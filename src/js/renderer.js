//
//   ___                      _                          
//  |  _`\                   ( )                         
//  | (_) )   __    ___     _| |   __   _ __   __   _ __ 
//  | ,  /  /'__`\/' _ `\ /'_` | /'__`\( '__)/'__`\( '__)
//  | |\ \ (  ___/| ( ) |( (_| |(  ___/| |  (  ___/| |   
//  (_) (_)`\____)(_) (_)`\__,_)`\____)(_)  `\____)(_)   
//                                                       
//                                                       

import ShaderBoy from './shaderboy';
import ShaderLib from './shader/shaderlib';
import Shader from './shader/shader';
import AssetLoader from './util/AssetLoader';

let gl = null;

export default ShaderBoy.renderer = {

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	init: function () {
		gl = ShaderBoy.gl;

		this.shaders = {};

		let mainFragCode = '';
		mainFragCode =
			ShaderBoy.shaderHeader[1] +
			ShaderLib.shader.uniformFS +
			ShaderLib.shader.commonFS +
			ShaderLib.shader.imageFS +
			ShaderLib.shader.commonfooterFS;
		let vsSource = null;
		if (ShaderBoy.glVersion === 2.0)
			vsSource = ShaderBoy.shaderHeader[0] + "in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
		else
			vsSource = ShaderBoy.shaderHeader[0] + "attribute vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";

		this.shaders.main = new Shader(gl, vsSource, mainFragCode);
		this.shaders.main.uniforms = {
			'iResolution': ShaderBoy.uniforms.iResolution,           // viewport resolution (in pixels)
			'iTime': ShaderBoy.uniforms.iTime,                 // shader playback time (in seconds)
			'iTimeDelta': 0,            // render time (in seconds)
			'iFrame': ShaderBoy.uniforms.iFrame,                // shader playback frame
			// 'iDate': iDate,                 // (year, month, day, time in seconds)
			// 'iChannelTime': [iTime, iTime, iTime, iTime],			 // channel playback time (in seconds)
			// 'iChannelResolution':[iResolution, iResolution, iResolution, iResolution],    // channel resolution (in pixels)
			'iMouse': ShaderBoy.uniforms.iMouse,                // mouse pixel coords. xy: current (if MLB down), zw: click
			'iChannel0': 0,             // input channel. XX = 2D/Cube
			// 'iChannel1': 1,             // input channel. XX = 2D/Cube
			// 'iChannel2': 2,             // input channel. XX = 2D/Cube
			// 'iChannel3': 3,             // input channel. XX = 2D/Cube
		};

		let screenFsHeader = '';
		if (ShaderBoy.glVersion === 2.0) {
		}
		else {
			screenFsHeader += '#define outColor gl_FragColor\n';
		}
		this.shaders.screen = new Shader(gl, vsSource, screenFsHeader + ShaderBoy.shaderHeader[1] + ShaderLib.shader.screenFS + ShaderLib.shader.commonfooterFS);
		this.shaders.screen.uniforms = {
			'iResolution': ShaderBoy.uniforms.iResolution,
			'frameTexture': 0
		};

		this.createBuffer(true);
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	recompile: function (commonCode, fragmentCode) {
		let mainFragCode = '';
		ShaderBoy.shaderUniformsLines = ShaderLib.shader.uniformFS.split(/\n/).length - 1;
		ShaderBoy.shaderCommonLines = commonCode.split(/\n/).length - 1;

		mainFragCode +=
			ShaderBoy.shaderHeader[1] +
			ShaderLib.shader.uniformFS +
			commonCode +
			fragmentCode +
			ShaderLib.shader.commonfooterFS;
		this.shaders.main.recompileFragment(mainFragCode);
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	createBuffer: function (init) {
		function setFloatTextureParams(gl, texture, width, height) {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}

		function setUnsignedByteTextureParams(gl, texture, width, height) {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}

		// create mainFramebuffer
		this.mainFramebuffer = gl.createFramebuffer();
		if (init === false) {
			gl.deleteTexture(this.mainTextures[0]);
			gl.deleteTexture(this.mainTextures[1]);
		}

		function getPowerOf2(val) {
			let res;
			if (val >= 2048) res = 2048;
			else if (val < 2048 && val >= 1024) res = 1024;
			else if (val < 1024 && val >= 512) res = 512;
			else if (val < 512 && val >= 256) res = 256;
			else if (val < 256 && val >= 128) res = 128;
			else if (val < 128 && val >= 64) res = 64;
			else if (val < 64 && val >= 16) res = 16;
			else res = 16;
			return res;
		}
		// create textures
		this.mainTextures = [];
		for (let i = 0; i < 2; i++) {
			this.mainTextures.push(gl.createTexture());
			if (ShaderBoy.glVersion === 2.0) {
				setFloatTextureParams(gl, this.mainTextures[i], window.innerWidth / ShaderBoy.renderScale, window.innerHeight / ShaderBoy.renderScale);
			}
			else {
				let width = window.innerWidth / ShaderBoy.renderScale;
				let height = window.innerHeight / ShaderBoy.renderScale;
				let res = (width > height) ? width : height;
				res = getPowerOf2(res);
				setUnsignedByteTextureParams(gl, this.mainTextures[i], width, height);
			}
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.mainFramebuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.mainTextures[0], 0);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.mainFramebuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.mainTextures[1], 0);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	render: function () {
		gl.viewport(0, 0, gl.canvas.clientWidth / ShaderBoy.renderScale, window.innerHeight / ShaderBoy.renderScale);
		this.shaders.main.begin();
		this.shaders.main.uniforms.iResolution = [ShaderBoy.uniforms.iResolution[0] / ShaderBoy.renderScale, ShaderBoy.uniforms.iResolution[1] / ShaderBoy.renderScale];
		this.shaders.main.uniforms.iTime = ShaderBoy.uniforms.iTime;
		this.shaders.main.uniforms.iTimeDelta = ShaderBoy.uniforms.iTimeDelta;
		this.shaders.main.uniforms.iFrame = ShaderBoy.uniforms.iFrame;
		this.shaders.main.uniforms.iChannel0 = 0;
		this.shaders.main.uniforms.iMouse = ShaderBoy.uniforms.iMouse;
		this.shaders.main.setUniforms();
		this.shaders.main.setTexture2d(0, this.mainTextures[0]);
		this.shaders.main.drawTexture(this.mainFramebuffer, this.mainTextures[1]);
		this.shaders.main.end();

		gl.viewport(0, 0, gl.canvas.clientWidth, window.innerHeight);
		this.shaders.screen.begin();
		this.shaders.screen.uniforms.iResolution = ShaderBoy.uniforms.iResolution;
		this.shaders.screen.uniforms.frameTexture = 0;
		this.shaders.screen.setUniforms();
		this.shaders.screen.setTexture2d(0, this.mainTextures[0]);
		this.shaders.screen.drawScreen();
		this.shaders.screen.end();

		gl.flush();

		this.mainTextures.reverse();
	}
};