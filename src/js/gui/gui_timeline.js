import ShaderBoy from '../shaderboy'

let playbackSpeed = 1
let playbackSpeedCount = 0
let offsetFrames = 0
let totalFrames = 3600// 1min@60fps
const step = 1 / 60

let isDragging = false
let isEditting = false
let tlRect = {}
let pel = null
let bsel = null
let crel = null
let stel = null
let enel = null
let wsel = null
let ofel = null
let tfel = null
let strx = 0
let enrx = 0
let crrx = 0
let wsrx = 0
let handleRectObj = null
let hw = 0
let hhw = 0

let isShiftKey = false
let isUpKey = false
let isDownKey = false
let isSoundPlaying = false

const s2i = (v) => { return parseInt(v) }
const f2x = (f) => { return Math.floor((s2i(f) - offsetFrames) / (totalFrames - offsetFrames) * tlRect.width) }
const x2f = (x) => { return Math.floor((totalFrames - offsetFrames) * ((x + 100 / (totalFrames - offsetFrames) - tlRect.minx) / tlRect.width)) + offsetFrames }
const fit = (x) => { return f2x(x2f(x)) + hw }

export default ShaderBoy.gui_timeline = {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    get totalFrames()
    {
        return s2i(tfel.value)
    },
    set totalFrames(val)
    {
        let v = val
        tfel.value = totalFrames = Math.max(v, offsetFrames)
        let isFitEnd = totalFrames === s2i(enel.children[0].value)
        stel.children[0].value = Math.min(s2i(stel.children[0].value), totalFrames)
        stel.style.left = f2x(stel.children[0].value) + "px"
        crel.children[0].value = Math.min(s2i(crel.children[0].value), totalFrames)
        crel.style.left = f2x(crel.children[0].value) + "px"
        enel.children[0].value = (isFitEnd) ? totalFrames : Math.min(s2i(enel.children[0].value), totalFrames)
        enel.style.left = f2x(enel.children[0].value) + hw + "px"
        wsel.style.left = s2i(stel.style.left) + hw + "px"
        wsel.style.width = (s2i(enel.style.left) - s2i(wsel.style.left)) + "px"
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    get offsetFrames()
    {
        return s2i(ofel.value)
    },
    set offsetFrames(v)
    {
        ofel.value = offsetFrames = Math.min(v, totalFrames)
        stel.children[0].value = Math.max(s2i(stel.children[0].value), offsetFrames)
        stel.style.left = f2x(stel.children[0].value) + "px"
        crel.children[0].value = Math.max(s2i(crel.children[0].value), offsetFrames)
        crel.style.left = f2x(crel.children[0].value) + "px"
        enel.children[0].value = Math.max(s2i(enel.children[0].value), offsetFrames)
        enel.style.left = f2x(enel.children[0].value) + hw + "px"
        wsel.style.left = s2i(stel.style.left) + hw + "px"
        wsel.style.width = (s2i(enel.style.left) - s2i(wsel.style.left)) + "px"
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    get startFrame()
    {
        return s2i(stel.children[0].value)
    },
    set startFrame(val)
    {
        let v = Math.max(val, offsetFrames)
        v = Math.min(v, s2i(enel.children[0].value) - 1)
        stel.children[0].value = v
        ShaderBoy.uniforms.iFrame = Math.max(v, ShaderBoy.uniforms.iFrame)
        ShaderBoy.uniforms.iTime = ShaderBoy.uniforms.iFrame * step
        stel.style.left = f2x(v) + "px"
        if (v >= s2i(crel.children[0].value))
        {
            crel.children[0].value = v
            crel.style.left = stel.style.left
        }
        wsel.style.left = s2i(stel.style.left) + hw + "px"
        wsel.style.width = (s2i(enel.style.left) - s2i(wsel.style.left)) + "px"
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    get endFrame()
    {
        return s2i(enel.children[0].value)
    },
    set endFrame(v)
    {
        v = Math.max(v, s2i(stel.children[0].value) + 1)
        v = Math.min(v, totalFrames)
        ShaderBoy.uniforms.iFrame = Math.min(v, ShaderBoy.uniforms.iFrame)
        ShaderBoy.uniforms.iTime = ShaderBoy.uniforms.iFrame * step
        enel.style.left = f2x(v) + hw + "px"
        enel.children[0].value = v
        if (v <= s2i(crel.children[0].value))
        {
            crel.children[0].value = v
            crel.style.left = s2i(enel.style.left) - hw + "px"
        }
        wsel.style.width = (s2i(enel.style.left) - s2i(wsel.style.left)) + "px"
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    get currentFrame()
    {
        return s2i(crel.children[0].value)
    },
    set currentFrame(v)
    {
        v = (v > this.endFrame) ? this.startFrame : v
        v = (v < this.startFrame) ? this.endFrame : v
        ShaderBoy.uniforms.iFrame = v
        ShaderBoy.uniforms.iTime = ShaderBoy.uniforms.iFrame * step
        v = tlRect.width * ((ShaderBoy.uniforms.iFrame - offsetFrames) / (totalFrames - offsetFrames)) + hhw
        crel.children[0].value = ShaderBoy.uniforms.iFrame
        crel.style.left = v - hhw + "px"
        ShaderBoy.forceDraw = true
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    get playbackSpeed()
    {
        return playbackSpeed
    },
    set playbackSpeed(v)
    {
        playbackSpeed = v
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    reset()
    {
        ShaderBoy.uniforms.iFrame = this.startFrame
        ShaderBoy.gui_timeline.currentFrame = ShaderBoy.uniforms.iFrame
        wsel.style.left = s2i(stel.style.left) + hw + "px"
        wsel.style.width = (s2i(enel.style.left) - s2i(wsel.style.left)) + "px"
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setup()
    {
        pel = document.getElementById('timeline')
        bsel = document.getElementById('tl-base')
        crel = document.getElementById('tl-current')
        stel = document.getElementById('tl-start')
        enel = document.getElementById('tl-end')
        wsel = document.getElementById('tl-workspace')
        ofel = document.getElementById('tl-offset-frames')
        tfel = document.getElementById('tl-total-frames')
        handleRectObj = enel.children[0].getClientRects()
        hw = ShaderBoy.style.buttonHeight//handleRectObj[0].width
        hhw = hw * .5

        tlRect.minx = s2i(bsel.offsetLeft)
        tlRect.maxx = s2i(tlRect.minx + bsel.offsetWidth)
        tlRect.width = window.innerWidth - ShaderBoy.style.buttonHeight * 2//s2i(bsel.offsetWidth)

        stel.style.left = tlRect.minx - hw + 'px'
        enel.style.left = tlRect.maxx + 'px'
        crel.style.left = tlRect.minx - hw + 'px'
        wsel.style.left = tlRect.minx + 'px'
        wsel.style.width = tlRect.width + 'px'

        ShaderBoy.uniforms.iFrame = offsetFrames
        ShaderBoy.uniforms.iTime = ShaderBoy.uniforms.iFrame * step
        ofel.value = offsetFrames
        tfel.value = totalFrames
        stel.children[0].value = offsetFrames
        enel.children[0].value = totalFrames


        // event handlers
        const input = (e) =>
        {
            const mul = () =>
            {
                if (isShiftKey)
                {
                    if (isUpKey) e.target.value = s2i(e.target.value) + 9
                    if (isDownKey) e.target.value = s2i(e.target.value) - 9
                }
            }

            if (e.target === tfel)
            {
                mul()
                ShaderBoy.gui_timeline.totalFrames = s2i(e.target.value)
            }
            else if (e.target === ofel)
            {
                mul()
                ShaderBoy.gui_timeline.offsetFrames = s2i(e.target.value)
            }
            else if (e.target === stel.children[0])
            {
                mul()
                ShaderBoy.gui_timeline.startFrame = s2i(e.target.value)
            }
            else if (e.target === enel.children[0])
            {
                mul()
                ShaderBoy.gui_timeline.endFrame = s2i(e.target.value)
            }
            else if (e.target === crel.children[0])
            {
                mul()
                ShaderBoy.gui_timeline.currentFrame = s2i(e.target.value)
            }
        }
        const keyup = (e) =>
        {
            if (e.shiftKey) isShiftKey = false
            if (e.code === 'ArrowUp') isUpKey = false
            if (e.code === 'ArrowDown') isDownKey = false
        }
        const keydown = (e) =>
        {
            if (e.shiftKey) isShiftKey = true
            if (e.code === 'ArrowUp') isUpKey = true
            if (e.code === 'ArrowDown') isDownKey = true
        }
        const blur = (e) => { isEditting = false }
        const focus = (e) => { isEditting = true }

        tfel.oninput = input
        tfel.onkeyup = keyup
        tfel.onkeydown = keydown
        tfel.onblur = blur
        tfel.onfocus = focus

        ofel.oninput = input
        ofel.onkeyup = keyup
        ofel.onkeydown = keydown
        ofel.onblur = blur
        ofel.onfocus = focus

        ShaderBoy.gui_timeline.dragEl(stel)
        stel.oninput = input
        stel.onkeyup = keyup
        stel.onkeydown = keydown
        stel.children[0].onblur = blur
        stel.children[0].onfocus = focus

        ShaderBoy.gui_timeline.dragEl(enel)
        enel.oninput = input
        enel.onkeyup = keyup
        enel.onkeydown = keydown
        enel.children[0].onblur = blur
        enel.children[0].onfocus = focus

        ShaderBoy.gui_timeline.dragEl(crel)
        crel.oninput = input
        crel.onkeyup = keyup
        crel.onkeydown = keydown
        crel.children[0].onblur = blur
        crel.children[0].onfocus = focus

        ShaderBoy.gui_timeline.dragEl(wsel)

        pel.onmousewheel = (e) =>
        {
            e.preventDefault()
            if (!ShaderBoy.isPlaying)
            {
                let velocity = 10
                if (e.ctrlKey)
                {
                    velocity = 100
                }
                if (e.altKey)
                {
                    velocity = 1
                }
                const delta = (e.deltaY < 0) ? 1 : -1
                const stf = s2i(stel.children[0].value)
                const enf = s2i(enel.children[0].value)
                ShaderBoy.uniforms.iFrame = Math.max(stf, ShaderBoy.uniforms.iFrame + (delta * velocity)) // should be 0...
                ShaderBoy.uniforms.iFrame = (ShaderBoy.uniforms.iFrame > enf) ? stf : ShaderBoy.uniforms.iFrame
                ShaderBoy.uniforms.iTime = ShaderBoy.uniforms.iFrame * step
                crel.style.left = f2x(ShaderBoy.uniforms.iFrame) + 'px'
                crel.children[0].value = ShaderBoy.uniforms.iFrame
                ShaderBoy.uniforms.iTime = ShaderBoy.uniforms.iFrame * step
                ShaderBoy.forceDraw = true
                if (ShaderBoy.buffers['Sound'] !== undefined && ShaderBoy.buffers['Sound'].active)
                {
                    ShaderBoy.soundRenderer.stop()
                    ShaderBoy.soundRenderer.play()
                    setTimeout(() => { ShaderBoy.soundRenderer.stop() }, 100)
                }
            }
        }

        if (isTest) ShaderBoy.gui_timeline.update()
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    onResize()
    {
        tlRect.minx = s2i(bsel.offsetLeft)
        tlRect.maxx = s2i(tlRect.minx + bsel.offsetWidth)
        tlRect.width = s2i(bsel.offsetWidth)

        stel.style.left = f2x(s2i(stel.children[0].value)) + 'px'
        enel.style.left = f2x(s2i(enel.children[0].value)) + hw + 'px'
        crel.style.left = f2x(s2i(crel.children[0].value)) + 'px'
        wsel.style.left = f2x(s2i(stel.children[0].value)) + hw + 'px'
        wsel.style.width = f2x(s2i(enel.children[0].value)) - f2x(s2i(stel.children[0].value)) + 'px'
        ShaderBoy.forceDraw = true
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    get guidata()
    {
        return {
            'startFrame': this.startFrame,
            'endFrame': this.endFrame,
            'totalFrames': this.totalFrames,
            'offsetFrames': this.offsetFrames,
            'playbackSpeed': this.playbackSpeed
        }
    },

    set guidata(data)
    {
        this.totalFrames = data.totalFrames
        this.offsetFrames = data.offsetFrames
        this.startFrame = data.startFrame
        this.endFrame = data.endFrame
        this.playbackSpeed = data.playbackSpeed
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    update()
    {
        if (isTest) requestAnimationFrame(ShaderBoy.gui_timeline.update)
        if (ShaderBoy.isPlaying && isEditting === false && isDragging === false)
        {
            playbackSpeedCount += playbackSpeed
            playbackSpeedCount -= Math.floor(playbackSpeedCount)
            playbackSpeedCount = Math.max(playbackSpeedCount, playbackSpeed)
            if (playbackSpeedCount === playbackSpeed)
            {
                ShaderBoy.uniforms.iFrame++
                ShaderBoy.uniforms.iTime = ShaderBoy.uniforms.iFrame * step
                const wsMin = s2i(stel.children[0].value)
                const wsMax = s2i(enel.children[0].value)

                let isLooped = false
                if (ShaderBoy.uniforms.iFrame > wsMax)
                {
                    ShaderBoy.uniforms.iTime = ShaderBoy.uniforms.iFrame = wsMin
                    isLooped = true
                }
                ShaderBoy.gui_timeline.currentFrame = ShaderBoy.uniforms.iFrame
                wsel.style.left = s2i(stel.style.left) + hw + "px"
                wsel.style.width = (s2i(enel.style.left) - s2i(wsel.style.left)) + "px"

                if (isLooped && ShaderBoy.buffers['Sound'] !== undefined && ShaderBoy.buffers['Sound'].active && !ShaderBoy.soundRenderer.paused)
                {
                    ShaderBoy.soundRenderer.stop()
                    ShaderBoy.soundRenderer.play()
                }
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    dragEl(elmnt)
    {
        let framew = Math.max(tlRect.width / (totalFrames - offsetFrames), 1)
        let isWsMoved = false
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, dstartpos = 0

        const dragMouseDown = (e) =>
        {
            pos3 = e.clientX
            pos4 = e.clientY
            dstartpos = e.clientX
            strx = s2i(stel.style.left)
            enrx = s2i(enel.style.left)
            crrx = s2i(crel.style.left)
            wsrx = s2i(wsel.style.left)
            framew = Math.max(tlRect.width / (totalFrames - offsetFrames), 1)
            document.onmouseup = closeDragEl
            document.onmousemove = moveEl
            if ((elmnt === crel) && ShaderBoy.buffers['Sound'] !== undefined && ShaderBoy.buffers['Sound'].active)
            {
                isSoundPlaying = !ShaderBoy.soundRenderer.paused
                ShaderBoy.soundRenderer.stop()
            }
        }

        const moveEl = (e) =>
        {
            isWsMoved = false
            pos1 = pos3 - e.clientX
            pos2 = pos4 - e.clientY
            pos3 = e.clientX
            pos4 = e.clientY

            isDragging = true
            if (elmnt !== wsel)
            {
                elmnt.children[0].blur()
            }

            if (elmnt === stel)
            {
                strx = strx - pos1
                if (strx + hw >= tlRect.minx - framew && strx + hw <= s2i(enel.style.left))
                {
                    if (Math.floor((strx - hw) % framew) <= framew * .5)
                    {
                        stel.style.left = Math.floor((strx) / framew + 1) * framew + "px"
                        wsel.style.left = s2i(stel.style.left) + hw + "px"
                        wsel.style.width = s2i(enel.style.left) - s2i(stel.style.left) - hw + "px"
                        crel.style.left = Math.max(s2i(crel.style.left), s2i(stel.style.left)) + 'px'
                    }
                }
            }
            else if (elmnt === enel)
            {
                enrx = enrx - pos1
                if (enrx <= tlRect.maxx && enrx >= s2i(stel.style.left) + hw)
                {
                    if (Math.floor((enrx - hw) % framew) <= framew * .5)
                    {
                        enel.style.left = Math.floor((enrx - hw) / framew) * framew + hw + "px"
                        wsel.style.width = s2i(enel.style.left) - s2i(wsel.style.left) + "px"
                        crel.style.left = Math.min(s2i(crel.style.left), s2i(enel.style.left) - hw) + 'px'
                    }
                }
            }
            else if (elmnt === crel)
            {
                crrx = crrx - pos1
                if (crrx + hw >= tlRect.minx - framew && crrx <= tlRect.maxx - hw)
                {
                    if (Math.floor((crrx - hw) % framew) <= framew * .5)
                    {
                        crel.style.left = Math.floor((crrx) / framew + 1) * framew + "px"
                        crel.children[0].value = x2f(s2i(crel.style.left) + hw)
                        ShaderBoy.uniforms.iFrame = x2f(s2i(crel.style.left) + hw)
                        ShaderBoy.uniforms.iTime = ShaderBoy.uniforms.iFrame * step
                        stel.style.left = Math.min(s2i(stel.style.left), s2i(crel.style.left)) + 'px'
                        enel.style.left = Math.max(s2i(enel.style.left), s2i(crel.style.left) + (hw)) + 'px'

                        wsel.style.left = s2i(stel.style.left) + hw + "px"
                        wsel.style.width = (s2i(enel.style.left) - s2i(wsel.style.left)) + "px"
                        ShaderBoy.forceDraw = true
                    }
                }
            }
            else if (elmnt === wsel)
            {
                wsrx = wsrx - pos1
                crrx = crrx - pos1
                if (wsrx >= tlRect.minx && wsrx <= tlRect.maxx - s2i(wsel.style.width) + framew)
                {
                    if (Math.floor((wsrx - hw) % framew) <= framew * .5)
                    {
                        let left = Math.floor((wsrx - hw) / framew) * framew
                        let width = s2i(wsel.style.width)

                        wsel.style.left = left + hw + "px"
                        stel.style.left = left + "px"
                        enel.style.left = left + hw + width + "px"

                        crel.style.left = Math.floor((crrx) / framew + 1) * framew + "px"
                        crel.children[0].value = x2f(s2i(crel.style.left) + hw)
                        ShaderBoy.uniforms.iFrame = x2f(s2i(crel.style.left) + hw)
                        ShaderBoy.uniforms.iTime = ShaderBoy.uniforms.iFrame * step
                        isWsMoved = true
                    }
                }
            }
            ShaderBoy.gui_timeline.endFrame = x2f(s2i(enel.style.left))
            ShaderBoy.gui_timeline.startFrame = x2f(s2i(stel.style.left) + hw)
            if (!isWsMoved) ShaderBoy.gui_timeline.currentFrame = x2f(s2i(crel.style.left) + hw)

            if ((elmnt === crel) && ShaderBoy.buffers['Sound'] !== undefined && ShaderBoy.buffers['Sound'].active)
            {
                ShaderBoy.soundRenderer.restart()
                setTimeout(() => { ShaderBoy.soundRenderer.stop() }, 100)
            }

        }

        const closeDragEl = () =>
        {
            document.onmouseup = null
            document.onmousemove = null
            isDragging = false
            ShaderBoy.uniforms.iFrame = s2i(crel.children[0].value)
            ShaderBoy.uniforms.iTime = ShaderBoy.uniforms.iFrame * step
            if ((elmnt === crel) && ShaderBoy.buffers['Sound'] !== undefined && ShaderBoy.buffers['Sound'].active && ShaderBoy.isPlaying)
            {
                ShaderBoy.soundRenderer.restart()
                isSoundPlaying = true
            }
        }

        elmnt.onmousedown = dragMouseDown
    }
}