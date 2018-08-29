//
//   _  _____ 
//  (_)(  _  )
//  | || ( ) |
//  | || | | |
//  | || (_) |
//  (_)(_____)
//            
//            

import ShaderBoy from './shaderboy';
import ShaderLib from './shader/shaderlib';

export default ShaderBoy.io = {
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	newShader: function () {
		if (ShaderBoy.needEditor) {
			ShaderBoy.buffers['MainImage'].active = true;
			ShaderBoy.buffers['Common'].active = false;
			ShaderBoy.buffers['MainImage'].textData = ShaderLib.shader.imageFS;
			ShaderBoy.buffers['Common'].textData = ShaderLib.shader.commonFS;
			ShaderBoy.editor.selectBuffer('MainImage', true);
			ShaderBoy.gui.header.needUpdate = true;
			ShaderBoy.gui.header.contents.innerText = 'new.'
			ShaderBoy.gui.header.base.domElement.style.backgroundColor = '#fcbd00';
			setTimeout(function () {
				ShaderBoy.gui.header.needUpdate = false;
				ShaderBoy.gui.header.base.domElement.style.backgroundColor = '#00000066';
			}, 1500);
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	saveShader: function () {
		if (ShaderBoy.needEditor) {
			localStorage.mainActive = ShaderBoy.buffers['MainImage'].active;
			localStorage.commonActive = ShaderBoy.buffers['Common'].active;
			localStorage.mainText = ShaderBoy.util.deepcopy(ShaderBoy.buffers['MainImage'].textData);
			localStorage.commonText = ShaderBoy.util.deepcopy(ShaderBoy.buffers['Common'].textData);
			localStorage.renderScale = ShaderBoy.renderScale;
			localStorage.fontSize = ShaderBoy.editor.fontSize;
			ShaderBoy.gui.header.needUpdate = true;
			ShaderBoy.gui.header.contents.innerText = 'saved.';
			ShaderBoy.gui.header.base.domElement.style.backgroundColor = '#1794be';
			setTimeout(function () {
				ShaderBoy.gui.header.needUpdate = false;
				ShaderBoy.gui.header.base.domElement.style.backgroundColor = '#00000066';
			}, 1500);
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	recompile: function () {
		if (ShaderBoy.needEditor) {
			if (ShaderBoy.buffers['MainImage'].active) {
				ShaderBoy.buffers['MainImage'].textData = ShaderBoy.editor.codemirror.getValue();
			}
			if (ShaderBoy.buffers['Common'].active) {
				ShaderBoy.buffers['Common'].textData = ShaderBoy.editor.codemirror.getValue();
			}
			ShaderBoy.renderer.recompile(
				ShaderBoy.util.deepcopy(ShaderBoy.buffers['Common'].textData),
				ShaderBoy.util.deepcopy(ShaderBoy.buffers['MainImage'].textData)
			);
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	loadShader: function (callback) {
		ShaderBoy.renderScale = (localStorage.renderScale !== undefined) ? localStorage.renderScale : 2;
		ShaderBoy.buffers['MainImage'].loaded = false;
		ShaderBoy.buffers['Common'].loaded = false;
		ShaderBoy.buffers['MainImage'].active = (localStorage.mainActive !== undefined) ? localStorage.mainActive : true;
		ShaderBoy.buffers['Common'].active = (localStorage.commonActive !== undefined) ? localStorage.commonActive : false;
		ShaderBoy.buffers['MainImage'].textData = (localStorage.mainText !== undefined) ? localStorage.mainText : ShaderLib.shader.imageFS;
		ShaderBoy.buffers['Common'].textData = (localStorage.commonText !== undefined) ? localStorage.commonText : ShaderLib.shader.commonFS;
		ShaderBoy.renderScale = (localStorage.renderScale !== undefined) ? localStorage.renderScale : 2;
		if (ShaderBoy.needEditor) {
			ShaderBoy.editor.selectBuffer('MainImage', true);
			ShaderBoy.gui.header.needUpdate = true;
			ShaderBoy.gui.header.contents.innerText = 'loaded.'
			ShaderBoy.gui.header.base.domElement.style.backgroundColor = '#fcbd00';
			setTimeout(function () {
				ShaderBoy.gui.header.needUpdate = false;
				ShaderBoy.gui.header.base.domElement.style.backgroundColor = '#00000066';
			}, 1500);
		}
		callback();
	}
};