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

  isTrialMode: false,
  isPlaying: false,
  isRecording: false,

  isCanvasHidden: false,
  isEditorHidden: false,
  isHeaderHidden: false,
  isCodePaneHidden: false,
  isKnobsHidden: false,
  isTimelineHidden: false,

  forceDraw: false,
  editingBuffer: '',
  vsSource: null,
  screenShader: null,
  capture: null,
  oldBufferIds: [],
  activeBufferIds: [],
  config: null,
  activeShaderName: undefined,
  uniforms: {
    'iResolution': [0, 0, 1], // viewport resolution (in pixels)
    'iTime': 0, // shader playback time (in seconds)
    'iTimeDelta': 0, // render time (in seconds)
    'iFrame': 0, // shader playback frame
    'iFrameRate': 0, // shader playback frame
    'iDate': 0, // (year, month, day, time in seconds)
    'iMouse': [0, 0, 0, 0], // mouse pixel coords. xy: current (if MLB down), zw: click
    'iChannel0': 0, // input channel. XX = 2D/Cube
    'iChannel1': 1, // input channel. XX = 2D/Cube
    'iChannel2': 2, // input channel. XX = 2D/Cube
    'iChannel3': 3, // input channel. XX = 2D/Cube
    'iSampleRate': 44100
  // 'iChannelTime': [iTime, iTime, iTime, iTime],			 // channel playback time (in seconds)
  // 'iChannelResolution':[iResolution, iResolution, iResolution, iResolution],    // channel resolution (in pixels)
  },


  glTexConsts:{
    CLEAR      :{ Color: 1, Zbuffer : 2, Stencil : 4 },
    TEXFMT     :{ C4I8 : 0, C1I8 : 1, C1F16 : 2, C4F16 : 3, C1F32 : 4, C4F32 : 5, Z16 : 6, Z24 : 7, Z32 : 8, C3F32:9 },
    TEXWRP     :{ CLAMP : 0, REPEAT : 1 },
    BUFTYPE    :{ STATIC : 0, DYNAMIC : 1 },
    PRIMTYPE   :{ POINTS : 0, LINES : 1, LINE_LOOP : 2, LINE_STRIP : 3, TRIANGLES : 4, TRIANGLE_STRIP : 5 },
    RENDSTGATE :{ WIREFRAME : 0, FRONT_FACE : 1, CULL_FACE : 2, DEPTH_TEST : 3, ALPHA_TO_COVERAGE : 4 },
    TEXTYPE    :{ T2D : 0, T3D : 1, CUBEMAP : 2 },
    FILTER     :{ NONE : 0, LINEAR : 1, MIPMAP : 2, NONE_MIPMAP : 3 },
    TYPE       :{ UINT8 : 0, UINT16 : 1, UINT32 : 2, FLOAT16: 3, FLOAT32 : 4, FLOAT64: 5 }
  },

  detectOS() {
    // Detect your OS.
    ShaderBoy.OS = 'Android' // default
    const ua = navigator.userAgent;
    if (ua.indexOf('Windows') > -1) ShaderBoy.OS = 'Windows'
    else if (ua.indexOf('iPhone') > -1) ShaderBoy.OS = 'iOS'
    else if (ua.indexOf('iPad') > -1) ShaderBoy.OS = 'iPadOS'
    else if (ua.indexOf('Mac') > -1){
      if(!('ontouchend' in document)) ShaderBoy.OS = 'MacOS'
      else ShaderBoy.OS = 'iPadOS'
    }
    else if (ua.indexOf('X11') > -1) ShaderBoy.OS = 'UNIX'
    else if (ua.indexOf('Linux') > -1) ShaderBoy.OS = 'Linux'
    else if (ua.indexOf('Android') > -1) ShaderBoy.OS = 'Android'

    console.log('OS: ', ShaderBoy.OS)
  },

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  getGL() {
    ShaderBoy.canvas = document.getElementById('gl_canvas')
    ShaderBoy.canvas.width = window.innerWidth
    ShaderBoy.canvas.height = window.innerHeight

    const opts = {
      alpha: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      antialias: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    } // 'low_power', 'high_performance', 'default'

    if (this.gl === null) {
      this.gl = this.canvas.getContext('webgl2', opts)
      console.log('Your WebGL is webgl2.')
    }

    if (this.gl === null) {
      this.gl = this.canvas.getContext('experimental-webgl2', opts)
      console.log('Your WebGL is experimental-webgl2.')
    }

    if (this.gl === null) {
      this.gl = this.canvas.getContext('webgl', opts)
      console.log('Your WebGL is webgl.')
    }

    if (this.gl === null) {
      this.gl = this.canvas.getContext('experimental-webgl', opts)
      console.log('Your WebGL is experimental-webgl.')
    }
    this.glVersion = !(this.gl instanceof WebGLRenderingContext) ? 2.0 : 1.0
    console.log('WebGL version: ', this.glVersion)
  },

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  getGLExtention() {
    this.glExt = {}
    if (this.glVersion === 2.0) {
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
      this.glExt.DebugShader = this.gl.getExtension('WEBGL_debug_shaders')
      this.glExt.AsynchCompile = this.gl.getExtension('KHR_parallel_shader_compile')

      this.gl.hint( this.gl.FRAGMENT_SHADER_DERIVATIVE_HINT, this.gl.NICEST)
    } else {
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

      if( this.glExt.Derivatives !== null) this.gl.hint( this.glExt.Derivatives.FRAGMENT_SHADER_DERIVATIVE_HINT_OES, this.gl.NICEST)
    }
    console.log(this.glExt)
  },

  iFormatPI2GL( format ){

    if( this.glVersion === 2.0 )
    {
           if (format === this.glTexConsts.TEXFMT.C4I8)  return { colorFormat: this.gl.RGBA8,           external: this.gl.RGBA,             precision: this.gl.UNSIGNED_BYTE }
      else if (format === this.glTexConsts.TEXFMT.C1I8)  return { colorFormat: this.gl.R8,              external: this.gl.RED,              precision: this.gl.UNSIGNED_BYTE }
      else if (format === this.glTexConsts.TEXFMT.C1F16) return { colorFormat: this.gl.R16F,            external: this.gl.RED,              precision: this.gl.FLOAT }
      else if (format === this.glTexConsts.TEXFMT.C4F16) return { colorFormat: this.gl.RGBA16F,         external: this.gl.RGBA,             precision: this.gl.FLOAT }
      else if (format === this.glTexConsts.TEXFMT.C1F32) return { colorFormat: this.gl.R32F,            external: this.gl.RED,              precision: this.gl.FLOAT }
      else if (format === this.glTexConsts.TEXFMT.C4F32) {
        if(ShaderBoy.OS === 'iPadOS' || ShaderBoy.OS === 'iOS') return { colorFormat: this.gl.RGBA8,           external: this.gl.RGBA,             precision: this.gl.UNSIGNED_BYTE }
        else return { colorFormat: this.gl.RGBA32F,         external: this.gl.RGBA,             precision: this.gl.FLOAT }
      }
      else if (format === this.glTexConsts.TEXFMT.C3F32) return { colorFormat: this.gl.RGB32F,          external: this.gl.RGB,              precision: this.gl.FLOAT }
      else if (format === this.glTexConsts.TEXFMT.Z16)   return { colorFormat: this.gl.DEPTH_COMPONENT16, external: this.gl.DEPTH_COMPONENT,  precision: this.gl.UNSIGNED_SHORT }
      else if (format === this.glTexConsts.TEXFMT.Z24)   return { colorFormat: this.gl.DEPTH_COMPONENT24, external: this.gl.DEPTH_COMPONENT,  precision: this.gl.UNSIGNED_SHORT }
      else if (format === this.glTexConsts.TEXFMT.Z32)   return { colorFormat: this.gl.DEPTH_COMPONENT32F, external: this.gl.DEPTH_COMPONENT,  precision: this.gl.UNSIGNED_SHORT }
    }
    else
    {
           if (format === this.glTexConsts.TEXFMT.C4I8)  return { colorFormat: this.gl.RGBA,            external: this.gl.RGBA,            precision: this.gl.UNSIGNED_BYTE }
      else if (format === this.glTexConsts.TEXFMT.C1I8)  return { colorFormat: this.gl.LUMINANCE,       external: this.gl.LUMINANCE,       precision: this.gl.UNSIGNED_BYTE }
      else if (format === this.glTexConsts.TEXFMT.C1F16) return { colorFormat: this.gl.LUMINANCE,       external: this.gl.LUMINANCE,       precision: this.gl.FLOAT }
      else if (format === this.glTexConsts.TEXFMT.C4F16) return { colorFormat: this.gl.RGBA,            external: this.gl.RGBA,            precision: this.gl.FLOAT }
      else if (format === this.glTexConsts.TEXFMT.C1F32) return { colorFormat: this.gl.LUMINANCE,       external: this.gl.RED,             precision: this.gl.FLOAT }
      else if (format === this.glTexConsts.TEXFMT.C4F32) return { colorFormat: this.gl.RGBA,            external: this.gl.RGBA,            precision: this.gl.FLOAT }
      else if (format === this.glTexConsts.TEXFMT.Z16)   return { colorFormat: this.gl.DEPTH_COMPONENT, external: this.gl.DEPTH_COMPONENT, precision: this.gl.UNSIGNED_SHORT }
    }

      return null;
  },

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  createShaderHeader() {
    this.shaderHeader = []
    this.shaderHeaderLines = []
    this.shaderHeader[0] = ''
    this.shaderHeaderLines[0] = 0
    if (this.glVersion === 2.0) {
      this.shaderHeader[0] += "#version 300 es\n" +
        "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "precision highp int;\n" +
        "precision mediump sampler3D;\n" +
        "#endif\n"
      this.shaderHeaderLines[0] += 6
    } else {
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
    if (this.glVersion === 2.0) {
      this.shaderHeader[1] += "#version 300 es\n" +
        "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "precision highp int;\n" +
        "precision mediump sampler3D;\n" +
        "#endif\n" +
        "out vec4 outColor;\n"
      this.shaderHeaderLines[1] += 6
    } else {
      if (this.glExt.Derivatives) {
        this.shaderHeader[1] += "#ifdef GL_OES_standard_derivatives\n#extension GL_OES_standard_derivatives : enable\n#endif\n";
        this.shaderHeaderLines[1] += 3
      }
      if (this.glExt.ShaderTextureLOD) {
        this.shaderHeader[1] += "#extension GL_EXT_shader_texture_lod : enable\n"; this.shaderHeaderLines[1]++
      }
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
      if (this.glExt.ShaderTextureLOD) {
        this.shaderHeader[1] += "vec4 textureLod(  sampler2D   s, vec2 c, float b)          { return texture2DLodEXT(s,c,b); }\n"
        this.shaderHeader[1] += "vec4 textureGrad( sampler2D   s, vec2 c, vec2 dx, vec2 dy) { return texture2DGradEXT(s,c,dx,dy); }\n"
        this.shaderHeaderLines[1] += 2
      }
    }
  }
}
export default ShaderBoy
