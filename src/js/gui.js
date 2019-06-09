//
//   ___    _   _  _ 
//  (  _`\ ( ) ( )(_)
//  | ( (_)| | | || |
//  | |___ | | | || |
//  | (_, )| (_) || |
//  (____/'(_____)(_)
//                   
//                   

import ShaderBoy from './shaderboy'
import key from 'keymaster'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/brace-fold'
import $ from 'jquery'
import CodeMirror from 'codemirror/lib/codemirror'
import gui_header from './gui/gui_header'
import gui_header_rec from './gui/gui_header_rec'
import gui_timeline from './gui/gui_timeline'
import gui_knobs from './gui/gui_knobs'
import gui_midi from './gui/gui_midi'
import gui_panel_shaderlist from './gui/gui_panel_shaderlist'
import gui_panel_textform from './gui/gui_panel_textform'
import gui_sidebar_ichannels from './gui/gui_sidebar_ichannels'

export default ShaderBoy.gui = {

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	init()
	{
		ShaderBoy.style.buttonHeight = (window.innerWidth > 750) ? 45 : 35

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
		this.setupInteraction()
		this.setupEditorShortcuts()
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
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setupInteraction()
	{
		let scrollMul = 1
		if (ShaderBoy.OS === 'Windows') { scrollMul = 100.0; }

		let mainEl = document.getElementById('main')
		mainEl.onmousedown = function (ev)
		{
			if (ev.button == 2) return false
			if (ShaderBoy.isEditorHide)
			{
				let c = ShaderBoy.canvas
				let rect = c.getBoundingClientRect()
				this.mouseOriX = Math.floor((ev.clientX - rect.left) / (rect.right - rect.left) * c.width)
				this.mouseOriY = Math.floor(c.height - (ev.clientY - rect.top) / (rect.bottom - rect.top) * c.height)
				this.mousePosX = this.mouseOriX
				this.mousePosY = this.mouseOriY
				this.mouseIsDown = true
				if (!ShaderBoy.isPlaying) ShaderBoy.forceFrame = true
				ShaderBoy.uniforms.iMouse = [this.mousePosX, this.mousePosY, this.mouseOriX, this.mouseOriY]
			}
		}

		mainEl.onmouseup = function (ev)
		{
			if (ShaderBoy.isEditorHide)
			{
				this.mouseIsDown = false
				this.mouseOriX = -Math.abs(this.mouseOriX)
				this.mouseOriY = -Math.abs(this.mouseOriY)
				if (!ShaderBoy.isPlaying) ShaderBoy.forceFrame = true
				ShaderBoy.uniforms.iMouse = [this.mousePosX, this.mousePosY, this.mouseOriX, this.mouseOriY]
			}
		}

		mainEl.onmousemove = function (ev)
		{
			if (ShaderBoy.isEditorHide)
			{
				if (this.mouseIsDown)
				{
					let c = ShaderBoy.canvas
					let rect = c.getBoundingClientRect()
					this.mousePosX = Math.floor((ev.clientX - rect.left) / (rect.right - rect.left) * c.width)
					this.mousePosY = Math.floor(c.height - (ev.clientY - rect.top) / (rect.bottom - rect.top) * c.height)
					if (!ShaderBoy.isPlaying) ShaderBoy.forceFrame = true
					ShaderBoy.uniforms.iMouse = [this.mousePosX, this.mousePosY, this.mouseOriX, this.mouseOriY]
				}
			}
		}

		mainEl.contextmenu = function (ev)
		{
			ev.preventDefault()
		}

		window.onresize = function (event)
		{
			// console.log('ShaderBoy.isRecording', ShaderBoy.isRecording)
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
				// document.getElementById('gui-sidebar-left').style.height = '100%'
				// document.getElementById('editor').style.height = '100%'
				// document.getElementById('gui-panel-knob').style.height = '100%'
				// console.log(document.getElementById('gui-panel-knob'))
			} else
			{
				event.preventDefault()
			}
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setupEditorShortcuts()
	{
		this.editorShortcuts = {
			'Alt-Right'()
			{
				let codeEl = document.getElementById('code')
				codeEl.classList.add('code-container-mov-l')
				setTimeout(function ()
				{
					let codeEl = document.getElementById('code')
					codeEl.classList.remove('code-container-mov-l')
				}, 1000 * 0.2)
				console.log(codeEl.classList)
				ShaderBoy.editor.moveBuffer(1)
			},
			'Alt-Left'()
			{
				let codeEl = document.getElementById('code')
				codeEl.classList.add('code-container-mov-l')
				setTimeout(function ()
				{
					let codeEl = document.getElementById('code')
					codeEl.classList.remove('code-container-mov-l')
				}, 1000 * 0.2)
				console.log(codeEl.classList)
				ShaderBoy.editor.moveBuffer(-1)
			},
			'Alt-Up'()
			{
				if (ShaderBoy.isRecording !== true)
				{
					ShaderBoy.isPlaying = !ShaderBoy.isPlaying
					if (ShaderBoy.buffers['Sound'].active)
					{
						ShaderBoy.soundRenderer.pause()
					}
				}
			},
			'Alt-Down'()
			{
				gui_timeline.reset()
				if (ShaderBoy.isRecording !== true && ShaderBoy.isPlaying)
				{
					if (ShaderBoy.buffers['Sound'].active)
					{
						ShaderBoy.soundRenderer.restart()
					}
				}
			},
			'Alt-Enter'(cm) { ShaderBoy.bufferManager.buildShaderFromBuffers(); },

			'Ctrl-1'()
			{
				ShaderBoy.renderScale = 1
				ShaderBoy.bufferManager.setFBOsProps()
				if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
			},
			'Ctrl-2'()
			{
				ShaderBoy.renderScale = 2
				ShaderBoy.bufferManager.setFBOsProps()
				if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
			},
			'Ctrl-3'()
			{
				ShaderBoy.renderScale = 3
				ShaderBoy.bufferManager.setFBOsProps()
				if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
			},
			'Ctrl-4'()
			{
				ShaderBoy.renderScale = 4
				ShaderBoy.bufferManager.setFBOsProps()
				if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
			},

			"Shift-Cmd-Alt-J": 'unfoldAll', // just for register fold command.
			"Ctrl-K"(cm)
			{
				cm.operation(function ()
				{
					for (let i = cm.firstLine(), e = cm.lastLine(); i <= e; i++)
						cm.foldCode(CodeMirror.Pos(i, 0))
				})
			},
			"Alt-K"(cm) { cm.foldCode(cm.getCursor()); },
		}

		const CMD = (ShaderBoy.OS === 'MacOS' || ShaderBoy.OS === 'iOS') ? 'Cmd' : 'Ctrl'

		this.editorShortcuts[CMD + '-S'] = function (cm)
		{
			if (!ShaderBoy.runInDevMode)
			{
				ShaderBoy.io.saveShader()
			}
			else
			{
				alert('Oops! You are in test mode. Please reload this page and authorize.')
			}
		}

		this.editorShortcuts[CMD + '-O'] = function (cm)
		{
			let textformEl = document.getElementById('gp-textarea')
			let shaderlistEl = document.getElementById('gp-shader-list')
			if (!textformEl.classList.contains('hide')) textformEl.classList.add('hide')
			if (shaderlistEl.classList.contains('hide')) shaderlistEl.classList.remove('hide')
			gui_panel_shaderlist.show()
			ShaderBoy.isPlaying = false

			ShaderBoy.editor.codemirror.display.input.blur()
			key('esc', function ()
			{
				let textformEl = document.getElementById('gp-textarea')
				let shaderlistEl = document.getElementById('gp-shader-list')
				if (!textformEl.classList.contains('hide')) textformEl.classList.add('hide')
				if (!shaderlistEl.classList.contains('hide')) shaderlistEl.classList.add('hide')
				gui_panel_shaderlist.show()
				ShaderBoy.isPlaying = true
				key.unbind('esc')
			})

			if (ShaderBoy.runInDevMode)
			{
				alert('Oops! You are in test mode. Please reload this page and authorize.')
			}
		}

		this.editorShortcuts['Shift-' + CMD + '-Alt-+'] = function ()
		{
			ShaderBoy.editor.incTextSize()
		}
		this.editorShortcuts['Shift-' + CMD + '-Alt-;'] = function ()
		{
			ShaderBoy.editor.incTextSize()
		}
		this.editorShortcuts['Shift-' + CMD + '-Alt-='] = function ()
		{
			ShaderBoy.editor.incTextSize()
		}
		this.editorShortcuts['Shift-' + CMD + '-Alt--'] = function ()
		{
			ShaderBoy.editor.decTextSize()
		}
		this.editorShortcuts['Shift-' + CMD + '-Alt-_'] = function ()
		{
			ShaderBoy.editor.decTextSize()
		}

		this.editorShortcuts['Shift-' + CMD + '-Alt-D'] = function ()
		{
			if (!ShaderBoy.isConcentrating)
			{
				document.getElementById('ctrl').classList.toggle('ctrl_hide')
				document.getElementById('ctrl-wrapper').classList.toggle('ctrl-wrapper_hide')
			}
		}

		this.editorShortcuts['Shift-' + CMD + '-Alt-A'] = function ()
		{
			let leftSidebarEl = document.getElementById('gui-sidebar-left')
			if (leftSidebarEl.classList.contains('gsbl-container-hidden'))
			{
				leftSidebarEl.classList.remove('gsbl-container-hidden')
				leftSidebarEl.classList.remove('gsbl-container-hide')
				leftSidebarEl.classList.add('gsbl-container-appear')
			}
			else
			{
				if (leftSidebarEl.classList.contains('gsbl-container-appear'))
				{
					leftSidebarEl.classList.remove('gsbl-container-appear')
					leftSidebarEl.classList.add('gsbl-container-hide')
				}
				else if (leftSidebarEl.classList.contains('gsbl-container-hide'))
				{
					leftSidebarEl.classList.remove('gsbl-container-hide')
					leftSidebarEl.classList.add('gsbl-container-appear')
				}
			}
		}

		this.editorShortcuts['Shift-' + CMD + '-Alt-T'] = function ()
		{
			if (!ShaderBoy.isConcentrating)
			{
				let tlel = document.getElementById('timeline')
				tlel.classList.toggle('tl_hide')
				document.querySelector('.CodeMirror').classList.toggle('expand-height')
			}
		}

		this.editorShortcuts['Shift-' + CMD + '-Alt-N'] = function ()
		{
			if (!ShaderBoy.runInDevMode)
			{
				document.getElementById("div-textarea").contentEditable = "true"
				gui_panel_textform.reset('New Shader Name', function ()
				{
					console.log(ShaderBoy.gui_panel_textform.result)
					ShaderBoy.io.newShader(ShaderBoy.gui_panel_textform.result)
				})
				let textformEl = document.getElementById('gp-textarea')
				let shaderlistEl = document.getElementById('gp-shader-list')
				if (textformEl.classList.contains('hide')) textformEl.classList.remove('hide')
				if (!shaderlistEl.classList.contains('hide')) shaderlistEl.classList.add('hide')
				ShaderBoy.isPlaying = false

				ShaderBoy.editor.codemirror.display.input.blur()
				key('esc', function ()
				{
					document.getElementById("div-textarea").contentEditable = "false"
					gui_panel_textform.reset('', function () { })
					ShaderBoy.isPlaying = true
					key.unbind('esc')
				})
			}
			else
			{
				alert('Oops! You are in test mode. Please reload this page and authorize.')
			}

		}

		this.editorShortcuts['Shift-' + CMD + '-Alt-H'] = function ()
		{
			ShaderBoy.isEditorHide = !ShaderBoy.isEditorHide

			ShaderBoy.gui.hdrEl = document.getElementById('gui-header')
			ShaderBoy.gui.tlEl = document.getElementById('timeline')
			ShaderBoy.gui.codeEl = document.getElementById('code')
			ShaderBoy.gui.ctrlEl = document.getElementById('ctrl')
			ShaderBoy.gui.isHdrElHidden = false
			ShaderBoy.gui.isTlElHidden = false
			ShaderBoy.gui.isCodeElHidden = false
			ShaderBoy.gui.isCtrlElHidden = false

			if (ShaderBoy.gui.ctrlEl.classList.contains('ctrl_hide'))
			{
				ShaderBoy.gui.isCtrlElHidden = true
			}
			ShaderBoy.gui.ctrlEl.classList.add('ctrl_hide')

			let ms = (ShaderBoy.gui.isCtrlElHidden) ? 0 : 400
			setTimeout(() =>
			{
				if (ShaderBoy.gui.hdrEl.classList.contains('hdr_hide'))
				{
					ShaderBoy.gui.isHdrElHidden = true
				}
				ShaderBoy.gui.hdrEl.classList.add('hdr_hide')

				if (ShaderBoy.gui.tlEl.classList.contains('tl_hide'))
				{
					ShaderBoy.gui.isTlElHidden = true
				}
				ShaderBoy.gui.tlEl.classList.add('tl_hide')

				if (ShaderBoy.gui.codeEl.classList.contains('code_hide'))
				{
					ShaderBoy.gui.isCodeElHidden = true
				}
				ShaderBoy.gui.codeEl.classList.add('code_hide')



				ShaderBoy.editor.codemirror.display.input.blur()

				key('ctrl+1', function ()
				{
					ShaderBoy.renderScale = 1
					ShaderBoy.bufferManager.setFBOsProps()
					if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
				})
				key('ctrl+2', function ()
				{
					ShaderBoy.renderScale = 2
					ShaderBoy.bufferManager.setFBOsProps()
					if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
				})
				key('ctrl+3', function ()
				{
					ShaderBoy.renderScale = 3
					ShaderBoy.bufferManager.setFBOsProps()
					if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
				})
				key('ctrl+4', function ()
				{
					ShaderBoy.renderScale = 4
					ShaderBoy.bufferManager.setFBOsProps()
					if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
				})
				key('⌥+up', function ()
				{
					if (ShaderBoy.isRecording !== true)
					{
						ShaderBoy.isPlaying = !ShaderBoy.isPlaying
					}
				})
				key('⌥+down', function ()
				{
					if (ShaderBoy.isRecording !== true)
					{
					}
				})

				let hide = function ()
				{
					if (!ShaderBoy.gui.isHdrElHidden)
					{
						ShaderBoy.gui.hdrEl.classList.remove('hdr_hide')
					}

					if (!ShaderBoy.gui.isTlElHidden)
					{
						ShaderBoy.gui.tlEl.classList.remove('tl_hide')
					}

					if (!ShaderBoy.gui.isCodeElHidden)
					{
						ShaderBoy.gui.codeEl.classList.remove('code_hide')
					}

					if (!ShaderBoy.gui.isCtrlElHidden)
					{
						let ms = 400
						setTimeout(() =>
						{
							ShaderBoy.gui.ctrlEl.classList.remove('ctrl_hide')
						}, ms)
					}

					ShaderBoy.editor.codemirror.focus()
					key.unbind('⌘+⇧+⌥+h', 'ctrl+⇧+⌥+h')
					key.unbind('ctrl+1')
					key.unbind('ctrl+2')
					key.unbind('ctrl+3')
					key.unbind('ctrl+4')
					key.unbind('⌥+up')
					key.unbind('⌥+down')
					if (ShaderBoy.OS === 'iOS' || ShaderBoy.OS === 'Android')
					{
						key.unbind('⌥+h')
					}
				}
				key('⌘+⇧+⌥+h', hide)
				key('ctrl+⇧+⌥+h', hide)
				if (ShaderBoy.OS === 'iOS' || ShaderBoy.OS === 'Android')
				{
					key('⌥+h', hide)
				}
			}
				, ms)
		}

		this.editorShortcuts['Shift-' + CMD + '-Alt-F'] = function (cm)
		{
			function getSelectedRange()
			{
				return {
					from: cm.getCursor(true),
					to: cm.getCursor(false),
				}
			}
			let range = getSelectedRange()
			cm.autoFormatRange(range.from, range.to)
		}
		this.editorShortcuts['Shift-' + CMD + '-F'] = function (cm)
		{
			function getSelectedRange()
			{
				return {
					from: cm.getCursor(true),
					to: cm.getCursor(false),
				}
			}
			let range = getSelectedRange()
			cm.autoFormatRange(range.from, range.to)
		}

		this.editorShortcuts['Shift-' + CMD + '-Alt-V'] = function ()
		{
			ShaderBoy.isConcentrating = !ShaderBoy.isConcentrating

			ShaderBoy.gui.tlEl = document.getElementById('timeline')
			ShaderBoy.gui.ctrlEl = document.getElementById('ctrl')

			if (ShaderBoy.isConcentrating)
			{
				ShaderBoy.isPlaying = false
				ShaderBoy.isEditorHide = false
				ShaderBoy.canvas.style.opacity = '0.0'
				$('.cm-s-3024-monotone span').css('background', '#1e1e1e00')
				$('.cm-s-3024-monotone .CodeMirror-code').toggleClass('concentrating')
				$('.cm-s-3024-monotone').toggleClass('color')

				ShaderBoy.gui.isCtrlElHidden = false
				ShaderBoy.gui.isTlElHidden = false

				if (ShaderBoy.gui.ctrlEl.classList.contains('ctrl_hide'))
				{
					ShaderBoy.gui.isCtrlElHidden = true
				}
				ShaderBoy.gui.ctrlEl.classList.add('ctrl_hide')
				document.getElementById('ctrl-wrapper').classList.add('ctrl-wrapper_hide')

				if (ShaderBoy.gui.tlEl.classList.contains('tl_hide'))
				{
					ShaderBoy.gui.isTlElHidden = true
				}
				ShaderBoy.gui.tlEl.classList.add('tl_hide')
			}
			else
			{
				ShaderBoy.isPlaying = true
				ShaderBoy.canvas.style.opacity = '1.0'
				$('.cm-s-3024-monotone span').css('background', '#1e1e1eFF')
				$('.cm-s-3024-monotone .CodeMirror-code').toggleClass('concentrating')
				$('.cm-s-3024-monotone').toggleClass('color')

				if (!ShaderBoy.gui.isTlElHidden)
				{
					ShaderBoy.gui.tlEl.classList.remove('tl_hide')
				}

				if (!ShaderBoy.gui.isCtrlElHidden)
				{
					ShaderBoy.gui.ctrlEl.classList.remove('ctrl_hide')
					document.getElementById('ctrl-wrapper').classList.remove('ctrl-wrapper_hide')
				}
			}
		}

		this.editorShortcuts['Shift-' + CMD + '-Alt-F'] = function ()
		{
			ShaderBoy.util.requestFullScreen()
		}

		this.editorShortcuts['Shift-' + CMD + '-Alt-M'] = function ()
		{
			if (ShaderBoy.buffers['Sound'].active)
			{
				ShaderBoy.soundRenderer.mute()
			}
		}

		this.editorShortcuts['Shift-' + CMD + '-Alt-R'] = function ()
		{
			ShaderBoy.gui.recEl = document.getElementById('ghdr-rec-base')
			ShaderBoy.gui.tlEl = document.getElementById('timeline')
			ShaderBoy.gui.codeEl = document.getElementById('code')
			ShaderBoy.gui.ctrlEl = document.getElementById('ctrl')
			document.getElementById('res-x').value = ShaderBoy.canvas.width
			document.getElementById('res-y').value = ShaderBoy.canvas.height

			ShaderBoy.gui.isTlElHidden = false
			ShaderBoy.gui.isCodeElHidden = false
			ShaderBoy.gui.isCtrlElHidden = false
			ShaderBoy.gui.isPlaying = false
			ShaderBoy.gui.recEl.classList.remove('rec_hide')

			if (ShaderBoy.gui.ctrlEl.classList.contains('ctrl_hide'))
			{
				ShaderBoy.gui.isCtrlElHidden = true
			}
			ShaderBoy.gui.ctrlEl.classList.add('ctrl_hide')

			let ms = (ShaderBoy.gui.isCtrlElHidden) ? 0 : 400
			setTimeout(() =>
			{
				if (ShaderBoy.gui.tlEl.classList.contains('tl_hide'))
				{
					ShaderBoy.gui.isTlElHidden = true
				}
				ShaderBoy.gui.tlEl.classList.remove('tl_hide')

				if (ShaderBoy.gui.codeEl.classList.contains('code_hide'))
				{
					ShaderBoy.gui.isCodeElHidden = true
				}
				ShaderBoy.gui.codeEl.classList.add('code_hide')

				ShaderBoy.editor.codemirror.display.input.blur()

				let isPlaying = ShaderBoy.isPlaying
				ShaderBoy.isPlaying = false
				ShaderBoy.gui_timeline.reset()

				key('ctrl+1', function ()
				{
					ShaderBoy.renderScale = 1
					ShaderBoy.bufferManager.setFBOsProps()
					if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
				})
				key('ctrl+2', function ()
				{
					ShaderBoy.renderScale = 2
					ShaderBoy.bufferManager.setFBOsProps()
					if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
				})
				key('ctrl+3', function ()
				{
					ShaderBoy.renderScale = 3
					ShaderBoy.bufferManager.setFBOsProps()
					if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
				})
				key('ctrl+4', function ()
				{
					ShaderBoy.renderScale = 4
					ShaderBoy.bufferManager.setFBOsProps()
					if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
				})
				key('⌥+up', function ()
				{
					if (ShaderBoy.isRecording !== true)
					{
						ShaderBoy.isPlaying = !ShaderBoy.isPlaying
					}
				})
				key('⌥+down', function ()
				{
					if (ShaderBoy.isRecording !== true)
					{
					}
				})
				let toEditorMode = function ()
				{
					ShaderBoy.gui.recEl.classList.add('rec_hide')

					if (ShaderBoy.gui.isTlElHidden)
					{
						ShaderBoy.gui.tlEl.classList.add('tl_hide')
					}

					if (!ShaderBoy.gui.isCodeElHidden)
					{
						ShaderBoy.gui.codeEl.classList.remove('code_hide')
					}

					if (!ShaderBoy.gui.isCtrlElHidden)
					{
						let ms = 400
						setTimeout(() =>
						{
							ShaderBoy.gui.ctrlEl.classList.remove('ctrl_hide')
						}, ms)
					}

					ShaderBoy.isPlaying = isPlaying

					ShaderBoy.editor.codemirror.focus()
					key.unbind('⌘+⇧+⌥+r', 'ctrl+⇧+⌥+r')
					key.unbind('ctrl+1')
					key.unbind('ctrl+2')
					key.unbind('ctrl+3')
					key.unbind('ctrl+4')
					key.unbind('⌥+up')
					key.unbind('⌥+down')
				}
				key('⌘+⇧+⌥+r', toEditorMode)
				key('ctrl+⇧+⌥+r', toEditorMode)
			}, ms)
		}

		// for Smartphone
		if (ShaderBoy.OS === 'iOS' || ShaderBoy.OS === 'Android')
		{
			this.editorShortcuts['Alt-Space'] = this.editorShortcuts['Alt-Enter']
			this.editorShortcuts['Alt-H'] = this.editorShortcuts['Shift-' + CMD + '-Alt-H']
			this.editorShortcuts['Shift-' + CMD + '-Alt-='] = function ()
			{
				ShaderBoy.editor.incTextSize()
			}
			this.editorShortcuts['Shift-' + CMD + '-Alt--'] = function ()
			{
				ShaderBoy.editor.decTextSize()
			}
		}
	}
};