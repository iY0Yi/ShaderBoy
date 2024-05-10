//
//   ___    _   _  _
//  (  _`\ ( ) ( )(_)
//  | ( (_)| | | || |
//  | |___ | | | || |
//  | (_, )| (_) || |
//  (____/'(_____)(_)
//
//

import collectFPS from 'collect-fps'
import ShaderBoy from '../shaderboy'
import gui_header from './gui_header'
import gui_header_rec from './gui_header_rec'
import gui_knobs from './gui_knobs'
import gui_midi from './gui_midi'
import gui_keyboard from './gui_keyboard'
import gui_panel_shaderlist from './gui_panel_shaderlist'
import gui_panel_textform from './gui_panel_textform'
import gui_sidebar_ichannels from './gui_sidebar_ichannels'
import gui_timeline from './gui_timeline'
import commands from '../commands'

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
		this.knobUniformFS = '\n'
		this.midiUniformFS = '\n'

		gui_header.setup()
		gui_header_rec.setup()
		gui_knobs.setup()
		gui_midi.setup()
		gui_keyboard.setup()
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
		if (ShaderBoy.OS === 'Windows') { scrollMul = 100.0 }

		function calcMouseX(ev){
			let c = ShaderBoy.canvas
			let rect = c.getBoundingClientRect()
			return Math.floor((ev.clientX - rect.left) / (rect.right - rect.left) * c.width)
		}

		function calcMouseY(ev){
			let c = ShaderBoy.canvas
			let rect = c.getBoundingClientRect()
			return Math.floor(c.height - (ev.clientY - rect.top) / (rect.bottom - rect.top) * c.height)
		}

		function onCanvas(ev){
			const rect = ShaderBoy.canvas.getBoundingClientRect()
			const mouseX = ev.clientX
			const mouseY = ev.clientY

			return (mouseX >= rect.left &&
				mouseX <= rect.right &&
				mouseY >= rect.top &&
				mouseY <= rect.bottom)
		}

		function onMouseDown(ev){
			if (ev.button == 2) return false
			if (ShaderBoy.isEditorHidden || (ShaderBoy.isSplited && onCanvas(ev)))
			{
				const gui = ShaderBoy.gui
				gui.mouseIsDown = true
				gui.mouseOriX = calcMouseX(ev)
				gui.mouseOriY = calcMouseY(ev)
				gui.mousePosX = gui.mouseOriX
				gui.mousePosY = gui.mouseOriY
				ShaderBoy.uniforms.iMouse = [gui.mousePosX, gui.mousePosY, gui.mouseOriX, gui.mouseOriY]
				ShaderBoy.forceDraw = !ShaderBoy.isPlaying
			}
		}

		function onMouseUp(ev){
			if (ShaderBoy.isEditorHidden || (ShaderBoy.isSplited && onCanvas(ev)))
			{
				const gui = ShaderBoy.gui
				gui.mouseIsDown = false
				gui.mouseOriX=Math.abs(gui.mouseOriX)*-1
				gui.mouseOriY=Math.abs(gui.mouseOriY)*-1
				ShaderBoy.uniforms.iMouse = [gui.mousePosX, gui.mousePosY, gui.mouseOriX, gui.mouseOriY]
				ShaderBoy.forceDraw = !ShaderBoy.isPlaying
			}
		}

		function onMouseMove(ev){
			if (ShaderBoy.isEditorHidden || (ShaderBoy.isSplited && onCanvas(ev)))
			{
				const gui = ShaderBoy.gui
				if (gui.mouseIsDown)
				{
					gui.mousePosX = calcMouseX(ev)
					gui.mousePosY = calcMouseY(ev)
					gui.mouseOriX=Math.abs(gui.mouseOriX)
					gui.mouseOriY=Math.abs(gui.mouseOriY)*-1
					ShaderBoy.uniforms.iMouse = [gui.mousePosX, gui.mousePosY, gui.mouseOriX, gui.mouseOriY]
					ShaderBoy.forceDraw = !ShaderBoy.isPlaying
				}
			}
		}

		document.onmousedown = (ev) => {onMouseDown(ev)}
		document.onmouseup = (ev) => {onMouseUp(ev)}
		document.onmousemove = (ev) => {onMouseMove(ev)}

		function touchToMouse(ev){
			const touches = ev.changedTouches
			return {'clientX': touches[0].pageX, 'clientY': touches[0].pageY}
		}

		document.addEventListener('touchstart', (ev) => {onMouseDown(touchToMouse(ev))})
		document.addEventListener('touchend', (ev) => {onMouseUp(touchToMouse(ev))})
		document.addEventListener('touchmove', (ev) => {onMouseMove(touchToMouse(ev))})

		this.iWheelCumulative = [0,0,0]

		document.addEventListener('wheel', (ev) =>
		{
			if (ShaderBoy.isEditorHidden || (ShaderBoy.isSplited && onCanvas(ev)))
			{
				this.iWheelCumulative[0] += ev.deltaX
				this.iWheelCumulative[1] += ev.deltaY
				this.iWheelCumulative[2] += ev.deltaZ

				ShaderBoy.uniforms.iWheel = [
					ev.deltaX,
					this.iWheelCumulative[0],
					ev.deltaY,
					this.iWheelCumulative[1],
					ev.deltaZ,
					this.iWheelCumulative[2],
				]
				ShaderBoy.forceDraw = !ShaderBoy.isPlaying
			}
		})

		if(ShaderBoy.OS === 'Android')
        {
			document.addEventListener('touchend', commands.toggleFullscreen)
			document.addEventListener('mouseup', commands.toggleFullscreen)
        }

		document.contextmenu = (ev) =>
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
				ShaderBoy.resetViewportSize()
			}
			else
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