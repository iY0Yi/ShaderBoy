//
//   ___    _   _  _ 
//  (  _`\ ( ) ( )(_)
//  | ( (_)| | | || |
//  | |___ | | | || |
//  | (_, )| (_) || |
//  (____/'(_____)(_)
//                   
//                   

import ShaderBoy from '../shaderboy'
import gui_header from './gui_header'
import gui_header_rec from './gui_header_rec'
import gui_timeline from './gui_timeline'
import gui_knobs from './gui_knobs'
import gui_midi from './gui_midi'
import gui_panel_shaderlist from './gui_panel_shaderlist'
import gui_panel_textform from './gui_panel_textform'
import gui_sidebar_ichannels from './gui_sidebar_ichannels'

import collectFPS from 'collect-fps'

export default ShaderBoy.gui = {

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	init()
	{
		this.mousePosX = 0
		this.mousePosY = 0
		this.mouseOriX = 0
		this.mouseOriY = 0
		this.mouseIsDown = false

		this.cursor = {}

		this.sldrs = []
		this.knobs = null
		this.midis = null
		this.knobUniformFS = ''
		this.midiUniformFS = ''

		gui_header.setup()
		gui_header_rec.setup()
		gui_knobs.setup()
		gui_midi.setup()
		gui_timeline.setup()
		gui_panel_shaderlist.setup()
		gui_panel_textform.setup()
		gui_sidebar_ichannels.setup()

		this.setupMouse()
		this.setupWindow()
		this.setupFPSCounter()
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setupFPSCounter()
	{
		//FPS counter
		ShaderBoy.io.lastFPS = collectFPS()
		setInterval(() =>
		{
			ShaderBoy.uniforms.iFrameRate = ShaderBoy.io.lastFPS()
			ShaderBoy.io.lastFPS = collectFPS()
		}, 1000)
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setupMouse()
	{
		let scrollMul = 1
		if (ShaderBoy.OS === 'Windows') { scrollMul = 100.0; }

		let mainEl = document.getElementById('main')
		mainEl.onmousedown = (ev) =>
		{
			if (ev.button == 2) return false
			if (ShaderBoy.isEditorHidden)
			{
				let c = ShaderBoy.canvas
				let rect = c.getBoundingClientRect()
				this.mouseOriX = Math.floor((ev.clientX - rect.left) / (rect.right - rect.left) * c.width)
				this.mouseOriY = Math.floor(c.height - (ev.clientY - rect.top) / (rect.bottom - rect.top) * c.height)
				this.mousePosX = this.mouseOriX
				this.mousePosY = this.mouseOriY
				this.mouseIsDown = true
				ShaderBoy.uniforms.iMouse = [this.mousePosX, this.mousePosY, this.mouseOriX, this.mouseOriY]
			}
		}

		mainEl.onmouseup = (ev) =>
		{
			if (ShaderBoy.isEditorHidden)
			{
				this.mouseIsDown = false
				this.mouseOriX = -Math.abs(this.mouseOriX)
				this.mouseOriY = -Math.abs(this.mouseOriY)
				ShaderBoy.uniforms.iMouse = [this.mousePosX, this.mousePosY, this.mouseOriX, this.mouseOriY]
			}
		}

		mainEl.onmousemove = (ev) =>
		{
			if (ShaderBoy.isEditorHidden)
			{
				if (this.mouseIsDown)
				{
					let c = ShaderBoy.canvas
					let rect = c.getBoundingClientRect()
					this.mousePosX = Math.floor((ev.clientX - rect.left) / (rect.right - rect.left) * c.width)
					this.mousePosY = Math.floor(c.height - (ev.clientY - rect.top) / (rect.bottom - rect.top) * c.height)
					ShaderBoy.uniforms.iMouse = [this.mousePosX, this.mousePosY, this.mouseOriX, this.mouseOriY]
				}
			}
		}

		mainEl.contextmenu = (ev) =>
		{
			ev.preventDefault()
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setupWindow()
	{
		window.onresize = (event) =>
		{
			if (!ShaderBoy.isRecording)
			{
				let wasPlaying = ShaderBoy.isPlaying
				ShaderBoy.isPlaying = false
				let canvasWidth = Math.floor(((ShaderBoy.capture === null) ? window.innerWidth : 1920))
				let canvasHeight = Math.floor(((ShaderBoy.capture === null) ? window.innerHeight : 1080))
				ShaderBoy.canvas.width = canvasWidth
				ShaderBoy.canvas.height = canvasHeight
				document.getElementById('res-x').value = ShaderBoy.canvas.width
				document.getElementById('res-y').value = ShaderBoy.canvas.height
				ShaderBoy.bufferManager.setFBOsProps()
				gui_timeline.onResize()
				ShaderBoy.isPlaying = wasPlaying
			} else
			{
				event.preventDefault()
			}
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	showLoading()
	{
		const loadingClassList = document.getElementById('cvr-loading').classList
		loadingClassList.remove('loading-hidden')
		loadingClassList.remove('loading-hide')
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	hideLoading()
	{
		const loadingClassList = document.getElementById('cvr-loading').classList
		loadingClassList.add('loading-hide')
		setTimeout(() =>
		{
			loadingClassList.add('loading-hidden')
		}, 400)
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	showAuth()
	{
		const authClassList = document.getElementById('div_authrise').classList
		const authContentClassList = document.getElementById('auth-content').classList
		authClassList.remove('hidden')
		authClassList.remove('hide')
		authContentClassList.remove('hide')
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	hideAuth()
	{
		const authClassList = document.getElementById('div_authrise').classList
		const authContentClassList = document.getElementById('auth-content').classList
		authContentClassList.add('hide')
		authClassList.add('hide')
		setTimeout(() =>
		{
			authClassList.add('hidden')
		}, 400)
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	update()
	{
		gui_timeline.update()
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	redraw()
	{
		gui_header.redraw()
	}
}