//   ___                             _                   
//  (  _`\                          ( )                  
//  | (_(_)   _    _   _   ___     _| |                  
//  `\__ \  /'_`\ ( ) ( )/' _ `\ /'_` |                  
//  ( )_) |( (_) )| (_) || ( ) |( (_| |                  
//  `\____)`\___/'`\___/'(_) (_)`\__,_)                  
//   ___                      _                          
//  |  _`\                   ( )                         
//  | (_) )   __    ___     _| |   __   _ __   __   _ __ 
//  | ,  /  /'__`\/' _ `\ /'_` | /'__`\( '__)/'__`\( '__)
//  | |\ \ (  ___/| ( ) |( (_| |(  ___/| |  (  ___/| |   
//  (_) (_)`\____)(_) (_)`\__,_)`\____)(_)  `\____)(_)   
//                                                       

import ShaderBoy from './shaderboy'
import bufferManager from './buffer_manager'

export default ShaderBoy.soundRenderer = {
    init()
    {
        this.gl = ShaderBoy.gl

        this.mSampleRate = 44100
        this.mPlayTime = 60 * 3
        this.mPlaySamples = this.mPlayTime * this.mSampleRate
        this.mTextureDimensions = 512
        this.mTmpBufferSamples = this.mTextureDimensions * this.mTextureDimensions
        this.initContext()

        const gl = this.gl
        this.framebuffer = gl.createFramebuffer()
        this.texture = gl.createTexture()
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0)
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.mTextureDimensions, this.mTextureDimensions, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.bindTexture(gl.TEXTURE_2D, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)

        this.mForceMuted = false

        this.wave = []
        this.wave[0] = document.getElementById('wave0')
        this.wave[1] = document.getElementById('wave1')
        this.wave[2] = document.getElementById('wave2')
    },

    initContext()
    {
        console.log('soundRenderer.initContext()')
        const AudioContext = window.AudioContext || window.webkitAudioContext
        this.ctx = new AudioContext()
        this.mGainNode = this.ctx.createGain()
        this.mGainNode.connect(this.ctx.destination)
        this.mPlayNode = null
        this.mBuffer = this.ctx.createBuffer(2, this.mPlaySamples, this.mSampleRate)
        this.bufL = this.mBuffer.getChannelData(0); // Float32Aray
        this.bufR = this.mBuffer.getChannelData(1); // Float32Array

        this.analyser = this.ctx.createAnalyser()
        this.analyser.fftSize = 2048
        this.bufferLength = this.analyser.frequencyBinCount
        this.frequency = new Uint8Array(this.bufferLength)
        this.mGainNode.connect(this.analyser)

        // this.pausedAt = this.getCurrentTime()
        // this.startedAt = 0
        this.paused = true
    },

    destroyContext()
    {
        console.log('soundRenderer.destroyContext')
        if (this.mPlayNode !== null) 
        {
            this.mPlayNode.stop()
            this.mPlayNode.disconnect()
            this.mPlayNode = null
        }
        this.mGainNode.disconnect()
        this.mGainNode = null
        this.ctx.close()

        this.mBuffer = null
        // this.pausedAt = this.startedAt = 0
        this.paused = true
        this.wave[0].style.height = '0px'
        this.wave[1].style.height = '0px'
        this.wave[2].style.height = '0px'
    },

    drawEQ()
    {
        // if (ShaderBoy.buffers['Sound'].active === true && ShaderBoy.isPlaying === true)
        {
            this.analyser.getByteFrequencyData(this.frequency)
            let vals = [0, 0, 0]
            const step = 8
            const amp = 1.5

            const lv0 = 40
            const lv1 = 120
            const lv2 = 240
            const tot = this.bufferLength

            const bandwidth = 40

            for (var i = 0; i < this.bufferLength; i += step)
            {
                if (i > lv0 && i <= lv0 + bandwidth)
                {
                    vals[0] += this.frequency[i] / 255
                }

                else if (i > lv1 && i <= lv1 + bandwidth)
                {
                    vals[1] += this.frequency[i] / 255
                }

                else if (i > lv2 && i <= lv2 + bandwidth)
                {
                    vals[2] += this.frequency[i] / 255
                }
            }
            this.wave[0].style.height = Math.pow(vals[0] / bandwidth * step * amp, 2.0) * 9 + 'px'
            this.wave[1].style.height = Math.pow(vals[1] / bandwidth * step * amp, 2.0) * 9 + 'px'
            this.wave[2].style.height = Math.pow(vals[2] / bandwidth * step * amp, 2.0) * 9 + 'px'
        }
    },


    mute()
    {
        this.mForceMuted = !this.mForceMuted
        if (this.mForceMuted)
        { this.mGainNode.gain.value = 0.0 }
        else
        { this.mGainNode.gain.value = 1.0 }
    },

    getCurrentTime()
    {
        return Math.floor(ShaderBoy.gui_timeline.currentFrame / 60)
    },

    //https://stackoverflow.com/questions/11506180/web-audio-api-resume-from-pause
    play()
    {
        console.log('soundRenderer.play()')
        this.mPlayNode = this.ctx.createBufferSource()
        this.mPlayNode.buffer = this.mBuffer
        this.mPlayNode.loop = true
        this.mPlayNode.connect(this.mGainNode)
        this.mPlayNode.state = this.mPlayNode.noteOn
        this.mPlayNode.start(0, this.getCurrentTime())
        this.paused = false
    },

    restart()
    {
        console.log('soundRenderer.restart()')
        this.stop()
        this.play()
    },

    stop()
    {
        console.log('soundRenderer.stop()')
        if (this.mPlayNode !== null)
        {
            this.mPlayNode.stop(0)
            this.mPlayNode.disconnect()
            this.mPlayNode = null
            this.paused = true
        }
    },

    pause()
    {
        if (this.paused) this.play()
        else this.stop()
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    render()
    {
        const gl = this.gl
        gl.viewport(0, 0, this.mTextureDimensions, this.mTextureDimensions)

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0)
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.bindTexture(gl.TEXTURE_2D, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)

        const numSamples = this.mTmpBufferSamples
        const numBlocks = Math.floor(this.mPlaySamples / numSamples)

        const shader = ShaderBoy.buffers['Sound'].shader
        shader.begin()

        for (let j = 0; j < numBlocks; j++)
        {
            const off = j * this.mTmpBufferSamples
            shader.uniforms.iSampleRate = this.mSampleRate
            shader.uniforms.iBlockOffset = off / this.mSampleRate
            shader.setKnobsUniforms()
            shader.setMIDIUniforms()
            shader.setShadetoySoundShaderUniforms()
            shader.drawTexture(this.framebuffer, this.texture)

            const pixels = new Uint8Array(this.mTmpBufferSamples * 4)
            gl.readPixels(0, 0, this.mTextureDimensions, this.mTextureDimensions, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

            for (let i = 0; i < numSamples; i++)
            {
                this.bufL[off + i] = -1.0 + 2.0 * (pixels[4 * i + 0] + 256.0 * pixels[4 * i + 1]) / 65535.0
                this.bufR[off + i] = -1.0 + 2.0 * (pixels[4 * i + 2] + 256.0 * pixels[4 * i + 3]) / 65535.0
            }
        }

        shader.end()

        if (this.mPlayNode != null) { this.mPlayNode.disconnect(); this.mPlayNode.stop(); }
    }
};