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

export default ShaderBoy.gui = {

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	header: {
		base: { domElement: null },
		content: null,
		needUpdate: false
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setting: {

	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	init: function () {
		ShaderBoy.style.buttonHeight = 35;

		this.header.base.domElement = document.getElementById('ctrl');
		if (this.header.base.domElement === null) { throw 'Could not get canvas. No element such a name.'; }
		this.header.base.domElement.style.backgroundColor = '#00000066';
		this.header.base.domElement.style.float = 'left';
		this.header.base.domElement.style.position = 'absolute';
		this.header.base.domElement.style.top = '0px';
		this.header.base.domElement.style.left = '0px';
		this.header.base.domElement.style.width = window.innerWidth + 'px';
		this.header.base.domElement.style.height = ShaderBoy.style.buttonHeight + 'px';
		this.header.base.domElement.style.display = 'table';
		this.header.base.domElement.style.border = '0px solid #FFF';
		this.header.base.domElement.style.zIndex = '81';

		// iTime / iFrame / FPS info
		this.header.contents = document.createElement("div");
		this.header.base.domElement.appendChild(this.header.contents);
		this.header.contents.innerText = 378892.0.toFixed(3) + ' sec' + ' / ' + 4382.0.toFixed(0) + ' frms' + ' / ' + 43.0.toFixed(0) + ' fps';
		this.header.contents.style.float = 'left';
		this.header.contents.style.position = 'absolute';
		this.header.contents.style.height = ShaderBoy.style.buttonHeight + 'px';
		this.header.contents.style.color = '#FFF'
		this.header.contents.style.top = '0px';
		this.header.contents.style.left = '0px';
		this.header.contents.style.fontSize = '14px';
		this.header.contents.style.fontFamily = 'Arial, monospace';
		this.header.contents.style.letterSpacing = '1px';
		this.header.contents.style.marginTop = '9px';
		this.header.contents.style.marginLeft = 15 + 'px';

		this.mousePositionCur = [];
		this.mousePosX = 0;
		this.mouseOriY = 0;
		this.mousePosX = 0;
		this.mousePosY = 0;
		this.mouseIsDown = false;
	},

	redrawHeader: function () {
		if (this.header.needUpdate !== true)
			this.header.contents.innerText = ShaderBoy.uniforms.iTime.toFixed(3) + ' sec' + ' / ' + ShaderBoy.uniforms.iFrame.toFixed(0) + ' frms' + ' / ' + ShaderBoy.time.fps.toFixed(1) + ' fps';

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

		window.addEventListener('resize', function () {
			ShaderBoy.isPlaying = false;
			ShaderBoy.renderer.createBuffer(false);
			ShaderBoy.canvas.width = window.innerWidth;
			ShaderBoy.canvas.height = window.innerHeight;
			ShaderBoy.gui.header.base.domElement.style.width = window.innerWidth + 'px';
			ShaderBoy.gui.header.base.domElement.style.height = ShaderBoy.style.buttonHeight + 'px';
			ShaderBoy.editor.setSize(window.innerWidth, window.innerHeight - ShaderBoy.style.buttonHeight);
			ShaderBoy.isPlaying = true;
		}, true);
	}
};