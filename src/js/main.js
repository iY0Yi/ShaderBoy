//
//                          
//  /'\_/`\        _        
//  |     |   _ _ (_)  ___  
//  | (_) | /'_` )| |/' _ `\
//  | | | |( (_| || || ( ) |
//  (_) (_)`\__,_)(_)(_) (_)
//                          
//                          

import jQuery from 'jquery';
import ShaderBoy from './shaderboy';
import time from './time';
import io from './io';
import gui from './gui';
import renderer from './renderer';
import soundRenderer from './sound_renderer';
import editor from './editor';
import util from './util';
import bufferManager from './buffer_manager';
import ShaderLib from './shaderlib';
import ShaderList from './shaderlist';
import 'normalize.css';
import './codemirror/addon/hint/show-hint.css';
import './codemirror/lib/codemirror.css';
import '../scss/main.scss';
// import './codemirror/theme/3024-day.css';
// import './codemirror/theme/3024-night.css';
import './codemirror/theme/3024-monotone.css';

// ShaderBoy init
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
ShaderBoy.init = function ()
{
	// Convert "img" tag to "svg" tag to attach styles.
	jQuery('img').each(function ()
	{
		var $img = jQuery(this);
		var imgID = $img.attr('id');
		var imgClass = $img.attr('class');
		var imgURL = $img.attr('src');
		jQuery.get(imgURL, function (data)
		{
			// Get the SVG tag, ignore the rest
			var $svg = jQuery(data).find('svg');

			if (typeof imgID !== 'undefined')
			{// Add replaced image's ID to the new SVG
				$svg = $svg.attr('id', imgID);
			}
			if (typeof imgClass !== 'undefined')
			{// Add replaced image's classes to the new SVG
				$svg = $svg.attr('class', imgClass + ' replaced-svg');
			}
			$svg = $svg.removeAttr('xmlns:a');
			$img.replaceWith($svg);
		});
	});


	ShaderBoy.capture = null;
	ShaderBoy.isRecording = false;

	// Detect your OS.
	ShaderBoy.OS = 'Unknown OS';
	if (navigator.appVersion.indexOf('Win') != -1) ShaderBoy.OS = 'Windows';
	if (navigator.appVersion.indexOf('Mac') != -1) ShaderBoy.OS = 'MacOS';
	if (navigator.appVersion.indexOf('X11') != -1) ShaderBoy.OS = 'UNIX';
	if (navigator.appVersion.indexOf('Linux') != -1) ShaderBoy.OS = 'Linux';
	if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) ShaderBoy.OS = 'iOS';
	if (navigator.userAgent.match(/Android/i)) ShaderBoy.OS = 'Android';
	if (ShaderBoy.OS === 'Unknown OS')
	{
		ShaderBoy.OS = 'Android';
	}

	console.log('ShaderBoy.OS', ShaderBoy.OS);
	console.log('navigator.appVersion', navigator.appVersion);


	// OK. Let's get WebGL!
	ShaderBoy.canvas = document.getElementById('gl_canvas');
	ShaderBoy.canvas.width = window.innerWidth;
	ShaderBoy.canvas.height = window.innerHeight;

	ShaderBoy.gl = null;
	ShaderBoy.glVersion = 0.0;

	try
	{
		let opts = {
			alpha: false,
			depth: false,
			stencil: false,
			premultipliedAlpha: false,
			antialias: true,
			preserveDrawingBuffer: true,
			powerPreference: 'high-performance'
		}; // 'low_power', 'high_performance', 'default'
		if (ShaderBoy.gl == null) { ShaderBoy.gl = ShaderBoy.canvas.getContext('webgl2', opts); ShaderBoy.glVersion = 2.0; }
		if (ShaderBoy.gl == null) { ShaderBoy.gl = ShaderBoy.canvas.getContext('experimental-webgl2', opts); ShaderBoy.glVersion = 2.0; }
		if (ShaderBoy.gl == null) { ShaderBoy.gl = ShaderBoy.canvas.getContext('webgl', opts); ShaderBoy.glVersion = 1.0; }
		if (ShaderBoy.gl == null) { ShaderBoy.gl = ShaderBoy.canvas.getContext('experimental-webgl', opts); ShaderBoy.glVersion = 1.0; }

		ShaderBoy.glExt = {};
		if (ShaderBoy.glVersion === 2.0)
		{
			ShaderBoy.glExt.Float32Textures = true;
			ShaderBoy.glExt.Float32Filter = ShaderBoy.gl.getExtension('OES_texture_float_linear');
			ShaderBoy.glExt.Float16Textures = true;
			ShaderBoy.glExt.Float16Filter = ShaderBoy.gl.getExtension('OES_texture_half_float_linear');
			ShaderBoy.glExt.Derivatives = true;
			ShaderBoy.glExt.DrawBuffers = true;
			ShaderBoy.glExt.DepthTextures = true;
			ShaderBoy.glExt.ShaderTextureLOD = true;
			ShaderBoy.glExt.Anisotropic = ShaderBoy.gl.getExtension('EXT_texture_filter_anisotropic');
			ShaderBoy.glExt.RenderToFloat32F = ShaderBoy.gl.getExtension('EXT_color_buffer_float');
		}
		else
		{
			ShaderBoy.glExt.Float32Textures = ShaderBoy.gl.getExtension('OES_texture_float');
			ShaderBoy.glExt.Float32Filter = ShaderBoy.gl.getExtension('OES_texture_float_linear');
			ShaderBoy.glExt.Float16Textures = ShaderBoy.gl.getExtension('OES_texture_half_float');
			ShaderBoy.glExt.Float16Filter = ShaderBoy.gl.getExtension('OES_texture_half_float_linear');
			ShaderBoy.glExt.Derivatives = ShaderBoy.gl.getExtension('OES_standard_derivatives');
			ShaderBoy.glExt.DrawBuffers = ShaderBoy.gl.getExtension('WEBGL_draw_buffers');
			ShaderBoy.glExt.DepthTextures = ShaderBoy.gl.getExtension('WEBGL_depth_texture');
			ShaderBoy.glExt.ShaderTextureLOD = ShaderBoy.gl.getExtension('EXT_shader_texture_lod');
			ShaderBoy.glExt.Anisotropic = ShaderBoy.gl.getExtension('EXT_texture_filter_anisotropic');
			ShaderBoy.glExt.RenderToFloat32F = ShaderBoy.glExt.Float32Textures;
		}

		ShaderBoy.shaderHeader = [];
		ShaderBoy.shaderHeaderLines = [];
		ShaderBoy.shaderHeader[0] = '';
		ShaderBoy.shaderHeaderLines[0] = 0;
		if (ShaderBoy.glVersion === 2.0)
		{
			ShaderBoy.shaderHeader[0] += "#version 300 es\n" +
				"#ifdef GL_ES\n" +
				"precision highp float;\n" +
				"precision highp int;\n" +
				"precision mediump sampler3D;\n" +
				"#endif\n";
			ShaderBoy.shaderHeaderLines[0] += 6;
		}
		else
		{
			ShaderBoy.shaderHeader[0] += "#ifdef GL_ES\n" +
				"precision highp float;\n" +
				"precision highp int;\n" +
				"#endif\n" +
				"float round( float x ) { return floor(x+0.5); }\n" +
				"vec2 round(vec2 x) { return floor(x + 0.5); }\n" +
				"vec3 round(vec3 x) { return floor(x + 0.5); }\n" +
				"vec4 round(vec4 x) { return floor(x + 0.5); }\n" +
				"float trunc( float x, float n ) { return floor(x*n)/n; }\n" +
				"mat3 transpose(mat3 m) { return mat3(m[0].x, m[1].x, m[2].x, m[0].y, m[1].y, m[2].y, m[0].z, m[1].z, m[2].z); }\n" +
				"float determinant( in mat2 m ) { return m[0][0]*m[1][1] - m[0][1]*m[1][0]; }\n" +
				"float determinant( mat4 m ) { float b00 = m[0][0] * m[1][1] - m[0][1] * m[1][0], b01 = m[0][0] * m[1][2] - m[0][2] * m[1][0], b02 = m[0][0] * m[1][3] - m[0][3] * m[1][0], b03 = m[0][1] * m[1][2] - m[0][2] * m[1][1], b04 = m[0][1] * m[1][3] - m[0][3] * m[1][1], b05 = m[0][2] * m[1][3] - m[0][3] * m[1][2], b06 = m[2][0] * m[3][1] - m[2][1] * m[3][0], b07 = m[2][0] * m[3][2] - m[2][2] * m[3][0], b08 = m[2][0] * m[3][3] - m[2][3] * m[3][0], b09 = m[2][1] * m[3][2] - m[2][2] * m[3][1], b10 = m[2][1] * m[3][3] - m[2][3] * m[3][1], b11 = m[2][2] * m[3][3] - m[2][3] * m[3][2];  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;}\n" +
				"mat2 inverse(mat2 m) { float det = determinant(m); return mat2(m[1][1], -m[0][1], -m[1][0], m[0][0]) / det; }\n" +
				"mat4 inverse(mat4 m ) { float inv0 = m[1].y*m[2].z*m[3].w - m[1].y*m[2].w*m[3].z - m[2].y*m[1].z*m[3].w + m[2].y*m[1].w*m[3].z + m[3].y*m[1].z*m[2].w - m[3].y*m[1].w*m[2].z; float inv4 = -m[1].x*m[2].z*m[3].w + m[1].x*m[2].w*m[3].z + m[2].x*m[1].z*m[3].w - m[2].x*m[1].w*m[3].z - m[3].x*m[1].z*m[2].w + m[3].x*m[1].w*m[2].z; float inv8 = m[1].x*m[2].y*m[3].w - m[1].x*m[2].w*m[3].y - m[2].x  * m[1].y * m[3].w + m[2].x  * m[1].w * m[3].y + m[3].x * m[1].y * m[2].w - m[3].x * m[1].w * m[2].y; float inv12 = -m[1].x  * m[2].y * m[3].z + m[1].x  * m[2].z * m[3].y +m[2].x  * m[1].y * m[3].z - m[2].x  * m[1].z * m[3].y - m[3].x * m[1].y * m[2].z + m[3].x * m[1].z * m[2].y; float inv1 = -m[0].y*m[2].z * m[3].w + m[0].y*m[2].w * m[3].z + m[2].y  * m[0].z * m[3].w - m[2].y  * m[0].w * m[3].z - m[3].y * m[0].z * m[2].w + m[3].y * m[0].w * m[2].z; float inv5 = m[0].x  * m[2].z * m[3].w - m[0].x  * m[2].w * m[3].z - m[2].x  * m[0].z * m[3].w + m[2].x  * m[0].w * m[3].z + m[3].x * m[0].z * m[2].w - m[3].x * m[0].w * m[2].z; float inv9 = -m[0].x  * m[2].y * m[3].w +  m[0].x  * m[2].w * m[3].y + m[2].x  * m[0].y * m[3].w - m[2].x  * m[0].w * m[3].y - m[3].x * m[0].y * m[2].w + m[3].x * m[0].w * m[2].y; float inv13 = m[0].x  * m[2].y * m[3].z - m[0].x  * m[2].z * m[3].y - m[2].x  * m[0].y * m[3].z + m[2].x  * m[0].z * m[3].y + m[3].x * m[0].y * m[2].z - m[3].x * m[0].z * m[2].y; float inv2 = m[0].y  * m[1].z * m[3].w - m[0].y  * m[1].w * m[3].z - m[1].y  * m[0].z * m[3].w + m[1].y  * m[0].w * m[3].z + m[3].y * m[0].z * m[1].w - m[3].y * m[0].w * m[1].z; float inv6 = -m[0].x  * m[1].z * m[3].w + m[0].x  * m[1].w * m[3].z + m[1].x  * m[0].z * m[3].w - m[1].x  * m[0].w * m[3].z - m[3].x * m[0].z * m[1].w + m[3].x * m[0].w * m[1].z; float inv10 = m[0].x  * m[1].y * m[3].w - m[0].x  * m[1].w * m[3].y - m[1].x  * m[0].y * m[3].w + m[1].x  * m[0].w * m[3].y + m[3].x * m[0].y * m[1].w - m[3].x * m[0].w * m[1].y; float inv14 = -m[0].x  * m[1].y * m[3].z + m[0].x  * m[1].z * m[3].y + m[1].x  * m[0].y * m[3].z - m[1].x  * m[0].z * m[3].y - m[3].x * m[0].y * m[1].z + m[3].x * m[0].z * m[1].y; float inv3 = -m[0].y * m[1].z * m[2].w + m[0].y * m[1].w * m[2].z + m[1].y * m[0].z * m[2].w - m[1].y * m[0].w * m[2].z - m[2].y * m[0].z * m[1].w + m[2].y * m[0].w * m[1].z; float inv7 = m[0].x * m[1].z * m[2].w - m[0].x * m[1].w * m[2].z - m[1].x * m[0].z * m[2].w + m[1].x * m[0].w * m[2].z + m[2].x * m[0].z * m[1].w - m[2].x * m[0].w * m[1].z; float inv11 = -m[0].x * m[1].y * m[2].w + m[0].x * m[1].w * m[2].y + m[1].x * m[0].y * m[2].w - m[1].x * m[0].w * m[2].y - m[2].x * m[0].y * m[1].w + m[2].x * m[0].w * m[1].y; float inv15 = m[0].x * m[1].y * m[2].z - m[0].x * m[1].z * m[2].y - m[1].x * m[0].y * m[2].z + m[1].x * m[0].z * m[2].y + m[2].x * m[0].y * m[1].z - m[2].x * m[0].z * m[1].y; float det = m[0].x * inv0 + m[0].y * inv4 + m[0].z * inv8 + m[0].w * inv12; det = 1.0 / det; return det*mat4( inv0, inv1, inv2, inv3,inv4, inv5, inv6, inv7,inv8, inv9, inv10, inv11,inv12, inv13, inv14, inv15);}\n" +
				"float sinh(float x)  { return (exp(x)-exp(-x))/2.; }\n" +
				"float cosh(float x)  { return (exp(x)+exp(-x))/2.; }\n" +
				"float tanh(float x)  { return sinh(x)/cosh(x); }\n" +
				"float coth(float x)  { return cosh(x)/sinh(x); }\n" +
				"float sech(float x)  { return 1./cosh(x); }\n" +
				"float csch(float x)  { return 1./sinh(x); }\n" +
				"float asinh(float x) { return    log(x+sqrt(x*x+1.)); }\n" +
				"float acosh(float x) { return    log(x+sqrt(x*x-1.)); }\n" +
				"float atanh(float x) { return .5*log((1.+x)/(1.-x)); }\n" +
				"float acoth(float x) { return .5*log((x+1.)/(x-1.)); }\n" +
				"float asech(float x) { return    log((1.+sqrt(1.-x*x))/x); }\n" +
				"float acsch(float x) { return    log((1.+sqrt(1.+x*x))/x); }\n";
			ShaderBoy.shaderHeaderLines[0] += 26;
		}

		ShaderBoy.shaderHeader[1] = "";
		ShaderBoy.shaderHeaderLines[1] = 0;
		if (ShaderBoy.glVersion === 2.0)
		{
			ShaderBoy.shaderHeader[1] += "#version 300 es\n" +
				"#ifdef GL_ES\n" +
				"precision highp float;\n" +
				"precision highp int;\n" +
				"precision mediump sampler3D;\n" +
				"#endif\n" +
				"out vec4 outColor;\n";
			ShaderBoy.shaderHeaderLines[1] += 6;
		}
		else
		{
			if (ShaderBoy.glExt.Derivatives) { ShaderBoy.shaderHeader[1] += "#ifdef GL_OES_standard_derivatives\n#extension GL_OES_standard_derivatives : enable\n#endif\n"; ShaderBoy.shaderHeaderLines[1] += 3; }
			if (ShaderBoy.glExt.ShaderTextureLOD) { ShaderBoy.shaderHeader[1] += "#extension GL_EXT_shader_texture_lod : enable\n"; ShaderBoy.shaderHeaderLines[1]++; }
			ShaderBoy.shaderHeader[1] += "#ifdef GL_ES\n" +
				"precision highp float;\n" +
				"precision highp int;\n" +
				"#endif\n" +
				"vec4 texture(     sampler2D   s, vec2 c)                   { return texture2D(s,c); }\n" +
				"vec4 texture(     sampler2D   s, vec2 c, float b)          { return texture2D(s,c,b); }\n" +
				"vec4 texture(     samplerCube s, vec3 c )                  { return textureCube(s,c); }\n" +
				"vec4 texture(     samplerCube s, vec3 c, float b)          { return textureCube(s,c,b); }\n" +
				"float round( float x ) { return floor(x+0.5); }\n" +
				"vec2 round(vec2 x) { return floor(x + 0.5); }\n" +
				"vec3 round(vec3 x) { return floor(x + 0.5); }\n" +
				"vec4 round(vec4 x) { return floor(x + 0.5); }\n" +
				"float trunc( float x, float n ) { return floor(x*n)/n; }\n" +
				"mat3 transpose(mat3 m) { return mat3(m[0].x, m[1].x, m[2].x, m[0].y, m[1].y, m[2].y, m[0].z, m[1].z, m[2].z); }\n" +
				"float determinant( in mat2 m ) { return m[0][0]*m[1][1] - m[0][1]*m[1][0]; }\n" +
				"float determinant( mat4 m ) { float b00 = m[0][0] * m[1][1] - m[0][1] * m[1][0], b01 = m[0][0] * m[1][2] - m[0][2] * m[1][0], b02 = m[0][0] * m[1][3] - m[0][3] * m[1][0], b03 = m[0][1] * m[1][2] - m[0][2] * m[1][1], b04 = m[0][1] * m[1][3] - m[0][3] * m[1][1], b05 = m[0][2] * m[1][3] - m[0][3] * m[1][2], b06 = m[2][0] * m[3][1] - m[2][1] * m[3][0], b07 = m[2][0] * m[3][2] - m[2][2] * m[3][0], b08 = m[2][0] * m[3][3] - m[2][3] * m[3][0], b09 = m[2][1] * m[3][2] - m[2][2] * m[3][1], b10 = m[2][1] * m[3][3] - m[2][3] * m[3][1], b11 = m[2][2] * m[3][3] - m[2][3] * m[3][2];  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;}\n" +
				"mat2 inverse(mat2 m) { float det = determinant(m); return mat2(m[1][1], -m[0][1], -m[1][0], m[0][0]) / det; }\n" +
				"mat4 inverse(mat4 m ) { float inv0 = m[1].y*m[2].z*m[3].w - m[1].y*m[2].w*m[3].z - m[2].y*m[1].z*m[3].w + m[2].y*m[1].w*m[3].z + m[3].y*m[1].z*m[2].w - m[3].y*m[1].w*m[2].z; float inv4 = -m[1].x*m[2].z*m[3].w + m[1].x*m[2].w*m[3].z + m[2].x*m[1].z*m[3].w - m[2].x*m[1].w*m[3].z - m[3].x*m[1].z*m[2].w + m[3].x*m[1].w*m[2].z; float inv8 = m[1].x*m[2].y*m[3].w - m[1].x*m[2].w*m[3].y - m[2].x  * m[1].y * m[3].w + m[2].x  * m[1].w * m[3].y + m[3].x * m[1].y * m[2].w - m[3].x * m[1].w * m[2].y; float inv12 = -m[1].x  * m[2].y * m[3].z + m[1].x  * m[2].z * m[3].y +m[2].x  * m[1].y * m[3].z - m[2].x  * m[1].z * m[3].y - m[3].x * m[1].y * m[2].z + m[3].x * m[1].z * m[2].y; float inv1 = -m[0].y*m[2].z * m[3].w + m[0].y*m[2].w * m[3].z + m[2].y  * m[0].z * m[3].w - m[2].y  * m[0].w * m[3].z - m[3].y * m[0].z * m[2].w + m[3].y * m[0].w * m[2].z; float inv5 = m[0].x  * m[2].z * m[3].w - m[0].x  * m[2].w * m[3].z - m[2].x  * m[0].z * m[3].w + m[2].x  * m[0].w * m[3].z + m[3].x * m[0].z * m[2].w - m[3].x * m[0].w * m[2].z; float inv9 = -m[0].x  * m[2].y * m[3].w +  m[0].x  * m[2].w * m[3].y + m[2].x  * m[0].y * m[3].w - m[2].x  * m[0].w * m[3].y - m[3].x * m[0].y * m[2].w + m[3].x * m[0].w * m[2].y; float inv13 = m[0].x  * m[2].y * m[3].z - m[0].x  * m[2].z * m[3].y - m[2].x  * m[0].y * m[3].z + m[2].x  * m[0].z * m[3].y + m[3].x * m[0].y * m[2].z - m[3].x * m[0].z * m[2].y; float inv2 = m[0].y  * m[1].z * m[3].w - m[0].y  * m[1].w * m[3].z - m[1].y  * m[0].z * m[3].w + m[1].y  * m[0].w * m[3].z + m[3].y * m[0].z * m[1].w - m[3].y * m[0].w * m[1].z; float inv6 = -m[0].x  * m[1].z * m[3].w + m[0].x  * m[1].w * m[3].z + m[1].x  * m[0].z * m[3].w - m[1].x  * m[0].w * m[3].z - m[3].x * m[0].z * m[1].w + m[3].x * m[0].w * m[1].z; float inv10 = m[0].x  * m[1].y * m[3].w - m[0].x  * m[1].w * m[3].y - m[1].x  * m[0].y * m[3].w + m[1].x  * m[0].w * m[3].y + m[3].x * m[0].y * m[1].w - m[3].x * m[0].w * m[1].y; float inv14 = -m[0].x  * m[1].y * m[3].z + m[0].x  * m[1].z * m[3].y + m[1].x  * m[0].y * m[3].z - m[1].x  * m[0].z * m[3].y - m[3].x * m[0].y * m[1].z + m[3].x * m[0].z * m[1].y; float inv3 = -m[0].y * m[1].z * m[2].w + m[0].y * m[1].w * m[2].z + m[1].y * m[0].z * m[2].w - m[1].y * m[0].w * m[2].z - m[2].y * m[0].z * m[1].w + m[2].y * m[0].w * m[1].z; float inv7 = m[0].x * m[1].z * m[2].w - m[0].x * m[1].w * m[2].z - m[1].x * m[0].z * m[2].w + m[1].x * m[0].w * m[2].z + m[2].x * m[0].z * m[1].w - m[2].x * m[0].w * m[1].z; float inv11 = -m[0].x * m[1].y * m[2].w + m[0].x * m[1].w * m[2].y + m[1].x * m[0].y * m[2].w - m[1].x * m[0].w * m[2].y - m[2].x * m[0].y * m[1].w + m[2].x * m[0].w * m[1].y; float inv15 = m[0].x * m[1].y * m[2].z - m[0].x * m[1].z * m[2].y - m[1].x * m[0].y * m[2].z + m[1].x * m[0].z * m[2].y + m[2].x * m[0].y * m[1].z - m[2].x * m[0].z * m[1].y; float det = m[0].x * inv0 + m[0].y * inv4 + m[0].z * inv8 + m[0].w * inv12; det = 1.0 / det; return det*mat4( inv0, inv1, inv2, inv3,inv4, inv5, inv6, inv7,inv8, inv9, inv10, inv11,inv12, inv13, inv14, inv15);}\n" +
				"float sinh(float x)  { return (exp(x)-exp(-x))/2.; }\n" +
				"float cosh(float x)  { return (exp(x)+exp(-x))/2.; }\n" +
				"float tanh(float x)  { return sinh(x)/cosh(x); }\n" +
				"float coth(float x)  { return cosh(x)/sinh(x); }\n" +
				"float sech(float x)  { return 1./cosh(x); }\n" +
				"float csch(float x)  { return 1./sinh(x); }\n" +
				"float asinh(float x) { return    log(x+sqrt(x*x+1.)); }\n" +
				"float acosh(float x) { return    log(x+sqrt(x*x-1.)); }\n" +
				"float atanh(float x) { return .5*log((1.+x)/(1.-x)); }\n" +
				"float acoth(float x) { return .5*log((x+1.)/(x-1.)); }\n" +
				"float asech(float x) { return    log((1.+sqrt(1.-x*x))/x); }\n" +
				"float acsch(float x) { return    log((1.+sqrt(1.+x*x))/x); }\n" +
				"#define outColor gl_FragColor\n";
			ShaderBoy.shaderHeaderLines[1] += 30;
			if (ShaderBoy.glExt.ShaderTextureLOD)
			{
				ShaderBoy.shaderHeader[1] += "vec4 textureLod(  sampler2D   s, vec2 c, float b)          { return texture2DLodEXT(s,c,b); }\n";
				ShaderBoy.shaderHeader[1] += "vec4 textureGrad( sampler2D   s, vec2 c, vec2 dx, vec2 dy) { return texture2DGradEXT(s,c,dx,dy); }\n";
				ShaderBoy.shaderHeaderLines[1] += 2;
			}
		}
	}
	catch (e)
	{
		throw e;
	}

	if (ShaderBoy.gl)
	{
		// We got WebGL!
		ShaderBoy.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		ShaderBoy.runInDevMode = process.env.NODE_ENV === 'development';

		time.init();
		gui.init();
		soundRenderer.init();
		bufferManager.init();
		editor.init();

		io.init();
		// ShaderBoy.canvas.width = window.innerWidth;
		// ShaderBoy.canvas.height = window.innerHeight;
		console.log(window.innerWidth);

	}
	else
	{
		throw 'Sorry! Your browser does not support WEBGL!';
	}
};

