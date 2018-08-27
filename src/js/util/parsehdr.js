////////////////////////////////////////////////////////////////////////////////
// class HDRParser
////////////////////////////////////////////////////////////////////////////////

//Code ported by Marcin Ignac (2014)
//Based on Java implementation from
//https://code.google.com/r/cys12345-research/source/browse/hdr/image_processor/RGBE.java?r=7d84e9fd866b24079dbe61fa0a966ce8365f5726

var HDRParser = {
	radiancePattern: '#\\?RADIANCE',
	commentPattern: '#.*',
	// gammaPattern: 'GAMMA=',
	exposurePattern: 'EXPOSURE=\\s*([0-9]*[.][0-9]*)',
	formatPattern: 'FORMAT=32-bit_rle_rgbe',
	widthHeightPattern: '-Y ([0-9]+) \\+X ([0-9]+)',

	loadBinary: function (url, scope, callback)
	{
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';
		request.onreadystatechange = function (e)
		{
			if (request.readyState === 4)
			{
				if (request.status === 200)
				{
					callback(null, request.response, scope);
				}
				else
				{
					callback('loadBinaryFile error : ' + request.response + e.toString(), null);
				}
			}
		};
		request.send(null);
	},

	//http://croquetweak.blogspot.co.uk/2014/08/deconstructing-floats-frexp-and-ldexp.html
	ldexp: function (mantissa, exponent)
	{
		return exponent > 1023 // avoid multiplying by infinity
			? mantissa * Math.pow(2, 1023) * Math.pow(2, exponent - 1023) : exponent < -1074 // avoid multiplying by zero
			? mantissa * Math.pow(2, -1074) * Math.pow(2, exponent + 1074) : mantissa * Math.pow(2, exponent);
	},

	readPixelsRawRLE: function (buffer, data, offset, fileOffset, scanlineWidth, numScanlines)
	{
		var rgbe = new Array(4);
		var scanlineBuffer = null;
		var ptr;
		var ptrEnd;
		var count;
		var buf = new Array(2);
		var bufferLength = buffer.length;

		function readBuf(buf)
		{
			var bytesRead = 0;
			do {
				buf[bytesRead++] = buffer[fileOffset];
			} while (++fileOffset < bufferLength && bytesRead < buf.length);
			return bytesRead;
		}

		function readBufOffset(buf, offset, length)
		{
			var bytesRead = 0;
			do {
				buf[offset + bytesRead++] = buffer[fileOffset];
			} while (++fileOffset < bufferLength && bytesRead < length);
			return bytesRead;
		}

		function readPixelsRaw(buffer, data, offset, numpixels)
		{
			var numExpected = 4 * numpixels;
			var numRead = readBufOffset(data, offset, numExpected);
			if (numRead < numExpected)
			{
				throw new Error('Error reading raw pixels: got ' + numRead + ' bytes, expected ' + numExpected);
			}
		}

		while (numScanlines > 0)
		{
			if (readBuf(rgbe) < rgbe.length)
			{
				throw new Error('Error reading bytes: expected ' + rgbe.length);
			}

			if ((rgbe[0] !== 2) || (rgbe[1] !== 2) || ((rgbe[2] & 0x80) !== 0))
			{
				//this file is not run length encoded
				data[offset++] = rgbe[0];
				data[offset++] = rgbe[1];
				data[offset++] = rgbe[2];
				data[offset++] = rgbe[3];
				readPixelsRaw(buffer, data, offset, scanlineWidth * numScanlines - 1);
				return;
			}

			if ((((rgbe[2] & 0xFF) << 8) | (rgbe[3] & 0xFF)) !== scanlineWidth)
			{
				throw new Error('Wrong scanline width ' + (((rgbe[2] & 0xFF) << 8) | (rgbe[3] & 0xFF)) + ', expected ' + scanlineWidth);
			}

			if (scanlineBuffer === null)
			{
				scanlineBuffer = new Array(4 * scanlineWidth);
			}

			ptr = 0;
			/* read each of the four channels for the scanline into the buffer */
			for (var i = 0; i < 4; i++)
			{
				ptrEnd = (i + 1) * scanlineWidth;
				while (ptr < ptrEnd)
				{
					if (readBuf(buf) < buf.length)
					{
						throw new Error('Error reading 2-byte buffer');
					}
					if ((buf[0] & 0xFF) > 128)
					{
						/* a run of the same value */
						count = (buf[0] & 0xFF) - 128;
						if ((count === 0) || (count > ptrEnd - ptr))
						{
							throw new Error('Bad scanline data');
						}
						while (count-- > 0)
						{
							scanlineBuffer[ptr++] = buf[1];
						}
					}
					else
					{
						/* a non-run */
						count = buf[0] & 0xFF;
						if ((count === 0) || (count > ptrEnd - ptr))
						{
							throw new Error('Bad scanline data');
						}
						scanlineBuffer[ptr++] = buf[1];
						if (--count > 0)
						{
							if (readBufOffset(scanlineBuffer, ptr, count) < count)
							{
								throw new Error('Error reading non-run data');
							}
							ptr += count;
						}
					}
				}
			}

			/* copy byte data to output */
			for (i = 0; i < scanlineWidth; i++)
			{
				data[offset + 0] = scanlineBuffer[i];
				data[offset + 1] = scanlineBuffer[i + scanlineWidth];
				data[offset + 2] = scanlineBuffer[i + 2 * scanlineWidth];
				data[offset + 3] = scanlineBuffer[i + 3 * scanlineWidth];
				offset += 4;
			}

			numScanlines--;
		}

	},

	//Returns data as floats and flipped along Y by default
	parseHdr: function (buffer)
	{
		if (buffer instanceof ArrayBuffer)
		{
			buffer = new Uint8Array(buffer);
		}

		var fileOffset = 0;
		var bufferLength = buffer.length;

		var NEW_LINE = 10;

		function readLine()
		{
			var buf = '';
			do {
				var b = buffer[fileOffset];
				if (b === NEW_LINE)
				{
					++fileOffset;
					break;
				}
				buf += String.fromCharCode(b);
			} while (++fileOffset < bufferLength);
			return buf;
		}

		var width = 0;
		var height = 0;
		var exposure = 1;
		var gamma = 1;
		var rle = false;

		for (var i = 0; i < 20; i++)
		{
			var line = readLine();
			var match;
			if (line.match(this.radiancePattern))
			{
				match = line.match(this.radiancePattern);
			}
			else if (line.match(this.formatPattern))
			{
				match = line.match(this.formatPattern);
				rle = true;
			}
			else if (line.match(this.exposurePattern))
			{
				match = line.match(this.exposurePattern);
				exposure = Number(match[1]);
			}
			else if (line.match(this.commentPattern))
			{
				match = line.match(this.commentPattern);
			}
			else if (line.match(this.widthHeightPattern))
			{
				match = line.match(this.widthHeightPattern);
				height = Number(match[1]);
				width = Number(match[2]);
				break;
			}
		}

		if (!rle)
		{
			throw new Error('File is not run length encoded!');
		}

		var data = new Uint8Array(width * height * 4);
		var scanlineWidth = width;
		var numScanlines = height;

		this.readPixelsRawRLE(buffer, data, 0, fileOffset, scanlineWidth, numScanlines);

		//TODO: Should be Float16
		var floatData = new Float32Array(width * height * 4);
		for (var offset = 0; offset < data.length; offset += 4)
		{
			var r = data[offset + 0] / 255;
			var g = data[offset + 1] / 255;
			var b = data[offset + 2] / 255;
			var e = data[offset + 3];
			var f = Math.pow(2.0, e - 128.0);

			r *= f;
			g *= f;
			b *= f;

			var floatOffset = offset;

			floatData[floatOffset + 0] = r;
			floatData[floatOffset + 1] = g;
			floatData[floatOffset + 2] = b;
			floatData[floatOffset + 3] = 1.0;
		}

		return {
			shape: [width, height],
			exposure: exposure,
			gamma: gamma,
			data: floatData
		};
	}
};
export default HDRParser;