import ShaderBoy from '../shaderboy'

export default ShaderBoy.gui_panel_textform = {

    textarea: null,
    result: null,
    callback: null,

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setup()
    {
        this.textarea = document.getElementById('div-textarea')

        this.textarea.onclick = (e) =>
        {
            e.stopPropagation()
        }

        this.textarea.onkeydown = (e) =>
        {
            e.stopPropagation()
            if (this.textarea.innerText == "")
            {
                document.getElementById('textarea-container').classList.remove('dirty')
            }
            else
            {
                document.getElementById('textarea-container').classList.add('dirty')
            }

            if (e.keyCode === 13)
            {
                const containerEl = document.getElementById('gui-panel')
                const gpbaseEl = document.getElementById('gp-base')
                containerEl.classList.toggle("gp-container-appear")
                gpbaseEl.classList.toggle("gp-appear")
                containerEl.classList.toggle("gp-container-hidden")
                gpbaseEl.classList.toggle("gp-hidden")
                const result = this.textarea.innerText
                this.result = result
                this.textarea.innerText = ''

                document.getElementById('textarea-container').classList.remove('dirty')

                this.callback()
                return
            }
        }

        this.textarea.onkeyup = (e) =>
        {
            e.stopPropagation()
            if (e.keyCode === 13)
            {
                document.getElementById('textarea-container').classList.remove('dirty')
                this.textarea.innerText = ''
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    reset(formName, shaderName, callback)
    {
        const containerEl = document.getElementById('gui-panel')
        const gpbaseEl = document.getElementById('gp-base')
        containerEl.classList.toggle("gp-container-appear")
        gpbaseEl.classList.toggle("gp-appear")
        containerEl.classList.toggle("gp-container-hidden")
        gpbaseEl.classList.toggle("gp-hidden")
        const formNameEl = document.getElementById('gp-formname')
        this.textarea.innerText = shaderName
        formNameEl.innerText = formName
        this.callback = callback
        if (shaderName !== '')
        {
            document.getElementById('textarea-container').classList.add('dirty')
        }
    }
}