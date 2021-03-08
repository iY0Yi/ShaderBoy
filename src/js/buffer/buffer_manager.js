//   ___             ___   ___                      
//  (  _`\         /'___)/'___)                     
//  | (_) ) _   _ | (__ | (__   __   _ __           
//  |  _ <'( ) ( )| ,__)| ,__)/'__`\( '__)          
//  | (_) )| (_) || |   | |  (  ___/| |             
//  (____/'`\___/'(_)   (_)  `\____)(_)             
//                                                  
//  /'\_/`\                                         
//  |     |   _ _   ___     _ _    __     __   _ __ 
//  | (_) | /'_` )/' _ `\ /'_` ) /'_ `\ /'__`\( '__)
//  | | | |( (_| || ( ) |( (_| |( (_) |(  ___/| |   
//  (_) (_)`\__,_)(_) (_)`\__,_)`\__  |`\____)(_)   
//                              ( )_) |             
//                               \___/'             

import ShaderBoy from '../shaderboy'
import Buffer from './buffer'
import ShaderLib from '../shader/shaderlib'
import Shader from '../shader/shader'
import CodeMirror from 'codemirror/lib/codemirror'

export default ShaderBoy.bufferManager = {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    init()
    {
        // buffer ids for moving buffer to buffer
        this.currentBufferDataId = 0

        ShaderBoy.buffers = {}
        ShaderBoy.buffers['Setting'] = new Buffer(false)
        ShaderBoy.buffers['Config'] = new Buffer(false)
        ShaderBoy.buffers['Common'] = new Buffer(false)
        ShaderBoy.buffers['Sound'] = new Buffer(false)
        ShaderBoy.buffers['BufferA'] = new Buffer(true)
        ShaderBoy.buffers['BufferB'] = new Buffer(true)
        ShaderBoy.buffers['BufferC'] = new Buffer(true)
        ShaderBoy.buffers['BufferD'] = new Buffer(true)
        ShaderBoy.buffers['Image'] = new Buffer(true)

        this.initBufferDoc('Config')
        this.initBufferDoc('Common')
        this.initBufferDoc('Sound')
        this.initBufferDoc('BufferA')
        this.initBufferDoc('BufferB')
        this.initBufferDoc('BufferC')
        this.initBufferDoc('BufferD')
        this.initBufferDoc('Image')

        ShaderBoy.buffers['Setting'].active = false
        ShaderBoy.buffers['Config'].active = true
        ShaderBoy.buffers['Common'].active = false
        ShaderBoy.buffers['Sound'].active = false
        ShaderBoy.buffers['BufferA'].active = false
        ShaderBoy.buffers['BufferB'].active = false
        ShaderBoy.buffers['BufferC'].active = false
        ShaderBoy.buffers['BufferD'].active = false
        ShaderBoy.buffers['Image'].active = true

        ShaderBoy.buffers['Image'].fileName = 'main.fs'
        ShaderBoy.buffers['Common'].fileName = 'common.fs'
        ShaderBoy.buffers['BufferA'].fileName = 'buf_a.fs'
        ShaderBoy.buffers['BufferB'].fileName = 'buf_b.fs'
        ShaderBoy.buffers['BufferC'].fileName = 'buf_c.fs'
        ShaderBoy.buffers['BufferD'].fileName = 'buf_d.fs'
        ShaderBoy.buffers['Sound'].fileName = 'sound.fs'

        ShaderBoy.oldBufferIds = []
        this.createVertexShader()
        this.createScreenShader()
        this.initFBOs()
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    initBufferDoc(name)
    {
        ShaderBoy.buffers[name].cm = CodeMirror.Doc(ShaderLib.shader[name], 'x-shader/x-fragment')
        ShaderBoy.buffers[name].errorWidgets = []
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    resetActiveBufferIds()
    {
        const currentBufName = ShaderBoy.activeBufferIds[ShaderBoy.bufferManager.currentBufferDataId]
        ShaderBoy.activeBufferIds = []
        if (ShaderBoy.buffers['Common'].active === true) ShaderBoy.activeBufferIds.push('Common')
        if (ShaderBoy.buffers['BufferA'].active === true) ShaderBoy.activeBufferIds.push('BufferA')
        if (ShaderBoy.buffers['BufferB'].active === true) ShaderBoy.activeBufferIds.push('BufferB')
        if (ShaderBoy.buffers['BufferC'].active === true) ShaderBoy.activeBufferIds.push('BufferC')
        if (ShaderBoy.buffers['BufferD'].active === true) ShaderBoy.activeBufferIds.push('BufferD')
        if (ShaderBoy.buffers['Image'].active === true) ShaderBoy.activeBufferIds.push('Image')
        if (ShaderBoy.buffers['Sound'].active === true) ShaderBoy.activeBufferIds.push('Sound')
        this.currentBufferDataId = ShaderBoy.activeBufferIds.indexOf(currentBufName)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    buildShaderFromBuffers(needCompile = true)
    {
        for (const name in ShaderBoy.buffers)
        {
            if (name !== 'Config' && name !== 'Setting')
            {
                if (ShaderBoy.config.buffers[name] !== undefined)
                {
                    ShaderBoy.buffers[name].active = ShaderBoy.config.buffers[name].active
                }
                else
                {
                    ShaderBoy.buffers[name].active = false
                }

                if (ShaderBoy.buffers[name].isRenderable && ShaderBoy.buffers[name].active && name !== 'Setting')
                {
                    for (let i = 0; i < 4; i++)
                    {
                        const newChannelSetting = ShaderBoy.config.buffers[name].iChannel[i]
                        if (newChannelSetting.asset !== null)
                        {
                            const ASSETS_NAME = ['BufferA', 'BufferB', 'BufferC', 'BufferD']
                            if (ASSETS_NAME.indexOf(newChannelSetting.asset) >= 0)
                            {
                                ShaderBoy.buffers[name].iChannel[i] = newChannelSetting
                            }
                            else
                            {
                                //error!
                                ShaderBoy.buffers[name].iChannel[i] = null
                            }
                        }
                        else
                        {
                            ShaderBoy.buffers[name].iChannel[i] = null
                        }
                    }
                }
            }
        }
        ShaderBoy.config = JSON.parse(JSON.stringify(ShaderBoy.config, null, "\t"))

        this.resetActiveBufferIds()

        if (ShaderBoy.oldBufferIds.toString() !== ShaderBoy.activeBufferIds.toString())
        {
            ShaderBoy.oldBufferIds = ShaderBoy.activeBufferIds.concat()
        }

        if (needCompile)
        {
            this.compileShaders()
        }

        ShaderBoy.forceDraw = (ShaderBoy.isPlaying !== true)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getCommonShaderCode()
    {
        let commonCode = ''
        ShaderBoy.shaderCommonLines = 0
        if (ShaderBoy.buffers['Common'].active === true)
        {
            commonCode = ShaderBoy.buffers['Common'].cm.getValue()
            ShaderBoy.shaderCommonLines = commonCode.split(/\n/).length - 1
        }
        return commonCode
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    createVertexShader()
    {
        if (ShaderBoy.glVersion === 2.0)
            ShaderBoy.vsSource = ShaderBoy.shaderHeader[0] + "layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }"
        else
            ShaderBoy.vsSource = ShaderBoy.shaderHeader[0] + "attribute vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }"
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    createScreenShader()
    {
        if (ShaderBoy.screenShader === null)
        {
            let screenFsHeader = ''
            if (ShaderBoy.glVersion !== 2.0)
            {
                screenFsHeader += '#define outColor gl_FragColor\n'
            }
            ShaderBoy.screenShader = new Shader(ShaderBoy.gl, ShaderBoy.vsSource, screenFsHeader + ShaderBoy.shaderHeader[1] + ShaderLib.shader.screenFS + ShaderLib.shader.commonfooterFS)
            ShaderBoy.screenShader.compile()
            ShaderBoy.screenShader.uniforms = {
                'iResolution': ShaderBoy.uniforms.iResolution,
                'frameTexture': 0
            }
        }
    },


    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getUniformCode()
    {
        ShaderBoy.gui_midi.collectUniforms()
        const uniformCode =
            ShaderLib.shader.uniformFS +
            ShaderBoy.gui.knobUniformFS +
            ShaderBoy.gui.midiUniformFS

        ShaderBoy.shaderUniformsLines = uniformCode.split(/\n/).length - 1
        return uniformCode
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getSoundUniformCode()
    {
        ShaderBoy.gui_midi.collectUniforms()
        const uniformCode =
            ShaderLib.shader.soundUniformFS +
            ShaderBoy.gui.knobUniformFS +
            ShaderBoy.gui.midiUniformFS

        ShaderBoy.shaderSoundUniformsLines = uniformCode.split(/\n/).length - 1
        return uniformCode
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getFragmentCode(buffer, uniformCode, commonCode)
    {
        return ShaderBoy.shaderHeader[1] +
            uniformCode +
            commonCode +
            buffer.cm.getValue() +
            ShaderLib.shader.commonfooterFS
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getSoundFragmentCode(buffer, uniformCode, commonCode)
    {
        return ShaderBoy.shaderHeader[1] +
            uniformCode +
            commonCode +
            buffer.cm.getValue() +
            ShaderLib.shader.soundfooterFS
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    compileShaders()
    {
        const gl = ShaderBoy.gl
        const vertexCode = ShaderBoy.vsSource

        const wasPlaying = ShaderBoy.isPlaying
        ShaderBoy.commands.pauseTimeline()

        const uniformCode = this.getUniformCode()
        const commonCode = this.getCommonShaderCode()

        ShaderBoy.bufferManager.numCompiledBuffer = (ShaderBoy.buffers['Common'].active === true) ? 1 : 0

        const callback = () =>
        {
            ShaderBoy.bufferManager.numCompiledBuffer++
            if (ShaderBoy.bufferManager.numCompiledBuffer === ShaderBoy.activeBufferIds.length)
            {
                if (ShaderBoy.buffers['Sound'].active)
                {
                    ShaderBoy.soundRenderer.render()
                }

                if (wasPlaying)
                {
                    ShaderBoy.commands.playTimeline()
                }

                if (!ShaderBoy.io.initLoading)
                {
                    ShaderBoy.gui_header.setStatus('suc', 'Compiled.', 3000)
                }

            }
        }

        for (const name in ShaderBoy.buffers)
        {
            const buffer = ShaderBoy.buffers[name]

            if (buffer.active)
            {
                if (buffer.isRenderable)
                {
                    const fragmentCode = this.getFragmentCode(buffer, uniformCode, commonCode)

                    if (buffer.shader === null)
                    {
                        buffer.shader = new Shader(gl, vertexCode, fragmentCode)
                        buffer.shader.bufName = name

                        buffer.shader.uniforms = {
                            'iResolution': ShaderBoy.uniforms.iResolution,// viewport resolution (in pixels)
                            'iTime': ShaderBoy.uniforms.iTime,            // shader playback time (in seconds)
                            'iTimeDelta': ShaderBoy.uniforms.iTimeDelta,  // render time (in seconds)
                            'iFrame': ShaderBoy.uniforms.iFrame,          // shader playback frame
                            'iFrameRate': ShaderBoy.uniforms.iFrameRate,  // shader playback frame
                            'iDate': ShaderBoy.uniforms.iDate,            // (year, month, day, time in seconds)
                            'iMouse': ShaderBoy.uniforms.iMouse,          // mouse pixel coords. xy: current (if MLB down), zw: click
                            'iChannel0': 0,                               // input channel. XX = 2D/Cube
                            'iChannel1': 1,                               // input channel. XX = 2D/Cube
                            'iChannel2': 2,                               // input channel. XX = 2D/Cube
                            'iChannel3': 3,                               // input channel. XX = 2D/Cube
                            'iSampleRate': 44100
                            // 'iChannelTime': [iTime, iTime, iTime, iTime],			 // channel playback time (in seconds)
                            // 'iChannelResolution':[iResolution, iResolution, iResolution, iResolution],    // channel resolution (in pixels)
                        }
                    }
                    else
                    {
                        buffer.shader.fragmentSource = fragmentCode
                    }
                }
                else if (name === 'Sound')
                {
                    const soundUniformCode = this.getSoundUniformCode()
                    const fragmentCode = this.getSoundFragmentCode(buffer, soundUniformCode, commonCode)

                    if (buffer.shader === null)
                    {
                        buffer.shader = new Shader(gl, vertexCode, fragmentCode)
                        buffer.shader.bufName = name
                        buffer.shader.uniforms = {
                            'iBlockOffset': 0,
                            'iSampleRate': 0
                        }
                    }
                    else
                    {
                        buffer.shader.fragmentSource = fragmentCode
                    }
                }

                if (buffer.shader !== null)
                {
                    buffer.shader.compile(callback)
                }
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setSamplerFilter(texture, filter)
    {
        const gl = ShaderBoy.gl
        gl.bindTexture(gl.TEXTURE_2D, texture)

        if (ShaderBoy.OS === 'iPadOS' || ShaderBoy.OS === 'iOS' || filter === 'nearest')
        {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        }
        else
        {// if (filter === 'linear') {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        }
        // "mipmap" will support with image texture assets.
        // else if (filter === 'mipmap') {
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
        //     gl.generateMipmap(gl.TEXTURE_2D)
        // }
        // else {
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR)
        //     gl.generateMipmap(gl.TEXTURE_2D)
        // }

        gl.bindTexture(gl.TEXTURE_2D, null)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setSamplerWrap(texture, wrap)
    {
        const gl = ShaderBoy.gl
        let glWrap = gl.REPEAT
        if (wrap === 'clamp') glWrap = gl.CLAMP_TO_EDGE
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, glWrap)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, glWrap)
        gl.bindTexture(gl.TEXTURE_2D, null)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setRenderResolution(texture, canvasWidth, canvasHeight)
    {
        const gl = ShaderBoy.gl
        const glFoTy = ShaderBoy.iFormatPI2GL( ShaderBoy.glTexConsts.TEXFMT.C4F32 );
        
        gl.bindTexture(gl.TEXTURE_2D, texture)
        // if (ShaderBoy.glVersion === 2.0)
        // {
            gl.texImage2D(gl.TEXTURE_2D, 0, glFoTy.colorFormat, canvasWidth, canvasHeight, 0, glFoTy.external, glFoTy.precision, null)
        // }
        // else
        // {
        //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvasWidth, canvasHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        // }
        gl.bindTexture(gl.TEXTURE_2D, null)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setFBOsProps()
    {
        const gl = ShaderBoy.gl
        const canvasWidth = Math.floor(((ShaderBoy.capture === null) ? gl.canvas.clientWidth : ShaderBoy.canvas.width) / ShaderBoy.renderScale)
        const canvasHeight = Math.floor(((ShaderBoy.capture === null) ? window.innerHeight : ShaderBoy.canvas.height) / ShaderBoy.renderScale)
        ShaderBoy.uniforms.iResolution[0] = canvasWidth
        ShaderBoy.uniforms.iResolution[1] = canvasHeight

        for (const name in ShaderBoy.buffers)
        {
            const buffer = ShaderBoy.buffers[name]
            if (buffer.active && buffer.isRenderable)
            {
                for (const texture of buffer.textures)
                {
                    this.setRenderResolution(texture, canvasWidth, canvasHeight)
                    this.setSamplerFilter(texture, 'nearest')
                    this.setSamplerWrap(texture, 'clamp')
                }
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    initFBOs()
    {
        const gl = ShaderBoy.gl
        const canvasWidth = Math.floor(((ShaderBoy.capture === null) ? gl.canvas.clientWidth : ShaderBoy.canvas.width) / ShaderBoy.renderScale)
        const canvasHeight = Math.floor(((ShaderBoy.capture === null) ? window.innerHeight : ShaderBoy.canvas.height) / ShaderBoy.renderScale)
        ShaderBoy.uniforms.iResolution[0] = canvasWidth
        ShaderBoy.uniforms.iResolution[1] = canvasHeight

        // Just for Shadertoy compativility...
        this.tempTexture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, this.tempTexture)
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        this.setRenderResolution(this.tempTexture, 256, 256)
        this.setSamplerFilter(this.tempTexture, 'nearest')
        this.setSamplerWrap(this.tempTexture, 'clamp')
        gl.bindTexture(gl.TEXTURE_2D, null)

        const glFoTy = ShaderBoy.iFormatPI2GL( ShaderBoy.glTexConsts.TEXFMT.C4F32 );
        for (const name in ShaderBoy.buffers)
        {
            const buffer = ShaderBoy.buffers[name]
            if (buffer.isRenderable)
            {
                buffer.framebuffer = gl.createFramebuffer()
                buffer.textures = []
                for (let i = 0; i < 2; i++)
                {
                    buffer.textures[i] = gl.createTexture()
                    gl.bindTexture(gl.TEXTURE_2D, buffer.textures[i])
                    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer.framebuffer)
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, buffer.textures[i], 0)
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
                    gl.texImage2D(gl.TEXTURE_2D, 0, glFoTy.colorFormat, canvasWidth, canvasHeight, 0, glFoTy.external, glFoTy.precision, null)
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
                    // gl.clear(gl.COLOR_BUFFER_BIT)
                    gl.clearColor(0.0, 0.0, 0.0, 1.0)
                    gl.bindTexture(gl.TEXTURE_2D, null)
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
                }
            }
        }
        this.setFBOsProps()
    },
}