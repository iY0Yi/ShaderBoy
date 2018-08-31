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
	mouse: {
		down:
		{
			curr: false,
			prev: false
		},
		position:
		{
			curr: [ShaderBoy.uniforms.iMouse[0], ShaderBoy.uniforms.iMouse[1]],
			prev: [ShaderBoy.uniforms.iMouse[0], ShaderBoy.uniforms.iMouse[1]]
		}
	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	init: function () {
		ShaderBoy.style.buttonHeight = 35;

		this.header.base.domElement = document.getElementById('ctrl');
		if (this.header.base.domElement === null) { throw 'Could not get canvas. No element such a name.'; }
		this.header.base.domElement.style.backgroundColor = '#00000066';
		this.header.base.domElement.style.float = 'left';
		this.header.base.domElement.style.position = 'absolute';
		// this.header.base.domElement.style.top = window.innerHeight - ShaderBoy.style.buttonHeight + 'px';
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

		this.mouseLeftDownCur = false;
		this.mousePositionCur = [];
		// this.header.contents.style.marginLeft = ShaderBoy.style.buttonHeight + 5 + 'px';
	},

	redrawHeader: function () {
		if (this.header.needUpdate !== true)
			this.header.contents.innerText = ShaderBoy.uniforms.iTime.toFixed(3) + ' sec' + ' / ' + ShaderBoy.uniforms.iFrame.toFixed(0) + ' frms' + ' / ' + ShaderBoy.time.fps + ' fps';

	},

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setupInteraction: function () {
		let scrollMul = 1;
		if (ShaderBoy.OS === 'Windows') { scrollMul = 100.0; }

		let eventPos = function (event) {
			let x = window.innerWidth - event.clientX;
			let y = window.innerHeight - event.clientY;
			console.log('x', x);
			console.log('y', y);
			return {
				x: x,
				y: y
			};
		};

		let canvasMousePos = function (event) {
			return eventPos(event);
		};

		document.body.onmousedown = function (event) {
			if (event.button == 2) return false;
			if (ShaderBoy.isEditorHide) {
				let mouse = eventPos(event);
				if (mouse.x >= 0 && mouse.x < document.body.clientWidth && mouse.y >= 0 && mouse.y < document.body.clientHeight) {
					this.mouseLeftDownCur = true;
					ShaderBoy.uniforms.iMouse[2] = 1;
				}
			}
		};

		document.body.onmouseup = function (event) {
			if (ShaderBoy.isEditorHide) {
				this.mouseLeftDownCur = false;
				let mouse = eventPos(event);
				ShaderBoy.uniforms.iMouse[2] = 0;
			}
		};

		document.body.onmousemove = function (event) {
			if (!this.mouseLeftDownCur) return;
			if (ShaderBoy.isEditorHide) {
				let mouse = eventPos(event);
				console.log('mouse', mouse);
				this.mousePositionCur = [mouse.x, mouse.y];
				ShaderBoy.uniforms.iMouse[0] = mouse.x;
				ShaderBoy.uniforms.iMouse[1] = mouse.y;
			}
		};

		document.body.contextmenu = function (event) {
			event.preventDefault();
		};
	}
};