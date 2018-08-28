import ShaderBoy from '../shaderboy';

let gl = null;
export default class Shader {
	constructor(gGl, vertexSource, fragmentSource) {
		gl = gGl;
		function regexMap(regex, text, callback) {
			let result;
			while ((result = regex.exec(text)) != null) {
				callback(result);
			}
		}

		function compileSource(gl, type, source) {
			var shader = gl.createShader(type);
			gl.shaderSource(shader, source);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				console.log(source);
				throw new Error('compile error: ' + gl.getShaderInfoLog(shader));
			}
			return shader;
		}

		this.vertexSource = vertexSource;
		this.fragmentSource = fragmentSource;
		this.source = vertexSource + fragmentSource;
		this.attributes = {};
		this.uniforms = {};
		this.uniformLocations = {};
		this.program = gl.createProgram();

		this.quadVBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		this.triVBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.triVBO);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.attachShader(this.program, compileSource(gl, gl.VERTEX_SHADER, vertexSource));
		gl.attachShader(this.program, compileSource(gl, gl.FRAGMENT_SHADER, fragmentSource));
		gl.linkProgram(this.program);
		this.vertAttLocation = gl.getAttribLocation(this.program, 'pos');
		gl.enableVertexAttribArray(this.vertAttLocation);

		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
			throw new Error('link error: ' + gl.getProgramInfoLog(this.program));
		}

		// Sampler uniforms need to be uploaded using `gl.uniform1i()` instead of `gl.uniform1f()`.
		// To do this automatically, we detect and remember all uniform samplers in the source code.
		let isSampler = {};
		regexMap(/uniform\s+sampler(1D|2D|3D|Cube)\s+(\w+)\s*;/g, vertexSource + fragmentSource, function (groups) {
			isSampler[groups[2]] = 1;
		});
		this.isSampler = isSampler;
	}

	recompileFragment(fragmentSource) {
		fragmentSource = fragmentSource.replace('　', ' ');
		fragmentSource = fragmentSource.replace('	', ' ');
		fragmentSource = fragmentSource.replace(/[^\x00-\x7F]/g, '');

		this.attributes = {};
		this.uniforms = {};
		this.uniformLocations = {};
		gl.deleteProgram(this.program);
		this.program = null;
		this.program = gl.createProgram();
		function compileSource(gl, type, source) {
			var shader = gl.createShader(type);
			gl.shaderSource(shader, source);
			gl.compileShader(shader);

			if (ShaderBoy.needEditor) {
				if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
					// throw new Error('compile error: ' + gl.getShaderInfoLog(shader));

					ShaderBoy.gui.header.needUpdate = true;
					ShaderBoy.gui.header.contents.innerText = 'error: ' + gl.getShaderInfoLog(shader);
					ShaderBoy.gui.header.base.domElement.style.backgroundColor = '#FF0000';
					setTimeout(function () {
						ShaderBoy.gui.header.needUpdate = false;
						ShaderBoy.gui.header.base.domElement.style.backgroundColor = '#00000066';
					}, 6000);
				}
				else {
					ShaderBoy.gui.header.needUpdate = true;
					ShaderBoy.gui.header.contents.innerText = 'compiled.';
					ShaderBoy.gui.header.base.domElement.style.backgroundColor = '#3ca403';
					setTimeout(function () {
						ShaderBoy.gui.header.needUpdate = false;
						ShaderBoy.gui.header.base.domElement.style.backgroundColor = '#00000066';
					}, 1500);
				}
			}
			return shader;
		}
		this.fragmentSource = fragmentSource;
		this.source = this.vertexSource + fragmentSource;
		gl.attachShader(this.program, compileSource(gl, gl.VERTEX_SHADER, this.vertexSource));
		gl.attachShader(this.program, compileSource(gl, gl.FRAGMENT_SHADER, this.fragmentSource));
		gl.linkProgram(this.program);
		this.vertAttLocation = gl.getAttribLocation(this.program, 'pos');
		gl.enableVertexAttribArray(this.vertAttLocation);

		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
			throw new Error('link error: ' + gl.getProgramInfoLog(this.program));
		}
	}

	begin() {
		gl.useProgram(this.program);
		// gl.clearColor(1.0, 1.0, 1.0, 1.0);
		// gl.clearDepth(1.0);
		// gl.clear(gl.COLOR_BUFFER_BIT);
	}

	end() {
		// gl.clearColor(1.0, 1.0, 1.0, 1.0);
		// gl.clearDepth(1.0);
		// gl.clear(gl.COLOR_BUFFER_BIT);
		gl.disableVertexAttribArray(this.vertAttLocation);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.useProgram(null);
	}

	setUniforms() {
		let isArray = function (obj) {
			let str = Object.prototype.toString.call(obj);
			return str == '[object Array]' || str == '[object Float32Array]';
		};

		let isNumber = function (obj) {
			let str = Object.prototype.toString.call(obj);
			return str == '[object Number]' || str == '[object Boolean]';
		};
		// if(name==='iChannel0')
		{
			let location = this.uniformLocations['iChannel0'] || gl.getUniformLocation(this.program, 'iChannel0');
			gl.uniform1i(location, 0);
		}

		let location = this.uniformLocations['iChannel0'] || gl.getUniformLocation(this.program, 'iChannel0');

		for (let name in this.uniforms) {
			// console.log(name);
			let realName = name.replace(/\"/g, '');
			let location = this.uniformLocations[realName] || gl.getUniformLocation(this.program, realName);
			if (realName == 'iFrame') {
				let value = this.uniforms[name];
				gl.uniform1i(location, value);
				return this;
			}
			if (!location) continue;
			this.uniformLocations[realName] = location;
			let value = this.uniforms[name];

			if (isArray(value)) {
				let v, m;
				switch (value.length) {
					case 1:
						v = new Float32Array(value);
						gl.uniform1fv(location, v);
						v = null;
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
						// console.log(value);
						gl.uniform1fv(location, value);
						break;
					// throw new Error('don\'t know how to load uniform "' + name + '" of length ' + value.length);
				}
			}
			else if (isNumber(value)) {
				(this.isSampler[name] ? gl.uniform1i : gl.uniform1f).call(gl, location, value);
			}
			else {
				throw new Error('attempted to set uniform "' + name + '" to invalid value ' + value);
			}
			location = null;
			value = null;
		}

		return this;
	}

	setTexture2d(id, texture) {
		this.gl = gl;
		gl.bindTexture(gl.TEXTURE_2D, null);
		eval('this.gl.activeTexture(this.gl.TEXTURE' + id + ');');
		gl.bindTexture(gl.TEXTURE_2D, texture);
	}

	setTexture3d(id, texture) {
		this.gl = gl;
		gl.bindTexture(gl.TEXTURE_2D, null);
		eval('this.gl.activeTexture(this.gl.TEXTURE' + id + ');');
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	}

	drawScreen() {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO);
		gl.vertexAttribPointer(this.vertAttLocation, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vertAttLocation);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	drawTexture(fbo, texture) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
		if (texture !== undefined) gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.triVBO);
		gl.vertexAttribPointer(this.vertAttLocation, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vertAttLocation);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}
}