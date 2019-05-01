import ShaderBoy from '../shaderboy'; // comment out on codepen.
// comment out on ShaderBoy.
// let ShaderBoy = {
//     isPlaying: true,
//     uniforms: {
//         iTime: 0,
//         iFrame: 0
//     }
// };

let isTest = false; // set "true" on codepen.

let panelEl = null;
let btns = [];
let list_local = [];

export default ShaderBoy.gui_panel_shaderlist = { // comment out on codepen.
    // ShaderBoy.gui_panel_shaderlist = {  // comment out on ShaderBoy.

    setup(list)
    {
        console.log('gui_panel_shaderlist: ', list);

        let createShaderBtn = function (shader)
        {
            let btn = document.createElement('div');
            let btn_thumb = document.createElement('div');
            let btn_detector = document.createElement('div');
            let btn_base = document.createElement('div');
            let btn_hover = document.createElement('div');

            let name_base = document.createElement('span');
            let name_hover = document.createElement('span');

            name_base.textContent = shader.name;
            name_hover.textContent = shader.name;
            btn_base.appendChild(name_base);
            btn_hover.appendChild(name_hover);

            btn.classList.add('btn');
            btn.classList.add('show');
            btn_thumb.classList.add('btn-thumb');
            btn_thumb.style.backgroundImage = shader.thumb;
            btn_detector.classList.add('btn-detector');
            btn_base.classList.add('btn__base');
            btn_hover.classList.add('btn__hover');
            btn.appendChild(btn_thumb);
            btn.appendChild(btn_base);
            btn.appendChild(btn_hover);
            btn.appendChild(btn_detector);
            return btn;
        };

        let shadernum = 0;
        if (list === undefined)
        {
            shadernum = 12;
            panelEl = document.getElementById('gp-shader-list');
        }
        else
        {
            while (panelEl.hasChildNodes())
            {
                panelEl.removeChild(panelEl.lastChild);
            }
            shadernum = list.length;
            list_local = list;
            btns = [];
        }

        for (let i = 0; i < shadernum; i++)
        {
            let shader = (list === undefined) ? { name: 'No shader', thumb: '' } : list[i];
            let btnEl = createShaderBtn(shader);
            btns.push(btnEl);

            btnEl.onclick = function (e)
            {
                e.stopPropagation();

                let name = '_defaultShader';
                name = e.target.parentElement.children[1].innerText;

                console.log('shadernum: ', shadernum);
                for (let i = 0; i < shadernum; i++)
                {
                    if (btns[i] == e.target.parentElement)
                    {
                        btns[i].classList.toggle('btn-activate');

                        setTimeout(function ()
                        {
                            btns[i].classList.toggle('btn-activate');
                        }, Math.floor(1000 * 0.8));
                    }
                    else
                    {
                        btns[i].classList.toggle('btn-hide');
                        setTimeout(function ()
                        {
                            btns[i].classList.toggle('btn-hide');
                        }, Math.floor(1000 * 0.8));
                    }
                }

                let containerEl = document.getElementById('gui-panel');
                let gpbaseEl = document.getElementById('gp-base');
                containerEl.classList.toggle("gp-container-appear");
                gpbaseEl.classList.toggle("gp-appear");
                containerEl.classList.toggle("gp-container-hide");
                gpbaseEl.classList.toggle("gp-hide");

                setTimeout(function ()
                {
                    containerEl.classList.toggle("gp-container-hide");
                    gpbaseEl.classList.toggle("gp-hide");
                    containerEl.classList.toggle("gp-container-hidden");
                    gpbaseEl.classList.toggle("gp-hidden");
                }, Math.floor(1000 * 0.8))

                ShaderBoy.io.loadShader(name, false);
            };

            btnEl.onmouseenter = function (e)
            {
                if (e.target.classList.contains('hover') !== true)
                {
                    e.target.classList.toggle("hover");
                }
            };

            btnEl.onmouseleave = function (e)
            {
                if (e.target.classList.contains('hover'))
                {
                    e.target.classList.remove("hover");
                }

                if (e.target.classList.contains('pre-active'))
                {
                    e.target.classList.remove("pre-active");
                    e.target.classList.toggle("active");
                }
            };
            panelEl.appendChild(btnEl);
        }
    },

    show()
    {
        let containerEl = document.getElementById('gui-panel');
        let gpbaseEl = document.getElementById('gp-base');
        containerEl.classList.toggle("gp-container-appear");
        gpbaseEl.classList.toggle("gp-appear");
        containerEl.classList.toggle("gp-container-hidden");
        gpbaseEl.classList.toggle("gp-hidden");
    }
};


if (isTest)
{
    document.body.onclick = function (e)
    {
        e.stopPropagation();
        let containerEl = document.getElementById('gui-panel');
        let gpbaseEl = document.getElementById('gp-base');
        containerEl.classList.toggle("gp-container-appear");
        gpbaseEl.classList.toggle("gp-appear");
        containerEl.classList.toggle("gp-container-hidden");
        gpbaseEl.classList.toggle("gp-hidden");
    };
    ShaderBoy.gui_panel_shaderlist.setup(true);
}