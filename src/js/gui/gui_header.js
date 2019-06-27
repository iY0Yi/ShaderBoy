import ShaderBoy from '../shaderboy'

export default ShaderBoy.gui_header = {

    bufCount: -1,
    bufOrder: [],
    activeBufs: [],

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setup()
    {
        this.bufOrder.push(document.getElementById('ghdr-btn-buf-a'))
        this.bufOrder.push(document.getElementById('ghdr-btn-buf-b'))
        this.bufOrder.push(document.getElementById('ghdr-btn-buf-c'))
        this.bufOrder.push(document.getElementById('ghdr-btn-buf-d'))

        const id = this.bufCount
        if (id > 0)
        {
            document.getElementById('ghdr-btn-dec-buf').classList.add('active')
        }
        if (id < ShaderBoy.gui_header.bufOrder.length - 1)
        {
            document.getElementById('ghdr-btn-inc-buf').classList.add('active')
        }

        document.getElementById('ghdr-btn-common').classList.add('disable')
        document.getElementById('ghdr-btn-snd').classList.add('disable')
        this.bufOrder[3].classList.add('disable')
        this.bufOrder[2].classList.add('disable')
        this.bufOrder[1].classList.add('disable')
        this.bufOrder[0].classList.add('disable')
        const mainEl = document.getElementById('ghdr-btn-mainimg')
        ShaderBoy.gui_header.setActive(mainEl.textContent)

        document.getElementById('ghdr-btn-switch-cmn').onclick = (event) =>
        {
            document.getElementById('ghdr-btn-common').classList.toggle('disable')
            document.getElementById('ghdr-btn-switch-cmn').classList.toggle('inc')
            document.getElementById('ghdr-btn-switch-cmn').classList.toggle('dec')
            const mainEl = document.getElementById('ghdr-btn-mainimg')
            if (document.getElementById('ghdr-btn-common').classList.contains('disable'))
            {
                if (!mainEl.classList.contains('active'))
                {
                    ShaderBoy.editor.setBuffer(mainEl.textContent)
                }
                document.getElementById('ghdr-btn-common').classList.remove('active')
                ShaderBoy.config.buffers['Common'].active = false
                ShaderBoy.buffers['Common'].active = false
            }
            else
            {
                ShaderBoy.config.buffers['Common'].active = true
                ShaderBoy.buffers['Common'].active = true
            }
            ShaderBoy.bufferManager.buildShaderFromBuffers(false)
        }

        document.getElementById('ghdr-btn-switch-snd').onclick = (event) =>
        {
            document.getElementById('ghdr-btn-snd').classList.toggle('disable')
            document.getElementById('ghdr-btn-switch-snd').classList.toggle('inc')
            document.getElementById('ghdr-btn-switch-snd').classList.toggle('dec')
            const mainEl = document.getElementById('ghdr-btn-mainimg')
            if (document.getElementById('ghdr-btn-snd').classList.contains('disable'))
            {
                if (!mainEl.classList.contains('active'))
                {
                    ShaderBoy.editor.setBuffer(mainEl.textContent)
                }
                document.getElementById('ghdr-btn-snd').classList.remove('active')
                ShaderBoy.config.buffers['Sound'].active = false
                ShaderBoy.buffers['Sound'].active = false
                ShaderBoy.soundRenderer.destroyContext()
            }
            else
            {
                ShaderBoy.config.buffers['Sound'].active = true
                ShaderBoy.buffers['Sound'].active = true
                ShaderBoy.soundRenderer.initContext()
            }
            ShaderBoy.bufferManager.buildShaderFromBuffers(false)
        }

        document.getElementById('ghdr-btn-inc-buf').onclick = (event) =>
        {
            ShaderBoy.gui_header.bufCount++
            ShaderBoy.gui_header.bufCount =
                Math.min(ShaderBoy.gui_header.bufOrder.length - 1,
                    ShaderBoy.gui_header.bufCount)

            const id = ShaderBoy.gui_header.bufCount
            ShaderBoy.gui_header.bufOrder[id].classList.remove('disable')
            console.log(id)

            document.getElementById('ghdr-btn-dec-buf').classList.add('active')
            if (id === ShaderBoy.gui_header.bufOrder.length - 1)
            {
                document.getElementById('ghdr-btn-inc-buf').classList.remove('active')
            }

            const bufName = ShaderBoy.gui_header.bufOrder[id].textContent
            ShaderBoy.config.buffers[bufName].active = true
            ShaderBoy.bufferManager.buildShaderFromBuffers(false)
        }

        document.getElementById('ghdr-btn-dec-buf').onclick = (event) =>
        {
            ShaderBoy.gui_header.bufCount--
            ShaderBoy.gui_header.bufCount = Math.max(-1, ShaderBoy.gui_header.bufCount)
            const id = ShaderBoy.gui_header.bufCount + 1
            ShaderBoy.gui_header.bufOrder[id].classList.add('disable')
            ShaderBoy.gui_header.bufOrder[id].classList.remove('active')
            document.getElementById('ghdr-btn-inc-buf').classList.add('active')
            if (id <= 0)
            {
                document.getElementById('ghdr-btn-dec-buf').classList.remove('active')
            }
            else
            {
                const mainEl = document.getElementById('ghdr-btn-mainimg')
                {
                    ShaderBoy.editor.setBuffer(mainEl.textContent)
                }
                const cmnEl = document.getElementById('ghdr-btn-common')
                {
                    cmnEl.classList.remove('active')
                }
            }
            const bufName = ShaderBoy.gui_header.bufOrder[id].textContent
            ShaderBoy.config.buffers[bufName].active = false
            ShaderBoy.bufferManager.buildShaderFromBuffers(false)
        }

        const bufBtns = document.querySelectorAll('.btn-buf')
        for (let i = 0; i < bufBtns.length; i++)
        {
            bufBtns[i].onclick = (event) =>
            {
                if (!event.target.classList.contains('active'))
                {
                    // ShaderBoy.gui_header.setActive(event.target.textContent)
                    ShaderBoy.editor.setBuffer(event.target.textContent)
                    const bufName = event.target.textContent
                    console.log(bufName)
                    ShaderBoy.editor.setBuffer(bufName)
                }
            }
        }

        document.getElementById('fpscounter').onclick = this.switchInfo
        document.getElementById('active-shader-name').onclick = this.switchInfo
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setActive(bufName)
    {
        let bufBtns = document.querySelectorAll('.btn-buf')
        for (let i = 0; i < bufBtns.length; i++)
        {
            if (bufBtns[i].textContent !== bufName)
            {
                bufBtns[i].classList.remove('active')
            }
            else
            {
                bufBtns[i].classList.add('active')
            }
        }

        let id = 0
        for (let i = 0; i < ShaderBoy.activeBufferIds.length; i++)
        {
            if (ShaderBoy.activeBufferIds[i] === bufName)
            {
                id = i
                break
            }
        }
        ShaderBoy.bufferManager.currentBufferDataId = id
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setDirty(isDirty)
    {
        if (ShaderBoy.io.initLoading === false)
        {
            if (isDirty)
            {
                document.getElementById('asn_dirty').classList.add('dirty')
            }
            else
            {
                document.getElementById('asn_dirty').classList.remove('dirty')
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    switchInfo()
    {
        const fpsClassList = document.getElementById('fpscounter').classList
        const nameClassList = document.getElementById('active-shader-name').classList

        if (nameClassList.contains('hidden'))
        {
            fpsClassList.add('hide')
            setTimeout(() =>
            {
                fpsClassList.add('hidden')
                nameClassList.remove('hidden')
                nameClassList.remove('hide')
            }, 200)
        }
        else
        {
            nameClassList.add('hide')
            setTimeout(() =>
            {
                nameClassList.add('hidden')
                fpsClassList.remove('hidden')
                fpsClassList.remove('hide')
            }, 200)
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    resetBtns(buffers)
    {
        ShaderBoy.gui_header.bufCount = -1
        const cmnEl = document.getElementById('ghdr-btn-common')
        const bufaEl = document.getElementById('ghdr-btn-buf-a')
        const bufbEl = document.getElementById('ghdr-btn-buf-b')
        const bufcEl = document.getElementById('ghdr-btn-buf-c')
        const bufdEl = document.getElementById('ghdr-btn-buf-d')
        const sndEl = document.getElementById('ghdr-btn-snd')
        // buffers['Sound'].active = true
        if (buffers['Common'].active === true) cmnEl.classList.remove('disable'); else cmnEl.classList.add('disable')
        if (buffers['BufferA'].active === true) bufaEl.classList.remove('disable'); else bufaEl.classList.add('disable')
        if (buffers['BufferB'].active === true) bufbEl.classList.remove('disable'); else bufbEl.classList.add('disable')
        if (buffers['BufferC'].active === true) bufcEl.classList.remove('disable'); else bufcEl.classList.add('disable')
        if (buffers['BufferD'].active === true) bufdEl.classList.remove('disable'); else bufdEl.classList.add('disable')
        if (buffers['Sound'].active === true) sndEl.classList.remove('disable'); else sndEl.classList.add('disable')

        const cmnBtnEl = document.getElementById('ghdr-btn-switch-cmn')
        cmnBtnEl.classList.remove('dec')
        cmnBtnEl.classList.remove('inc')
        if (buffers['Common'].active === true)
        {
            cmnBtnEl.classList.add('dec')
        }
        else
        {
            cmnBtnEl.classList.add('inc')
        }

        const sndBtnEl = document.getElementById('ghdr-btn-switch-snd')
        sndBtnEl.classList.remove('dec')
        sndBtnEl.classList.remove('inc')
        if (buffers['Sound'].active === true)
        {
            sndBtnEl.classList.add('dec')
        }
        else
        {
            sndBtnEl.classList.add('inc')
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setError(bufName)
    {
        const bufBtns = document.querySelectorAll('.btn-buf')
        for (let i = 0; i < bufBtns.length; i++)
        {
            if (bufBtns[i].textContent !== bufName)
            {
                bufBtns[i].classList.remove('notify-error')
            }
            else
            {
                bufBtns[i].classList.add('notify-error')
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setErrorOnly(bufName)
    {
        const bufBtns = document.querySelectorAll('.btn-buf')
        for (let i = 0; i < bufBtns.length; i++)
        {
            if (bufBtns[i].textContent === bufName)
            {
                bufBtns[i].classList.add('notify-error')
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    removeErrorOnly(bufName)
    {
        const bufBtns = document.querySelectorAll('.btn-buf')
        for (let i = 0; i < bufBtns.length; i++)
        {
            if (bufBtns[i].textContent === bufName)
            {
                bufBtns[i].classList.remove('notify-error')
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    resetiChannels()
    {
        console.log('resetiChannels...')
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    statusList: ['gsuc', 'suc', 'wrn', 'error', 'prgrs', 'gdrv', 'ldrv'],
    cleanupStatus()
    {
        const statusEl = document.querySelectorAll('.ghdr-notif')
        for (const element of statusEl)
        {
            for (const statusName of this.statusList)
            {
                const className = `notif-${statusName}`
                element.classList.remove(className)
            }
            element.textContent = ''
            clearInterval(this.timer[1])
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    timer: [null, null],
    statusChangeCallback: undefined,
    setStatus(statusName, text, ms, callback)
    {
        const statusEl = document.querySelectorAll('.ghdr-notif')

        this.cleanupStatus()

        this.statusChangeCallback = callback

        for (const element of statusEl)
        {
            let className = 'notif-'
            let isValid = false

            for (const status of this.statusList)
            {
                if (statusName !== status)
                {
                    isValid = true
                }
            }

            if (!isValid)
            {
                statusName = 'prgrs'
            }

            className += statusName
            element.classList.add(className)
            element.textContent = text
        }

        if (ms > 0)
        {
            if (this.timer[0] !== null)
            {
                this.timer[1] = this.timer[0]
            }

            this.timer[0] = setTimeout((e) =>
            {
                ShaderBoy.gui_header.cleanupStatus()
                if (ShaderBoy.gui_header.statusChangeCallback !== undefined)
                {
                    setTimeout(
                        ShaderBoy.gui_header.statusChangeCallback(),
                        800
                    )
                }
            }, ms)
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    redraw()
    {
        document.getElementById('cntr_itime').textContent = ShaderBoy.uniforms.iTime.toFixed(3)
        document.getElementById('cntr_iframe').textContent = ShaderBoy.uniforms.iFrame.toFixed(0)
        document.getElementById('cntr_fps').textContent = ShaderBoy.time.fps.toFixed(1)
        if (ShaderBoy.buffers['Sound'].active)
        {
            ShaderBoy.soundRenderer.drawEQ()
        }
    }
}