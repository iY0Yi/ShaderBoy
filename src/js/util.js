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

export default ShaderBoy.util={
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	deepcopy: function (str) {
		let newstr = str;
		return (' ' + newstr).slice(1);
	},
};