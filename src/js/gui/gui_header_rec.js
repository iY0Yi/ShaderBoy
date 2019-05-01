// comment out on codepen.
import ShaderBoy from '../shaderboy';

// comment out on ShaderBoy.
// console.clear();
// let ShaderBoy = {
//     isPlaying: true,
//     uniforms: {
//         iTime: 0,
//         iFrame: 0
//     }
// };

let isTest = false; // set "true" on codepen.

export default ShaderBoy.gui_header_rec = { // comment out on codepen.
    // ShaderBoy.gui_header_rec = {  // comment out on ShaderBoy.
    dropdownClick(event)
    {
        let drpdwn = document.querySelectorAll('.dropdown.rec-setting-drpdwn');
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
    },

    setup()
    {
        let txtEls = document.querySelectorAll('.rec-text');
        for (let i = 0; i < txtEls.length; i++)
        {
            txtEls[i].onchange = function (event)
            {
                event.target.classList.add('defined');
            }
        }

        document.getElementById('ghdr-btn-record').onclick = function (event)
        {
            ShaderBoy.isRecording = !ShaderBoy.isRecording;

            let settings = document.querySelectorAll('.rec-setting');
            if (!event.target.classList.contains('active'))
            {
                console.log('Recording is started.');
                event.target.classList.add('active');
                for (let i = 0; i < settings.length; i++)
                {
                    settings[i].classList.add('disabled');
                    console.log(settings[i].type);
                    if (settings[i].type === 'text')
                    {
                        settings[i].classList.add('noselect');
                        settings[i].readOnly = true;
                    }
                    else
                    {
                        settings[i].classList.remove('noselect');
                        settings[i].onclick = undefined;
                    }
                }
                ShaderBoy.gui_header_rec.setRecSetting();
                ShaderBoy.gui_header_rec.start();
            }
            else
            {
                console.log('Recording was aborted.');
                event.target.classList.remove('active');
                for (let i = 0; i < settings.length; i++)
                {
                    settings[i].classList.remove('disabled');
                    if (settings[i].type === 'text')
                    {
                        settings[i].readOnly = false;
                    }
                    else
                    {
                        settings[i].onclick = ShaderBoy.gui_header_rec.dropdownClick;
                    }
                }
                ShaderBoy.gui_header_rec.stop();
            }
        }


        // Dropdown
        // let selectEls = document.getElementsByTagName('select');
        let selectEls = document.querySelectorAll('.rec-setting-drpdwn');
        for (let i = 0; i < selectEls.length; i++)
        {
            {
                let drpdwnDiv = document.createElement('div');
                drpdwnDiv.classList = selectEls[i].classList;
                drpdwnDiv.classList.add('dropdown');
                drpdwnDiv.classList.add('rec-setting-drpdwn');
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
                drpdwnDiv.onclick = this.dropdownClick;

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

    start()
    {
        let config = ShaderBoy.config.capture;
        console.log(config);

        ShaderBoy.gui_timeline.currentFrame = 0;

        ShaderBoy.canvas.width = config.resolution[0];
        ShaderBoy.canvas.height = config.resolution[1];

        ShaderBoy.capture = new CCapture(config);

        ShaderBoy.capture.totalframes = config.framerate * config.timeLimit;
        ShaderBoy.capture.currentframes = 0;

        ShaderBoy.bufferManager.setFBOsProps();

        ShaderBoy.isPlaying = true;
        ShaderBoy.isConcentrating = false;

        ShaderBoy.capture.start();
        this.timer = setInterval(function (e)
        {
            console.log('recording...');
            if (ShaderBoy.gui_timeline.currentFrame >= ShaderBoy.gui_timeline.endFrame)
            {
                ShaderBoy.gui_header_rec.stop();
                clearInterval(ShaderBoy.gui_header_rec.timer);
            }
        }, Math.floor(1 / 60 * 1000));

        ShaderBoy.gui_header.setStatus('prgrs', 'Recording...', 0);
    },

    stop()
    {
        document.getElementById('ghdr-btn-record').classList.remove('active');

        ShaderBoy.capture.stop();
        ShaderBoy.capture.save();

        console.log('ShaderBoy.capture', ShaderBoy.capture);
        let canvasWidth = Math.floor(window.innerWidth);
        let canvasHeight = Math.floor(window.innerHeight);
        ShaderBoy.canvas.width = canvasWidth;
        ShaderBoy.canvas.height = canvasHeight;
        ShaderBoy.bufferManager.setFBOsProps();
        ShaderBoy.isPlaying = true;
        ShaderBoy.isRecording = false;
        ShaderBoy.capture = null;
        // ShaderBoy.time.reset();
        ShaderBoy.gui_header.setStatus('suc3', 'Recording has been completed.', 3000);
    },

    setRecSetting()
    {
        console.log('setRecSetting');

        function getQuality(lv)
        {
            console.log('lv: ', lv);
            let q = 100;
            switch (lv)
            {
                case 'Very High':
                    q = 100;
                    break;
                case 'High':
                    q = 80;
                    break;
                case 'Medium':
                    q = 60;
                    break;
                case 'Low':
                    q = 40;
                    break;
                case 'Very Low':
                    q = 20;
                    break;
                default:
                    break;
            }
            return q;
        };

        function getFormat(name)
        {
            let f = 'webm';
            switch (name)
            {
                case 'WebM':
                    f = 'webm';
                    break;
                case 'GIF':
                    f = 'gif';
                    break;
                case 'PNG':
                    f = 'png';
                    break;
                case 'JPG':
                    f = 'jpg';
                    break;
                default:
                    break;
            }
            return f;
        };

        function getTimeLimit()
        {
            let start = ShaderBoy.gui_timeline.currentFrame;
            let end = ShaderBoy.gui_timeline.endFrame;
            let len = (end - start) / ShaderBoy.config.capture.framerate;
            return len;
        };

        ShaderBoy.config.capture.name = document.getElementById('filename').value || 'Untitled';
        let drpdwn = document.querySelectorAll('.dropdown.rec-setting-drpdwn');
        ShaderBoy.config.capture.format = (drpdwn[0].childNodes[0].textContent === 'Format') ? 'webm' : getFormat(drpdwn[0].childNodes[0].textContent);
        ShaderBoy.config.capture.framerate = (drpdwn[1].childNodes[0].textContent === 'Framerate') ? 60 : Number(drpdwn[1].childNodes[0].textContent);
        ShaderBoy.config.capture.quality = (drpdwn[2].childNodes[0].textContent === 'Quality') ? 100 : getQuality(drpdwn[2].childNodes[0].textContent);

        if (ShaderBoy.config.capture.format === 'gif')
        {
            ShaderBoy.config.capture.workersPath = 'js/';
        }
        // ShaderBoy.config.capture.timeLimit = getTimeLimit(); // sec
        ShaderBoy.config.capture.autoSaveTime = 10; // sec
        ShaderBoy.config.capture.motionBlurFrames = 0;

        ShaderBoy.config.capture.resolution = [0, 0];
        ShaderBoy.config.capture.resolution[0] = Number(document.getElementById('res-x').value) || 1920;
        ShaderBoy.config.capture.resolution[1] = Number(document.getElementById('res-y').value) || 1080;

    },

    readRecSetting()
    {

    }
}

if (isTest)
{
    ShaderBoy.gui_header_rec.setup(true);
}