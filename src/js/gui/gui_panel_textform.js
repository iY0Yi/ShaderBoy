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

export default ShaderBoy.gui_panel_textform = { // comment out on codepen.
    // ShaderBoy.gui_panel_textform = {  // comment out on ShaderBoy.
    textarea: null,
    result: null,
    callback: null,
    setup()
    {
        this.textarea = document.getElementById('div-textarea');

        this.textarea.onclick = function (e)
        {
            e.stopPropagation();
        }

        this.textarea.onkeydown = function (e)
        {
            e.stopPropagation();
            if (ShaderBoy.gui_panel_textform.textarea.innerText == "")
            {
                this.parentNode.classList.remove('dirty');
            }
            else
            {
                this.parentNode.classList.add('dirty');
            }

            let characterCode = e.keyCode;
            if (characterCode === 13)
            {
                let containerEl = document.getElementById('gui-panel');
                let gpbaseEl = document.getElementById('gp-base');
                containerEl.classList.toggle("gp-container-appear");
                gpbaseEl.classList.toggle("gp-appear");
                containerEl.classList.toggle("gp-container-hidden");
                gpbaseEl.classList.toggle("gp-hidden");
                let result = ShaderBoy.gui_panel_textform.textarea.innerText;
                ShaderBoy.gui_panel_textform.result = result;
                ShaderBoy.gui_panel_textform.textarea.innerText = '';

                let textareaContainer = document.getElementById('textarea-container');
                textareaContainer.classList.remove('dirty');

                ShaderBoy.gui_panel_textform.callback();
                return;
            }
        }

        this.textarea.onkeyup = function (e)
        {
            e.stopPropagation();

            let characterCode = e.keyCode;
            if (characterCode === 13)
            {
                let textareaContainer = document.getElementById('textarea-container');
                textareaContainer.classList.remove('dirty');
                ShaderBoy.gui_panel_textform.textarea.innerText = '';
            }
        };
    },

    reset(name, callback)
    {
        let containerEl = document.getElementById('gui-panel');
        let gpbaseEl = document.getElementById('gp-base');
        containerEl.classList.toggle("gp-container-appear");
        gpbaseEl.classList.toggle("gp-appear");
        containerEl.classList.toggle("gp-container-hidden");
        gpbaseEl.classList.toggle("gp-hidden");
        let nameEl = document.getElementById('gp-formname');
        nameEl.innerText = name;
        this.callback = callback;
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
    ShaderBoy.gui_panel_textform.setup(true);
}