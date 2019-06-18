//
//   _   _  _       _   
//  ( ) ( )( )_  _ (_ ) 
//  | | | || ,_)(_) | | 
//  | | | || |  | | | | 
//  | (_) || |_ | | | | 
//  (_____)`\__)(_)(___)
//                      
//                      

import ShaderBoy from './shaderboy'

export default ShaderBoy.util = {
	// deepcopy for string.
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	deepcopy(str)
	{
		return (' ' + str).slice(1)
	},
	// check if a name is included in a string.
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	isIncluded(str, name)
	{
		return str.indexOf(name) != -1
	},

	// compare 2 lists
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	same(listA, listB)
	{
		return listA.toString() === listB.toString()
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	requestFullScreen()
	{
		const element = document.body
		// Supports most browsers and their versions.
		const requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen

		if (requestMethod)
		{ // Native full screen.
			requestMethod.call(element)
		} else if (typeof window.ActiveXObject !== "undefined")
		{ // Older IE.
			const wscript = new ActiveXObject("WScript.Shell")
			if (wscript !== null)
			{
				wscript.SendKeys("{F11}")
			}
		}
	},

	//http://adripofjavascript.com/blog/drips/object-equality-in-javascript.html
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	isSame(a, b)
	{
		const aProps = Object.getOwnPropertyNames(a)
		const bProps = Object.getOwnPropertyNames(b)
		if (aProps.length != bProps.length)
		{
			return false
		}

		for (let i = 0; i < aProps.length; i++)
		{
			const propName = aProps[i]
			if (a[propName] !== b[propName])
			{
				return false
			}
		}

		return true
	}
}