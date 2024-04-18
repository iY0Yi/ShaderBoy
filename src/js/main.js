//
//
//  /'\_/`\        _
//  |     |   _ _ (_)  ___
//  | (_) | /'_` )| |/' _ `\
//  | | | |( (_| || || ( ) |
//  (_) (_)`\__,_)(_)(_) (_)
//
//

import ShaderBoy from './shaderboy'
import io from './io/io'
import gui from './gui/gui'
import imageRenderer from './renderer/image_renderer'
import soundRenderer from './renderer/sound_renderer'
import gui_header from './gui/gui_header'
import gui_header_rec from './gui/gui_header_rec'
import editor from './editor/editor'
import bufferManager from './buffer/buffer_manager'
import ShaderLib from './shader/shaderlib'
import ShaderList from './shader/shaderlist'

import $ from 'jquery'

import 'normalize.css'
import './editor/codemirror/addon/hint/show-hint.css'
import './editor/codemirror/lib/codemirror.css'
import '../scss/main.scss'
import './editor/codemirror/theme/3024-monotone.css'

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
ShaderBoy.init = () =>
{
	try
	{
		ShaderBoy.getGL()
		ShaderBoy.getGLExtention()
		ShaderBoy.createShaderHeader()
	}
	catch (error)
	{
		throw error
	}

	if (ShaderBoy.gl)
	{
		gui.init()
		soundRenderer.init()
		bufferManager.init()
		editor.init()
		io.init()
	}
	else
	{
		throw new Error('Sorry! Your browser does not support WebGL!')
	}
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
ShaderBoy.update = () =>
{
	requestAnimationFrame(ShaderBoy.update)

	gui.update()

	if (ShaderBoy.isPlaying)
	{
		imageRenderer.render()

		if (ShaderBoy.capture && ShaderBoy.isRecording)
		{
			ShaderBoy.capture.capture(ShaderBoy.canvas)
			const total = ShaderBoy.capture.totalframes
			const current = ShaderBoy.capture.currentframes

			if (current > total)
			{
				gui_header_rec.stop()
			}
			else
			{
				gui_header.setStatus('prgrs', 'Recording...', 0)
				ShaderBoy.capture.currentframes++
			}
		}
	}
	else if (ShaderBoy.forceDraw === true)
	{
		imageRenderer.render()
		ShaderBoy.forceDraw = false
	}

	gui.redraw()
}

ShaderBoy.resetViewportSize = () =>
{
	if(ShaderBoy !== undefined && ShaderBoy !== null)
	{
		ShaderBoy.canvas = document.getElementById('gl_canvas')
		if(ShaderBoy.canvas && ShaderBoy.gl)
		{
			const style = window.getComputedStyle(ShaderBoy.canvas)
			ShaderBoy.canvasWidth = parseInt(style.width, 10)
			ShaderBoy.canvasHeight = parseInt(style.height, 10)
			ShaderBoy.canvas.width = ShaderBoy.canvasWidth
			ShaderBoy.canvas.height = ShaderBoy.canvasHeight
			document.getElementById('res-x').value = ShaderBoy.canvasWidth
			document.getElementById('res-y').value = ShaderBoy.canvasHeight
			ShaderBoy.bufferManager.setFBOsProps()
		}
	}
}

// Entry point
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
window.onload = () =>
{
	// Convert "img" tag to "svg" tag to attach styles.
	$('img').each(() =>
	{
		const $img = $(this)
		const imgID = $img.attr('id')
		const imgClass = $img.attr('class')
		const imgURL = $img.attr('src')
		$.get(imgURL, (data) =>
		{
			// Get the SVG tag, ignore the rest
			let $svg = $(data).find('svg')

			if (typeof imgID !== 'undefined')
			{// Add replaced image's ID to the new SVG
				$svg = $svg.attr('id', imgID)
			}
			if (typeof imgClass !== 'undefined')
			{// Add replaced image's classes to the new SVG
				$svg = $svg.attr('class', imgClass + ' replaced-svg')
			}
			$svg = $svg.removeAttr('xmlns:a')
			$img.replaceWith($svg)
		})
	})

	ShaderBoy.detectOS()

	if (ShaderBoy.OS === 'iOS')
	{
		// Set readonly to input and textarea and disabled to select other than the current focus.
		$('input, textarea, select').on('focus', () =>
		{
			$('input, textarea').not(this).attr("readonly", "readonly")
			$('select').not(this).attr("disabled", "disabled")
		})
		// Remove readonly and disabled when the focus goes out.
		$('input, textarea, select').on('blur', () =>
		{
			$('input, textarea').removeAttr("readonly")
			$('select').removeAttr("disabled")
		})
	}

	document.getElementById('shaderboy').style.display = 'inline'
	gui_header.setStatus('prgrs', 'Loading...', 0)
	ShaderLib.loadShadersFiles(ShaderList, ShaderBoy.init)
}