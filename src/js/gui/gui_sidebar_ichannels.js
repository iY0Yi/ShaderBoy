import ShaderBoy from '../shaderboy'

export default ShaderBoy.gui_sidebar_ichannels = {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    bufClasses: ['buf-null', 'buf-a', 'buf-b', 'buf-c', 'buf-d'],
    panelClick(event)
    {
        const curBufName = ShaderBoy.activeBufferIds[ShaderBoy.bufferManager.currentBufferDataId]
        if (curBufName !== 'Config' && curBufName !== 'Setting' && curBufName !== 'Common')
        {
            const curBuf = event.target.classList[1]
            let i = 0
            for (i = 0; i < ShaderBoy.gui_sidebar_ichannels.bufClasses.length; i++)
            {
                if (ShaderBoy.gui_sidebar_ichannels.bufClasses[i] === curBuf)
                {
                    break
                }
            }

            i = (i + 1) % (ShaderBoy.gui_sidebar_ichannels.bufClasses.length)
            const nxtBuf = ShaderBoy.gui_sidebar_ichannels.bufClasses[i]
            event.target.classList.remove(curBuf)
            event.target.classList.add(nxtBuf)
            if (curBuf === 'buf-null' || nxtBuf === 'buf-null')
            {
                console.log(event.target.parentNode)
                event.target.parentNode.classList.toggle('null')
            }
            ShaderBoy.gui_sidebar_ichannels.setiChannels()
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setup()
    {
        const astpnls = document.querySelectorAll('.asset-panel')
        for (let i = 0; i < astpnls.length; i++)
        {
            if (!astpnls[i].classList.contains('buf-null'))
            {
                astpnls[i].classList.remove('buf-a')
                astpnls[i].classList.remove('buf-b')
                astpnls[i].classList.remove('buf-c')
                astpnls[i].classList.remove('buf-d')
                astpnls[i].classList.add('buf-null')
            }

            astpnls[i].onclick = this.panelClick
        }

        const selectEls = document.querySelectorAll('.ichannels-drpdwn')
        for (let i = 0; i < selectEls.length; i++)
        {
            {
                const drpdwnDiv = document.createElement('div')
                drpdwnDiv.classList = selectEls[i].classList
                drpdwnDiv.classList.add('dropdown')
                drpdwnDiv.classList.add('ichannels-drpdwn')
                console.log(drpdwnDiv.classList)
                drpdwnDiv.tabIndex = '0'
                const currentSpn = document.createElement('span')
                const listDiv = document.createElement('div')
                const ul = document.createElement('ul')
                currentSpn.classList.add('current')
                listDiv.classList.add('list')
                listDiv.appendChild(ul)
                drpdwnDiv.appendChild(currentSpn)
                drpdwnDiv.appendChild(listDiv)
                selectEls[i].parentNode.insertBefore(drpdwnDiv, selectEls[i].nextElementSibling)

                const options = selectEls[i].options
                const selected = options[selectEls[i].selectedIndex]
                currentSpn.innerHTML = selected.dataset.displayText || selected.text

                // Open/close
                drpdwnDiv.onclick = (event) =>
                {
                    const drpdwn = document.querySelectorAll('.dropdown.ichannels-drpdwn')
                    for (let i = 0; i < drpdwn.length; i++)
                    {
                        if (drpdwn[i] !== event.target)
                        {
                            drpdwn[i].classList.remove('open')
                        }
                    }

                    if (!event.target.parentNode.classList.contains('null'))
                    {
                        event.target.classList.toggle('open')
                        if (event.target.classList.contains('open'))
                        {
                            const opts = event.target.querySelectorAll('.option')
                            for (const opt of opts)
                            {
                                opt.tabIndex = '0'
                            }
                            const sels = event.target.querySelectorAll('.selected')
                            for (const sel of sels)
                            {
                                sel.focus()
                            }
                        }
                        else
                        {
                            const opts = event.target.querySelectorAll('.option')
                            for (const opt of opts)
                            {
                                opt.removeAttribute('tabindex')
                            }
                            event.target.focus()
                        }
                    }
                }

                for (let j = 0; j < options.length; j++)
                {
                    const item = document.createElement('li')
                    item.classList.add('option')
                    if (j === selectEls[i].selectedIndex)
                    {
                        item.classList.add('selected')
                    }
                    item.dataset.value = options[j].value
                    item.dataset.displayText = options[j].dataset.displayText || ''
                    item.innerHTML = options[j].text
                    ul.appendChild(item)

                    item.onclick = (e) =>
                    {
                        const op = e.target
                        const opts = op.closest('.list').querySelectorAll('.option')
                        for (const opt of opts) 
                        {
                            if (opt.classList.contains('selected'))
                            {
                                opt.classList.remove('selected')
                            }
                        }

                        op.classList.add('selected')
                        const text = op.dataset.displayText || op.textContent
                        const drpdwnEl = op.closest('.dropdown')
                        drpdwnEl.children[0].innerHTML = text

                        ShaderBoy.gui_sidebar_ichannels.setiChannels()
                    }
                }
            }
        }

        // Close when clicking outside
        document.onclick = (event) =>
        {
            if (event.target.closest('.dropdown') === null)
            {
                const drpdwn = document.querySelectorAll('.dropdown')
                for (const dd of drpdwn) 
                {
                    dd.classList.remove('open')
                }
                const opts = document.querySelectorAll('.dropdown.option')
                for (const opt of opts)
                {
                    opt.removeAttribute('tabindex')
                }
            }
            event.stopPropagation()
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setiChannels()
    {
        const setBufferById = (curBufName, id) =>
        {
            const channelEl = document.getElementById(`ichannel${id}`)
            const bufClass = channelEl.childNodes[1].classList[1]
            let bufName = null
            if (bufClass === 'buf-a') bufName = 'BufferA'
            if (bufClass === 'buf-b') bufName = 'BufferB'
            if (bufClass === 'buf-c') bufName = 'BufferC'
            if (bufClass === 'buf-d') bufName = 'BufferD'
            ShaderBoy.config.buffers[curBufName].iChannel[id].asset = bufName

            const drpdwn = document.querySelectorAll('.dropdown.ichannels-drpdwn')
            ShaderBoy.config.buffers[curBufName].iChannel[id].filter = (drpdwn[0].childNodes[0].textContent === 'Filter') ? 'linear' : drpdwn[0].childNodes[0].textContent
            ShaderBoy.config.buffers[curBufName].iChannel[id].wrap = (drpdwn[1].childNodes[0].textContent === 'Wrap') ? 'repeat' : drpdwn[1].childNodes[0].textContent
        }
        const curBufName = ShaderBoy.activeBufferIds[ShaderBoy.bufferManager.currentBufferDataId]
        setBufferById(curBufName, 0)
        setBufferById(curBufName, 1)
        setBufferById(curBufName, 2)
        setBufferById(curBufName, 3)
        ShaderBoy.bufferManager.buildShaderFromBuffers(false)
        ShaderBoy.bufferManager.setFBOsProps()
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    readiChannels(bufName)
    {
        if (bufName !== 'Config' && bufName !== 'Setting' && bufName !== 'Common')
        {
            const astpnls = document.querySelectorAll('.asset-panel')
            for (const pnl of astpnls)
            {
                pnl.parentNode.classList.remove('disabled')
                pnl.classList.remove('buf-a')
                pnl.classList.remove('buf-b')
                pnl.classList.remove('buf-c')
                pnl.classList.remove('buf-d')
                pnl.classList.remove('buf-null')
                pnl.onclick = this.panelClick
            }

            const ichannelConfig = ShaderBoy.config.buffers[bufName].iChannel
            let setBufferUIById = (id) =>
            {
                const channelEl = document.getElementById(`ichannel${id}`)
                channelEl.classList.remove('null')
                const assetEl = channelEl.childNodes[1]
                let bufClass = 'buf-null'
                if (ichannelConfig[id].asset === 'BufferA') bufClass = 'buf-a'
                if (ichannelConfig[id].asset === 'BufferB') bufClass = 'buf-b'
                if (ichannelConfig[id].asset === 'BufferC') bufClass = 'buf-c'
                if (ichannelConfig[id].asset === 'BufferD') bufClass = 'buf-d'
                assetEl.classList.add(bufClass)

                const drpdwn = document.querySelectorAll('.dropdown.ichannels-drpdwn')
                drpdwn[0].childNodes[0].textContent = ichannelConfig[id].filter
                drpdwn[1].childNodes[0].textContent = ichannelConfig[id].wrap

                if (bufClass === 'buf-null')
                {
                    channelEl.classList.add('null')
                }
            }
            setBufferUIById(0)
            setBufferUIById(1)
            setBufferUIById(2)
            setBufferUIById(3)
        }
        else
        {
            const astpnls = document.querySelectorAll('.asset-panel')
            for (let i = 0; i < astpnls.length; i++)
            {
                astpnls[i].parentNode.classList.add('disabled')
                astpnls[i].onclick = undefined
                astpnls[i].classList.remove('buf-a')
                astpnls[i].classList.remove('buf-b')
                astpnls[i].classList.remove('buf-c')
                astpnls[i].classList.remove('buf-d')
                astpnls[i].classList.add('buf-null')
                const channelEl = document.getElementById(`ichannel${i}`)
                channelEl.classList.add('null')
                const drpdwn = document.querySelectorAll('.dropdown.ichannels-drpdwn')
                drpdwn[0].childNodes[0].textContent = 'linear'
                drpdwn[1].childNodes[0].textContent = 'repeat'
            }
        }
    }
}