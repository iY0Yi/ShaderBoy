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
		console.log("Float32Filter=" + gl.getExtension('OES_texture_float_linear'));
		console.log("Float16Filter=" + gl.getExtension('OES_texture_half_float_linear'));
		console.log("Anisotropic=" + gl.getExtension('EXT_texture_filter_anisotropic'));
		console.log("RenderToFloat32F=" + gl.getExtension('EXT_color_buffer_float'));

		this.shaders = {};

		let mainFragCode = '';
		mainFragCode =
			ShaderLib.shader.uniformFS +
			ShaderLib.shader.commonFS +
			ShaderLib.shader.imageFS +
			ShaderLib.shader.commonfooterFS;
		this.shaders.main = new Shader(gl, ShaderLib.shader.commonVS, mainFragCode);
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

		this.shaders.screen = new Shader(gl, ShaderLib.shader.commonVS, ShaderLib.shader.screenFS + ShaderLib.shader.commonfooterFS);
		this.shaders.screen.uniforms = {
			'iResolution': ShaderBoy.uniforms.iResolution,
			'frameTexture': 0
		};

		this.createBuffer(true);
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	recompile: function (commonCode, fragmentCode) {
		let mainFragCode = '';
		mainFragCode =
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

		// create textures
		this.mainTextures = [];
		for (let i = 0; i < 2; i++) {
			this.mainTextures.push(gl.createTexture());
			setFloatTextureParams(gl, this.mainTextures[i], window.innerWidth / ShaderBoy.renderScale, window.innerHeight / ShaderBoy.renderScale);
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.mainFramebuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.mainTextures[0], 0);
		gl.clearColor(1.0, 1.0, 1.0, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.mainFramebuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.mainTextures[1], 0);
		gl.clearColor(1.0, 1.0, 1.0, 1.0);
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