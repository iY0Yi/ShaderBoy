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
	deepcopy: function (str) {
		let newstr = str;
		return (' ' + newstr).slice(1);
	},
	// check if a name is included in a string.
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	isIncluded: function (str, name) {
		return str.indexOf(name) != -1;
	},

	// compare 2 lists
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	same: function (listA, listB) {
		return listA.toString() === listB.toString();
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	requestFullScreen: function () {
		let element = document.body;
		// Supports most browsers and their versions.
		let requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;

		if (requestMethod) { // Native full screen.
			requestMethod.call(element);
		} else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
			let wscript = new ActiveXObject("WScript.Shell");
			if (wscript !== null) {
				wscript.SendKeys("{F11}");
			}
		}
	}
};