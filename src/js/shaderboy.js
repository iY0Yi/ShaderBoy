//
//
//   ___    _                 _               ___                 
//  (  _`\ ( )               ( )             (  _`\               
//  | (_(_)| |__     _ _    _| |   __   _ __ | (_) )   _    _   _ 
//  `\__ \ |  _ `\ /'_` ) /'_` | /'__`\( '__)|  _ <' /'_`\ ( ) ( )
//  ( )_) || | | |( (_| |( (_| |(  ___/| |   | (_) )( (_) )| (_) |
//  `\____)(_) (_)`\__,_)`\__,_)`\____)(_)   (____/'`\___/'`\__, |
//                                                         ( )_| |
//                                                         `\___/'
//

const ShaderBoy = {
    gl: null,
    glVersion: 0.0,
    isTrialMode:false,
    isPlaying: false,
    isRecording: false,
    isEditorHide: false,
    isConcentrating: false,
    needRecompile: false,
    needStatusInfo: false,
    forceDraw: false,
    editingBuffer: '',
    vsSource: null,
    screenShader: null,
    oldBufferIds: [],
    activeBufferIds: [],
    config: null,
    activeShaderName: undefined,
    uniforms: {
        'iResolution': [0, 0, 1],// viewport resolution (in pixels)
        'iTime': 0,            // shader playback time (in seconds)
        'iTimeDelta': 0,  // render time (in seconds)
        'iFrame': 0,          // shader playback frame
        'iFrameRate': 0,  // shader playback frame
        'iDate': 0,            // (year, month, day, time in seconds)
        'iMouse': [0, 0, 0, 0],          // mouse pixel coords. xy: current (if MLB down), zw: click
        'iChannel0': 0,                               // input channel. XX = 2D/Cube
        'iChannel1': 1,                               // input channel. XX = 2D/Cube
        'iChannel2': 2,                               // input channel. XX = 2D/Cube
        'iChannel3': 3,                               // input channel. XX = 2D/Cube
        'iSampleRate': 44100
        // 'iChannelTime': [iTime, iTime, iTime, iTime],			 // channel playback time (in seconds)
        // 'iChannelResolution':[iResolution, iResolution, iResolution, iResolution],    // channel resolution (in pixels)
    },

    detectOS()
    {
        // Detect your OS.
        ShaderBoy.OS = 'Unknown OS'
        if (navigator.appVersion.indexOf('Win') != -1) ShaderBoy.OS = 'Windows'
        if (navigator.appVersion.indexOf('Mac') != -1) ShaderBoy.OS = 'MacOS'
        if (navigator.appVersion.indexOf('X11') != -1) ShaderBoy.OS = 'UNIX'
        if (navigator.appVersion.indexOf('Linux') != -1) ShaderBoy.OS = 'Linux'
        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) ShaderBoy.OS = 'iOS'
        if (navigator.userAgent.match(/Android/i)) ShaderBoy.OS = 'Android'
        if (ShaderBoy.OS === 'Unknown OS')
        {
            ShaderBoy.OS = 'Android'
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getGL()
    {
        ShaderBoy.canvas = document.getElementById('gl_canvas')
        ShaderBoy.canvas.width = window.innerWidth
        ShaderBoy.canvas.height = window.innerHeight

        const opts = {
            alpha: false,
            depth: false,
            stencil: false,
            premultipliedAlpha: false,
            antialias: true,
            preserveDrawingBuffer: true,
            powerPreference: 'high-performance'
        } // 'low_power', 'high_performance', 'default'

        if (this.gl === null)
        {
            this.gl = this.canvas.getContext('webgl2', opts)
            this.glVersion = 2.0
        }

        if (this.gl === null)
        {
            this.gl = this.canvas.getContext('experimental-webgl2', opts)
            this.glVersion = 2.0
        }

        if (this.gl === null)
        {
            this.gl = this.canvas.getContext('webgl', opts)
            this.glVersion = 1.0
        }

        if (this.gl === null)
        {
            this.gl = this.canvas.getContext('experimental-webgl', opts)
            this.glVersion = 1.0
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getGLExtention()
    {
        this.glExt = {}
        if (this.glVersion === 2.0)
        {
            this.glExt.Float32Textures = true
            this.glExt.Float32Filter = this.gl.getExtension('OES_texture_float_linear')
            this.glExt.Float16Textures = true
            this.glExt.Float16Filter = this.gl.getExtension('OES_texture_half_float_linear')
            this.glExt.Derivatives = true
            this.glExt.DrawBuffers = true
            this.glExt.DepthTextures = true
            this.glExt.ShaderTextureLOD = true
            this.glExt.Anisotropic = this.gl.getExtension('EXT_texture_filter_anisotropic')
            this.glExt.RenderToFloat32F = this.gl.getExtension('EXT_color_buffer_float')
        }
        else
        {
            this.glExt.Float32Textures = this.gl.getExtension('OES_texture_float')
            this.glExt.Float32Filter = this.gl.getExtension('OES_texture_float_linear')
            this.glExt.Float16Textures = this.gl.getExtension('OES_texture_half_float')
            this.glExt.Float16Filter = this.gl.getExtension('OES_texture_half_float_linear')
            this.glExt.Derivatives = this.gl.getExtension('OES_standard_derivatives')
            this.glExt.DrawBuffers = this.gl.getExtension('WEBGL_draw_buffers')
            this.glExt.DepthTextures = this.gl.getExtension('WEBGL_depth_texture')
            this.glExt.ShaderTextureLOD = this.gl.getExtension('EXT_shader_texture_lod')
            this.glExt.Anisotropic = this.gl.getExtension('EXT_texture_filter_anisotropic')
            this.glExt.RenderToFloat32F = this.glExt.Float32Textures
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    createShaderHeader()
    {
        this.shaderHeader = []
        this.shaderHeaderLines = []
        this.shaderHeader[0] = ''
        this.shaderHeaderLines[0] = 0
        if (this.glVersion === 2.0)
        {
            this.shaderHeader[0] += "#version 300 es\n" +
                "#ifdef GL_ES\n" +
                "precision highp float;\n" +
                "precision highp int;\n" +
                "precision mediump sampler3D;\n" +
                "#endif\n"
            this.shaderHeaderLines[0] += 6
        }
        else
        {
            this.shaderHeader[0] += "#ifdef GL_ES\n" +
                "precision highp float;\n" +
                "precision highp int;\n" +
                "#endif\n" +
                "float round( float x ) { return floor(x+0.5); }\n" +
                "vec2 round(vec2 x) { return floor(x + 0.5); }\n" +
                "vec3 round(vec3 x) { return floor(x + 0.5); }\n" +
                "vec4 round(vec4 x) { return floor(x + 0.5); }\n" +
                "float trunc( float x, float n ) { return floor(x*n)/n; }\n" +
                "mat3 transpose(mat3 m) { return mat3(m[0].x, m[1].x, m[2].x, m[0].y, m[1].y, m[2].y, m[0].z, m[1].z, m[2].z); }\n" +
                "float determinant( in mat2 m ) { return m[0][0]*m[1][1] - m[0][1]*m[1][0]; }\n" +
                "float determinant( mat4 m ) { float b00 = m[0][0] * m[1][1] - m[0][1] * m[1][0], b01 = m[0][0] * m[1][2] - m[0][2] * m[1][0], b02 = m[0][0] * m[1][3] - m[0][3] * m[1][0], b03 = m[0][1] * m[1][2] - m[0][2] * m[1][1], b04 = m[0][1] * m[1][3] - m[0][3] * m[1][1], b05 = m[0][2] * m[1][3] - m[0][3] * m[1][2], b06 = m[2][0] * m[3][1] - m[2][1] * m[3][0], b07 = m[2][0] * m[3][2] - m[2][2] * m[3][0], b08 = m[2][0] * m[3][3] - m[2][3] * m[3][0], b09 = m[2][1] * m[3][2] - m[2][2] * m[3][1], b10 = m[2][1] * m[3][3] - m[2][3] * m[3][1], b11 = m[2][2] * m[3][3] - m[2][3] * m[3][2];  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;}\n" +
                "mat2 inverse(mat2 m) { float det = determinant(m); return mat2(m[1][1], -m[0][1], -m[1][0], m[0][0]) / det; }\n" +
                "mat4 inverse(mat4 m ) { float inv0 = m[1].y*m[2].z*m[3].w - m[1].y*m[2].w*m[3].z - m[2].y*m[1].z*m[3].w + m[2].y*m[1].w*m[3].z + m[3].y*m[1].z*m[2].w - m[3].y*m[1].w*m[2].z; float inv4 = -m[1].x*m[2].z*m[3].w + m[1].x*m[2].w*m[3].z + m[2].x*m[1].z*m[3].w - m[2].x*m[1].w*m[3].z - m[3].x*m[1].z*m[2].w + m[3].x*m[1].w*m[2].z; float inv8 = m[1].x*m[2].y*m[3].w - m[1].x*m[2].w*m[3].y - m[2].x  * m[1].y * m[3].w + m[2].x  * m[1].w * m[3].y + m[3].x * m[1].y * m[2].w - m[3].x * m[1].w * m[2].y; float inv12 = -m[1].x  * m[2].y * m[3].z + m[1].x  * m[2].z * m[3].y +m[2].x  * m[1].y * m[3].z - m[2].x  * m[1].z * m[3].y - m[3].x * m[1].y * m[2].z + m[3].x * m[1].z * m[2].y; float inv1 = -m[0].y*m[2].z * m[3].w + m[0].y*m[2].w * m[3].z + m[2].y  * m[0].z * m[3].w - m[2].y  * m[0].w * m[3].z - m[3].y * m[0].z * m[2].w + m[3].y * m[0].w * m[2].z; float inv5 = m[0].x  * m[2].z * m[3].w - m[0].x  * m[2].w * m[3].z - m[2].x  * m[0].z * m[3].w + m[2].x  * m[0].w * m[3].z + m[3].x * m[0].z * m[2].w - m[3].x * m[0].w * m[2].z; float inv9 = -m[0].x  * m[2].y * m[3].w +  m[0].x  * m[2].w * m[3].y + m[2].x  * m[0].y * m[3].w - m[2].x  * m[0].w * m[3].y - m[3].x * m[0].y * m[2].w + m[3].x * m[0].w * m[2].y; float inv13 = m[0].x  * m[2].y * m[3].z - m[0].x  * m[2].z * m[3].y - m[2].x  * m[0].y * m[3].z + m[2].x  * m[0].z * m[3].y + m[3].x * m[0].y * m[2].z - m[3].x * m[0].z * m[2].y; float inv2 = m[0].y  * m[1].z * m[3].w - m[0].y  * m[1].w * m[3].z - m[1].y  * m[0].z * m[3].w + m[1].y  * m[0].w * m[3].z + m[3].y * m[0].z * m[1].w - m[3].y * m[0].w * m[1].z; float inv6 = -m[0].x  * m[1].z * m[3].w + m[0].x  * m[1].w * m[3].z + m[1].x  * m[0].z * m[3].w - m[1].x  * m[0].w * m[3].z - m[3].x * m[0].z * m[1].w + m[3].x * m[0].w * m[1].z; float inv10 = m[0].x  * m[1].y * m[3].w - m[0].x  * m[1].w * m[3].y - m[1].x  * m[0].y * m[3].w + m[1].x  * m[0].w * m[3].y + m[3].x * m[0].y * m[1].w - m[3].x * m[0].w * m[1].y; float inv14 = -m[0].x  * m[1].y * m[3].z + m[0].x  * m[1].z * m[3].y + m[1].x  * m[0].y * m[3].z - m[1].x  * m[0].z * m[3].y - m[3].x * m[0].y * m[1].z + m[3].x * m[0].z * m[1].y; float inv3 = -m[0].y * m[1].z * m[2].w + m[0].y * m[1].w * m[2].z + m[1].y * m[0].z * m[2].w - m[1].y * m[0].w * m[2].z - m[2].y * m[0].z * m[1].w + m[2].y * m[0].w * m[1].z; float inv7 = m[0].x * m[1].z * m[2].w - m[0].x * m[1].w * m[2].z - m[1].x * m[0].z * m[2].w + m[1].x * m[0].w * m[2].z + m[2].x * m[0].z * m[1].w - m[2].x * m[0].w * m[1].z; float inv11 = -m[0].x * m[1].y * m[2].w + m[0].x * m[1].w * m[2].y + m[1].x * m[0].y * m[2].w - m[1].x * m[0].w * m[2].y - m[2].x * m[0].y * m[1].w + m[2].x * m[0].w * m[1].y; float inv15 = m[0].x * m[1].y * m[2].z - m[0].x * m[1].z * m[2].y - m[1].x * m[0].y * m[2].z + m[1].x * m[0].z * m[2].y + m[2].x * m[0].y * m[1].z - m[2].x * m[0].z * m[1].y; float det = m[0].x * inv0 + m[0].y * inv4 + m[0].z * inv8 + m[0].w * inv12; det = 1.0 / det; return det*mat4( inv0, inv1, inv2, inv3,inv4, inv5, inv6, inv7,inv8, inv9, inv10, inv11,inv12, inv13, inv14, inv15);}\n" +
                "float sinh(float x)  { return (exp(x)-exp(-x))/2.; }\n" +
                "float cosh(float x)  { return (exp(x)+exp(-x))/2.; }\n" +
                "float tanh(float x)  { return sinh(x)/cosh(x); }\n" +
                "float coth(float x)  { return cosh(x)/sinh(x); }\n" +
                "float sech(float x)  { return 1./cosh(x); }\n" +
                "float csch(float x)  { return 1./sinh(x); }\n" +
                "float asinh(float x) { return    log(x+sqrt(x*x+1.)); }\n" +
                "float acosh(float x) { return    log(x+sqrt(x*x-1.)); }\n" +
                "float atanh(float x) { return .5*log((1.+x)/(1.-x)); }\n" +
                "float acoth(float x) { return .5*log((x+1.)/(x-1.)); }\n" +
                "float asech(float x) { return    log((1.+sqrt(1.-x*x))/x); }\n" +
                "float acsch(float x) { return    log((1.+sqrt(1.+x*x))/x); }\n"
            this.shaderHeaderLines[0] += 26
        }

        this.shaderHeader[1] = ""
        this.shaderHeaderLines[1] = 0
        if (this.glVersion === 2.0)
        {
            this.shaderHeader[1] += "#version 300 es\n" +
                "#ifdef GL_ES\n" +
                "precision highp float;\n" +
                "precision highp int;\n" +
                "precision mediump sampler3D;\n" +
                "#endif\n" +
                "out vec4 outColor;\n"
            this.shaderHeaderLines[1] += 6
        }
        else
        {
            if (this.glExt.Derivatives) { this.shaderHeader[1] += "#ifdef GL_OES_standard_derivatives\n#extension GL_OES_standard_derivatives : enable\n#endif\n"; this.shaderHeaderLines[1] += 3 }
            if (this.glExt.ShaderTextureLOD) { this.shaderHeader[1] += "#extension GL_EXT_shader_texture_lod : enable\n"; this.shaderHeaderLines[1]++ }
            this.shaderHeader[1] += "#ifdef GL_ES\n" +
                "precision highp float;\n" +
                "precision highp int;\n" +
                "#endif\n" +
                "vec4 texture(     sampler2D   s, vec2 c)                   { return texture2D(s,c); }\n" +
                "vec4 texture(     sampler2D   s, vec2 c, float b)          { return texture2D(s,c,b); }\n" +
                "vec4 texture(     samplerCube s, vec3 c )                  { return textureCube(s,c); }\n" +
                "vec4 texture(     samplerCube s, vec3 c, float b)          { return textureCube(s,c,b); }\n" +
                "float round( float x ) { return floor(x+0.5); }\n" +
                "vec2 round(vec2 x) { return floor(x + 0.5); }\n" +
                "vec3 round(vec3 x) { return floor(x + 0.5); }\n" +
                "vec4 round(vec4 x) { return floor(x + 0.5); }\n" +
                "float trunc( float x, float n ) { return floor(x*n)/n; }\n" +
                "mat3 transpose(mat3 m) { return mat3(m[0].x, m[1].x, m[2].x, m[0].y, m[1].y, m[2].y, m[0].z, m[1].z, m[2].z); }\n" +
                "float determinant( in mat2 m ) { return m[0][0]*m[1][1] - m[0][1]*m[1][0]; }\n" +
                "float determinant( mat4 m ) { float b00 = m[0][0] * m[1][1] - m[0][1] * m[1][0], b01 = m[0][0] * m[1][2] - m[0][2] * m[1][0], b02 = m[0][0] * m[1][3] - m[0][3] * m[1][0], b03 = m[0][1] * m[1][2] - m[0][2] * m[1][1], b04 = m[0][1] * m[1][3] - m[0][3] * m[1][1], b05 = m[0][2] * m[1][3] - m[0][3] * m[1][2], b06 = m[2][0] * m[3][1] - m[2][1] * m[3][0], b07 = m[2][0] * m[3][2] - m[2][2] * m[3][0], b08 = m[2][0] * m[3][3] - m[2][3] * m[3][0], b09 = m[2][1] * m[3][2] - m[2][2] * m[3][1], b10 = m[2][1] * m[3][3] - m[2][3] * m[3][1], b11 = m[2][2] * m[3][3] - m[2][3] * m[3][2];  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;}\n" +
                "mat2 inverse(mat2 m) { float det = determinant(m); return mat2(m[1][1], -m[0][1], -m[1][0], m[0][0]) / det; }\n" +
                "mat4 inverse(mat4 m ) { float inv0 = m[1].y*m[2].z*m[3].w - m[1].y*m[2].w*m[3].z - m[2].y*m[1].z*m[3].w + m[2].y*m[1].w*m[3].z + m[3].y*m[1].z*m[2].w - m[3].y*m[1].w*m[2].z; float inv4 = -m[1].x*m[2].z*m[3].w + m[1].x*m[2].w*m[3].z + m[2].x*m[1].z*m[3].w - m[2].x*m[1].w*m[3].z - m[3].x*m[1].z*m[2].w + m[3].x*m[1].w*m[2].z; float inv8 = m[1].x*m[2].y*m[3].w - m[1].x*m[2].w*m[3].y - m[2].x  * m[1].y * m[3].w + m[2].x  * m[1].w * m[3].y + m[3].x * m[1].y * m[2].w - m[3].x * m[1].w * m[2].y; float inv12 = -m[1].x  * m[2].y * m[3].z + m[1].x  * m[2].z * m[3].y +m[2].x  * m[1].y * m[3].z - m[2].x  * m[1].z * m[3].y - m[3].x * m[1].y * m[2].z + m[3].x * m[1].z * m[2].y; float inv1 = -m[0].y*m[2].z * m[3].w + m[0].y*m[2].w * m[3].z + m[2].y  * m[0].z * m[3].w - m[2].y  * m[0].w * m[3].z - m[3].y * m[0].z * m[2].w + m[3].y * m[0].w * m[2].z; float inv5 = m[0].x  * m[2].z * m[3].w - m[0].x  * m[2].w * m[3].z - m[2].x  * m[0].z * m[3].w + m[2].x  * m[0].w * m[3].z + m[3].x * m[0].z * m[2].w - m[3].x * m[0].w * m[2].z; float inv9 = -m[0].x  * m[2].y * m[3].w +  m[0].x  * m[2].w * m[3].y + m[2].x  * m[0].y * m[3].w - m[2].x  * m[0].w * m[3].y - m[3].x * m[0].y * m[2].w + m[3].x * m[0].w * m[2].y; float inv13 = m[0].x  * m[2].y * m[3].z - m[0].x  * m[2].z * m[3].y - m[2].x  * m[0].y * m[3].z + m[2].x  * m[0].z * m[3].y + m[3].x * m[0].y * m[2].z - m[3].x * m[0].z * m[2].y; float inv2 = m[0].y  * m[1].z * m[3].w - m[0].y  * m[1].w * m[3].z - m[1].y  * m[0].z * m[3].w + m[1].y  * m[0].w * m[3].z + m[3].y * m[0].z * m[1].w - m[3].y * m[0].w * m[1].z; float inv6 = -m[0].x  * m[1].z * m[3].w + m[0].x  * m[1].w * m[3].z + m[1].x  * m[0].z * m[3].w - m[1].x  * m[0].w * m[3].z - m[3].x * m[0].z * m[1].w + m[3].x * m[0].w * m[1].z; float inv10 = m[0].x  * m[1].y * m[3].w - m[0].x  * m[1].w * m[3].y - m[1].x  * m[0].y * m[3].w + m[1].x  * m[0].w * m[3].y + m[3].x * m[0].y * m[1].w - m[3].x * m[0].w * m[1].y; float inv14 = -m[0].x  * m[1].y * m[3].z + m[0].x  * m[1].z * m[3].y + m[1].x  * m[0].y * m[3].z - m[1].x  * m[0].z * m[3].y - m[3].x * m[0].y * m[1].z + m[3].x * m[0].z * m[1].y; float inv3 = -m[0].y * m[1].z * m[2].w + m[0].y * m[1].w * m[2].z + m[1].y * m[0].z * m[2].w - m[1].y * m[0].w * m[2].z - m[2].y * m[0].z * m[1].w + m[2].y * m[0].w * m[1].z; float inv7 = m[0].x * m[1].z * m[2].w - m[0].x * m[1].w * m[2].z - m[1].x * m[0].z * m[2].w + m[1].x * m[0].w * m[2].z + m[2].x * m[0].z * m[1].w - m[2].x * m[0].w * m[1].z; float inv11 = -m[0].x * m[1].y * m[2].w + m[0].x * m[1].w * m[2].y + m[1].x * m[0].y * m[2].w - m[1].x * m[0].w * m[2].y - m[2].x * m[0].y * m[1].w + m[2].x * m[0].w * m[1].y; float inv15 = m[0].x * m[1].y * m[2].z - m[0].x * m[1].z * m[2].y - m[1].x * m[0].y * m[2].z + m[1].x * m[0].z * m[2].y + m[2].x * m[0].y * m[1].z - m[2].x * m[0].z * m[1].y; float det = m[0].x * inv0 + m[0].y * inv4 + m[0].z * inv8 + m[0].w * inv12; det = 1.0 / det; return det*mat4( inv0, inv1, inv2, inv3,inv4, inv5, inv6, inv7,inv8, inv9, inv10, inv11,inv12, inv13, inv14, inv15);}\n" +
                "float sinh(float x)  { return (exp(x)-exp(-x))/2.; }\n" +
                "float cosh(float x)  { return (exp(x)+exp(-x))/2.; }\n" +
                "float tanh(float x)  { return sinh(x)/cosh(x); }\n" +
                "float coth(float x)  { return cosh(x)/sinh(x); }\n" +
                "float sech(float x)  { return 1./cosh(x); }\n" +
                "float csch(float x)  { return 1./sinh(x); }\n" +
                "float asinh(float x) { return    log(x+sqrt(x*x+1.)); }\n" +
                "float acosh(float x) { return    log(x+sqrt(x*x-1.)); }\n" +
                "float atanh(float x) { return .5*log((1.+x)/(1.-x)); }\n" +
                "float acoth(float x) { return .5*log((x+1.)/(x-1.)); }\n" +
                "float asech(float x) { return    log((1.+sqrt(1.-x*x))/x); }\n" +
                "float acsch(float x) { return    log((1.+sqrt(1.+x*x))/x); }\n" +
                "#define outColor gl_FragColor\n"
            this.shaderHeaderLines[1] += 30
            if (this.glExt.ShaderTextureLOD)
            {
                this.shaderHeader[1] += "vec4 textureLod(  sampler2D   s, vec2 c, float b)          { return texture2DLodEXT(s,c,b); }\n"
                this.shaderHeader[1] += "vec4 textureGrad( sampler2D   s, vec2 c, vec2 dx, vec2 dy) { return texture2DGradEXT(s,c,dx,dy); }\n"
                this.shaderHeaderLines[1] += 2
            }
        }
    }
}
export default ShaderBoy
