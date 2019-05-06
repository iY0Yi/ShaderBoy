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

export default ShaderBoy.gui_sidebar_ichannels = { // comment out on codepen.
    // ShaderBoy.gui_sidebar_ichannels = {  // comment out on ShaderBoy.

    bufClasses: ['buf-null', 'buf-a', 'buf-b', 'buf-c', 'buf-d'],
    panelClick: function (event)
    {
        let curBufName = ShaderBoy.activeBufferIds[ShaderBoy.bufferManager.currentBufferDataId];
        if (curBufName !== 'Config' && curBufName !== 'Setting' && curBufName !== 'Common')
        {
            let curBuf = event.target.classList[1];
            let i = 0;
            for (i = 0; i < ShaderBoy.gui_sidebar_ichannels.bufClasses.length; i++)
            {
                if (ShaderBoy.gui_sidebar_ichannels.bufClasses[i] === curBuf)
                {
                    break;
                }
            }

            i = (i + 1) % (ShaderBoy.gui_sidebar_ichannels.bufClasses.length);
            let nxtBuf = ShaderBoy.gui_sidebar_ichannels.bufClasses[i];
            event.target.classList.remove(curBuf);
            event.target.classList.add(nxtBuf);
            if (curBuf === 'buf-null' || nxtBuf === 'buf-null')
            {
                console.log(event.target.parentNode);
                event.target.parentNode.classList.toggle('null');
            }
            ShaderBoy.gui_sidebar_ichannels.setiChannels();
        }
    },
    setup()
    {
        let astpnls = document.querySelectorAll('.asset-panel');
        for (let i = 0; i < astpnls.length; i++)
        {
            if (!astpnls[i].classList.contains('buf-null'))
            {
                astpnls[i].classList.remove('buf-a');
                astpnls[i].classList.remove('buf-b');
                astpnls[i].classList.remove('buf-c');
                astpnls[i].classList.remove('buf-d');
                astpnls[i].classList.add('buf-null');
            }

            astpnls[i].onclick = this.panelClick;
        }

        let selectEls = document.querySelectorAll('.ichannels-drpdwn');
        for (let i = 0; i < selectEls.length; i++)
        {
            {
                let drpdwnDiv = document.createElement('div');
                drpdwnDiv.classList = selectEls[i].classList;
                drpdwnDiv.classList.add('dropdown');
                drpdwnDiv.classList.add('ichannels-drpdwn');
                console.log(drpdwnDiv.classList);
                drpdwnDiv.tabIndex = '0';
                let currentSpn = document.createElement('span');
                let listDiv = document.createElement('div');
                let ul = document.createElement('ul');
                currentSpn.classList.add('current');
                listDiv.classList.add('list');
                listDiv.appendChild(ul);
                drpdwnDiv.appendChild(currentSpn);
                drpdwnDiv.appendChild(listDiv);
                selectEls[i].parentNode.insertBefore(drpdwnDiv, selectEls[i].nextElementSibling);

                let options = selectEls[i].options;
                let selected = options[selectEls[i].selectedIndex];
                currentSpn.innerHTML = selected.dataset.displayText || selected.text;

                // Open/close
                drpdwnDiv.onclick = function (event)
                {
                    let drpdwn = document.querySelectorAll('.dropdown.ichannels-drpdwn');
                    for (let i = 0; i < drpdwn.length; i++)
                    {
                        if (drpdwn[i] !== event.target)
                        {
                            drpdwn[i].classList.remove('open');
                        }
                    }

                    if (!event.target.parentNode.classList.contains('null'))
                    {
                        event.target.classList.toggle('open');
                        if (event.target.classList.contains('open'))
                        {
                            let opts = event.target.querySelectorAll('.option');
                            for (let i = 0; i < opts.length; i++)
                            {
                                opts[i].tabIndex = '0';
                            }
                            let sels = event.target.querySelectorAll('.selected');
                            for (let i = 0; i < sels.length; i++)
                            {
                                sels[i].focus();
                            }
                        }
                        else
                        {
                            let opts = event.target.querySelectorAll('.option');
                            for (let i = 0; i < opts.length; i++)
                            {
                                opts[i].removeAttribute('tabindex');
                            }
                            event.target.focus();
                        }
                    }
                };

                for (let j = 0; j < options.length; j++)
                {
                    let item = document.createElement('li');
                    item.classList.add('option');
                    if (j === selectEls[i].selectedIndex)
                    {
                        item.classList.add('selected');
                    }
                    item.dataset.value = options[j].value;
                    item.dataset.displayText = options[j].dataset.displayText || '';
                    item.innerHTML = options[j].text;
                    ul.appendChild(item);

                    item.onclick = function (e)
                    {
                        let op = e.target;
                        let opts = op.closest('.list').querySelectorAll('.option');
                        for (let i = 0; i < opts.length; i++)
                        {
                            if (opts[i].classList.contains('selected'))
                            {
                                opts[i].classList.remove('selected');
                            }
                        }

                        op.classList.add('selected');
                        let text = op.dataset.displayText || op.textContent;
                        let drpdwnEl = op.closest('.dropdown');
                        drpdwnEl.children[0].innerHTML = text;

                        ShaderBoy.gui_sidebar_ichannels.setiChannels();
                    }
                }
            }
        }

        // Close when clicking outside
        document.onclick = function (event)
        {
            if (event.target.closest('.dropdown') === null)
            {
                let drpdwn = document.querySelectorAll('.dropdown');
                for (let i = 0; i < drpdwn.length; i++)
                {
                    drpdwn[i].classList.remove('open');
                }
                let opts = document.querySelectorAll('.dropdown.option');
                for (let i = 0; i < opts.length; i++)
                {
                    opts[i].removeAttribute('tabindex');
                }
            }
            event.stopPropagation();
        };
    },

    setiChannels()
    {
        console.log('setiChannels...');
        function setBufferById(curBufName, id)
        {
            let channelEl = document.getElementById('ichannel' + id);
            let bufClass = channelEl.childNodes[1].classList[1];
            let bufName = null;
            if (bufClass === 'buf-a') bufName = 'BufferA';
            if (bufClass === 'buf-b') bufName = 'BufferB';
            if (bufClass === 'buf-c') bufName = 'BufferC';
            if (bufClass === 'buf-d') bufName = 'BufferD';
            ShaderBoy.config.buffers[curBufName].iChannel[id].asset = bufName;

            let drpdwn = document.querySelectorAll('.dropdown.ichannels-drpdwn');
            ShaderBoy.config.buffers[curBufName].iChannel[id].filter = (drpdwn[0].childNodes[0].textContent === 'Filter') ? 'linear' : drpdwn[0].childNodes[0].textContent;
            ShaderBoy.config.buffers[curBufName].iChannel[id].wrap = (drpdwn[1].childNodes[0].textContent === 'Wrap') ? 'repeat' : drpdwn[1].childNodes[0].textContent;
        }
        let curBufName = ShaderBoy.activeBufferIds[ShaderBoy.bufferManager.currentBufferDataId];
        setBufferById(curBufName, 0);
        setBufferById(curBufName, 1);
        setBufferById(curBufName, 2);
        setBufferById(curBufName, 3);
        ShaderBoy.bufferManager.buildShaderFromBuffers();
        ShaderBoy.bufferManager.setFBOsProps();
    },

    readiChannels(bufName)
    {
        console.log('readiChannels...');
        if (bufName !== 'Config' && bufName !== 'Setting' && bufName !== 'Common')
        {
            let astpnls = document.querySelectorAll('.asset-panel');
            for (let i = 0; i < astpnls.length; i++)
            {
                astpnls[i].parentNode.classList.remove('disabled');
                astpnls[i].classList.remove('buf-a');
                astpnls[i].classList.remove('buf-b');
                astpnls[i].classList.remove('buf-c');
                astpnls[i].classList.remove('buf-d');
                astpnls[i].classList.remove('buf-null');
                astpnls[i].onclick = this.panelClick;
            }

            let ichannelConfig = ShaderBoy.config.buffers[bufName].iChannel;
            function setBufferUIById(id)
            {
                let channelEl = document.getElementById('ichannel' + id);
                channelEl.classList.remove('null');
                let assetEl = channelEl.childNodes[1];
                let bufClass = 'buf-null';
                if (ichannelConfig[id].asset === 'BufferA') bufClass = 'buf-a';
                if (ichannelConfig[id].asset === 'BufferB') bufClass = 'buf-b';
                if (ichannelConfig[id].asset === 'BufferC') bufClass = 'buf-c';
                if (ichannelConfig[id].asset === 'BufferD') bufClass = 'buf-d';
                assetEl.classList.add(bufClass);

                let drpdwn = document.querySelectorAll('.dropdown.ichannels-drpdwn');
                drpdwn[0].childNodes[0].textContent = ichannelConfig[id].filter;
                drpdwn[1].childNodes[0].textContent = ichannelConfig[id].wrap;

                if (bufClass === 'buf-null')
                {
                    channelEl.classList.add('null');
                }
            }
            setBufferUIById(0);
            setBufferUIById(1);
            setBufferUIById(2);
            setBufferUIById(3);
        }
        else
        {
            let astpnls = document.querySelectorAll('.asset-panel');
            for (let i = 0; i < astpnls.length; i++)
            {
                astpnls[i].parentNode.classList.add('disabled');
                astpnls[i].onclick = undefined;
                astpnls[i].classList.remove('buf-a');
                astpnls[i].classList.remove('buf-b');
                astpnls[i].classList.remove('buf-c');
                astpnls[i].classList.remove('buf-d');
                astpnls[i].classList.add('buf-null');
                let channelEl = document.getElementById('ichannel' + i);
                channelEl.classList.add('null');
                let drpdwn = document.querySelectorAll('.dropdown.ichannels-drpdwn');
                drpdwn[0].childNodes[0].textContent = 'linear';
                drpdwn[1].childNodes[0].textContent = 'repeat';
            }
        }
    }

}

if (isTest)
{
    ShaderBoy.gui_sidebar_ichannels.setup(true);
}