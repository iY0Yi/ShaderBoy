import ShaderBoy from './shaderboy';
import util from './util';

let gl = null;
export default class Shader
{

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	constructor(gGl, vertexSource, fragmentSource)
	{
		gl = gGl;
		function regexMap(regex, text, cb)
		{
			let result;
			while ((result = regex.exec(text)) != null)
			{
				cb(result);
			}
		}

		this.vertexSource = vertexSource;
		this.fragmentSource = fragmentSource;
		this.source = vertexSource + fragmentSource;
		this.attributes = {};
		this.uniforms = {};
		this.uniformLocations = {};
		this.program = gl.createProgram();
		this.errors = [];
		this.bufName = '';
		this.quadVBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		this.triVBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.triVBO);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		// Sampler uniforms need to be uploaded using `gl.uniform1i()` instead of `gl.uniform1f()`.
		// To do this automatically, we detect and remember all uniform samplers in the source code.
		let isSampler = {};
		regexMap(/uniform\s+sampler(1D|2D|3D|Cube)\s+(\w+)\s*;/g, vertexSource + fragmentSource, function (groups)
		{
			isSampler[groups[2]] = 1;
		});
		this.isSampler = isSampler;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	compile(succeedCallback)
	{
		this.fragmentSource = this.fragmentSource.replace('　', ' ');
		this.fragmentSource = this.fragmentSource.replace('	', ' ');
		this.fragmentSource = this.fragmentSource.replace(/[^\x00-\x7F]/g, '');

		this.attributes = {};
		this.uniforms = {};
		this.uniformLocations = {};
		gl.deleteProgram(this.program);
		this.program = null;
		this.program = gl.createProgram();

		function splitErrorMsg(str)
		{
			let res = [];
			let errors = str.split(/\n/);
			for (let i = 0; i < errors.length - 1; i++)
			{
				let errorElements = errors[i].split(':');
				res[i] = {
					'lineNum': Math.max(1, errorElements[2] - (ShaderBoy.shaderHeaderLines[1] + ShaderBoy.shaderUniformsLines + ShaderBoy.shaderCommonLines + 2)),
					'element': errorElements[3],
					'msg': errorElements[4]
				};
			}
			return res;
		}

		function compileSource(scope, gl, type, source)
		{
			var shader = gl.createShader(type);
			gl.shaderSource(shader, source);
			gl.compileShader(shader);

			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
			{
				// throw new Error('compile error: ' + gl.getShaderInfoLog(shader));
				scope.errors = splitErrorMsg(gl.getShaderInfoLog(shader));
				console.log(scope.errors);
				ShaderBoy.editor.updateErrorInfo(scope.bufName, scope.errors);
				ShaderBoy.gui_header.setErrorOnly(scope.bufName);

				ShaderBoy.gui_header.setStatus('error', 'Compilation failed.', 0);
			}
			else
			{
				scope.errors = [];
				ShaderBoy.editor.updateErrorInfo(scope.bufName, scope.errors);
				ShaderBoy.gui_header.removeErrorOnly(scope.bufName);
				if (succeedCallback !== undefined && type === gl.FRAGMENT_SHADER)
				{
					succeedCallback();
				}
			}

			return shader;
		}

		this.source = this.vertexSource + this.fragmentSource;
		gl.attachShader(this.program, compileSource(this, gl, gl.VERTEX_SHADER, this.vertexSource));
		gl.attachShader(this.program, compileSource(this, gl, gl.FRAGMENT_SHADER, this.fragmentSource));
		gl.linkProgram(this.program);
		this.vertAttLocation = gl.getAttribLocation(this.program, 'pos');
		gl.enableVertexAttribArray(this.vertAttLocation);

		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
		{
			// throw new Error('link error: ' + gl.getProgramInfoLog(this.program));
			console.log('link error: ' + gl.getProgramInfoLog(this.program));
		}
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	begin()
	{
		gl.useProgram(this.program);
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	end()
	{
		gl.disableVertexAttribArray(this.vertAttLocation);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.useProgram(null);
	}

	setSliderUniforms()
	{
		for (let i = 0; i < ShaderBoy.gui.sldrs.length; i++)
		{
			const element = ShaderBoy.gui.sldrs[i];
			gl.uniform1f(gl.getUniformLocation(this.program, 'sld' + i), (element.ui.value / 1000).toFixed(3));
		}
	}

	setKnobsUniforms()
	{
		for (let i = 0; i < ShaderBoy.gui.knobs.knobs.length; i++)
		{
			const element = ShaderBoy.gui.knobs.knobs[i];
			gl.uniform1f(gl.getUniformLocation(this.program, element.name), (element.value).toFixed(3));
		}
	}

	setMIDIUniforms()
	{
		for (const midiName in ShaderBoy.gui.midis)
		{
			const value = ShaderBoy.gui.midis[midiName];
			gl.uniform1f(gl.getUniformLocation(this.program, midiName), value);
		}
	}

	setShadetoyUniforms()
	{
		gl.uniform3fv(gl.getUniformLocation(this.program, 'iResolution'), new Float32Array(this.uniforms.iResolution));
		gl.uniform1f(gl.getUniformLocation(this.program, 'iTime'), this.uniforms.iTime);
		gl.uniform1f(gl.getUniformLocation(this.program, 'iTimeDelta'), this.uniforms.iTimeDelta);
		gl.uniform1i(gl.getUniformLocation(this.program, 'iFrame'), this.uniforms.iFrame);
		gl.uniform1f(gl.getUniformLocation(this.program, 'iFrameRate'), this.uniforms.iFrameRate);
		gl.uniform4fv(gl.getUniformLocation(this.program, 'iDate'), new Float32Array(this.uniforms.iDate));
		gl.uniform4fv(gl.getUniformLocation(this.program, 'iMouse'), new Float32Array(this.uniforms.iMouse));
		gl.uniform1i(gl.getUniformLocation(this.program, 'iChannel0'), 0);
		gl.uniform1i(gl.getUniformLocation(this.program, 'iChannel1'), 1);
		gl.uniform1i(gl.getUniformLocation(this.program, 'iChannel2'), 2);
		gl.uniform1i(gl.getUniformLocation(this.program, 'iChannel3'), 3);
	}



	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setUniforms()
	{
		let isArray = function (obj)
		{
			let str = Object.prototype.toString.call(obj);
			return str == '[object Array]' || str == '[object Float32Array]';
		};

		let isNumber = function (obj)
		{
			let str = Object.prototype.toString.call(obj);
			return str == '[object Number]' || str == '[object Boolean]';
		};

		for (let name in this.uniforms)
		{

			let realName = name.replace(/\"/g, '');
			let location = this.uniformLocations[realName] || gl.getUniformLocation(this.program, name);

			if (!location) continue;
			this.uniformLocations[realName] = location;
			let value = this.uniforms[name];

			if (isArray(value))
			{
				let v, m;
				switch (value.length)
				{
					case 1:
						if (isChannel)
						{
							gl.uniform1i(location, value);
						} else
						{
							v = new Float32Array(value);
							gl.uniform1fv(location, v);
							v = null;
						}
						break;
					case 2:
						v = new Float32Array(value);
						gl.uniform2fv(location, v);
						v = null;
						break;
					case 3:
						v = new Float32Array(value);
						gl.uniform3fv(location, v);
						v = null;
						break;
					case 4:
						v = new Float32Array(value);
						gl.uniform4fv(location, v);
						v = null;
						break;
					// Matrices are automatically transposed, since WebGL uses column-major
					// indices instead of row-major indices.
					case 9:
						m = [
							value[0], value[3], value[6],
							value[1], value[4], value[7],
							value[2], value[5], value[8]
						];
						v = new Float32Array(m);
						gl.uniformMatrix3fv(location, false, v);
						m = null;
						v = null;
						break;
					case 16:
						m = [
							value[0], value[4], value[8], value[12],
							value[1], value[5], value[9], value[13],
							value[2], value[6], value[10], value[14],
							value[3], value[7], value[11], value[15]
						];
						v = new Float32Array(m);
						gl.uniformMatrix4fv(location, false, v);
						m = null;
						v = null;
						break;
					default:
						gl.uniform1fv(location, new Float32Array(value));
						break;
					// throw new Error('don\'t know how to load uniform "' + name + '" of length ' + value.length);
				}
			}
			else if (isNumber(value))
			{
				(this.isSampler[name] ? gl.uniform1i : gl.uniform1f).call(gl, location, value);
			}
			else
			{
				console.log('attempted to set uniform "' + name + '" to invalid value ' + value);
				// throw new Error('attempted to set uniform "' + name + '" to invalid value ' + value);
			}
			location = null;
			value = null;
		}

		return this;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setTextureSlot(id)
	{

		switch (id)
		{
			case 0:
				gl.activeTexture(gl.TEXTURE0);
				break;
			case 1:
				gl.activeTexture(gl.TEXTURE1);
				break;
			case 2:
				gl.activeTexture(gl.TEXTURE2);
				break;
			case 3:
				gl.activeTexture(gl.TEXTURE3);
				break;
			default:
				gl.activeTexture(gl.TEXTURE0);
				break;
		}
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setTexture2d(id, texture)
	{

		switch (id)
		{
			case 0:
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				break;
			case 1:
				gl.activeTexture(gl.TEXTURE1);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				break;
			case 2:
				gl.activeTexture(gl.TEXTURE2);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				break;
			case 3:
				gl.activeTexture(gl.TEXTURE3);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				break;
			default:
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				break;
		}
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setTexture3d(id, texture)
	{
		this.gl = gl;
		gl.bindTexture(gl.TEXTURE_2D, null);
		eval('this.gl.activeTexture(this.gl.TEXTURE' + id + ');');
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	drawScreen()
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO);
		gl.vertexAttribPointer(this.vertAttLocation, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vertAttLocation);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	drawTexture(fbo, texture)
	{
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
		if (texture !== undefined) gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.triVBO);
		gl.vertexAttribPointer(this.vertAttLocation, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vertAttLocation);
		// gl.clearColor(0.0, 0.0, 0.0, 1.0);
		// gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}
}