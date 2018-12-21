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
export default ShaderBoy.gui = {

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	header: {
		base: { domElement: null },
		content: null,
		needUpdate: false,

		init: function () {
			this.base.domElement = document.getElementById('ctrl');
			if (this.base.domElement === null) { throw 'Could not get canvas. No element such a name.'; }
			this.base.domElement.style.backgroundColor = '#00000066';
			this.base.domElement.style.float = 'left';
			this.base.domElement.style.position = 'absolute';
			this.base.domElement.style.top = '0px';
			this.base.domElement.style.left = '0px';
			this.base.domElement.style.width = window.innerWidth + 'px';
			this.base.domElement.style.height = ShaderBoy.style.buttonHeight + 'px';
			this.base.domElement.style.display = 'table';
			this.base.domElement.style.border = '0px solid #FFF';
			this.base.domElement.style.zIndex = '81';
			this.base.domElement.style.display = 'flex';
			this.base.domElement.style.justifyContent = 'space-between';

			// Buffer name
			this.bufferName = document.createElement("div");
			this.base.domElement.appendChild(this.bufferName);
			this.bufferName.innerText = 'MainImage';
			// this.bufferName.style.float = 'left';
			// this.bufferName.style.position = 'absolute';
			this.bufferName.style.height = ShaderBoy.style.buttonHeight - 5 + 'px';
			this.bufferName.style.color = '#FFF'
			this.bufferName.style.top = '0px';
			this.bufferName.style.left = '0px';
			this.bufferName.style.fontSize = '14px';
			this.bufferName.style.fontFamily = 'Arial, monospace';
			this.bufferName.style.letterSpacing = '1px';
			this.bufferName.style.marginTop = '9px';
			this.bufferName.style.marginLeft = 20 + 'px';

			// iTime / iFrame / FPS info
			this.timeInfo = document.createElement("div");
			this.base.domElement.appendChild(this.timeInfo);
			this.timeInfo.innerText = 0.0.toFixed(3) + ' sec' + ' | ' + 0.0.toFixed(0) + ' frm' + ' | ' + 0.0.toFixed(0) + ' fps';
			// this.timeInfo.style.float = 'right';
			// this.timeInfo.style.position = 'absolute';
			this.timeInfo.style.height = ShaderBoy.style.buttonHeight - 5 + 'px';
			this.timeInfo.style.color = '#FFF'
			this.timeInfo.style.top = '0px';
			this.timeInfo.style.left = '0px';
			this.timeInfo.style.fontSize = '14px';
			this.timeInfo.style.fontFamily = 'Arial, monospace';
			this.timeInfo.style.letterSpacing = '1px';
			this.timeInfo.style.marginTop = '9px';
			this.timeInfo.style.marginRight = 20 + 'px';
		},

		showCommandInfo: function (text, color, bgColor, isStatic) {
			console.log(text);
			this.currentbufferText = ShaderBoy.util.deepcopy(this.bufferName.innerText);
			this.currentcontentText = ShaderBoy.util.deepcopy(this.timeInfo.innerText);
			this.needUpdate = true;
			this.bufferName.innerText = text;
			this.timeInfo.innerText = '';
			this.base.domElement.style.backgroundColor = bgColor;
			this.bufferName.style.fontFamily = '"Cutive Mono", monospace;';
			this.timeInfo.style.fontFamily = '"Cutive Mono", monospace;';
			this.bufferName.style.color = color;
			this.timeInfo.style.color = color;
			if (!isStatic) {
				setTimeout(function () {
					ShaderBoy.gui.header.needUpdate = false;
					ShaderBoy.gui.header.bufferName.innerText = ShaderBoy.gui.currentbufferText;
					ShaderBoy.gui.header.timeInfo.innerText = ShaderBoy.gui.currentcontentText;
					ShaderBoy.gui.header.bufferName.style.color = '#d8d4c5';
					ShaderBoy.gui.header.timeInfo.style.color = '#d8d4c5';
					ShaderBoy.gui.header.base.domElement.style.backgroundColor = '#00000066';
				}, 3000);
			}
		},

		redraw: function () {
			if (this.needUpdate !== true) {
				this.bufferName.innerText = ShaderBoy.editingBuffer;
				this.timeInfo.innerText = ShaderBoy.uniforms.iTime.toFixed(3) + ' sec' + ' | ' + ShaderBoy.uniforms.iFrame.toFixed(0) + ' frm' + ' | ' + ShaderBoy.time.fps.toFixed(1) + ' fps';
			}
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	init: function () {
		ShaderBoy.style.buttonHeight = 35;

		this.header.init();

		this.mousePosX = 0;
		this.mousePosY = 0;
		this.mouseOriX = 0;
		this.mouseOriY = 0;
		this.mouseIsDown = false;

		this.cursor = {};

		this.setupInteraction();
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	redraw: function () {
		this.header.redraw();
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setupInteraction: function () {
		let scrollMul = 1;
		if (ShaderBoy.OS === 'Windows') { scrollMul = 100.0; }

		document.body.onmousedown = function (ev) {
			if (ev.button == 2) return false;
			if (ShaderBoy.isEditorHide) {
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

		document.body.onmouseup = function (ev) {
			if (ShaderBoy.isEditorHide) {
				this.mouseIsDown = false;
				this.mouseOriX = -Math.abs(this.mouseOriX);
				this.mouseOriY = -Math.abs(this.mouseOriY);
				if (!ShaderBoy.isPlaying) ShaderBoy.forceFrame = true;
				ShaderBoy.uniforms.iMouse = [this.mousePosX, this.mousePosY, this.mouseOriX, this.mouseOriY];
			}
		};

		document.body.onmousemove = function (ev) {
			if (ShaderBoy.isEditorHide) {
				if (this.mouseIsDown) {
					let c = ShaderBoy.canvas;
					let rect = c.getBoundingClientRect();
					this.mousePosX = Math.floor((ev.clientX - rect.left) / (rect.right - rect.left) * c.width);
					this.mousePosY = Math.floor(c.height - (ev.clientY - rect.top) / (rect.bottom - rect.top) * c.height);
					if (!ShaderBoy.isPlaying) ShaderBoy.forceFrame = true;
					ShaderBoy.uniforms.iMouse = [this.mousePosX, this.mousePosY, this.mouseOriX, this.mouseOriY];
				}
			}
		};

		document.body.contextmenu = function (ev) {
			ev.preventDefault();
		};

		window.addEventListener('resize', function (event) {
			console.log('ShaderBoy.isRecording', ShaderBoy.isRecording);
			if (!ShaderBoy.isRecording) {
				let wasPlaying = ShaderBoy.isPlaying;
				ShaderBoy.isPlaying = false;
				let canvasWidth = Math.floor(((ShaderBoy.capture === null) ? window.innerWidth : 1920));
				let canvasHeight = Math.floor(((ShaderBoy.capture === null) ? window.innerHeight : 1080));
				ShaderBoy.canvas.width = canvasWidth;
				ShaderBoy.canvas.height = canvasHeight;
				ShaderBoy.bufferManager.initFrameBuffers();
				ShaderBoy.gui.header.base.domElement.style.width = window.innerWidth + 'px';
				ShaderBoy.gui.header.base.domElement.style.height = ShaderBoy.style.buttonHeight + 'px';
				ShaderBoy.editor.codemirror.setSize(window.innerWidth, window.innerHeight - ShaderBoy.style.buttonHeight);
				ShaderBoy.isPlaying = wasPlaying;
			} else {
				event.preventDefault();
			}
		}, true);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		this.editorShortcuts = {
			'Alt-Right': function () {
				ShaderBoy.editor.moveBuffer(1);
			},
			'Alt-Left': function () {
				ShaderBoy.editor.moveBuffer(-1);
			},
			'Alt-Up': function () {
				if (ShaderBoy.isRecording !== true) {
					ShaderBoy.isPlaying = !ShaderBoy.isPlaying;
					ShaderBoy.time.pause();
				}
			},
			'Alt-Down': function () {
				if (ShaderBoy.isRecording !== true) {
					ShaderBoy.time.reset();
				}
			},
			'Alt-Enter': function (cm) { ShaderBoy.bufferManager.resetBufferData(false); },

			'Ctrl-1': function () {
				ShaderBoy.renderScale = 1;
				ShaderBoy.bufferManager.initFrameBuffers();
				if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
			},
			'Ctrl-2': function () {
				ShaderBoy.renderScale = 2;
				ShaderBoy.bufferManager.initFrameBuffers();
				if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
			},
			'Ctrl-3': function () {
				ShaderBoy.renderScale = 3;
				ShaderBoy.bufferManager.initFrameBuffers();
				if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
			},
			'Ctrl-4': function () {
				ShaderBoy.renderScale = 4;
				ShaderBoy.bufferManager.initFrameBuffers();
				if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
			},

			"Shift-Cmd-Alt-J": 'unfoldAll', // just for register fold command...
			"Ctrl-K": function (cm) {
				cm.operation(function () {
					for (let i = cm.firstLine(), e = cm.lastLine(); i <= e; i++)
						cm.foldCode(CodeMirror.Pos(i, 0));
				});
			},
			"Alt-K": function (cm) { cm.foldCode(cm.getCursor()); },
		};

		const CMD = (ShaderBoy.OS === 'MacOS' || ShaderBoy.OS === 'iOS') ? 'Cmd' : 'Ctrl';

		this.editorShortcuts[CMD + '-S'] = function (cm) { ShaderBoy.io.saveShader(); };

		this.editorShortcuts['Shift-' + CMD + '-Alt-+'] = function () {
			ShaderBoy.editor.incTextSize();
		};
		this.editorShortcuts['Shift-' + CMD + '-Alt-;'] = function () {
			ShaderBoy.editor.incTextSize();
		};
		this.editorShortcuts['Shift-' + CMD + '-Alt-='] = function () {
			ShaderBoy.editor.incTextSize();
		};
		this.editorShortcuts['Shift-' + CMD + '-Alt--'] = function () {
			ShaderBoy.editor.decTextSize();
		};
		this.editorShortcuts['Shift-' + CMD + '-Alt-_'] = function () {
			ShaderBoy.editor.decTextSize();
		};
		// this.editorShortcuts['Shift-' + CMD + '-Alt-L'] = function () { ShaderBoy.io.loadShader(); };
		this.editorShortcuts['Shift-' + CMD + '-Alt-N'] = function () { ShaderBoy.io.newShader(); };

		this.editorShortcuts['Shift-' + CMD + '-Alt-H'] = function () {
			ShaderBoy.isEditorHide = !ShaderBoy.isEditorHide;
			if (ShaderBoy.isEditorHide) {
				ShaderBoy.editor.domElement.style.opacity = '0.0';
				ShaderBoy.gui.header.base.domElement.style.opacity = '0.0';
				ShaderBoy.gui.cursor = ShaderBoy.editor.codemirror.getCursor();
				let elem = document.getElementById('code');
				elem.style.cursor = 'default';
				ShaderBoy.editor.domElement.style.top = '100vh';
				ShaderBoy.gui.header.base.domElement.style.top = '100vh';
				ShaderBoy.editor.domElement.style.display = 'none';
				ShaderBoy.gui.header.base.domElement.style.display = 'none';
			}
			else {
				ShaderBoy.editor.domElement.style.opacity = '1.0';
				ShaderBoy.gui.header.base.domElement.style.opacity = '1.0';
				ShaderBoy.editor.codemirror.setCursor(ShaderBoy.gui.cursor);
				let elem = document.getElementById('code');
				elem.style.cursor = 'auto';
				ShaderBoy.editor.domElement.style.top = '0px';
				ShaderBoy.gui.header.base.domElement.style.top = '0px';
				ShaderBoy.editor.domElement.style.display = 'table';
				ShaderBoy.gui.header.base.domElement.style.display = 'flex';
				ShaderBoy.editor.codemirror.focus();
			}
		};

		this.editorShortcuts['Shift-' + CMD + '-Alt-F'] = function (cm) {
			function getSelectedRange() {
				return {
					from: cm.getCursor(true),
					to: cm.getCursor(false),
				};
			}
			let range = getSelectedRange();
			cm.autoFormatRange(range.from, range.to);
		};
		this.editorShortcuts['Shift-' + CMD + '-F'] = function (cm) {
			function getSelectedRange() {
				return {
					from: cm.getCursor(true),
					to: cm.getCursor(false),
				};
			}
			let range = getSelectedRange();
			cm.autoFormatRange(range.from, range.to);
		};

		this.editorShortcuts['Shift-' + CMD + '-Alt-V'] = function () {
			ShaderBoy.isConcentrating = !ShaderBoy.isConcentrating;
			if (ShaderBoy.isConcentrating) {
				ShaderBoy.isPlaying = false;
				ShaderBoy.isEditorHide = false;
				ShaderBoy.editor.domElement.style.opacity = '1.0';
				ShaderBoy.gui.header.base.domElement.style.opacity = '1.0';
				ShaderBoy.canvas.style.opacity = '0.0';
				$('.cm-s-3024-night span').css('background', '#1E1E1E00');

			}
			else {
				ShaderBoy.isPlaying = true;
				ShaderBoy.canvas.style.opacity = '1.0';
				$('.cm-s-3024-night span').css('background', '#1E1E1EFF');
			}
		};

		this.editorShortcuts['Shift-' + CMD + '-Alt-F'] = function () {
			ShaderBoy.util.requestFullScreen();
		};

		this.editorShortcuts['Shift-' + CMD + '-Alt-R'] = function () {
			ShaderBoy.isRecording = !ShaderBoy.isRecording;
			if (!ShaderBoy.isRecording) {
				ShaderBoy.capture.stop();
				ShaderBoy.capture.save();
				console.log('ShaderBoy.capture', ShaderBoy.capture);
				let canvasWidth = Math.floor(window.innerWidth);
				let canvasHeight = Math.floor(window.innerHeight);
				ShaderBoy.canvas.width = canvasWidth;
				ShaderBoy.canvas.height = canvasHeight;
				ShaderBoy.bufferManager.initFrameBuffers();
				ShaderBoy.isPlaying = true;
				ShaderBoy.isRecording = false;
				ShaderBoy.capture = null;
				ShaderBoy.time.reset();
				ShaderBoy.gui.header.showCommandInfo('✓ Finished Recording.', '#FF0000', '#1E1E1E', false);
			}
			else {
				let config = JSON.parse(ShaderBoy.buffers['Config'].cm.getValue()).capture;
				let resX = 1920;
				let resY = 1080;
				if ('resolution' in config) {
					resX = config.resolution[0];
					resY = config.resolution[1];
					delete config.resolution;
				}
				ShaderBoy.capture = new CCapture(config);

				ShaderBoy.capture.totalframes = config.framerate * config.timeLimit;
				ShaderBoy.capture.currentframes = 0;

				ShaderBoy.canvas.width = resX;
				ShaderBoy.canvas.height = resY;
				ShaderBoy.bufferManager.initFrameBuffers();

				ShaderBoy.isPlaying = true;
				ShaderBoy.isConcentrating = false;
				ShaderBoy.canvas.style.opacity = '1.0';

				ShaderBoy.time.reset();
				ShaderBoy.capture.start();

				ShaderBoy.gui.header.showCommandInfo('● Recording...', '#FF0000', '#1E1E1E', true);
			}
		};

		// for Smartphone
		// if (ShaderBoy.OS === 'iOS' || ShaderBoy.OS === 'Android') 
		{
			this.editorShortcuts['Alt-Space'] = function (cm) { ShaderBoy.bufferManager.resetBufferData(false); };
			this.editorShortcuts['Alt-H'] = function () {
				ShaderBoy.isEditorHide = !ShaderBoy.isEditorHide;
				if (ShaderBoy.isEditorHide) {
					ShaderBoy.editor.domElement.style.opacity = '0.0';
					ShaderBoy.gui.header.base.domElement.style.opacity = '0.0';
					ShaderBoy.gui.cursor = ShaderBoy.editor.codemirror.getCursor();
					ShaderBoy.editor.domElement.style.top = '100vh';
					ShaderBoy.gui.header.base.domElement.style.top = '100vh';
					ShaderBoy.editor.domElement.style.display = 'none';
					ShaderBoy.gui.header.base.domElement.style.display = 'none';
				}
				else {
					ShaderBoy.editor.domElement.style.opacity = '1.0';
					ShaderBoy.gui.header.base.domElement.style.opacity = '1.0';
					ShaderBoy.editor.codemirror.setCursor(ShaderBoy.gui.cursor);
					ShaderBoy.editor.domElement.style.top = '0px';
					ShaderBoy.gui.header.base.domElement.style.top = '0px';
					ShaderBoy.editor.domElement.style.display = 'table';
					ShaderBoy.gui.header.base.domElement.style.display = 'flex';
					ShaderBoy.editor.codemirror.focus();
				}
			};
		}

		key('⌥+up', function () {
			if (ShaderBoy.isRecording !== true) {
				ShaderBoy.isPlaying = !ShaderBoy.isPlaying;
				ShaderBoy.time.pause();
			}
		});
		key('⌥+down', function () {
			if (ShaderBoy.isRecording !== true) {
				ShaderBoy.time.reset();
			}
		});
		key('ctrl+1', function () {
			ShaderBoy.renderScale = 1;
			ShaderBoy.bufferManager.initFrameBuffers();
			if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
		});
		key('ctrl+2', function () {
			ShaderBoy.renderScale = 2;
			ShaderBoy.bufferManager.initFrameBuffers();
			if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
		});
		key('ctrl+3', function () {
			ShaderBoy.renderScale = 3;
			ShaderBoy.bufferManager.initFrameBuffers();
			if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
		});
		key('ctrl+4', function () {
			ShaderBoy.renderScale = 4;
			ShaderBoy.bufferManager.initFrameBuffers();
			if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true;
		});

		key('⌘+⇧+⌥+h, ctrl+⇧+⌥+h', function () {
			console.log('keymaster!!!!!!!');
			ShaderBoy.isEditorHide = !ShaderBoy.isEditorHide;
			if (ShaderBoy.isEditorHide) {
				ShaderBoy.editor.domElement.style.opacity = '0.0';
				ShaderBoy.gui.header.base.domElement.style.opacity = '0.0';
				ShaderBoy.gui.cursor = ShaderBoy.editor.codemirror.getCursor();
				ShaderBoy.editor.domElement.style.top = '100vh';
				ShaderBoy.gui.header.base.domElement.style.top = '100vh';
				ShaderBoy.editor.domElement.style.display = 'none';
				ShaderBoy.gui.header.base.domElement.style.display = 'none';
			}
			else {
				ShaderBoy.editor.domElement.style.opacity = '1.0';
				ShaderBoy.gui.header.base.domElement.style.opacity = '1.0';
				ShaderBoy.editor.codemirror.setCursor(ShaderBoy.gui.cursor);
				ShaderBoy.editor.domElement.style.top = '0px';
				ShaderBoy.gui.header.base.domElement.style.top = '0px';
				ShaderBoy.editor.domElement.style.display = 'table';
				ShaderBoy.gui.header.base.domElement.style.display = 'flex';
				ShaderBoy.editor.codemirror.focus();
			}
		});
	}
};