// Update
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function ()
{
	let lastTime = 0;
	let vendors = ['ms', 'moz', 'webkit', 'o'];
	for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x)
	{
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
			|| window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function (callback, element)
		{
			let currTime = new Date().getTime();
			let timeToCall = Math.max(0, 16 - (currTime - lastTime));
			let id = window.setTimeout(function () { callback(currTime + timeToCall); },
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function (id)
		{
			clearTimeout(id);
		};
}());

ShaderBoy.update = function ()
{
	requestAnimationFrame(ShaderBoy.update);

	gui.update();

	if (ShaderBoy.isPlaying)
	{
		renderer.render();
		if (ShaderBoy.capture && ShaderBoy.isRecording)
		{
			ShaderBoy.capture.capture(ShaderBoy.canvas);
			let total = ShaderBoy.capture.totalframes;
			let current = ShaderBoy.capture.currentframes;

			if (current > total)
			{
				ShaderBoy.gui_header.setStatus('suc3', 'Recording has complete.', 3000);

				ShaderBoy.capture.stop();
				console.log('ShaderBoy.capture', ShaderBoy.capture);
				let canvasWidth = Math.floor(window.innerWidth);
				let canvasHeight = Math.floor(window.innerHeight);
				ShaderBoy.canvas.width = canvasWidth;
				ShaderBoy.canvas.height = canvasHeight;
				bufferManager.setFBOsProps();
				ShaderBoy.isRecording = false;
				ShaderBoy.capture = null;
			}
			else
			{
				ShaderBoy.gui_header.setStatus('prgrs', 'Recording...', 0);
				ShaderBoy.capture.currentframes++;
			}
		}
	}
	else if (ShaderBoy.forceDraw === true)
	{
		renderer.render();
		console.log('forceDraw');
		ShaderBoy.forceDraw = false;
	}
	gui.redraw();
};

// Entry point
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
window.onload = function ()
{
	document.getElementById('shaderboy').style.display = 'inline';
	ShaderBoy.gui_header.setStatus('prgrs', 'Loading...', 0);
	ShaderLib.loadShadersFiles(ShaderList, ShaderBoy.init);
};
