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

import ShaderBoy from './shaderboy';
import BufferDataContainer from './buffer_data_container';
import ShaderLib from './shaderlib';
import Shader from './shader';
import CodeMirror from 'codemirror/lib/codemirror';

export default ShaderBoy.bufferManager = {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    init: function ()
    {
        // buffer ids for moving buffer to buffer
        this.currentBufferDataId = 0;

        ShaderBoy.buffers['Setting'] = new BufferDataContainer(false);
        ShaderBoy.buffers['Config'] = new BufferDataContainer(false);
        ShaderBoy.buffers['Common'] = new BufferDataContainer(false);
        ShaderBoy.buffers['Sound'] = new BufferDataContainer(false);
        ShaderBoy.buffers['BufferA'] = new BufferDataContainer(true);
        ShaderBoy.buffers['BufferB'] = new BufferDataContainer(true);
        ShaderBoy.buffers['BufferC'] = new BufferDataContainer(true);
        ShaderBoy.buffers['BufferD'] = new BufferDataContainer(true);
        ShaderBoy.buffers['Image'] = new BufferDataContainer(true);

        this.initBufferDoc('Config');
        this.initBufferDoc('Common');
        this.initBufferDoc('Sound');
        this.initBufferDoc('BufferA');
        this.initBufferDoc('BufferB');
        this.initBufferDoc('BufferC');
        this.initBufferDoc('BufferD');
        this.initBufferDoc('Image');

        ShaderBoy.buffers['Setting'].active = false;
        ShaderBoy.buffers['Config'].active = false;
        ShaderBoy.buffers['Common'].active = false;
        ShaderBoy.buffers['Sound'].active = false;
        ShaderBoy.buffers['BufferA'].active = false;
        ShaderBoy.buffers['BufferB'].active = false;
        ShaderBoy.buffers['BufferC'].active = false;
        ShaderBoy.buffers['BufferD'].active = false;
        ShaderBoy.buffers['Image'].active = true;

        ShaderBoy.oldBufferIds = [];

        this.initFBOs();
    },

    initBufferDoc(name)
    {
        console.log('io: initBufferDoc');
        ShaderBoy.buffers[name].cm = CodeMirror.Doc(ShaderLib.shader[name], 'x-shader/x-fragment');
        ShaderBoy.buffers[name].errorWidgets = [];
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    resetActiveBufferIds()
    {
        let currentBufName = ShaderBoy.activeBufferIds[ShaderBoy.bufferManager.currentBufferDataId];
        console.log(ShaderBoy.activeBufferIds[ShaderBoy.bufferManager.currentBufferDataId]);
        ShaderBoy.activeBufferIds = [];
        if (ShaderBoy.buffers['Common'].active === true) ShaderBoy.activeBufferIds.push('Common');
        if (ShaderBoy.buffers['BufferA'].active === true) ShaderBoy.activeBufferIds.push('BufferA');
        if (ShaderBoy.buffers['BufferB'].active === true) ShaderBoy.activeBufferIds.push('BufferB');
        if (ShaderBoy.buffers['BufferC'].active === true) ShaderBoy.activeBufferIds.push('BufferC');
        if (ShaderBoy.buffers['BufferD'].active === true) ShaderBoy.activeBufferIds.push('BufferD');
        if (ShaderBoy.buffers['Image'].active === true) ShaderBoy.activeBufferIds.push('Image');
        if (ShaderBoy.buffers['Sound'].active === true) ShaderBoy.activeBufferIds.push('Sound');
        console.log('ShaderBoy.activeBufferIds', ShaderBoy.activeBufferIds);
        this.currentBufferDataId = ShaderBoy.activeBufferIds.indexOf(currentBufName);
    },

    needNewShader(settingObj)
    {
        for (let i = 0; i < settingObj.shaders.list.length; i++)
        {
            const element = settingObj.shaders.list[i];
            if (element === settingObj.shaders.active)
            {
                return false;
            }
        }
        return true;
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    buildShaderFromBuffers(needCompile)
    {
        needCompile = (needCompile === undefined) ? true : needCompile;

        console.log('bufferManager: buildShaderFromBuffers');
        for (const name in ShaderBoy.buffers)
        {
            if (name !== 'Config' && name !== 'Setting')
            {
                if (ShaderBoy.config.buffers[name] !== undefined)
                {
                    ShaderBoy.buffers[name].active = ShaderBoy.config.buffers[name].active;
                }
                else
                {
                    ShaderBoy.buffers[name].active = false;
                }

                if (ShaderBoy.buffers[name].isRenderable && ShaderBoy.buffers[name].active && name !== 'Setting')
                {
                    for (let i = 0; i < 4; i++)
                    {
                        const newChannelSetting = ShaderBoy.config.buffers[name].iChannel[i];
                        if (newChannelSetting.asset !== null)
                        {
                            console.log('newChannelSetting', newChannelSetting);
                            const ASSETS_NAME = ['BufferA', 'BufferB', 'BufferC', 'BufferD'];
                            if (ASSETS_NAME.indexOf(newChannelSetting.asset) >= 0)
                            {
                                ShaderBoy.buffers[name].iChannel[i] = newChannelSetting;
                            }
                            else
                            {
                                //error!
                                ShaderBoy.buffers[name].iChannel[i] = null;
                            }
                        }
                        else
                        {
                            ShaderBoy.buffers[name].iChannel[i] = null;
                        }
                    }
                }
            }
        }
        ShaderBoy.config = JSON.parse(JSON.stringify(ShaderBoy.config, null, "\t"));

        this.resetActiveBufferIds();

        // Code
        if (ShaderBoy.util.same(ShaderBoy.oldBufferIds, ShaderBoy.activeBufferIds) === false)
        {
            ShaderBoy.oldBufferIds = ShaderBoy.activeBufferIds.concat();
        }

        if (needCompile)
        {
            this.compileShaders();
        }

        ShaderBoy.forceDraw = (ShaderBoy.isPlaying !== true);
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getCommonShaderCode()
    {
        let commonCode = '';
        ShaderBoy.shaderCommonLines = 0;
        if (ShaderBoy.buffers['Common'].active === true)
        {
            commonCode = ShaderBoy.buffers['Common'].cm.getValue();
            ShaderBoy.shaderCommonLines = commonCode.split(/\n/).length - 1;
        }
        return commonCode;
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    createVertexShader()
    {
        if (ShaderBoy.glVersion === 2.0)
            ShaderBoy.vsSource = ShaderBoy.shaderHeader[0] + "in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
        else
            ShaderBoy.vsSource = ShaderBoy.shaderHeader[0] + "attribute vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
    },

    getUniformCode()
    {
        ShaderBoy.gui_midi.collectUniforms();
        let uniformCode =
            ShaderLib.shader.uniformFS +
            ShaderBoy.gui.knobUniformFS +
            ShaderBoy.gui.midiUniformFS;
        ShaderBoy.shaderUniformsLines = uniformCode.split(/\n/).length - 1;
        return uniformCode;
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getFragmentCode(buffer, uniformCode, commonCode)
    {
        let fragCode = '';
        fragCode =
            ShaderBoy.shaderHeader[1] +
            uniformCode +
            commonCode +
            buffer.cm.getValue() +
            ShaderLib.shader.commonfooterFS;
        return fragCode;
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getSoundFragmentCode(buffer, commonCode)
    {
        let fragCode = '';
        fragCode =
            ShaderBoy.shaderHeader[1] +
            commonCode +
            buffer.cm.getValue() +
            ShaderLib.shader.soundfooterFS;
        return fragCode;
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    compileShaders()
    {
        console.log('bufferManager: compileShaders');

        if (ShaderBoy.io.initLoading === true)
        {
            this.createVertexShader();
            if (ShaderBoy.screenShader === null)
            {
                let screenFsHeader = '';
                if (ShaderBoy.glVersion !== 2.0)
                {
                    screenFsHeader += '#define outColor gl_FragColor\n';
                }
                ShaderBoy.screenShader = new Shader(ShaderBoy.gl, ShaderBoy.vsSource, screenFsHeader + ShaderBoy.shaderHeader[1] + ShaderLib.shader.screenFS + ShaderLib.shader.commonfooterFS);
                ShaderBoy.screenShader.compile();
                ShaderBoy.screenShader.uniforms = {
                    'iResolution': ShaderBoy.uniforms.iResolution,
                    'frameTexture': 0
                };
            }
        }
        else
        {
            if (ShaderBoy.buffers['Sound'].active && !ShaderBoy.soundRenderer.paused)
            {
                ShaderBoy.soundRenderer.stop();
            }
        }

        let uniformCode = this.getUniformCode();
        let commonCode = this.getCommonShaderCode();

        ShaderBoy.bufferManager.numCompiledBuffer = (ShaderBoy.buffers['Common'].active === true) ? 1 : 0;

        let callback = function ()
        {
            ShaderBoy.bufferManager.numCompiledBuffer++;
            if (ShaderBoy.bufferManager.numCompiledBuffer === ShaderBoy.activeBufferIds.length)
            {
                ShaderBoy.gui_header.setStatus('suc1', 'Compiled.', 3000);

                if (ShaderBoy.buffers['Sound'].active)
                {
                    let wasPlaying = ShaderBoy.isPlaying;
                    console.log('Reset Sound buffer...');
                    ShaderBoy.isPlaying = false;
                    ShaderBoy.soundRenderer.render();
                    // if (wasPlaying || ShaderBoy.io.initLoading === true)
                    {
                        ShaderBoy.soundRenderer.restart();
                        ShaderBoy.isPlaying = true;
                    }

                }
                if (ShaderBoy.io.initLoading === true)
                {
                    ShaderBoy.io.initLoading = false;
                    ShaderBoy.gui_header.setStatus('suc2', 'Loaded.', 3000, function ()
                    {
                        document.getElementById('cvr-loading').classList.add('loading-hide');
                        setTimeout(() =>
                        {
                            document.getElementById('cvr-loading').classList.add('loading-hidden');
                        }, 400);
                    });
                    ShaderBoy.update();
                    console.log('updating was started.');
                }
            }
        };

        for (const name in ShaderBoy.buffers)
        {
            const buffer = ShaderBoy.buffers[name];

            if (buffer.active && (buffer.isRenderable || name === 'Sound'))
            {
                if (name !== 'Sound')
                {
                    let fragmentCode = this.getFragmentCode(buffer, uniformCode, commonCode);
                    if (buffer.shader === null)
                    {
                        buffer.shader = new Shader(ShaderBoy.gl, ShaderBoy.vsSource, fragmentCode);
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
                        };
                        buffer.shader.bufName = name;
                    }
                    else
                    {
                        buffer.shader.fragmentSource = fragmentCode;
                    }
                }
                else
                {
                    let fragmentCode = this.getSoundFragmentCode(buffer, commonCode);
                    if (buffer.shader === null)
                    {
                        buffer.shader = new Shader(ShaderBoy.gl, ShaderBoy.vsSource, fragmentCode);
                        buffer.shader.uniforms = {
                            'iBlockOffset': 0,
                            'iSampleRate': 0
                        };
                        buffer.shader.bufName = name;
                    }
                    else
                    {
                        buffer.shader.fragmentSource = fragmentCode;
                    }
                }

                buffer.shader.compile(callback);
            }
        }


    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setSamplerFilter(texture, filter)
    {
        let gl = ShaderBoy.gl;
        gl.bindTexture(gl.TEXTURE_2D, texture);

        if (filter === 'nearest')
        {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        }
        else
        {// if (filter === 'linear') {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        // "mipmap" will support with image texture assets.
        // else if (filter === 'mipmap') {
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        //     gl.generateMipmap(gl.TEXTURE_2D);
        // }
        // else {
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
        //     gl.generateMipmap(gl.TEXTURE_2D);
        // }

        gl.bindTexture(gl.TEXTURE_2D, null);
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setSamplerWrap: function (texture, wrap)
    {
        let gl = ShaderBoy.gl;
        let glWrap = gl.REPEAT;
        if (wrap === 'clamp') glWrap = gl.CLAMP_TO_EDGE;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, glWrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, glWrap);
        gl.bindTexture(gl.TEXTURE_2D, null);
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setRenderResolution: function (texture, canvasWidth, canvasHeight)
    {
        let gl = ShaderBoy.gl;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        if (ShaderBoy.glVersion === 2.0)
        {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, canvasWidth, canvasHeight, 0, gl.RGBA, gl.FLOAT, null);
        }
        else
        {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvasWidth, canvasHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setFBOsProps: function ()
    {
        let gl = ShaderBoy.gl;
        let canvasWidth = Math.floor(((ShaderBoy.capture === null) ? gl.canvas.clientWidth : ShaderBoy.canvas.width) / ShaderBoy.renderScale);
        let canvasHeight = Math.floor(((ShaderBoy.capture === null) ? window.innerHeight : ShaderBoy.canvas.height) / ShaderBoy.renderScale);
        ShaderBoy.uniforms.iResolution[0] = canvasWidth;
        ShaderBoy.uniforms.iResolution[1] = canvasHeight;

        for (const name in ShaderBoy.buffers)
        {
            const buffer = ShaderBoy.buffers[name];

            if (buffer.active && buffer.isRenderable)
            {
                for (let i = 0; i < 2; i++)
                {
                    this.setRenderResolution(buffer.textures[i], canvasWidth, canvasHeight);
                    this.setSamplerFilter(buffer.textures[i], 'linear');
                    this.setSamplerWrap(buffer.textures[i], 'repeat');
                }
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    initFBOs: function ()
    {
        console.log('bufferManager: initFBOs');
        let gl = ShaderBoy.gl;

        // Just for Shadertoy compativility...
        this.tempTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.tempTexture);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        this.setRenderResolution(this.tempTexture, 256, 256);
        this.setSamplerFilter(this.tempTexture, 'linear');
        this.setSamplerWrap(this.tempTexture, 'repeat');
        gl.bindTexture(gl.TEXTURE_2D, null);

        for (const name in ShaderBoy.buffers)
        {
            let buffer = ShaderBoy.buffers[name];
            if (buffer.isRenderable)
            {
                buffer.framebuffer = gl.createFramebuffer();
                buffer.textures = [];

                for (let i = 0; i < 2; i++)
                {
                    buffer.textures.push(gl.createTexture());
                    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer.framebuffer);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, buffer.textures[i], 0);
                    gl.bindTexture(gl.TEXTURE_2D, buffer.textures[i]);
                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                }
            }
        }
        this.setFBOsProps();
    },
};

