import SPT,
{
	gl,
	debug
}
	from '../main';

var glUtil = {

	setUniforms: function (program, uniforms) {
		for (var name in uniforms) {
			if (name !== undefined) {
				var value = uniforms[name];
				var location = gl.getUniformLocation(program, name);
				if (location === null) {
					continue;
				}

				if (value instanceof Array) {
					value = new Float32Array(value);
				}

				if (value instanceof Float32Array) {
					switch (value.length) {
						case 2:
							gl.uniform2fv(location, value);
							break;
						case 3:
							gl.uniform3fv(location, value);
							break;
						case 4:
							gl.uniform4fv(location, value);
							break;
						case 9:
							gl.uniformMatrix3fv(location, value);
							break;
						case 16:
							gl.uniformMatrix4fv(location, false, value);
							break;
						default:
							console.log('Warning: Invalid Float32Array.');
							break;
					}
				}
				else {
					gl.uniform1f(location, value);
				}
			}
		}
	},

	compileSource: function (source, type) {
		var shader = gl.createShader(type);
		if (debug.SHADER) {
			console.log(source);
		}
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			throw 'compile error: ' + gl.getShaderInfoLog(shader);
		}
		return shader;
	},

	compileShader: function (vertexSource, fragmentSource) {
		var gl = SPT.gl;
		if (debug.SHADER) console.time('gl.createProgram');
		var shaderProgram = gl.createProgram();
		if (debug.SHADER) console.timeEnd('gl.createProgram');
		if (debug.SHADER) console.time('gl.attachShaderVs');
		gl.attachShader(shaderProgram, this.compileSource(vertexSource, gl.VERTEX_SHADER));
		if (debug.SHADER) console.timeEnd('gl.attachShaderVs');
		if (debug.SHADER) console.time('gl.attachShaderFs');
		gl.attachShader(shaderProgram, this.compileSource(fragmentSource, gl.FRAGMENT_SHADER));
		if (debug.SHADER) console.timeEnd('gl.attachShaderFs');
		if (debug.SHADER) console.time('gl.linkProgram');
		gl.linkProgram(shaderProgram);
		if (debug.SHADER) console.timeEnd('gl.linkProgram');
		if (debug.SHADER) console.time('gl.getProgramParameter');
		var param = gl.getProgramParameter(shaderProgram, gl.LINK_STATUS);
		if (debug.SHADER) console.timeEnd('gl.getProgramParameter');
		if (debug.SHADER) console.log(gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS));
		if (debug.SHADER) console.log(gl.getProgramInfoLog(shaderProgram));

		if (!param) {
			throw 'link error: ' + gl.getProgramInfoLog(shaderProgram);
		}
		return shaderProgram;
	},

	createTextureFromImg: function (url) {
		var img = new Image();
		var gl = SPT.gl;
		img.onload = function () {
			var tex = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, tex);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
			return tex;
		};
		img.src = url;
	},
};
export default glUtil;