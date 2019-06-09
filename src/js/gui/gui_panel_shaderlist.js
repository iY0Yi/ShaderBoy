import ShaderBoy from '../shaderboy' // comment out on codepen.
// comment out on ShaderBoy.
// let ShaderBoy = {
//     isPlaying: true,
//     uniforms: {
//         iTime: 0,
//         iFrame: 0
//     }
// }

const isTest = false // set "true" on codepen.

let panelEl = null
let btns = []
let list_local = []

export default ShaderBoy.gui_panel_shaderlist = { // comment out on codepen.
    // ShaderBoy.gui_panel_shaderlist = {  // comment out on ShaderBoy.

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setup(list)
    {
        const createShaderBtn = (shader) =>
        {
            const btn = document.createElement('div')
            const btn_thumb = document.createElement('div')
            const btn_detector = document.createElement('div')
            const btn_base = document.createElement('div')
            const btn_hover = document.createElement('div')

            const name_base = document.createElement('span')
            const name_hover = document.createElement('span')

            name_base.textContent = shader.name
            name_hover.textContent = shader.name
            btn_base.appendChild(name_base)
            btn_hover.appendChild(name_hover)

            btn.classList.add('btn')
            btn.classList.add('show')
            btn_thumb.classList.add('btn-thumb')
            // btn_thumb.style.backgroundImage = shader.thumb
            btn_detector.classList.add('btn-detector')
            btn_base.classList.add('btn__base')
            btn_hover.classList.add('btn__hover')
            btn.appendChild(btn_thumb)
            btn.appendChild(btn_base)
            btn.appendChild(btn_hover)
            btn.appendChild(btn_detector)
            if (shader.thumb !== '')
            {
                const img = new Image()
                img.onload = () =>
                {
                    const div = document.getElementById('gui-layer')
                    const imgcon = document.createElement('div')
                    div.appendChild(imgcon)
                    imgcon.style.width = '0px'
                    imgcon.style.height = '0px'
                    imgcon.style.backgroundImage = 'url("' + img.src + '")'
                    this.body.style.backgroundImage = 'url("' + img.src + '")'
                    this.body.style.backgroundSize = '100% 100%'
                }
                img.src = shader.thumb
                img.body = btn_thumb
            }
            else
            {
                btn_thumb.style.backgroundImage = 'url("data:image/svg+xml;charset=utf8,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%2214.43px%22%20height%3D%2214.43px%22%20viewBox%3D%220%200%2014.43%2014.43%22%20style%3D%22enable-background%3Anew%200%200%2014.43%2014.43%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%20.st0%7Bfill-rule%3Aevenodd%3Bclip-rule%3Aevenodd%3Bfill%3A%23D8D5C4%3B%7D%3C%2Fstyle%3E%3Cdefs%3E%3C%2Fdefs%3E%3Cg%3E%20%3Cg%3E%20%3Cpath%20class%3D%22st0%22%20d%3D%22M7.21%2C0C3.23%2C0%2C0%2C3.23%2C0%2C7.21s3.23%2C7.21%2C7.21%2C7.21s7.21-3.23%2C7.21-7.21S11.2%2C0%2C7.21%2C0z%20M4.21%2C8.21%20c-0.55%2C0-1-0.45-1-1s0.45-1%2C1-1s1%2C0.45%2C1%2C1S4.77%2C8.21%2C4.21%2C8.21z%20M7.21%2C8.21c-0.55%2C0-1-0.45-1-1s0.45-1%2C1-1s1%2C0.45%2C1%2C1%20S7.77%2C8.21%2C7.21%2C8.21z%20M10.21%2C8.21c-0.55%2C0-1-0.45-1-1s0.45-1%2C1-1s1%2C0.45%2C1%2C1S10.77%2C8.21%2C10.21%2C8.21z%22%2F%3E%20%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E")'
                btn_thumb.style.backgroundSize = '16px 16px'
                btn_thumb.style.backgroundRepeat = 'no-repeat'
            }

            return btn
        }

        let shadernum = 0
        if (list === undefined)
        {
            shadernum = 12
            panelEl = document.getElementById('gp-shader-list')
        }
        else
        {
            while (panelEl.hasChildNodes())
            {
                panelEl.removeChild(panelEl.lastChild)
            }
            shadernum = list.length
            list_local = list
            btns = []
        }

        for (let i = 0; i < shadernum; i++)
        {
            const shader = (list === undefined) ? { name: 'Loading...', thumb: '' } : list[i]
            const btnEl = createShaderBtn(shader)
            btns.push(btnEl)

            btnEl.onclick = (e) =>
            {
                e.stopPropagation()

                let name = '_defaultShader'
                name = e.target.parentElement.children[1].innerText

                for (let i = 0; i < shadernum; i++)
                {
                    if (btns[i] == e.target.parentElement)
                    {
                        btns[i].classList.toggle('btn-activate')

                        setTimeout(() =>
                        {
                            btns[i].classList.toggle('btn-activate')
                        }, Math.floor(1000 * 0.8))
                    }
                    else
                    {
                        btns[i].classList.toggle('btn-hide')
                        setTimeout(() =>
                        {
                            btns[i].classList.toggle('btn-hide')
                        }, Math.floor(1000 * 0.8))
                    }
                }

                const containerEl = document.getElementById('gui-panel')
                const gpbaseEl = document.getElementById('gp-base')
                containerEl.classList.toggle("gp-container-appear")
                gpbaseEl.classList.toggle("gp-appear")
                containerEl.classList.toggle("gp-container-hide")
                gpbaseEl.classList.toggle("gp-hide")

                setTimeout(() =>
                {
                    containerEl.classList.toggle("gp-container-hide")
                    gpbaseEl.classList.toggle("gp-hide")
                    containerEl.classList.toggle("gp-container-hidden")
                    gpbaseEl.classList.toggle("gp-hidden")
                }, Math.floor(1000 * 0.8))

                ShaderBoy.io.loadShader(name, false)
            }

            btnEl.onmouseenter = (e) =>
            {
                if (e.target.classList.contains('hover') !== true)
                {
                    e.target.classList.toggle("hover")
                }
            }

            btnEl.onmouseleave = (e) =>
            {
                if (e.target.classList.contains('hover'))
                {
                    e.target.classList.remove("hover")
                }

                if (e.target.classList.contains('pre-active'))
                {
                    e.target.classList.remove("pre-active")
                    e.target.classList.toggle("active")
                }
            }
            panelEl.appendChild(btnEl)
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    show()
    {
        const containerEl = document.getElementById('gui-panel')
        const gpbaseEl = document.getElementById('gp-base')
        containerEl.classList.toggle("gp-container-appear")
        gpbaseEl.classList.toggle("gp-appear")
        containerEl.classList.toggle("gp-container-hidden")
        gpbaseEl.classList.toggle("gp-hidden")
    }
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if (isTest)
{
    document.body.onclick = (e) =>
    {
        e.stopPropagation()
        const containerEl = document.getElementById('gui-panel')
        const gpbaseEl = document.getElementById('gp-base')
        containerEl.classList.toggle("gp-container-appear")
        gpbaseEl.classList.toggle("gp-appear")
        containerEl.classList.toggle("gp-container-hidden")
        gpbaseEl.classList.toggle("gp-hidden")
    }
    ShaderBoy.gui_panel_shaderlist.setup(true)
}