// console.clear();
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

export default ShaderBoy.gui_header = { // comment out on codepen.
    // ShaderBoy.gui_header = {  // comment out on ShaderBoy.

    bufCount: -1,
    bufOrder: [],
    activeBufs: [],

    setActive(bufName)
    {
        let bufBtns = document.querySelectorAll('.btn-buf');
        for (let i = 0; i < bufBtns.length; i++)
        {
            if (bufBtns[i].textContent !== bufName)
            {
                bufBtns[i].classList.remove('active');
            }
            else
            {
                bufBtns[i].classList.add('active');
            }
        }

        let id = 0;
        for (let i = 0; i < ShaderBoy.activeBufferIds.length; i++)
        {
            if (ShaderBoy.activeBufferIds[i] === bufName)
            {
                id = i;
                break;
            }
        }
        ShaderBoy.bufferManager.currentBufferDataId = id;
    },

    resetBtns(buffers)
    {
        console.log('Otaku: ', buffers);
        ShaderBoy.gui_header.bufCount = -1;
        let cmnEl = document.getElementById('ghdr-btn-common');
        let bufaEl = document.getElementById('ghdr-btn-buf-a');
        let bufbEl = document.getElementById('ghdr-btn-buf-b');
        let bufcEl = document.getElementById('ghdr-btn-buf-c');
        let bufdEl = document.getElementById('ghdr-btn-buf-d');
        let sndEl = document.getElementById('ghdr-btn-snd');
        // buffers['Sound'].active = true;
        if (buffers['Common'].active === true) cmnEl.classList.remove('disable'); else cmnEl.classList.add('disable');
        if (buffers['BufferA'].active === true) bufaEl.classList.remove('disable'); else bufaEl.classList.add('disable');
        if (buffers['BufferB'].active === true) bufbEl.classList.remove('disable'); else bufbEl.classList.add('disable');
        if (buffers['BufferC'].active === true) bufcEl.classList.remove('disable'); else bufcEl.classList.add('disable');
        if (buffers['BufferD'].active === true) bufdEl.classList.remove('disable'); else bufdEl.classList.add('disable');
        if (buffers['Sound'].active === true) sndEl.classList.remove('disable'); else sndEl.classList.add('disable');

        let cmnBtnEl = document.getElementById('ghdr-btn-switch-cmn');
        cmnBtnEl.classList.remove('dec');
        cmnBtnEl.classList.remove('inc');
        if (buffers['Common'].active === true)
        {
            cmnBtnEl.classList.add('dec');
        }
        else
        {
            cmnBtnEl.classList.add('inc');
        }

        let sndBtnEl = document.getElementById('ghdr-btn-switch-snd');
        sndBtnEl.classList.remove('dec');
        sndBtnEl.classList.remove('inc');
        if (buffers['Sound'].active === true)
        {
            sndBtnEl.classList.add('dec');
        }
        else
        {
            sndBtnEl.classList.add('inc');
        }
    },

    setError(bufName)
    {
        let bufBtns = document.querySelectorAll('.btn-buf');
        for (let i = 0; i < bufBtns.length; i++)
        {
            if (bufBtns[i].textContent !== bufName)
            {
                bufBtns[i].classList.remove('notify-error');
            }
            else
            {
                bufBtns[i].classList.add('notify-error');
            }
        }
    },

    setErrorOnly(bufName)
    {
        let bufBtns = document.querySelectorAll('.btn-buf');
        for (let i = 0; i < bufBtns.length; i++)
        {
            if (bufBtns[i].textContent === bufName)
            {
                bufBtns[i].classList.add('notify-error');
            }
        }
    },

    removeErrorOnly(bufName)
    {
        let bufBtns = document.querySelectorAll('.btn-buf');
        for (let i = 0; i < bufBtns.length; i++)
        {
            if (bufBtns[i].textContent === bufName)
            {
                bufBtns[i].classList.remove('notify-error');
            }
        }
    },

    setup()
    {
        this.bufOrder.push(document.getElementById('ghdr-btn-buf-a'));
        this.bufOrder.push(document.getElementById('ghdr-btn-buf-b'));
        this.bufOrder.push(document.getElementById('ghdr-btn-buf-c'));
        this.bufOrder.push(document.getElementById('ghdr-btn-buf-d'));

        let id = this.bufCount;
        if (id > 0)
        {
            document.getElementById('ghdr-btn-dec-buf').classList.add('active');
        }
        if (id < ShaderBoy.gui_header.bufOrder.length - 1)
        {
            document.getElementById('ghdr-btn-inc-buf').classList.add('active');
        }

        document.getElementById('ghdr-btn-common').classList.add('disable');
        document.getElementById('ghdr-btn-snd').classList.add('disable');
        this.bufOrder[3].classList.add('disable');
        this.bufOrder[2].classList.add('disable');
        this.bufOrder[1].classList.add('disable');
        this.bufOrder[0].classList.add('disable');
        let mainEl = document.getElementById('ghdr-btn-mainimg');
        ShaderBoy.gui_header.setActive(mainEl.textContent);

        document.getElementById('ghdr-btn-switch-cmn').onclick = function (event)
        {
            document.getElementById('ghdr-btn-common').classList.toggle('disable');
            document.getElementById('ghdr-btn-switch-cmn').classList.toggle('inc');
            document.getElementById('ghdr-btn-switch-cmn').classList.toggle('dec');
            let mainEl = document.getElementById('ghdr-btn-mainimg');
            if (document.getElementById('ghdr-btn-common').classList.contains('disable'))
            {
                if (!mainEl.classList.contains('active'))
                {
                    ShaderBoy.editor.setBuffer(mainEl.textContent);
                }
                document.getElementById('ghdr-btn-common').classList.remove('active');
                ShaderBoy.config.buffers['Common'].active = false;
                ShaderBoy.buffers['Common'].active = false;
            }
            else
            {
                ShaderBoy.config.buffers['Common'].active = true;
                ShaderBoy.buffers['Common'].active = true;
            }
            ShaderBoy.bufferManager.buildShaderFromBuffers(false);
        }

        document.getElementById('ghdr-btn-switch-snd').onclick = function (event)
        {
            document.getElementById('ghdr-btn-snd').classList.toggle('disable');
            document.getElementById('ghdr-btn-switch-snd').classList.toggle('inc');
            document.getElementById('ghdr-btn-switch-snd').classList.toggle('dec');
            let mainEl = document.getElementById('ghdr-btn-mainimg');
            if (document.getElementById('ghdr-btn-snd').classList.contains('disable'))
            {
                if (!mainEl.classList.contains('active'))
                {
                    ShaderBoy.editor.setBuffer(mainEl.textContent);
                }
                document.getElementById('ghdr-btn-snd').classList.remove('active');
                ShaderBoy.config.buffers['Sound'].active = false;
                ShaderBoy.buffers['Sound'].active = false;
                ShaderBoy.soundRenderer.destroyContext();
            }
            else
            {
                ShaderBoy.config.buffers['Sound'].active = true;
                ShaderBoy.buffers['Sound'].active = true;
                ShaderBoy.soundRenderer.initContext();
            }
            ShaderBoy.bufferManager.buildShaderFromBuffers(false);
        }

        document.getElementById('ghdr-btn-inc-buf').onclick = function (event)
        {
            ShaderBoy.gui_header.bufCount++;
            ShaderBoy.gui_header.bufCount =
                Math.min(ShaderBoy.gui_header.bufOrder.length - 1,
                    ShaderBoy.gui_header.bufCount);

            let id = ShaderBoy.gui_header.bufCount;
            ShaderBoy.gui_header.bufOrder[id].classList.remove('disable');
            console.log(id);

            document.getElementById('ghdr-btn-dec-buf').classList.add('active');
            if (id === ShaderBoy.gui_header.bufOrder.length - 1)
            {
                document.getElementById('ghdr-btn-inc-buf').classList.remove('active');
            }

            let bufName = ShaderBoy.gui_header.bufOrder[id].textContent;
            ShaderBoy.config.buffers[bufName].active = true;
            ShaderBoy.bufferManager.buildShaderFromBuffers(false);
        }

        document.getElementById('ghdr-btn-dec-buf').onclick = function (event)
        {
            ShaderBoy.gui_header.bufCount--;
            ShaderBoy.gui_header.bufCount = Math.max(-1, ShaderBoy.gui_header.bufCount);
            let id = ShaderBoy.gui_header.bufCount + 1;
            ShaderBoy.gui_header.bufOrder[id].classList.add('disable');
            ShaderBoy.gui_header.bufOrder[id].classList.remove('active');
            console.log(id);
            document.getElementById('ghdr-btn-inc-buf').classList.add('active');
            if (id <= 0)
            {
                document.getElementById('ghdr-btn-dec-buf').classList.remove('active');
            }
            else
            {
                let mainEl = document.getElementById('ghdr-btn-mainimg');
                {
                    ShaderBoy.editor.setBuffer(mainEl.textContent);
                }
                let cmnEl = document.getElementById('ghdr-btn-common');
                {
                    cmnEl.classList.remove('active');
                }
            }
            let bufName = ShaderBoy.gui_header.bufOrder[id].textContent;
            ShaderBoy.config.buffers[bufName].active = false;
            ShaderBoy.bufferManager.buildShaderFromBuffers(false);
        }

        let bufBtns = document.querySelectorAll('.btn-buf');
        for (let i = 0; i < bufBtns.length; i++)
        {
            bufBtns[i].onclick = function (event)
            {
                if (!event.target.classList.contains('active'))
                {
                    // ShaderBoy.gui_header.setActive(event.target.textContent);
                    ShaderBoy.editor.setBuffer(event.target.textContent);
                    let bufName = event.target.textContent;
                    console.log(bufName);
                    ShaderBoy.editor.setBuffer(bufName);
                }
            };
        }
    },

    resetiChannels()
    {
        console.log('resetiChannels...');
    },


    statusList: ['suc1', 'suc2', 'suc3', 'error', 'prgrs', 'gdrv', 'ldrv'],
    cleanupStatus()
    {
        let statusEl = document.querySelectorAll('.ghdr-notif');
        for (let i = 0; i < statusEl.length; i++)
        {
            for (let j = 0; j < this.statusList.length; j++)
            {
                const statusName = this.statusList[j];
                let className = 'notif-' + statusName;
                statusEl[i].classList.remove(className);
            }
            statusEl[i].textContent = '';
            clearInterval(this.timer[1]);
        }
    },

    timer: [null, null],
    statusChangeCallback: undefined,
    setStatus(statusName, text, ms, callback)
    {
        console.log('setStatus');
        let statusEl = document.querySelectorAll('.ghdr-notif');

        this.cleanupStatus();

        this.statusChangeCallback = callback;

        for (let i = 0; i < statusEl.length; i++)
        {
            let className = 'notif-';
            let isValid = false;
            for (let j = 0; j < this.statusList.length; j++)
            {
                if (statusName !== this.statusList[j])
                {
                    isValid = true;
                }
            }
            if (!isValid)
            {
                statusName = 'prgrs';
            }

            className += statusName;
            statusEl[i].classList.add(className);
            statusEl[i].textContent = text;
        }

        if (ms > 0)
        {
            if (this.timer[0] !== null)
            {
                this.timer[1] = this.timer[0];
            }

            this.timer[0] = setTimeout(function (e)
            {
                ShaderBoy.gui_header.cleanupStatus();
                if (ShaderBoy.gui_header.statusChangeCallback !== undefined)
                {
                    setTimeout(
                        ShaderBoy.gui_header.statusChangeCallback(),
                        800
                    );
                }
            }, ms);
        }
    },

    redraw()
    {
        document.getElementById('cntr_itime').textContent = ShaderBoy.uniforms.iTime.toFixed(3);
        document.getElementById('cntr_iframe').textContent = ShaderBoy.uniforms.iFrame.toFixed(0);
        document.getElementById('cntr_fps').textContent = ShaderBoy.time.fps.toFixed(1);
        if (ShaderBoy.buffers['Sound'].active)
        {
            ShaderBoy.soundRenderer.drawEQ();
        }
    }
}

if (isTest)
{
    ShaderBoy.gui_header.setup(true);
}