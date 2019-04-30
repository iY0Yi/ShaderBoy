//
//   _   _  _       _   
//  ( ) ( )( )_  _ (_ ) 
//  | | | || ,_)(_) | | 
//  | | | || |  | | | | 
//  | (_) || |_ | | | | 
//  (_____)`\__)(_)(___)
//                      
//                      

import ShaderBoy from './shaderboy';

export default ShaderBoy.util = {
	// deepcopy for string.
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	deepcopy: function (str)
	{
		let newstr = str;
		return (' ' + newstr).slice(1);
	},
	// check if a name is included in a string.
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	isIncluded: function (str, name)
	{
		return str.indexOf(name) != -1;
	},

	// compare 2 lists
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	same: function (listA, listB)
	{
		return listA.toString() === listB.toString();
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	requestFullScreen: function ()
	{
		let element = document.body;
		// Supports most browsers and their versions.
		let requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

		if (requestMethod)
		{ // Native full screen.
			requestMethod.call(element);
		} else if (typeof window.ActiveXObject !== "undefined")
		{ // Older IE.
			let wscript = new ActiveXObject("WScript.Shell");
			if (wscript !== null)
			{
				wscript.SendKeys("{F11}");
			}
		}
	},

	//http://adripofjavascript.com/blog/drips/object-equality-in-javascript.html
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	isSame: function (a, b)
	{
		// Create arrays of property names
		var aProps = Object.getOwnPropertyNames(a);
		var bProps = Object.getOwnPropertyNames(b);

		// If number of properties is different,
		// objects are not equivalent
		if (aProps.length != bProps.length)
		{
			return false;
		}

		for (var i = 0; i < aProps.length; i++)
		{
			var propName = aProps[i];

			// If values of same property are not equal,
			// objects are not equivalent
			if (a[propName] !== b[propName])
			{
				return false;
			}
		}

		// If we made it this far, objects
		// are considered equivalent
		return true;
	}
};