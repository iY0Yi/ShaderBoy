import ShaderBoy from '../shaderboy'

export default ShaderBoy.gui_knobs = {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setup()
    {
        ShaderBoy.gui.ctrl = { 'domElement': null }
        ShaderBoy.gui.ctrl.domElement = document.getElementById('ctrl')
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
                const knobs = document.getElementsByClassName("gui-knob comp")
                this.precision = 360 * 5
                for (let i = 0; i < knobs.length; i++)
                {
                    ShaderBoy.gui.knobUniformFS += `uniform float ${this.knobs[i].name};\n`
                    let element = knobs[i].children[1]
                    this.knobs[i].circle = element

                    knobs[i].onmousewheel = (e) =>
                    {
                        e.preventDefault()
                        let velocity = 10
                        if (e.ctrlKey)
                        {
                            velocity = 100
                        }
                        if (e.altKey)
                        {
                            velocity = 1
                        }

                        if (ShaderBoy.gui.knobs.knobs[i].active === true)
                        {
                            ShaderBoy.forceDraw = (ShaderBoy.isPlaying !== true)
                            const delta = (e.deltaY < 0) ? 1 : -1
                            const deg = e.deltaY
                            ShaderBoy.gui.knobs.knobs[i].value += delta * velocity * (1 / ShaderBoy.gui.knobs.precision)// deg * 1 / ShaderBoy.gui.knobs.precision
                            ShaderBoy.gui.knobs.knobs[i].value = Math.max(ShaderBoy.gui.knobs.knobs[i].value, -1)
                            ShaderBoy.gui.knobs.knobs[i].value = Math.min(ShaderBoy.gui.knobs.knobs[i].value, 1)
                            ShaderBoy.gui.knobs.knobs[i].value = Number(ShaderBoy.gui.knobs.knobs[i].value.toFixed(3))
                            element.style.transform = `rotate(${ShaderBoy.gui.knobs.knobs[i].value * ShaderBoy.gui.knobs.precision}deg)`
                        }
                    }

                    knobs[i].onclick = (e) =>
                    {
                        ShaderBoy.gui.knobs.knobs[i].active = !ShaderBoy.gui.knobs.knobs[i].active
                        ShaderBoy.gui.knobs.toggle(i, true)
                    }
                }
            },
            methods:
            {
                toggle(id, clicked)
                {
                    if (ShaderBoy.gui.knobs.knobs[id].active === false)
                    {
                        ShaderBoy.gui.knobs.knobs[id].circle.style.transition = 'all 600ms ease-in-out'
                        ShaderBoy.gui.knobs.knobs[id].circle.style.transform = 'rotate(0deg)'
                        ShaderBoy.gui.knobs.knobs[id].circle.parentElement.style.transition = 'all 600ms ease-in-out'

                        if (clicked)
                        {
                            const bufnames = ['BufferA', 'BufferB', 'BufferC', 'BufferD', 'Image', 'Sound']
                            for (let j = 0; j < bufnames.length; j++)
                            {
                                const name = bufnames[j]
                                if (ShaderBoy.buffers[name].cm !== undefined)
                                {
                                    let shdrtxt = ShaderBoy.buffers[name].cm.getValue()
                                    shdrtxt = shdrtxt.split(ShaderBoy.gui.knobs.knobs[id].name).join((ShaderBoy.gui.knobs.knobs[id].value).toFixed(3))
                                    ShaderBoy.buffers[name].cm.setValue(shdrtxt)
                                }
                            }
                        }
                    }
                    else
                    {
                        ShaderBoy.gui.knobs.knobs[id].circle.style.transition = 'all 0ms ease-in-out'
                        ShaderBoy.gui.knobs.knobs[id].circle.style.transform = `rotate(${ShaderBoy.gui.knobs.knobs[id].value * ShaderBoy.gui.knobs.precision}deg)`
                        ShaderBoy.gui.knobs.knobs[id].circle.parentElement.style.transition = 'all 600ms ease-in-out'
                    }
                    if (clicked)
                    {
                        ShaderBoy.gui.knobs.knobs[id].circle.parentElement.classList.toggle('active')
                        ShaderBoy.gui.knobs.knobs[id].value = 0
                    }
                }
            }
        })
    }
}