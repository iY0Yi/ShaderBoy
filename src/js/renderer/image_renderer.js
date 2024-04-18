//
//   ___                      _
//  |  _`\                   ( )
//  | (_) )   __    ___     _| |   __   _ __   __   _ __
//  | ,  /  /'__`\/' _ `\ /'_` | /'__`\( '__)/'__`\( '__)
//  | |\ \ (  ___/| ( ) |( (_| |(  ___/| |  (  ___/| |
//  (_) (_)`\____)(_) (_)`\__,_)`\____)(_)  `\____)(_)
//
//

import ShaderBoy from '../shaderboy'
import bufferManager from '../buffer/buffer_manager'

export default ShaderBoy.imageRenderer = {
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	render()
	{
		ShaderBoy.resetViewportSize()

		const gl = ShaderBoy.gl
		gl.viewport(0, 0, ShaderBoy.canvasWidth / ShaderBoy.renderScale, ShaderBoy.canvasHeight / ShaderBoy.renderScale)

		const len = ShaderBoy.activeBufferIds.length
		for (const name of ShaderBoy.activeBufferIds)
		{
			if (!ShaderBoy.buffers[name].isRenderable || ShaderBoy.buffers[name].shader === null)
			{
				continue
			}

			const buffer = ShaderBoy.buffers[name]
			buffer.shader.begin()
			buffer.shader.uniforms.iResolution = ShaderBoy.uniforms.iResolution
			buffer.shader.uniforms.iTime = ShaderBoy.uniforms.iTime
			buffer.shader.uniforms.iTimeDelta = ShaderBoy.uniforms.iTimeDelta
			buffer.shader.uniforms.iFrame = ShaderBoy.uniforms.iFrame
			buffer.shader.uniforms.iFrameRate = ShaderBoy.uniforms.iFrameRate
			buffer.shader.uniforms.iDate = ShaderBoy.uniforms.iDate
			buffer.shader.uniforms.iMouse = [ShaderBoy.uniforms.iMouse[0] / ShaderBoy.renderScale, ShaderBoy.uniforms.iMouse[1] / ShaderBoy.renderScale, ShaderBoy.uniforms.iMouse[2] / ShaderBoy.renderScale, ShaderBoy.uniforms.iMouse[3] / ShaderBoy.renderScale]
			buffer.shader.uniforms.iSampleRate = 44100
			buffer.shader.uniforms.iChannel0 = 0
			buffer.shader.uniforms.iChannel1 = 1
			buffer.shader.uniforms.iChannel2 = 2
			buffer.shader.uniforms.iChannel3 = 3
			for (let j = 0; j < 4; j++)
			{
				const iChannelSetting = buffer.iChannel[j]
				let texture
				if (iChannelSetting !== null)
				{
					buffer.needSwap = (name === iChannelSetting.asset)
					texture = ShaderBoy.buffers[iChannelSetting.asset].textures[(buffer.needSwap) ? 1 : 0]
					bufferManager.setSamplerFilter(texture, iChannelSetting.filter)
					bufferManager.setSamplerWrap(texture, iChannelSetting.wrap)
				}
				else
				{
					texture = bufferManager.tempTexture
				}
				buffer.shader.setTextureSlot(j)
				gl.bindTexture(gl.TEXTURE_2D, texture)
			}
			buffer.shader.setKnobsUniforms()
			buffer.shader.setMIDIUniforms()
			buffer.shader.setShadetoyUniforms()
			buffer.shader.drawTexture(buffer.framebuffer, buffer.textures[0])
			buffer.shader.end()

		}

		gl.viewport(0, 0, ShaderBoy.canvasWidth, ShaderBoy.canvasHeight)
		ShaderBoy.screenShader.begin()
		ShaderBoy.screenShader.uniforms.iResolution = [ShaderBoy.uniforms.iResolution[0] * ShaderBoy.renderScale, ShaderBoy.uniforms.iResolution[1] * ShaderBoy.renderScale, ShaderBoy.uniforms.iResolution[2]]
		ShaderBoy.screenShader.uniforms.frameTexture = 0
		bufferManager.setSamplerFilter(ShaderBoy.buffers['Image'].textures[0], 'nearest')
		bufferManager.setSamplerWrap(ShaderBoy.buffers['Image'].textures[0], 'clamp')
		ShaderBoy.screenShader.setTexture2d(0, ShaderBoy.buffers['Image'].textures[0])
		ShaderBoy.screenShader.setUniforms()
		ShaderBoy.screenShader.drawScreen()
		ShaderBoy.screenShader.end()

		gl.flush()

		for (const name of ShaderBoy.activeBufferIds)
		{
			if (ShaderBoy.buffers[name].isRenderable && ShaderBoy.buffers[name].needSwap)
			{
				ShaderBoy.buffers[name].textures.reverse()
			}
		}
	}
}