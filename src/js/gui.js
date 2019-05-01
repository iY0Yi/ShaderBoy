//
//   ___    _   _  _ 
//  (  _`\ ( ) ( )(_)
//  | ( (_)| | | || |
//  | |___ | | | || |
//  | (_, )| (_) || |
//  (____/'(_____)(_)
//                   
//                   

import ShaderBoy from './shaderboy';
import key from 'keymaster';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import $ from 'jquery';
import CodeMirror from 'codemirror/lib/codemirror';
import gui_header from './gui/gui_header';
import gui_header_rec from './gui/gui_header_rec';
import gui_timeline from './gui/gui_timeline';
import gui_panel_shaderlist from './gui/gui_panel_shaderlist';
import gui_panel_textform from './gui/gui_panel_textform';
import gui_sidebar_ichannels from './gui/gui_sidebar_ichannels';

export default ShaderBoy.gui = {

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	init: function ()
	{
		ShaderBoy.style.buttonHeight = (window.innerWidth > 750) ? 45 : 35;

		this.mousePosX = 0;
		this.mousePosY = 0;
		this.mouseOriX = 0;
		this.mouseOriY = 0;
		this.mouseIsDown = false;

		this.cursor = {};

		this.sldrs = [];
		this.knobs = null;
		this.midis = null;
		this.knobUniformFS = '';
		this.sldrUniformFS = '';
		this.midiUniformFS = '';
		this.isSlidersHide = true;

		this.setupKnobs();
		this.setupMidi();
		gui_header.setup();
		gui_header_rec.setup();
		gui_timeline.setup();
		gui_panel_shaderlist.setup();
		gui_panel_textform.setup();
		gui_sidebar_ichannels.setup();
		this.setupInteraction();
		this.setupEditorShortcuts();
	},

	setupKnobs: function ()
	{
		this.ctrl = { 'domElement': null };
		this.ctrl.domElement = document.getElementById('ctrl');
		ShaderBoy.gui.knobs = new Vue({
			el: '#gui-panel-knob',
			data: {
				show: true,
				knobs:
					[
						{ id: 0, name: 's0x', circle: null, value: 0, active: true },
						{ id: 1, name: 's0y', circle: null, value: 0, active: true },
						{ id: 2, name: 's0z', circle: null, value: 0, active: true },

						{ id: 3, name: 's1x', circle: null, value: 0, active: true },
						{ id: 4, name: 's1y', circle: null, value: 0, active: true },
						{ id: 5, name: 's1z', circle: null, value: 0, active: true },

						{ id: 6, name: 's2x', circle: null, value: 0, active: true },
						{ id: 7, name: 's2y', circle: null, value: 0, active: true },
						{ id: 8, name: 's2z', circle: null, value: 0, active: true },

						{ id: 9, name: 's3x', circle: null, value: 0, active: true },
						{ id: 10, name: 's3y', circle: null, value: 0, active: false },
						{ id: 11, name: 's3z', circle: null, value: 0, active: false },

						{ id: 12, name: 's4x', circle: null, value: 0, active: false },
						{ id: 13, name: 's4y', circle: null, value: 0, active: false },
						{ id: 14, name: 's4z', circle: null, value: 0, active: false },

						{ id: 15, name: 's5x', circle: null, value: 0, active: false },
						{ id: 16, name: 's5y', circle: null, value: 0, active: false },
						{ id: 17, name: 's5z', circle: null, value: 0, active: false },

						{ id: 18, name: 's6x', circle: null, value: 0, active: false },
						{ id: 19, name: 's6y', circle: null, value: 0, active: false },
						{ id: 20, name: 's6z', circle: null, value: 0, active: false },

						{ id: 21, name: 's7x', circle: null, value: 0, active: false },
						{ id: 22, name: 's7y', circle: null, value: 0, active: false },
						{ id: 23, name: 's7z', circle: null, value: 0, active: false },
					]
			},
			mounted()
			{
				let knobs = document.getElementsByClassName("gui-knob comp");
				console.log('knobs:: ', knobs);
				this.precision = 360 * 5;
				for (let i = 0; i < knobs.length; i++)
				{
					ShaderBoy.gui.knobUniformFS += 'uniform float ' + this.knobs[i].name + ';\n';
					let element = knobs[i].children[1];
					this.knobs[i].circle = element;

					knobs[i].onmousewheel = function (e)
					{
						e.preventDefault();
						let velocity = 10;
						if (e.ctrlKey)
						{
							velocity = 100;
						}
						if (e.altKey)
						{
							velocity = 1;
						}

						if (ShaderBoy.gui.knobs.knobs[i].active === true)
						{
							ShaderBoy.forceDraw = (ShaderBoy.isPlaying !== true);
							console.log(e);
							let delta = (e.deltaY < 0) ? 1 : -1;
							let deg = e.deltaY;
							ShaderBoy.gui.knobs.knobs[i].value += delta * velocity * (1 / ShaderBoy.gui.knobs.precision);// deg * 1 / ShaderBoy.gui.knobs.precision;
							ShaderBoy.gui.knobs.knobs[i].value = Math.max(ShaderBoy.gui.knobs.knobs[i].value, -1);
							ShaderBoy.gui.knobs.knobs[i].value = Math.min(ShaderBoy.gui.knobs.knobs[i].value, 1);
							ShaderBoy.gui.knobs.knobs[i].value = Number(ShaderBoy.gui.knobs.knobs[i].value.toFixed(3));
							element.style.transform = 'rotate(' + ShaderBoy.gui.knobs.knobs[i].value * ShaderBoy.gui.knobs.precision + 'deg)';
						}
					};

					knobs[i].onclick = function (e)
					{
						ShaderBoy.gui.knobs.knobs[i].active = !ShaderBoy.gui.knobs.knobs[i].active;
						ShaderBoy.gui.knobs.toggle(i, true);
					};
				}

				console.log(ShaderBoy.gui.sldrUniformFS);
			},
			methods:
			{
				toggle(id, clicked)
				{
					console.log(ShaderBoy.gui.knobs.knobs[id].circle);

					if (ShaderBoy.gui.knobs.knobs[id].active === false)
					{
						ShaderBoy.gui.knobs.knobs[id].circle.style.transition = 'all 600ms ease-in-out';
						ShaderBoy.gui.knobs.knobs[id].circle.style.transform = 'rotate(0deg)';
						ShaderBoy.gui.knobs.knobs[id].circle.parentElement.style.transition = 'all 600ms ease-in-out';

						if (clicked)
						{
							let bufnames = ['BufferA', 'BufferB', 'BufferC', 'BufferD', 'MainImage'];
							for (let j = 0; j < bufnames.length; j++)
							{
								const name = bufnames[j];
								if (ShaderBoy.buffers[name].cm !== undefined)
								{
									let shdrtxt = ShaderBoy.buffers[name].cm.getValue();
									shdrtxt = shdrtxt.split(ShaderBoy.gui.knobs.knobs[id].name).join((ShaderBoy.gui.knobs.knobs[id].value).toFixed(3));
									ShaderBoy.buffers[name].cm.setValue(shdrtxt);
								}
							}
						}
					}
					else
					{
						ShaderBoy.gui.knobs.knobs[id].circle.style.transition = 'all 0ms ease-in-out';
						ShaderBoy.gui.knobs.knobs[id].circle.style.transform = 'rotate(' + ShaderBoy.gui.knobs.knobs[id].value * ShaderBoy.gui.knobs.precision + 'deg)';
						ShaderBoy.gui.knobs.knobs[id].circle.parentElement.style.transition = 'all 600ms ease-in-out';
					}
					if (clicked)
					{
						ShaderBoy.gui.knobs.knobs[id].circle.parentElement.classList.toggle('active');
						ShaderBoy.gui.knobs.knobs[id].value = 0;
					}
				}
			}
		});
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	update()
	{
		gui_timeline.update();
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	redraw: function ()
	{
		gui_header.redraw();
	},

	// "Web MIDI API Example" by Rumyra:
	// https://codepen.io/Rumyra/pen/NxdbzL
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setupMidi: function ()
	{
		// start talking to MIDI controller
		if (navigator.requestMIDIAccess)
		{
			navigator.requestMIDIAccess({
				sysex: false
			}).then(this.onMIDISuccess, this.onMIDIFailure);
		} else
		{
			console.warn("No MIDI support in your browser");
		}
	},

	onMIDISuccess: function (midiData)
	{
		// this is all our MIDI data
		let midi = midiData;
		let allInputs = midi.inputs.values();
		// loop over all available inputs and listen for any MIDI input
		for (let input = allInputs.next(); input && !input.done; input = allInputs.next())
		{
			// when a MIDI value is received call the onMIDIMessage function
			input.value.onmidimessage = ShaderBoy.gui.gotMIDImessage;
		}
	},

	gotMIDImessage: function (e)
	{
		// "midigui" by pqml:
		// https://github.com/pqml/midigui/blob/b2739d972fa2522f988ea96e9ddc7fce2054c882/build/midigui.js
		var cmd = e.data[0] >> 4;
		function message(channel, pitch, velocity)
		{
			return {
				channel: channel,
				pitch: pitch,
				velocity: (velocity / 127).toFixed(3)
			};
		}
		var msg = message(e.data[0] & 0xf, e.data[1], e.data[2]);
		var data = { 'name': null, 'value': null };
		if (cmd === 8 || cmd === 9 && msg.velocity === 0)
		{
			// noteOff
			data.name = 'midi_n' + msg.pitch;
			data.value = msg.velocity;
		} else if (cmd === 9)
		{
			// noteOn
			data.name = 'midi_n' + msg.pitch;
			data.value = msg.velocity;
		} else if (cmd === 11)
		{
			// controller message
			data.name = 'midi_c' + msg.pitch;
			data.value = msg.velocity;
		} else
		{
			// sysex or other
			data.name = 'midi_s' + msg.pitch;
			data.value = msg.velocity;
		}

		if (ShaderBoy.gui.midis === null)
		{
			ShaderBoy.gui.midis = {};
		}

		if (ShaderBoy.gui.midis !== null && ShaderBoy.gui.midis[data.name] !== undefined)
		{
			ShaderBoy.gui.midis[data.name] = data.value;
		}
		ShaderBoy.forceDraw = (ShaderBoy.isPlaying !== true);

		ShaderBoy.gui_header.setStatus('suc3', 'MIDI: ' + data.name + ' = ' + data.value, 3000);
	},

	onMIDIFailure: function ()
	{
		console.warn("Not recognising MIDI controller");
	},

	collectMidiUniforms: function ()
	{
		let commonShaderCode = ShaderBoy.bufferManager.getCommonShaderCode();

		let midiUniformNames = [];
		for (const name in ShaderBoy.buffers)
		{
			if (name !== 'Config' && name !== 'Setting' && ShaderBoy.buffers[name].active)
			{
				const srctxt = ShaderBoy.buffers[name].cm.getValue();
				let midi_c = srctxt.match(/midi_c\d+/g);
				midiUniformNames = midiUniformNames.concat(midi_c);
				let midi_n = srctxt.match(/midi_n\d+/g);
				midiUniformNames = midiUniformNames.concat(midi_n);
			}
		}
		midiUniformNames = Array.from(new Set(midiUniformNames));
		midiUniformNames = midiUniformNames.filter(function (a)
		{
			return a !== null;
		});
		console.log('midiUniformNames: ', midiUniformNames);

		ShaderBoy.gui.midis = null;
		ShaderBoy.gui.midiUniformFS = '\n';

		if (midiUniformNames.length >= 0)
		{
			ShaderBoy.gui.midis = {};

			for (let i = 0; i < midiUniformNames.length; i++)
			{
				const name = midiUniformNames[i];
				ShaderBoy.gui.midis[name] = 0.0;
				ShaderBoy.gui.midiUniformFS += 'uniform float ' + name + ';\n';
			}
		}

		console.log('ShaderBoy.gui.midis: ', ShaderBoy.gui.midis);
		console.log('ShaderBoy.gui.midiUniformFS: ', ShaderBoy.gui.midiUniformFS);
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setupInteraction: function ()
	{
		let scrollMul = 1;
		if (ShaderBoy.OS === 'Windows') { scrollMul = 100.0; }

		let mainEl = document.getElementById('main');
		mainEl.onmousedown = function (ev)
		{
			if (ev.button == 2) return false;
			if (ShaderBoy.isEditorHide)
			{
				let c = ShaderBoy.canvas;
				let rect = c.getBoundingClientRect();
				this.mouseOriX = Math.floor((ev.clientX - rect.left) / (rect.right - rect.left) * c.width);
				this.mouseOriY = Math.floor(c.height - (ev.clientY - rect.top) / (rect.bottom - rect.top) * c.height);
				this.mousePosX = this.mouseOriX;
				this.mousePosY = this.mouseOriY;
				this.mouseIsDown = true;
				if (!ShaderBoy.isPlaying) ShaderBoy.forceFrame = true;
				ShaderBoy.uniforms.iMouse = [this.mousePosX, this.mousePosY, this.mouseOriX, this.mouseOriY];
			}
		};

		mainEl.onmouseup = function (ev)
		{
			if (ShaderBoy.isEditorHide)
			{
				this.mouseIsDown = false;
				this.mouseOriX = -Math.abs(this.mouseOriX);
				this.mouseOriY = -Math.abs(this.mouseOriY);
				if (!ShaderBoy.isPlaying) ShaderBoy.forceFrame = true;
				ShaderBoy.uniforms.iMouse = [this.mousePosX, this.mousePosY, this.mouseOriX, this.mouseOriY];
			}
		};

		mainEl.onmousemove = function (ev)
		{
			if (ShaderBoy.isEditorHide)
			{
				if (this.mouseIsDown)
				{
					let c = ShaderBoy.canvas;
					let rect = c.getBoundingClientRect();
					this.mousePosX = Math.floor((ev.clientX - rect.left) / (rect.right - rect.left) * c.width);
					this.mousePosY = Math.floor(c.height - (ev.clientY - rect.top) / (rect.bottom - rect.top) * c.height);
					if (!ShaderBoy.isPlaying) ShaderBoy.forceFrame = true;
					ShaderBoy.uniforms.iMouse = [this.mousePosX, this.mousePosY, this.mouseOriX, this.mouseOriY];
				}
			}
		};

		mainEl.contextmenu = function (ev)
		{
			ev.preventDefault();
		};

		window.onresize = function (event)
		{
			// console.log('ShaderBoy.isRecording', ShaderBoy.isRecording);
			if (!ShaderBoy.isRecording)
			{
				let wasPlaying = ShaderBoy.isPlaying;
				ShaderBoy.isPlaying = false;
				let canvasWidth = Math.floor(((ShaderBoy.capture === null) ? window.innerWidth : 1920));
				let canvasHeight = Math.floor(((ShaderBoy.capture === null) ? window.innerHeight : 1080));
				ShaderBoy.canvas.width = canvasWidth;
				ShaderBoy.canvas.height = canvasHeight;
				document.getElementById('res-x').value = ShaderBoy.canvas.width;
				document.getElementById('res-y').value = ShaderBoy.canvas.height;
				ShaderBoy.bufferManager.setFBOsProps();
				gui_timeline.onResize();
				ShaderBoy.isPlaying = wasPlaying;
				// document.getElementById('gui-sidebar-left').style.height = '100%';
				// document.getElementById('editor').style.height = '100%';
				// document.getElementById('gui-panel-knob').style.height = '100%';
				// console.log(document.getElementById('gui-panel-knob'));
			} else
			{
				event.preventDefault();
			}
		};
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setupEditorShortcuts: function ()
	{
		this.editorShortcuts = {
			'Alt-Right': function ()
			{
				let codeEl = document.getElementById('code');
				codeEl.classList.add('code-container-mov-l');
				setTimeout(function ()
				{
					let codeEl = document.getElementById('code');
					codeEl.classList.remove('code-container-mov-l');
				}, 1000 * 0.2);
				console.log(codeEl.classList);
				ShaderBoy.editor.moveBuffer(1);
			},
			'Alt-Left': function ()
			{
				let codeEl = document.getElementById('code');
				codeEl.classList.add('code-container-mov-l');
				setTimeout(function ()
				{
					let codeEl = document.getElementById('code');
					codeEl.classList.remove('code-container-mov-l');
				}, 1000 * 0.2);
				console.log(codeEl.classList);
				ShaderBoy.editor.moveBuffer(-1);
			},
			'Alt-Up': function ()
			{
				if (ShaderBoy.isRecording !== true)
				{
					ShaderBoy.isPlaying = !ShaderBoy.isPlaying;
					// ShaderBoy.time.pause();
				}
			},
			'Alt-Down': function ()
			{
				gui_timeline.reset();
				if (ShaderBoy.isRecording !== true)
				{
					// ShaderBoy.time.reset();
				}
			},
			'Alt-Enter': function (cm) { ShaderBoy.bufferManager.buildShaderFromBuffers(); },

			'Ctrl-1': function ()
			{
				ShaderBoy.renderScale = 1;
				ShaderBoy.bufferManager.setFBOsProps();
				if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
			},
			'Ctrl-2': function ()
			{
				ShaderBoy.renderScale = 2;
				ShaderBoy.bufferManager.setFBOsProps();
				if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
			},
			'Ctrl-3': function ()
			{
				ShaderBoy.renderScale = 3;
				ShaderBoy.bufferManager.setFBOsProps();
				if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
			},
			'Ctrl-4': function ()
			{
				ShaderBoy.renderScale = 4;
				ShaderBoy.bufferManager.setFBOsProps();
				if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
			},

			"Shift-Cmd-Alt-J": 'unfoldAll', // just for register fold command.
			"Ctrl-K": function (cm)
			{
				cm.operation(function ()
				{
					for (let i = cm.firstLine(), e = cm.lastLine(); i <= e; i++)
						cm.foldCode(CodeMirror.Pos(i, 0));
				});
			},
			"Alt-K": function (cm) { cm.foldCode(cm.getCursor()); },
		};

		const CMD = (ShaderBoy.OS === 'MacOS' || ShaderBoy.OS === 'iOS') ? 'Cmd' : 'Ctrl';

		this.editorShortcuts[CMD + '-S'] = function (cm)
		{
			if (!ShaderBoy.runInDevMode)
			{
				ShaderBoy.io.saveShader();
			}
			else
			{
				alert('Oops! You are in test mode. Please reload this page and authorize.');
			}
		};
		this.editorShortcuts[CMD + '-O'] = function (cm)
		{
			let textformEl = document.getElementById('gp-textarea');
			let shaderlistEl = document.getElementById('gp-shader-list');
			if (!textformEl.classList.contains('hide')) textformEl.classList.add('hide');
			if (shaderlistEl.classList.contains('hide')) shaderlistEl.classList.remove('hide');
			gui_panel_shaderlist.show();
			ShaderBoy.isPlaying = false;

			ShaderBoy.editor.codemirror.display.input.blur();
			key('esc', function ()
			{
				let textformEl = document.getElementById('gp-textarea');
				let shaderlistEl = document.getElementById('gp-shader-list');
				if (!textformEl.classList.contains('hide')) textformEl.classList.add('hide');
				if (!shaderlistEl.classList.contains('hide')) shaderlistEl.classList.add('hide');
				gui_panel_shaderlist.show();
				ShaderBoy.isPlaying = true;
				key.unbind('esc');
			});

			if (ShaderBoy.runInDevMode)
			{
				alert('Oops! You are in test mode. Please reload this page and authorize.');
			}
		};

		this.editorShortcuts['Shift-' + CMD + '-Alt-+'] = function ()
		{
			ShaderBoy.editor.incTextSize();
		};
		this.editorShortcuts['Shift-' + CMD + '-Alt-;'] = function ()
		{
			ShaderBoy.editor.incTextSize();
		};
		this.editorShortcuts['Shift-' + CMD + '-Alt-='] = function ()
		{
			ShaderBoy.editor.incTextSize();
		};
		this.editorShortcuts['Shift-' + CMD + '-Alt--'] = function ()
		{
			ShaderBoy.editor.decTextSize();
		};
		this.editorShortcuts['Shift-' + CMD + '-Alt-_'] = function ()
		{
			ShaderBoy.editor.decTextSize();
		};

		this.editorShortcuts['Shift-' + CMD + '-Alt-D'] = function ()
		{
			ShaderBoy.gui.isSlidersHide = !ShaderBoy.gui.isSlidersHide;
			document.getElementById('ctrl').classList.toggle('ctrl_hide');
			document.getElementById('ctrl-wrapper').classList.toggle('ctrl-wrapper_hide');
		};

		this.editorShortcuts['Shift-' + CMD + '-Alt-A'] = function ()
		{
			let leftSidebarEl = document.getElementById('gui-sidebar-left');
			if (leftSidebarEl.classList.contains('gsbl-container-hidden'))
			{
				leftSidebarEl.classList.remove('gsbl-container-hidden');
				leftSidebarEl.classList.remove('gsbl-container-hide');
				leftSidebarEl.classList.add('gsbl-container-appear');
			}
			else
			{
				if (leftSidebarEl.classList.contains('gsbl-container-appear'))
				{
					leftSidebarEl.classList.remove('gsbl-container-appear');
					leftSidebarEl.classList.add('gsbl-container-hide');
				}
				else if (leftSidebarEl.classList.contains('gsbl-container-hide'))
				{
					leftSidebarEl.classList.remove('gsbl-container-hide');
					leftSidebarEl.classList.add('gsbl-container-appear');
				}
			}
		};

		this.editorShortcuts['Shift-' + CMD + '-Alt-T'] = function ()
		{
			ShaderBoy.gui.isSlidersHide = !ShaderBoy.gui.isSlidersHide;
			let tlel = document.getElementById('timeline');
			tlel.classList.toggle('tl_hide');
			document.querySelector('.CodeMirror').classList.toggle('expand-height');
		};

		this.editorShortcuts['Shift-' + CMD + '-Alt-N'] = function ()
		{
			if (!ShaderBoy.runInDevMode)
			{
				gui_panel_textform.reset('New Shader Name', function ()
				{
					console.log(ShaderBoy.gui_panel_textform.result);
					ShaderBoy.io.newShader(ShaderBoy.gui_panel_textform.result);
				});
				let textformEl = document.getElementById('gp-textarea');
				let shaderlistEl = document.getElementById('gp-shader-list');
				if (textformEl.classList.contains('hide')) textformEl.classList.remove('hide');
				if (!shaderlistEl.classList.contains('hide')) shaderlistEl.classList.add('hide');
				ShaderBoy.isPlaying = false;

				ShaderBoy.editor.codemirror.display.input.blur();
				key('esc', function ()
				{
					gui_panel_textform.reset('', function () { });
					ShaderBoy.isPlaying = true;
					key.unbind('esc');
				});
			}
			else
			{
				alert('Oops! You are in test mode. Please reload this page and authorize.');
			}

		};

		this.editorShortcuts['Shift-' + CMD + '-Alt-H'] = function ()
		{
			ShaderBoy.isEditorHide = !ShaderBoy.isEditorHide;

			ShaderBoy.gui.hdrEl = document.getElementById('gui-header');
			ShaderBoy.gui.tlEl = document.getElementById('timeline');
			ShaderBoy.gui.codeEl = document.getElementById('code');
			ShaderBoy.gui.ctrlEl = document.getElementById('ctrl');
			ShaderBoy.gui.isHdrElHidden = false;
			ShaderBoy.gui.isTlElHidden = false;
			ShaderBoy.gui.isCodeElHidden = false;
			ShaderBoy.gui.isCtrlElHidden = false;

			if (ShaderBoy.gui.ctrlEl.classList.contains('ctrl_hide'))
			{
				ShaderBoy.gui.isCtrlElHidden = true;
			}
			ShaderBoy.gui.ctrlEl.classList.add('ctrl_hide');

			let ms = (ShaderBoy.gui.isCtrlElHidden) ? 0 : 400;
			setTimeout(() =>
			{
				if (ShaderBoy.gui.hdrEl.classList.contains('hdr_hide'))
				{
					ShaderBoy.gui.isHdrElHidden = true;
				}
				ShaderBoy.gui.hdrEl.classList.add('hdr_hide');

				if (ShaderBoy.gui.tlEl.classList.contains('tl_hide'))
				{
					ShaderBoy.gui.isTlElHidden = true;
				}
				ShaderBoy.gui.tlEl.classList.add('tl_hide');

				if (ShaderBoy.gui.codeEl.classList.contains('code_hide'))
				{
					ShaderBoy.gui.isCodeElHidden = true;
				}
				ShaderBoy.gui.codeEl.classList.add('code_hide');



				ShaderBoy.editor.codemirror.display.input.blur();

				key('ctrl+1', function ()
				{
					ShaderBoy.renderScale = 1;
					ShaderBoy.bufferManager.setFBOsProps();
					if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
				});
				key('ctrl+2', function ()
				{
					ShaderBoy.renderScale = 2;
					ShaderBoy.bufferManager.setFBOsProps();
					if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
				});
				key('ctrl+3', function ()
				{
					ShaderBoy.renderScale = 3;
					ShaderBoy.bufferManager.setFBOsProps();
					if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
				});
				key('ctrl+4', function ()
				{
					ShaderBoy.renderScale = 4;
					ShaderBoy.bufferManager.setFBOsProps();
					if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
				});
				key('⌥+up', function ()
				{
					if (ShaderBoy.isRecording !== true)
					{
						ShaderBoy.isPlaying = !ShaderBoy.isPlaying;
						// ShaderBoy.time.pause();
					}
				});
				key('⌥+down', function ()
				{
					if (ShaderBoy.isRecording !== true)
					{
						// ShaderBoy.time.reset();
					}
				});

				let hide = function ()
				{
					if (!ShaderBoy.gui.isHdrElHidden)
					{
						ShaderBoy.gui.hdrEl.classList.remove('hdr_hide');
					}

					if (!ShaderBoy.gui.isTlElHidden)
					{
						ShaderBoy.gui.tlEl.classList.remove('tl_hide');
					}
					
					if (!ShaderBoy.gui.isCodeElHidden)
					{
						ShaderBoy.gui.codeEl.classList.remove('code_hide');
					}
					
					if (!ShaderBoy.gui.isCtrlElHidden)
					{
						let ms = 400;
						setTimeout(() =>
						{
							ShaderBoy.gui.ctrlEl.classList.remove('ctrl_hide');
						},ms);
					}

					ShaderBoy.editor.codemirror.focus();
					key.unbind('⌘+⇧+⌥+h', 'ctrl+⇧+⌥+h');
					key.unbind('ctrl+1');
					key.unbind('ctrl+2');
					key.unbind('ctrl+3');
					key.unbind('ctrl+4');
					key.unbind('⌥+up');
					key.unbind('⌥+down');
					if (ShaderBoy.OS === 'iOS' || ShaderBoy.OS === 'Android')
					{
						key.unbind('⌥+h');
					}
				};
				key('⌘+⇧+⌥+h', hide);
				key('ctrl+⇧+⌥+h', hide);
				if (ShaderBoy.OS === 'iOS' || ShaderBoy.OS === 'Android')
				{
					key('⌥+h', hide);
				}
			}
				, ms)
		};

		this.editorShortcuts['Shift-' + CMD + '-Alt-F'] = function (cm)
		{
			function getSelectedRange()
			{
				return {
					from: cm.getCursor(true),
					to: cm.getCursor(false),
				};
			}
			let range = getSelectedRange();
			cm.autoFormatRange(range.from, range.to);
		};
		this.editorShortcuts['Shift-' + CMD + '-F'] = function (cm)
		{
			function getSelectedRange()
			{
				return {
					from: cm.getCursor(true),
					to: cm.getCursor(false),
				};
			}
			let range = getSelectedRange();
			cm.autoFormatRange(range.from, range.to);
		};

		this.editorShortcuts['Shift-' + CMD + '-Alt-V'] = function ()
		{
			ShaderBoy.isConcentrating = !ShaderBoy.isConcentrating;
			if (ShaderBoy.isConcentrating)
			{
				ShaderBoy.isPlaying = false;
				ShaderBoy.isEditorHide = false;
				ShaderBoy.canvas.style.opacity = '0.0';
				$('.cm-s-3024-monotone span').css('background', '#1e1e1e00');
				$('.cm-s-3024-monotone .CodeMirror-code').toggleClass('concentrating');

			}
			else
			{
				ShaderBoy.isPlaying = true;
				ShaderBoy.canvas.style.opacity = '1.0';
				$('.cm-s-3024-monotone span').css('background', '#1e1e1eFF');
				$('.cm-s-3024-monotone .CodeMirror-code').toggleClass('concentrating');
			}
		};

		this.editorShortcuts['Shift-' + CMD + '-Alt-F'] = function ()
		{
			ShaderBoy.util.requestFullScreen();
		};

		this.editorShortcuts['Shift-' + CMD + '-Alt-R'] = function ()
		{
			let recEl = document.getElementById('ghdr-rec-base');
			let tlEl = document.getElementById('timeline');
			let codeEl = document.getElementById('code');
			let ctrlEl = document.getElementById('ctrl');
			document.getElementById('res-x').value = ShaderBoy.canvas.width;
			document.getElementById('res-y').value = ShaderBoy.canvas.height;

			let isTlElHidden = false;
			let isCodeElHidden = false;
			let isCtrlElHidden = false;
			let isPlaying = false;
			recEl.classList.remove('rec_hide');

			if (tlEl.classList.contains('tl_hide'))
			{
				isTlElHidden = true;
			}
			tlEl.classList.remove('tl_hide');

			if (codeEl.classList.contains('code_hide'))
			{
				isCodeElHidden = true;
			}
			codeEl.classList.add('code_hide');

			if (ctrl.classList.contains('ctrl_hide'))
			{
				isCtrlElHidden = true;
			}
			ctrl.classList.add('ctrl_hide');

			ShaderBoy.editor.codemirror.display.input.blur();


			isPlaying = ShaderBoy.isPlaying;
			ShaderBoy.isPlaying = false;
			gui_timeline.reset();

			key('ctrl+1', function ()
			{
				ShaderBoy.renderScale = 1;
				ShaderBoy.bufferManager.setFBOsProps();
				if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
			});
			key('ctrl+2', function ()
			{
				ShaderBoy.renderScale = 2;
				ShaderBoy.bufferManager.setFBOsProps();
				if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
			});
			key('ctrl+3', function ()
			{
				ShaderBoy.renderScale = 3;
				ShaderBoy.bufferManager.setFBOsProps();
				if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
			});
			key('ctrl+4', function ()
			{
				ShaderBoy.renderScale = 4;
				ShaderBoy.bufferManager.setFBOsProps();
				if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
			});
			key('⌥+up', function ()
			{
				if (ShaderBoy.isRecording !== true)
				{
					ShaderBoy.isPlaying = !ShaderBoy.isPlaying;
					// ShaderBoy.time.pause();
				}
			});
			key('⌥+down', function ()
			{
				if (ShaderBoy.isRecording !== true)
				{
					// ShaderBoy.time.reset();
				}
			});
			let toEditorMode = function ()
			{
				recEl.classList.add('rec_hide');

				if (isTlElHidden)
				{
					tlEl.classList.add('tl_hide');
				}

				if (!isCodeElHidden)
				{
					codeEl.classList.remove('code_hide');
				}

				if (!isCtrlElHidden)
				{
					ctrl.classList.remove('ctrl_hide');
				}

				ShaderBoy.isPlaying = isPlaying;

				ShaderBoy.editor.codemirror.focus();
				key.unbind('⌘+⇧+⌥+r', 'ctrl+⇧+⌥+r');
				key.unbind('ctrl+1');
				key.unbind('ctrl+2');
				key.unbind('ctrl+3');
				key.unbind('ctrl+4');
				key.unbind('⌥+up');
				key.unbind('⌥+down');
			};
			key('⌘+⇧+⌥+r', toEditorMode);
			key('ctrl+⇧+⌥+r', toEditorMode);
		};

		// for Smartphone
		if (ShaderBoy.OS === 'iOS' || ShaderBoy.OS === 'Android')
		{
			this.editorShortcuts['Alt-Space'] = this.editorShortcuts['Alt-Enter'];
			this.editorShortcuts['Alt-H'] = this.editorShortcuts['Shift-' + CMD + '-Alt-H'];
			this.editorShortcuts['Shift-' + CMD + '-Alt-='] = function ()
			{
				ShaderBoy.editor.incTextSize();
			};
			this.editorShortcuts['Shift-' + CMD + '-Alt--'] = function ()
			{
				ShaderBoy.editor.decTextSize();
			};
		}
	}
};