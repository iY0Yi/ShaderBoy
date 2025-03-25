import ShaderBoy from '../shaderboy'

export default ShaderBoy.gui_keyboard = {

    keyboard: {},

    setup()
    {
        console.log('gui_keyboard.setup()')
        let dat = new Uint8Array( 256*3 )
        for (let j=0; j<(256*3); j++ ) { dat[j] = 0 }

        const gl = ShaderBoy.gl
        let fbo = gl.createFramebuffer()
        let texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.bindTexture(gl.TEXTURE_2D, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)

        this.keyboard = { dat: dat, fbo: fbo, tex: texture}

        let isNativeKeyCode = false

        if(ShaderBoy.OS==='Android')
        {
            const mainDiv = document.getElementById('main')
            const invisibleInput = document.createElement('textarea')
            invisibleInput.id = 'invisibleInput'
            invisibleInput.style.opacity = 0
            invisibleInput.style.width = '1px'
            invisibleInput.style.height = '1px'
            invisibleInput.style.position = 'absolute'
            invisibleInput.style.left = '-9999px'

            invisibleInput.setAttribute('autocomplete','off')
            invisibleInput.setAttribute('autocorrect','off')
            invisibleInput.setAttribute('autocapitalize','none')
            invisibleInput.setAttribute('spellcheck','false')
            invisibleInput.setAttribute('inputmode','text')

            mainDiv.appendChild(invisibleInput)
            mainDiv.addEventListener('touchstart', (e) => {
                invisibleInput.focus()
                e.preventDefault()
            })

            // fake keyup. we can't get keydown for virtual keyboards.
            invisibleInput.addEventListener('input', (e) => {
                console.log('invisibleInput.input')
                if(!isNativeKeyCode)
                {
                    const currentText = e.target.value
                    if (currentText.length > 0)
                    {
                        const lastChar = currentText.slice(-1)
                        const upperChar = lastChar.toUpperCase()
                        const code = upperChar.charCodeAt(0)
                        this.setKey(code)
                        console.log('invisibleInput.setKey( ', code, ' )')
                        ShaderBoy.forceDraw = !ShaderBoy.isPlaying
                        invisibleInput.value = ''
                    }
                }
            })

            // default keydown/up events to detect modifier keys
            invisibleInput.onkeydown = (ev) =>
            {
                console.log('invisibleInput.onkeydown')
                if(ev.keyCode===229) return; // not midifier keys
                if (ShaderBoy.isEditorHidden || ShaderBoy.isSplited){
                    this.setKeyDown( ev.keyCode )
                    console.log('invisibleInput.setKeyDown( ', ev.keyCode, ' )')
                    ShaderBoy.forceDraw = !ShaderBoy.isPlaying
                }
            }
            invisibleInput.onkeyup = (ev)=>
            {
                console.log('invisibleInput.onkeyup')
                if(ev.keyCode===229) return; // not midifier keys
                if (ShaderBoy.isEditorHidden || ShaderBoy.isSplited){
                    this.setKeyUp( ev.keyCode )
                    console.log('invisibleInput.setKeyUp( ', ev.keyCode, ' )')
                    ShaderBoy.forceDraw = !ShaderBoy.isPlaying
                }
            }
        }
        const canvas = document.getElementById("gl_canvas");
        canvas.onkeydown = (ev) =>
        {
            console.log('document.onkeydown')
            if(ev.keyCode===229) return; // for Android
            isNativeKeyCode = true
            const onEditor = document.activeElement === ShaderBoy.editor.getDomNode()
            if(!onEditor)
            {
                if (ShaderBoy.isEditorHidden || ShaderBoy.isSplited){
                    this.setKeyDown( ev.keyCode )
                    console.log('document.setKeyDown( ', ev.keyCode, ' )')
                    ShaderBoy.forceDraw = !ShaderBoy.isPlaying
                }
            }
        }

        canvas.onkeyup = (ev)=>
        {
            console.log('document.onkeyup')
            if(ev.keyCode===229) return; // for Android
            const onEditor = document.activeElement === ShaderBoy.editor.getDomNode()
            if(!onEditor)
            {
                if (ShaderBoy.isEditorHidden || ShaderBoy.isSplited){
                    this.setKeyUp( ev.keyCode )
                    console.log('document.setKeyUp( ', ev.keyCode, ' )')
                    ShaderBoy.forceDraw = !ShaderBoy.isPlaying
                }
            }
            isNativeKeyCode = false
        }

    },

    updateTexture(){
        const gl = ShaderBoy.gl
        gl.bindTexture(gl.TEXTURE_2D, this.keyboard.tex)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 256, 3, 0, gl.RED, gl.UNSIGNED_BYTE, this.keyboard.dat)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.bindTexture(gl.TEXTURE_2D, null)
    },

    setKey( k )
    {
        this.keyboard.dat[ k + 0*256 ] = (this.keyboard.dat[ k + 0*256 ]>0) ? 0:255;
        this.keyboard.dat[ k + 1*256 ] = (this.keyboard.dat[ k + 1*256 ]>0) ? 0:255;
        this.keyboard.dat[ k + 2*256 ] = 255 - this.keyboard.dat[ k + 2*256 ]
        this.updateTexture()
    },

    setKeyDown( k )
    {
        if( this.keyboard.dat[ k + 0*256 ] == 255 ) return
        this.keyboard.dat[ k + 0*256 ] = 255
        this.keyboard.dat[ k + 1*256 ] = 255
        this.keyboard.dat[ k + 2*256 ] = 255 - this.keyboard.dat[ k + 2*256 ]
        this.updateTexture()
    },

    setKeyUp( k )
    {
        this.keyboard.dat[ k + 0*256 ] = 0
        this.keyboard.dat[ k + 1*256 ] = 0
        this.updateTexture()
    }
}