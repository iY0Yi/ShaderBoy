//   ___    _                 _
//  (  _`\ ( )               ( )
//  | (_(_)| |__     _ _    _| |   __   _ __
//  `\__ \ |  _ `\ /'_` ) /'_` | /'__`\( '__)
//  ( )_) || | | |( (_| |( (_| |(  ___/| |
//  `\____)(_) (_)`\__,_)`\__,_)`\____)(_)
//

import commands from '../commands'
import editor from '../editor/editor'
import gui from '../gui/gui'
import gui_header from '../gui/gui_header'
import gui_timeline from '../gui/gui_timeline'
import gui_inline_1f from '../gui/gui_inline_1f'
import gui_inline_2f from '../gui/gui_inline_2f'
import gui_inline_col from '../gui/gui_inline_col'
import io from '../io/io'
import ShaderBoy from '../shaderboy'

let gl = null

export default class Shader
{
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	constructor(gGl, vertexSource, fragmentSource)
	{
		gl = gGl
		const regexMap = (regex, text, cb) =>
		{
			let result
			while ((result = regex.exec(text)) != null)
			{
				cb(result)
			}
		}

		this.vertexSource = vertexSource
		this.fragmentSource = fragmentSource
		this.source = vertexSource + fragmentSource
		this.attributes = {}
		this.uniforms = {}
		this.uniformLocations = {}
		this.program = gl.createProgram()
		this.errors = []
		this.bufName = ''

		this.quadVBO = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, null)

