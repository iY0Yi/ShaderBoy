//
//                          
//  /'\_/`\        _        
//  |     |   _ _ (_)  ___  
//  | (_) | /'_` )| |/' _ `\
//  | | | |( (_| || || ( ) |
//  (_) (_)`\__,_)(_)(_) (_)
//                          
//                          

import ShaderBoy from './shaderboy';
import time from './time';
import io from './io';
import gui from './gui';
import renderer from './renderer';
import editor from './editor';
import util from './util';
import BufferDataContainer from './buffer_data_container';

import ShaderLib from './shader/shaderlib';
import ShaderList from './shader/shaderlist';

// ShaderBoy init
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

ShaderBoy.init = function () {
	ShaderBoy.canvas = document.getElementById('gl_canvas');
	ShaderBoy.canvas.width = window.innerWidth;
	ShaderBoy.canvas.height = window.innerHeight;
	ShaderBoy.gl = null;
	try {
		let opts = {
			alpha: true,
			depth: true,
			stencil: false,
			styleActiveLine: true,
			premultipliedAlpha: false,
			antialias: true,
			preserveDrawingBuffer: true,
			powerPreference: 'high-performance'
		}; // 'low_power', 'high_performance', 'default'
		if (ShaderBoy.gl == null) ShaderBoy.gl = ShaderBoy.canvas.getContext('webgl2', opts);
		if (ShaderBoy.gl == null) ShaderBoy.gl = ShaderBoy.canvas.getContext('experimental-webgl2', opts);
		if (ShaderBoy.gl == null) ShaderBoy.gl = ShaderBoy.canvas.getContext('webgl', opts);
		if (ShaderBoy.gl == null) ShaderBoy.gl = ShaderBoy.canvas.getContext('experimental-webgl', opts);
	}
	catch (e) {
		throw e;
	}

	if (ShaderBoy.gl) {
		ShaderBoy.buffers['Common'] = new BufferDataContainer(false);
		ShaderBoy.buffers['MainImage'] = new BufferDataContainer(true);

		if (ShaderBoy.needEditor) {
			ShaderBoy.gui.init();
			ShaderBoy.editor.init();
		}

		ShaderBoy.io.loadShader(function () {
			ShaderBoy.renderer.init();
			if (ShaderBoy.needEditor) {
				ShaderBoy.editor.selectBuffer('MainImage', true);
				ShaderBoy.editor.selectBuffer('Common', true);
				ShaderBoy.editor.selectBuffer('MainImage', false);
			}
			ShaderBoy.io.recompile();
			ShaderBoy.gui.setupInteraction();
			ShaderBoy.time.init();
			ShaderBoy.update();
		});
	}
	else {
		throw 'Sorry! Your browser does not support WEBGL2.0!';
	}
};

// Update
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var requestAnimationFrame = (function () {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000.0 / 60.0);
		};
})();

ShaderBoy.update = function () {
	requestAnimationFrame(ShaderBoy.update);
	if (ShaderBoy.isPlaying) {
		if (ShaderBoy.time.needUpdate()) {
			ShaderBoy.uniforms.iTime = ShaderBoy.time.appTime;
			ShaderBoy.uniforms.iResolution = [ShaderBoy.gl.canvas.clientWidth, window.innerHeight];
			ShaderBoy.renderer.render();
			if (ShaderBoy.needEditor) {
				ShaderBoy.gui.redrawHeader();
			}
			ShaderBoy.uniforms.iFrame++;
		}
		ShaderBoy.gui.mouse.down.prev = ShaderBoy.gui.mouse.down.curr;
		ShaderBoy.gui.mouse.position.prev = [ShaderBoy.gui.mouse.position.curr[0], ShaderBoy.gui.mouse.position.curr[1]];
	}
};

// Entry point
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
window.onload = function () { ShaderLib.loadShaders(ShaderList, ShaderBoy.init); };
