import ShaderBoy from './shaderboy';
////////////////////////////////////////////////////////////////////////////////
// singleton ShaderLib
////////////////////////////////////////////////////////////////////////////////

var ShaderLib = {
	shader:
		{},
	loadedNum: 0,
	shaderNum: 0,
	shaderInitialized: false,

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	loadTextFile: function (name, url)
	{
		// Set up an asynchronous request
		let request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.setRequestHeader('Pragma', 'no-cache');
		request.setRequestHeader('Cache-Control', 'no-cache');
		request.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT');
		request.root = this;
		// Hook the event that gets called as the request progresses
		request.onreadystatechange = function ()
		{
			// If the request is "DONE" (completed or failed)
			if (request.readyState === 4)
			{
				// If we got HTTP status 200 (OK)
				if (request.status === 200)
				{
					let root = this.root;
					let shaderTxt = request.responseText;
					// if (debug.SHADER) console.log('loadedShader: ' + name);
					root.loadedNum++;
					if (root.shader[name] !== null)
					{
						root.shader[name] = null;
					}
					root.shader[name] = shaderTxt;
					if (root.loadedNum === root.shaderNum)
					{
						if (root.shaderInitialized === true)
						{
							// if (debug.SHADER) {
							// console.log(shaderTxt);
							// }
						}
						else
						{
							root.shaderInitialized = true;
							root.callback();
						}
						root.loadedNum = 0;
					}
				}
				else
				{ // Failed
					console.log('Failed to load the shader"' + url + '"');
				}
			}
		};

		request.send(null);
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	loadShadersFiles: function (ref, callback)
	{

		this.callback = callback;
		this.shaderNum = ref.length;

		for (let i = 0; i < this.shaderNum; i++)
		{
			let name = ref[i].name;
			let url = window.location.href + ref[i].url;
			this.loadTextFile(name, url);
		}
	}
};

export default ShaderLib;