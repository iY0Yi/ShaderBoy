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
import bufferManager from './buffer_manager';

export default ShaderBoy.renderer = {
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	render: function () {
		let gl = ShaderBoy.gl;
		let canvasWidth = (ShaderBoy.capture === null) ? gl.canvas.clientWidth : ShaderBoy.canvas.width;
		let canvasHeight = (ShaderBoy.capture === null) ? window.innerHeight : ShaderBoy.canvas.height;
		gl.viewport(0, 0, canvasWidth / ShaderBoy.renderScale, canvasHeight / ShaderBoy.renderScale);

		const len = ShaderBoy.activeBufferIds.length;
		for (let i = 0; i < len; i++) {
			const name = ShaderBoy.activeBufferIds[i];
			if (ShaderBoy.buffers[name].isRenderable) {
				let buffer = ShaderBoy.buffers[name];
				buffer.shader.begin();
				buffer.shader.uniforms.iResolution = ShaderBoy.uniforms.iResolution;
				buffer.shader.uniforms.iTime = ShaderBoy.uniforms.iTime;
				buffer.shader.uniforms.iTimeDelta = ShaderBoy.uniforms.iTimeDelta;
				buffer.shader.uniforms.iFrame = ShaderBoy.uniforms.iFrame;
				buffer.shader.uniforms.iFrameRate = ShaderBoy.uniforms.iFrameRate;
				buffer.shader.uniforms.iDate = ShaderBoy.uniforms.iDate;
				buffer.shader.uniforms.iMouse = [ShaderBoy.uniforms.iMouse[0] / ShaderBoy.renderScale, ShaderBoy.uniforms.iMouse[1] / ShaderBoy.renderScale, ShaderBoy.uniforms.iMouse[2] / ShaderBoy.renderScale, ShaderBoy.uniforms.iMouse[3] / ShaderBoy.renderScale];
				buffer.shader.uniforms.iChannel0 = 0;
				buffer.shader.uniforms.iChannel1 = 1;
				buffer.shader.uniforms.iChannel2 = 2;
				buffer.shader.uniforms.iChannel3 = 3;
				for (let j = 0; j < 4; j++) {
					const iChannelSetting = buffer.iChannel[j];
					if (iChannelSetting !== null) {
						// if (name === 'BufferA') console.log(j + ': ', iChannelSetting);
						let texid = 0;
						buffer.needSwap = (name === iChannelSetting.asset);
						let texture = ShaderBoy.buffers[iChannelSetting.asset].textures[(buffer.needSwap) ? 1 : 0];
						buffer.shader.setTextureSlot(j);
						ShaderBoy.bufferManager.setSamplerFilter(texture, iChannelSetting.filter);
						ShaderBoy.bufferManager.setSamplerWrap(texture, iChannelSetting.wrap);
						gl.bindTexture(gl.TEXTURE_2D, texture);
					}
				}
				buffer.shader.setShadetoyUniforms();
				buffer.shader.drawTexture(buffer.framebuffer, buffer.textures[0]);
				buffer.shader.end();
			}
		}

		gl.viewport(0, 0, canvasWidth, canvasHeight);
		ShaderBoy.screenShader.begin();
		ShaderBoy.screenShader.uniforms.iResolution = [ShaderBoy.uniforms.iResolution[0] * ShaderBoy.renderScale, ShaderBoy.uniforms.iResolution[1] * ShaderBoy.renderScale, ShaderBoy.uniforms.iResolution[2]];
		ShaderBoy.screenShader.uniforms.frameTexture = 0;
		ShaderBoy.bufferManager.setSamplerFilter(ShaderBoy.buffers['MainImage'].textures[0], 'nearest');
		ShaderBoy.bufferManager.setSamplerWrap(ShaderBoy.buffers['MainImage'].textures[0], 'clamp');
		ShaderBoy.screenShader.setTexture2d(0, ShaderBoy.buffers['MainImage'].textures[0]);
		ShaderBoy.screenShader.setUniforms();
		ShaderBoy.screenShader.drawScreen();
		ShaderBoy.screenShader.end();

		gl.flush();

		for (let i = 0; i < len; i++) {
			const name = ShaderBoy.activeBufferIds[i];
			if (ShaderBoy.buffers[name].isRenderable) {
				if (ShaderBoy.buffers[name].needSwap)
					ShaderBoy.buffers[name].textures.reverse();
			}
		}
	}
};