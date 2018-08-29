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

		let elementPos = function (element) {
			if (element !== undefined) {
				var x = 0,
					y = 0;
				while (element.offsetParent) {
					x += element.offsetLeft;
					y += element.offsetTop;
					element = element.offsetParent;
				}
				return {
					x: x,
					y: y
				};
			}
		};

		let eventPos = function (event) {
			return {
				x: event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
				y: event.clientY + document.body.scrollTop + document.documentElement.scrollTop
			};
		};

		let canvasMousePos = function (event) {
			let mousePos = eventPos(event);
			let canvasPos = elementPos(ShaderBoy.gl.canvas);
			return {
				x: mousePos.x - canvasPos.x,
				y: mousePos.y - canvasPos.y
			};
		};

		ShaderBoy.gl.canvas.onmousedown = function (event) {
			if (event.button == 2) return false;

			let mouse = canvasMousePos(event);
			if (mouse.x >= 0 && mouse.x < ShaderBoy.gl.canvas.clientWidth && mouse.y >= 0 && mouse.y < ShaderBoy.gl.canvas.clientHeight) {
				io.mouseLeftDownCur = true;
				iMouse[2] = 1;
			}
		};

		ShaderBoy.gl.canvas.onmouseup = function (event) {
			io.mouseLeftDownCur = false;
			let mouse = canvasMousePos(event);
			iMouse[2] = 0;
		};

		ShaderBoy.gl.canvas.onmousemove = function (event) {
			if (!io.mouseLeftDownCur) return;
			let mouse = canvasMousePos(event);
			io.mousePositionCur = [mouse.x, mouse.y];
			iMouse[0] = mouse.x;
			iMouse[1] = mouse.y;
		};

		ShaderBoy.gl.canvas.contextmenu = function (event) {
			event.preventDefault();
		};
	}
};