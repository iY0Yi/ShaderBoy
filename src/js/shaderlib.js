//   ___    _                 _               _         _     
//  (  _`\ ( )               ( )             ( )     _ ( )    
//  | (_(_)| |__     _ _    _| |   __   _ __ | |    (_)| |_   
//  `\__ \ |  _ `\ /'_` ) /'_` | /'__`\( '__)| |  _ | || '_`\ 
//  ( )_) || | | |( (_| |( (_| |(  ___/| |   | |_( )| || |_) )
//  `\____)(_) (_)`\__,_)`\__,_)`\____)(_)   (____/'(_)(_,__/'
//                                                            

import ShaderBoy from './shaderboy'

const ShaderLib = {
	shader: {},
	loadedNum: 0,
	shaderNum: 0,
	shaderInitialized: false,

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	loadTextFile(name, url)
	{
		// Set up an asynchronous request
		const request = new XMLHttpRequest()
		request.open('GET', url, true)
		request.setRequestHeader('Pragma', 'no-cache')
		request.setRequestHeader('Cache-Control', 'no-cache')
		request.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT')

		request.onreadystatechange = () =>
		{// Hook the event that gets called as the request progresses

			if (request.readyState === 4)
			{// If the request is "DONE" (completed or failed)

				if (request.status === 200)
				{// If we got HTTP status 200 (OK)
					const shaderTxt = request.responseText
					this.shader[name] = shaderTxt
					this.loadedNum++

					if (this.loadedNum === this.shaderNum)
					{
						this.callback()
					}
				}
				else
				{ // Failed
					throw new Error(`Failed to load the shader"${url}"`)
				}
			}
		}

		request.send(null)
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	loadShadersFiles(ref, callback)
	{
		this.callback = callback
		this.shaderNum = ref.length
		this.loadedNum = 0
		for (const shaderfile of ref)
		{
			let name = shaderfile.name
			let url = window.location.href + shaderfile.url
			this.loadTextFile(name, url)
		}
	}
}

export default ShaderLib