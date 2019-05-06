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
        ShaderBoy.buffers['BufferA'] = new BufferDataContainer(true);
        ShaderBoy.buffers['BufferB'] = new BufferDataContainer(true);
        ShaderBoy.buffers['BufferC'] = new BufferDataContainer(true);
        ShaderBoy.buffers['BufferD'] = new BufferDataContainer(true);
        ShaderBoy.buffers['MainImage'] = new BufferDataContainer(true);
        ShaderBoy.buffers['MainSound'] = new BufferDataContainer(true);

        this.initBufferDoc(['Config']);
        this.initBufferDoc(['Common']);
        this.initBufferDoc(['BufferA']);
        this.initBufferDoc(['BufferB']);
        this.initBufferDoc(['BufferC']);
        this.initBufferDoc(['BufferD']);
        this.initBufferDoc(['MainImage']);

        ShaderBoy.buffers['Setting'].active = false;
        ShaderBoy.buffers['Config'].active = false;
        ShaderBoy.buffers['Common'].active = false;
        ShaderBoy.buffers['BufferA'].active = false;
        ShaderBoy.buffers['BufferB'].active = false;
        ShaderBoy.buffers['BufferC'].active = false;
        ShaderBoy.buffers['BufferD'].active = false;
        ShaderBoy.buffers['MainImage'].active = true;

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
        if (ShaderBoy.buffers['MainImage'].active === true) ShaderBoy.activeBufferIds.push('MainImage');
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
    buildShaderFromBuffers()
    {
        console.log('bufferManager: buildShaderFromBuffers');
        for (const name in ShaderBoy.buffers)
        {
            if (name !== 'Config' && name !== 'Setting')
            {
                ShaderBoy.buffers[name].active = ShaderBoy.config.buffers[name].active;

                if (ShaderBoy.buffers[name].isRenderable && ShaderBoy.buffers[name].active)
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
                                console.log('YES');
                                ShaderBoy.buffers[name].iChannel[i] = newChannelSetting;
                            }
                            else
                            {
                                console.log('NO');
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
                console.log('ShaderBoy.buffers[name]', name, ShaderBoy.buffers[name]);
            }
        }
        ShaderBoy.config = JSON.parse(JSON.stringify(ShaderBoy.config, null, "\t"));

        this.resetActiveBufferIds();
        // Code
        if (ShaderBoy.util.same(ShaderBoy.oldBufferIds, ShaderBoy.activeBufferIds) === false)
        {
            console.log('initShaders');
            ShaderBoy.oldBufferIds = ShaderBoy.activeBufferIds.concat();
            this.initShaders();
        }
        else
        {
            console.log('recompileShaders');
            this.recompileShaders();
        }

        ShaderBoy.forceDraw = (ShaderBoy.isPlaying !== true);
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getCommonShaderCode()
    {
        let commonShaderCode = '';
        ShaderBoy.shaderCommonLines = 0;
        if (ShaderBoy.buffers['Common'].active === true)
        {
            commonShaderCode = ShaderBoy.util.deepcopy(ShaderBoy.buffers['Common'].cm.getValue());
            ShaderBoy.shaderCommonLines = commonShaderCode.split(/\n/).length - 1;
        }
        return commonShaderCode;
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getFragmentCode(buffer, commonShaderCode)
    {
        let fragCode = '';
        fragCode =
            ShaderBoy.shaderHeader[1] +
            ShaderLib.shader.uniformFS +
            ShaderBoy.gui.knobUniformFS +
            ShaderBoy.gui.midiUniformFS +
            commonShaderCode +
            buffer.cm.getValue() +
            ShaderLib.shader.commonfooterFS;
        return fragCode;
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    initShaders()
    {
        console.log('bufferManager: initShaders');

        ShaderBoy.gui_midi.collectUniforms();

        if (ShaderBoy.glVersion === 2.0)
            ShaderBoy.vsSource = ShaderBoy.shaderHeader[0] + "in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
        else
            ShaderBoy.vsSource = ShaderBoy.shaderHeader[0] + "attribute vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";

        let commonShaderCode = this.getCommonShaderCode();

        for (const name in ShaderBoy.buffers)
        {
            const buffer = ShaderBoy.buffers[name];

            if (buffer.active && buffer.isRenderable)
            {
                let callback = function () { };
                if (name === 'MainImage' && ShaderBoy.io.initLoading === true)
                {
                    callback = function ()
                    {
                        if (ShaderBoy.io.initLoading === true)
                        {
                            let loadDiv = document.getElementById('cvr-loading');
                            ShaderBoy.canvas = document.getElementById('gl_canvas');
                            console.log('updating was started.');
                            ShaderBoy.io.initLoading = false;
                            ShaderBoy.update();
                        }
                    };
                }

                buffer.shader = new Shader(ShaderBoy.gl, ShaderBoy.vsSource, this.getFragmentCode(buffer, commonShaderCode));
                buffer.shader.bufName = name;
                buffer.shader.compile(callback);
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
                    // 'iChannelTime': [iTime, iTime, iTime, iTime],			 // channel playback time (in seconds)
                    // 'iChannelResolution':[iResolution, iResolution, iResolution, iResolution],    // channel resolution (in pixels)
                };
            }
        }

        if (ShaderBoy.screenShader === null)
        {
            let screenFsHeader = '';
            if (ShaderBoy.glVersion === 2.0)
            {
            }
            else
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

        // ShaderBoy.editor.setBuffer('MainImage');
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    recompileShaders()
    {
        console.log('bufferManager: recompileShaders');

        ShaderBoy.gui_midi.collectUniforms();

        let uniformCodeStr =
            ShaderLib.shader.uniformFS +
            ShaderBoy.gui.knobUniformFS +
            ShaderBoy.gui.midiUniformFS;

        ShaderBoy.shaderUniformsLines = uniformCodeStr.split(/\n/).length - 1;

        let commonShaderCode = this.getCommonShaderCode();
        ShaderBoy.bufferManager.numCompiledBuffer = 0;
        for (let name in ShaderBoy.buffers)
        {
            let buffer = ShaderBoy.buffers[name];
            console.log(name, ': ', buffer);
            if (buffer.active === true && buffer.isRenderable && buffer.shader !== null)
            {
                let newSource = this.getFragmentCode(buffer, commonShaderCode);
                let newPureSource = (newSource + '').replace(/\s+/g, '');
                let curPureSource = (buffer.shader.fragmentSource + '').replace(/\s+/g, '');
                // if (newPureSource !== curPureSource)
                {
                    let callback = function ()
                    {
                        ShaderBoy.bufferManager.numCompiledBuffer++;
                        if (ShaderBoy.bufferManager.numCompiledBuffer === ShaderBoy.activeBufferIds.length)
                        {
                            ShaderBoy.gui_header.setStatus('suc1', 'Compiled.', 3000);
                        }
                    }

                    buffer.shader.fragmentSource = newSource;
                    buffer.shader.compile(callback);
                }
                // else
                // {
                //     ShaderBoy.bufferManager.numCompiledBuffer++;
                // }
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
                    gl.clearColor(0.0, 0.0, 0.0, 1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.bindTexture(gl.TEXTURE_2D, buffer.textures[i]);
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                }
            }
        }
        this.setFBOsProps();
    },
};