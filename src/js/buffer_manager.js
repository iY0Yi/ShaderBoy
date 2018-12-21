import ShaderBoy from './shaderboy';
import BufferDataContainer from './buffer_data_container';
import ShaderLib from './shader/shaderlib';
import Shader from './shader/shader';
// import log from './util/logutil';
let gl = null;
let log = console.log;
let oldBufferIds = [];

export default ShaderBoy.bufferManager = {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    init: function () {
        ShaderBoy.buffers['Setting'] = new BufferDataContainer(false);
        ShaderBoy.buffers['Config'] = new BufferDataContainer(false);
        ShaderBoy.buffers['Common'] = new BufferDataContainer(false);
        ShaderBoy.buffers['BufferA'] = new BufferDataContainer(true);
        ShaderBoy.buffers['BufferB'] = new BufferDataContainer(true);
        ShaderBoy.buffers['BufferC'] = new BufferDataContainer(true);
        ShaderBoy.buffers['BufferD'] = new BufferDataContainer(true);
        ShaderBoy.buffers['MainImage'] = new BufferDataContainer(true);
        ShaderBoy.buffers['MainSound'] = new BufferDataContainer(true);
        ShaderBoy.buffers['Setting'].active = true;
        ShaderBoy.buffers['Config'].active = true;
        ShaderBoy.buffers['MainImage'].active = true;
        gl = ShaderBoy.gl;

        // buffer ids for moving buffer to buffer
        this.currentBufferDataId = 0;
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    resetActiveBufferIds: function () {
        let currentBufName = 'MainImage';
        ShaderBoy.activeBufferIds = [];
        if (ShaderBoy.buffers['Setting'].active === true) ShaderBoy.activeBufferIds.push('Setting');
        if (ShaderBoy.buffers['Config'].active === true) ShaderBoy.activeBufferIds.push('Config');
        if (ShaderBoy.buffers['Common'].active === true) ShaderBoy.activeBufferIds.push('Common');
        if (ShaderBoy.buffers['BufferA'].active === true) ShaderBoy.activeBufferIds.push('BufferA');
        if (ShaderBoy.buffers['BufferB'].active === true) ShaderBoy.activeBufferIds.push('BufferB');
        if (ShaderBoy.buffers['BufferC'].active === true) ShaderBoy.activeBufferIds.push('BufferC');
        if (ShaderBoy.buffers['BufferD'].active === true) ShaderBoy.activeBufferIds.push('BufferD');
        if (ShaderBoy.buffers['MainImage'].active === true) ShaderBoy.activeBufferIds.push('MainImage');
        console.log('ShaderBoy.activeBufferIds', ShaderBoy.activeBufferIds);
        this.currentBufferDataId = ShaderBoy.activeBufferIds.indexOf(currentBufName);
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getSetting: function () {
        let setting = JSON.parse(ShaderBoy.buffers['Setting'].cm.getValue());
        return setting;
    },
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getConfig: function () {
        let config = JSON.parse(ShaderBoy.buffers['Config'].cm.getValue());
        return config;
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    resetBufferData: function (needForceResetBuffer) {

        let settingObj = this.getSetting();

        console.log('settingObj.shaders.active: ', settingObj.shaders.active);
        console.log('ShaderBoy.activeShaderName: ', ShaderBoy.activeShaderName);

        // If calling of resetBufferData is initial, "settingObj.shaders.active" is undefined.
        // So, we compile it anyway.
        if (settingObj.shaders.active === undefined || ShaderBoy.activeShaderName === settingObj.shaders.active) {

            ShaderBoy.config = this.getConfig();
            let needResetBuffers = needForceResetBuffer;
            const ASSETS_NAME = ['BufferA', 'BufferB', 'BufferC', 'BufferD'];
            for (const name in ShaderBoy.buffers) {
                if (ShaderBoy.buffers.hasOwnProperty(name) && name !== 'Config' && name !== 'Setting') {
                    // 
                    // 
                    ShaderBoy.buffers[name].active = ShaderBoy.config.buffers[name].active;
                    if (ShaderBoy.buffers[name].isRenderable) {
                        // 
                        // 
                        for (let i = 0; i < 4; i++) {
                            const newChannelSetting = ShaderBoy.config.buffers[name].iChannel[i];
                            if (newChannelSetting.asset !== null) {
                                if (ShaderBoy.buffers[name].iChannel[i] !== null) {
                                    if (ShaderBoy.buffers[name].iChannel[i].asset !== newChannelSetting.asset) {
                                        needResetBuffers = true;
                                    }
                                }

                                for (let j = 0; j < ASSETS_NAME.length; j++) {
                                    const assetName = ASSETS_NAME[j];
                                    if (newChannelSetting.asset === assetName) {
                                        ShaderBoy.buffers[name].iChannel[i] = newChannelSetting;
                                    }
                                }

                                if (ShaderBoy.buffers[name].iChannel[i] !== null) {
                                    if (
                                        newChannelSetting.asset !== ShaderBoy.buffers[name].iChannel[i].asset ||
                                        newChannelSetting.filter !== ShaderBoy.buffers[name].iChannel[i].filter ||
                                        newChannelSetting.wrap !== ShaderBoy.buffers[name].iChannel[i].wrap ||
                                        newChannelSetting.vflip !== ShaderBoy.buffers[name].iChannel[i].vflip
                                    ) {
                                        needResetBuffers = true;
                                    }
                                }
                            }
                            else {
                                if (ShaderBoy.buffers[name].iChannel[i] !== null) {
                                    if (ShaderBoy.buffers[name].iChannel[i].asset !== null) {
                                        needResetBuffers = true;
                                    }
                                }
                                ShaderBoy.buffers[name].iChannel[i] = null;
                            }
                        }
                        // 
                        // 
                    }
                    // 
                    // 
                }
            }

            this.resetActiveBufferIds();

            if (ShaderBoy.util.same(oldBufferIds, ShaderBoy.activeBufferIds) === false) {
                oldBufferIds = ShaderBoy.activeBufferIds.concat();
                this.initShaders();
            }

            if (needResetBuffers) {
                this.initFrameBuffers();
            }
            this.recompile();

            if (ShaderBoy.isPlaying !== true) {
                ShaderBoy.forceDraw = true;
            }
        }
        else {
            //active shader name. to be loaded.
            ShaderBoy.activeShaderName = settingObj.shaders.active;
            ShaderBoy.io.loadShader(ShaderBoy.activeShaderName, false);
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getCommonCode: function () {
        let commonCode = '';
        ShaderBoy.shaderCommonLines = 0;
        if (ShaderBoy.buffers['Common'].active === true) {
            commonCode = ShaderBoy.util.deepcopy(ShaderBoy.buffers['Common'].cm.getValue());
            ShaderBoy.shaderCommonLines = commonCode.split(/\n/).length - 1;
        }
        return commonCode;
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getFragmentCode: function (buffer, commonCode) {
        let fragCode = '';
        fragCode =
            ShaderBoy.shaderHeader[1] +
            ShaderLib.shader.uniformFS +
            commonCode +
            buffer.cm.getValue() +
            ShaderLib.shader.commonfooterFS;
        return fragCode;
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    initShaders: function () {
        if (ShaderBoy.glVersion === 2.0)
            ShaderBoy.vsSource = ShaderBoy.shaderHeader[0] + "in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
        else
            ShaderBoy.vsSource = ShaderBoy.shaderHeader[0] + "attribute vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";

        let commonCode = this.getCommonCode();

        for (const name in ShaderBoy.buffers) {
            if (ShaderBoy.buffers.hasOwnProperty(name)) {
                const buffer = ShaderBoy.buffers[name];
                if (buffer.active && buffer.isRenderable) {
                    buffer.shader = new Shader(gl, ShaderBoy.vsSource, this.getFragmentCode(buffer, commonCode));
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
        }

        if (ShaderBoy.screenShader === null) {
            let screenFsHeader = '';
            if (ShaderBoy.glVersion === 2.0) {
            }
            else {
                screenFsHeader += '#define outColor gl_FragColor\n';
            }
            ShaderBoy.screenShader = new Shader(gl, ShaderBoy.vsSource, screenFsHeader + ShaderBoy.shaderHeader[1] + ShaderLib.shader.screenFS + ShaderLib.shader.commonfooterFS);
            ShaderBoy.screenShader.uniforms = {
                'iResolution': ShaderBoy.uniforms.iResolution,
                'frameTexture': 0
            };
        }

        ShaderBoy.editor.setBuffer('MainImage');
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    recompile: function () {
        ShaderBoy.shaderUniformsLines = ShaderLib.shader.uniformFS.split(/\n/).length - 1;
        let commonCode = this.getCommonCode();

        for (let name in ShaderBoy.buffers) {
            if (ShaderBoy.buffers.hasOwnProperty(name)) {
                let buffer = ShaderBoy.buffers[name];
                if (buffer.active && buffer.isRenderable && buffer.shader !== null) {
                    let newCode = this.getFragmentCode(buffer, commonCode);
                    let newPureCode = (newCode + '').replace(/\s+/g, '');
                    let curPureCode = (buffer.shader.fragmentSource + '').replace(/\s+/g, '');
                    if (newPureCode !== curPureCode) {
                        buffer.shader.recompileFragment(newCode, (name === 'MainImage'));
                    }
                    else {
                        console.log('newPureCode', newPureCode);
                        console.log('curPureCode', curPureCode);
                    }
                }
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setSamplerFilter: function (texture, filter) {
        gl.bindTexture(gl.TEXTURE_2D, texture);

        if (filter === 'nearest') {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        }
        else {// if (filter === 'linear') {
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
    setSamplerWrap: function (texture, wrap) {
        let glWrap = gl.REPEAT;
        if (wrap === 'clamp') glWrap = gl.CLAMP_TO_EDGE;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, glWrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, glWrap);
        gl.bindTexture(gl.TEXTURE_2D, null);
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    initFrameBuffers: function () {
        for (const name in ShaderBoy.buffers) {
            if (ShaderBoy.buffers.hasOwnProperty(name)) {
                let buffer = ShaderBoy.buffers[name];
                if (buffer.isRenderable) {
                    if (buffer.framebuffer === null) {
                        // create framebuffer
                        buffer.framebuffer = gl.createFramebuffer();
                    }
                    else {
                        // clear old textures
                        for (let i = 0; i < 2; i++) {
                            if (buffer.textures[i] !== null || buffer.textures[i] !== undefined) {
                                gl.deleteTexture(buffer.textures[i]);
                            }
                        }
                    }

                    buffer.textures = [];
                    let canvasWidth = Math.floor(((ShaderBoy.capture === null) ? gl.canvas.clientWidth : ShaderBoy.canvas.width) / ShaderBoy.renderScale);
                    let canvasHeight = Math.floor(((ShaderBoy.capture === null) ? window.innerHeight : ShaderBoy.canvas.height) / ShaderBoy.renderScale);

                    for (let i = 0; i < 2; i++) {
                        buffer.textures.push(gl.createTexture());
                        ShaderBoy.uniforms.iResolution[0] = canvasWidth;
                        ShaderBoy.uniforms.iResolution[1] = canvasHeight;
                        this.setSamplerFilter(buffer.textures[i], 'linear');
                        this.setSamplerWrap(buffer.textures[i], 'repeat');
                        gl.bindTexture(gl.TEXTURE_2D, buffer.textures[i]);
                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                        if (ShaderBoy.glVersion === 2.0) {
                            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, canvasWidth, canvasHeight, 0, gl.RGBA, gl.FLOAT, null);
                        }
                        else {
                            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvasWidth, canvasHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                        }
                        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer.framebuffer);
                        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, buffer.textures[i], 0);
                        gl.clearColor(0.0, 0.0, 0.0, 1.0);
                        gl.clear(gl.COLOR_BUFFER_BIT);
                        gl.bindTexture(gl.TEXTURE_2D, null);
                        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                    }
                }
            }
        }
    },
};