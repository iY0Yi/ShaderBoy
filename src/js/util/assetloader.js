import HDRParser from '../util/parsehdr';

export default class AssetLoader {
	constructor() {
		this.envMapTexture = null;
	}

	//
	// Initialize a texture and load an image.
	// When the image finished loading copy it into the texture.
	//
	loadTexture(gl, url) {
		function isPowerOf2(value) {
			return (value & (value - 1)) == 0;
		}
		const texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Because images have to be download over the internet
		// they might take a moment until they are ready.
		// Until then put a single pixel in the texture so we can
		// use it immediately. When the image has finished downloading
		// we'll update the texture with the contents of the image.
		const level = 0;
		const internalFormat = gl.RGBA;
		const width = 1;
		const height = 1;
		const border = 0;
		const srcFormat = gl.RGBA;
		const srcType = gl.UNSIGNED_BYTE;
		const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
			width, height, border, srcFormat, srcType,
			pixel);

		const image = new Image();
		image.onload = function () {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
				srcFormat, srcType, image);
			if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			}
		};
		image.src = url;

		return texture;
	}

	loadHdrEnvMap(url) {
		// load HDR texture
		HDRParser.loadBinary(url, this, function (err, hdr) {
			let imgHdr = HDRParser.parseHdr(hdr);
			AssetLoader.envMapTexture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, AssetLoader.envMapTexture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texImage2D(
				gl.TEXTURE_2D, 0, gl.RGBA, imgHdr.shape[0], imgHdr.shape[1], 0,
				gl.RGBA, gl.FLOAT, imgHdr.data
			);
			gl.bindTexture(gl.TEXTURE_2D, null);
			console.log('HDR is OK.');
		});
	}
}