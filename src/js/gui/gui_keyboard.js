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

        document.onkeydown = (ev) =>
        {
            const onEditor = document.activeElement === ShaderBoy.editor.codemirror.getInputField()
            if(!onEditor)
            {
                if (ShaderBoy.isEditorHidden || ShaderBoy.isSplited){
                    this.setKeyDown( ev.keyCode )
                    ShaderBoy.forceDraw = !ShaderBoy.isPlaying
                }
            }
        }

        document.onkeyup = (ev)=>
        {
            const onEditor = document.activeElement === ShaderBoy.editor.codemirror.getInputField()
            if(!onEditor)
            {
                console.log('onkeyup')
                if (ShaderBoy.isEditorHidden || ShaderBoy.isSplited){
                    this.setKeyUp( ev.keyCode )
                    ShaderBoy.forceDraw = !ShaderBoy.isPlaying
                }
            }
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

    setKeyDown( k )
    {
        if( this.keyboard.dat[ k + 0*256 ] == 255 ) return;
        this.keyboard.dat[ k + 0*256 ] = 255;
        this.keyboard.dat[ k + 1*256 ] = 255;
        this.keyboard.dat[ k + 2*256 ] = 255 - this.keyboard.dat[ k + 2*256 ];
        this.updateTexture()
    },

    setKeyUp( k )
    {
        this.keyboard.dat[ k + 0*256 ] = 0;
        this.keyboard.dat[ k + 1*256 ] = 0;
        this.updateTexture()
    }
}