		this.triVBO = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.triVBO)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, null)

		// Sampler uniforms need to be uploaded using `gl.uniform1i()` instead of `gl.uniform1f()`.
		// To do this automatically, we detect and remember all uniform samplers in the source code.
		let isSampler = {}
		regexMap(/uniform\s+sampler(1D|2D|3D|Cube)\s+(\w+)\s*;/g, vertexSource + fragmentSource, (groups) =>
		{
			isSampler[groups[2]] = 1
		})
		this.isSampler = isSampler
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	compile(succeedCallback)
	{
		// フラグメントシェーダーのコードを処理
		this.fragmentSource = gui_inline_1f.insertUniform(this.fragmentSource)
		this.fragmentSource = gui_inline_2f.insertUniform(this.fragmentSource)
		this.fragmentSource = gui_inline_col.insertUniform(this.fragmentSource)
		this.fragmentSource = this.fragmentSource.replace('　', ' ')
		this.fragmentSource = this.fragmentSource.replace('	', ' ')
		this.fragmentSource = this.fragmentSource.replace(/[^\x00-\x7F]/g, '')

		this.attributes = {}
		this.uniforms = {}
		this.uniformLocations = {}
		// gl.deleteProgram(this.program)
		// this.program = null
		// this.program = gl.createProgram()
		let pr = gl.createProgram()
		const splitErrorMsg = (str) =>
		{
			let res = []
			const errors = str.split(/\n/)
			for (let i = 0; i < errors.length - 1; i++)
			{
				let errorElements = errors[i].split(':')
				res[i] = {
					'lineNum': Math.max(1, errorElements[2] - (ShaderBoy.shaderHeaderLines[1] + ShaderBoy.shaderUniformsLines + ShaderBoy.shaderCommonLines + 2)),
					'element': errorElements[3],
					'msg': errorElements[4]
				}
			}
			return res
		}

		let isCompiled = false

		const compileSource = (gl, type, source) =>
		{
			const shader = gl.createShader(type)
			gl.shaderSource(shader, source)
			gl.compileShader(shader)

			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
			{
				this.errors = splitErrorMsg(gl.getShaderInfoLog(shader))
				editor.updateErrorInfo(this.bufName, this.errors)
				gui_header.setErrorOnly(this.bufName)
				isCompiled = false
			}
			else
			{
				this.errors = []
				editor.updateErrorInfo(this.bufName, this.errors)
				gui_header.removeErrorOnly(this.bufName)
				isCompiled = true
			}
			return shader
		}

		this.source = this.vertexSource + this.fragmentSource
		gl.attachShader(pr, compileSource(gl, gl.VERTEX_SHADER, this.vertexSource))
		gl.attachShader(pr, compileSource(gl, gl.FRAGMENT_SHADER, this.fragmentSource))
		gl.linkProgram(pr)

		let compiledCallback = ()=>{
			if (isCompiled)
			{
				this.program = pr
				this.vertAttLocation = gl.getAttribLocation(pr, 'pos')
				gl.enableVertexAttribArray(this.vertAttLocation)

				if (succeedCallback !== undefined)
				{
					succeedCallback()
				}
			}
			else
			{
				commands.stopTimeline()
				if (!io.initLoading)
				{
					gui_header.setStatus('error', 'Compilation failed!', 0)
				}
			}
		}

		if (ShaderBoy.glExt.AsynchCompile===null){
			compiledCallback()
		}
		else
		{
			let checkCompilation = ()=>
			{
					if( gl.getProgramParameter(pr, ShaderBoy.glExt.AsynchCompile.COMPLETION_STATUS_KHR) === true )
					{
						compiledCallback()
					}
					else
					{
						ShaderBoy.gui_header.setStatus('prgrs', 'Compiling...', 0)
						setTimeout(checkCompilation, 10)
					}
			}
			setTimeout(checkCompilation, 10)
		}
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	begin()
	{
		gl.useProgram(this.program)
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	end()
	{
		gl.disableVertexAttribArray(this.vertAttLocation)
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)
		gl.bindBuffer(gl.ARRAY_BUFFER, null)
		gl.useProgram(null)
	}

	setKnobsUniforms()
	{
		for (const knob of gui.knobs.knobs)
		{
			gl.uniform1f(gl.getUniformLocation(this.program, knob.name), (knob.value).toFixed(3))
		}
	}

	setSliderUniforms()
	{
		gl.uniform1f(gl.getUniformLocation(this.program, gui_inline_1f.name), gui_inline_1f.offset)
		gl.uniform2f(gl.getUniformLocation(this.program, gui_inline_2f.name), gui_inline_2f.offsetX, gui_inline_2f.offsetY)
		gl.uniform3f(gl.getUniformLocation(this.program, gui_inline_col.name), gui_inline_col.offsetR, gui_inline_col.offsetG, gui_inline_col.offsetB)
	}

	setMIDIUniforms()
	{
		for (const midiName in gui.midis)
		{
			const value = gui.midis[midiName]
			gl.uniform1f(gl.getUniformLocation(this.program, midiName), value)
		}
	}

	setShadetoyUniforms()
	{
		gl.uniform3fv(gl.getUniformLocation(this.program, 'iResolution'), new Float32Array(this.uniforms.iResolution))
		gl.uniform1f(gl.getUniformLocation(this.program, 'iTime'), this.uniforms.iTime)
		gl.uniform1f(gl.getUniformLocation(this.program, 'iTimeDelta'), this.uniforms.iTimeDelta)
		gl.uniform1i(gl.getUniformLocation(this.program, 'iFrame'), this.uniforms.iFrame)
		gl.uniform1f(gl.getUniformLocation(this.program, 'iFrameRate'), this.uniforms.iFrameRate)
		gl.uniform4fv(gl.getUniformLocation(this.program, 'iDate'), new Float32Array(this.uniforms.iDate))
		gl.uniform4fv(gl.getUniformLocation(this.program, 'iMouse'), new Float32Array(this.uniforms.iMouse))
		gl.uniform1f(gl.getUniformLocation(this.program, 'iSampleRate'), this.uniforms.iSampleRate)
		gl.uniform1i(gl.getUniformLocation(this.program, 'iChannel0'), 0)
		gl.uniform1i(gl.getUniformLocation(this.program, 'iChannel1'), 1)
		gl.uniform1i(gl.getUniformLocation(this.program, 'iChannel2'), 2)
		gl.uniform1i(gl.getUniformLocation(this.program, 'iChannel3'), 3)
		gl.uniform4fv(gl.getUniformLocation(this.program, 'iWheel'), new Float32Array(this.uniforms.iWheel))
	}

	setShadetoySoundShaderUniforms()
	{
		gl.uniform1f(gl.getUniformLocation(this.program, 'iBlockOffset'), this.uniforms.iBlockOffset)
		gl.uniform1f(gl.getUniformLocation(this.program, 'iSampleRate'), this.uniforms.iSampleRate)
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setUniforms()
	{
		const isArray = (obj) =>
		{
			const str = Object.prototype.toString.call(obj)
			return str === '[object Array]' || str === '[object Float32Array]'
		}

		const isNumber = (obj) =>
		{
			const str = Object.prototype.toString.call(obj)
			return str === '[object Number]' || str === '[object Boolean]'
		}

		for (const name in this.uniforms)
		{
			const realName = name.replace(/\"/g, '')
			const location = this.uniformLocations[realName] || gl.getUniformLocation(this.program, name)

			if (!location) continue
			this.uniformLocations[realName] = location
			const value = this.uniforms[name]

			if (isArray(value))
			{
				let v, m
				switch (value.length)
				{
					case 1:
						if (isChannel)
						{
							gl.uniform1i(location, value)
						} else
						{
							v = new Float32Array(value)
							gl.uniform1fv(location, v)
							v = null
						}
						break
					case 2:
						v = new Float32Array(value)
						gl.uniform2fv(location, v)
						v = null
						break
					case 3:
						v = new Float32Array(value)
						gl.uniform3fv(location, v)
						v = null
						break
					case 4:
						v = new Float32Array(value)
						gl.uniform4fv(location, v)
						v = null
						break
					// Matrices are automatically transposed, since WebGL uses column-major
					// indices instead of row-major indices.
					case 9:
						m = [
							value[0], value[3], value[6],
							value[1], value[4], value[7],
							value[2], value[5], value[8]
						]
						v = new Float32Array(m)
						gl.uniformMatrix3fv(location, false, v)
						m = null
						v = null
						break
					case 16:
						m = [
							value[0], value[4], value[8], value[12],
							value[1], value[5], value[9], value[13],
							value[2], value[6], value[10], value[14],
							value[3], value[7], value[11], value[15]
						]
						v = new Float32Array(m)
						gl.uniformMatrix4fv(location, false, v)
						m = null
						v = null
						break
					default:
						gl.uniform1fv(location, new Float32Array(value))
						break
				}
			}
			else if (isNumber(value))
			{
				(this.isSampler[name] ? gl.uniform1i : gl.uniform1f).call(gl, location, value)
			}
			else
			{
				throw new Error(`attempted to set uniform "${name}" to invalid value ${value}`)
			}
		}

		return this
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setTextureSlot(id)
	{
		gl.activeTexture(gl.TEXTURE0+id)
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setTexture2d(id, texture)
	{
		gl.activeTexture(gl.TEXTURE0+id)
		gl.bindTexture(gl.TEXTURE_2D, texture)
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setTexture3d(id, texture)
	{
		gl.bindTexture(gl.TEXTURE_2D, null)
		eval(`this.gl.activeTexture(this.gl.TEXTURE${id});`)
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	drawScreen()
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO)
		gl.vertexAttribPointer(this.vertAttLocation, 2, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(this.vertAttLocation)
		if (gui_timeline.offsetFrames >= gui_timeline.currentFrame) gl.clear(gl.COLOR_BUFFER_BIT)
		gl.drawArrays(gl.TRIANGLES, 0, 6)
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	drawTexture(fbo, texture)
	{
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
		if (texture !== undefined) gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.triVBO)
		gl.vertexAttribPointer(this.vertAttLocation, 2, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(this.vertAttLocation)
		if (gui_timeline.offsetFrames >= gui_timeline.currentFrame) gl.clear(gl.COLOR_BUFFER_BIT)
		gl.drawArrays(gl.TRIANGLES, 0, 3)
	}
}
