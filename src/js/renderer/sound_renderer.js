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

import ShaderBoy from '../shaderboy'
import gui_timeline from '../gui/gui_timeline'
let gl = null

const createRealtimeProcessorSource = () => `
class ShaderBoySoundProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.queue = [];
    this.current = null;
    this.readIndex = 0;
    this.requestPending = false;
    this.isActive = false;
    this.port.onmessage = (event) => {
      const data = event.data || {};
      switch (data.type) {
        case 'chunk':
          this.queue.push(new Float32Array(data.buffer));
          this.requestPending = false;
          break;
        case 'flush':
          this.queue.length = 0;
          this.current = null;
          this.readIndex = 0;
          this.requestPending = false;
          break;
        case 'set-active':
          this.isActive = !!data.active;
          break;
        default:
          break;
      }
    };
  }

  advanceBuffer() {
    if (this.queue.length > 0) {
      this.current = this.queue.shift();
      this.readIndex = 0;
      this.requestPending = false;
    } else {
      this.current = null;
    }
  }

  process(inputs, outputs) {
    const output = outputs[0];
    const left = output[0];
    const right = output[1];

    const frames = left.length;
    for (let i = 0; i < frames; i++) {
      if (!this.current || this.readIndex >= this.current.length) {
        this.advanceBuffer();
      }

      if (!this.current || !this.isActive) {
        left[i] = 0;
        right[i] = 0;
      } else {
        left[i] = this.current[this.readIndex++];
        right[i] = this.current[this.readIndex++];
      }
    }

    if (this.isActive && !this.requestPending) {
      const remainingChunks = this.queue.length + (this.current ? 1 : 0);
      if (remainingChunks <= 1) {
        this.requestPending = true;
        this.port.postMessage({ type: 'request' });
      }
    }

    return true;
  }
}

registerProcessor('shaderboy-sound-processor', ShaderBoySoundProcessor);
`

export default ShaderBoy.soundRenderer = {
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    init()
    {
        gl = ShaderBoy.gl

        this.mSampleRate = 44100
        this.mPlayTime = 60 * 3
        this.mPlaySamples = this.mPlayTime * this.mSampleRate

        this.offlineTextureSize = 512
        this.realtimeTextureSize = 64

        this.realtimePreference = true
        this.realtimeMode = true
        this.realtimePreRollChunks = 3
        this.realtimeCurrentSample = 0
        this.realtimePlaying = false
        this.realtimeNeedsReset = false

        this.framebuffer = null
        this.texture = null
        this.pixelBuffer = null

        this.workletNode = null
        this.workletInitPromise = null
        this.realtimeModuleUrl = null

        this.ensureRenderingTargets()
        this.initContext()

        this.mForceMuted = false

        this.wave = []
        this.wave[0] = document.getElementById('wave0')
        this.wave[1] = document.getElementById('wave1')
        this.wave[2] = document.getElementById('wave2')

        this.fakeDownloadLink = document.createElement('a')
        document.body.appendChild(this.fakeDownloadLink)
        this.fakeDownloadLink.style = "display: none"
    },

    ensureRenderingTargets()
    {
        if (!gl) return

        const desiredSize = this.realtimeMode ? this.realtimeTextureSize : this.offlineTextureSize
        if (this.mTextureDimensions === desiredSize && this.framebuffer !== null && this.texture !== null)
        {
            return
        }

        this.mTextureDimensions = desiredSize
        this.mTmpBufferSamples = this.mTextureDimensions * this.mTextureDimensions

        if (this.framebuffer !== null) gl.deleteFramebuffer(this.framebuffer)
        if (this.texture !== null) gl.deleteTexture(this.texture)

        this.framebuffer = gl.createFramebuffer()
        this.texture = gl.createTexture()

        const glFoTy = ShaderBoy.iFormatPI2GL(ShaderBoy.glTexConsts.TEXFMT.C4I8)

        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        gl.texImage2D(gl.TEXTURE_2D, 0, glFoTy.colorFormat, this.mTextureDimensions, this.mTextureDimensions, 0, glFoTy.external, glFoTy.precision, null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.bindTexture(gl.TEXTURE_2D, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)

        this.pixelBuffer = new Uint8Array(this.mTmpBufferSamples * 4)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
        this.paused = true

        if (this.realtimeMode)
        {
            this.ensureRealtimeChain()
        }
    },

    ensureRealtimeChain()
    {
        if (!this.ctx) return
        if (this.workletNode !== null || this.workletInitPromise !== null) return

        const moduleUrl = this.getRealtimeModuleUrl()
        this.workletInitPromise = this.ctx.audioWorklet.addModule(moduleUrl)
            .then(() =>
            {
                this.workletNode = new AudioWorkletNode(this.ctx, 'shaderboy-sound-processor', {
                    numberOfInputs: 0,
                    numberOfOutputs: 1,
                    outputChannelCount: [2]
                })
                this.workletNode.port.onmessage = (event) => this.handleWorkletMessage(event)
                this.workletNode.connect(this.mGainNode)
                this.workletNode.port.postMessage({ type: 'set-active', active: false })

                if (this.realtimeNeedsReset)
                {
                    this.realtimeNeedsReset = false
                    this.resetRealtimeAfterCompile()
                }
            })
            .catch((error) =>
            {
                console.error('Failed to initialise AudioWorklet:', error)
            })
            .finally(() =>
            {
                this.workletInitPromise = null
            })
    },

    getRealtimeModuleUrl()
    {
        if (this.realtimeModuleUrl) return this.realtimeModuleUrl
        const blob = new Blob([createRealtimeProcessorSource()], { type: 'application/javascript' })
        this.realtimeModuleUrl = URL.createObjectURL(blob)
        return this.realtimeModuleUrl
    },

    destroyRealtimeChain()
    {
        if (this.workletNode !== null)
        {
            try
            {
                this.workletNode.port.postMessage({ type: 'flush' })
                this.workletNode.port.postMessage({ type: 'set-active', active: false })
            }
            catch (error)
            {
                console.warn('soundRenderer.destroyRealtimeChain flush failed:', error)
            }
            this.workletNode.disconnect()
            this.workletNode = null
        }
    },

    updateRealtimePreference(isRealtime)
    {
        if (isRealtime === undefined || isRealtime === null)
        {
            this.realtimePreference = true
        }
        else
        {
            this.realtimePreference = !!isRealtime
        }
        this.applyRealtimePreference()
    },

    applyRealtimePreference()
    {
        if (this.realtimePreference === this.realtimeMode) return
        this.setMode(this.realtimePreference)
    },

    setMode(isRealtime)
    {
        if (this.realtimeMode === isRealtime) return

        if (isRealtime)
        {
            this.stopOfflinePlayback()
        }
        else
        {
            this.stopRealtimePlayback()
        }

        this.realtimeMode = isRealtime
        this.ensureRenderingTargets()

        if (!this.ctx) return

        if (this.realtimeMode)
        {
            this.ensureRealtimeChain()
        }
        else
        {
            this.destroyRealtimeChain()
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    destroyContext()
    {
        console.log('soundRenderer.destroyContext')
        this.stopOfflinePlayback()
        this.stopRealtimePlayback()
        this.mGainNode.disconnect()
        this.mGainNode = null
        this.destroyRealtimeChain()
        if (this.ctx)
        {
            this.ctx.close()
        }

        this.mBuffer = null
        this.paused = true
        this.wave[0].style.height = '0px'
        this.wave[1].style.height = '0px'
        this.wave[2].style.height = '0px'
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    drawEQ()
    {
        if (ShaderBoy.buffers['Sound'].active === true && ShaderBoy.isPlaying === true)
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

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    mute()
    {
        if (!this.mGainNode) return
        this.mForceMuted = !this.mForceMuted
        if (this.mForceMuted)
        { this.mGainNode.gain.value = 0.0 }
        else
        { this.mGainNode.gain.value = 1.0 }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getCurrentTime()
    {
        return gui_timeline.currentFrame / 60
    },

    //https://stackoverflow.com/questions/11506180/web-audio-api-resume-from-pause
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    async play()
    {
        console.log('soundRenderer.play()')
        this.applyRealtimePreference()
        this.paused = false
        if (this.realtimeMode)
        {
            await this.startRealtimePlayback()
            if (this.paused)
            {
                this.stopRealtimePlayback()
            }
        }
        else
        {
            this.startOfflinePlayback()
        }
    },

    startOfflinePlayback()
    {
        if (!this.ctx || this.mBuffer === null) return
        this.stopOfflinePlayback()
        this.mPlayNode = this.ctx.createBufferSource()
        this.mPlayNode.buffer = this.mBuffer
        this.mPlayNode.loop = true
        this.mPlayNode.connect(this.mGainNode)
        this.mPlayNode.state = this.mPlayNode.noteOn
        this.mPlayNode.start(0, this.getCurrentTime())
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    async startRealtimePlayback()
    {
        if (!this.ctx) return
        this.ensureRealtimeChain()
        if (this.workletInitPromise !== null)
        {
            await this.workletInitPromise
        }
        if (this.workletNode === null) return

        const soundBuffer = ShaderBoy.buffers['Sound']
        if (!soundBuffer || soundBuffer.shader === null)
        {
            console.warn('soundRenderer.startRealtimePlayback(): sound shader is not ready.')
            this.realtimePlaying = false
            this.workletNode.port.postMessage({ type: 'set-active', active: false })
            return
        }

        this.realtimeCurrentSample = Math.max(0, Math.floor(this.getCurrentTime() * this.mSampleRate)) % this.mPlaySamples
        this.workletNode.port.postMessage({ type: 'flush' })
        this.workletNode.port.postMessage({ type: 'set-active', active: true })
        this.realtimePlaying = true
        this.primeRealtimeQueue(this.realtimePreRollChunks)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    async restart()
    {
        console.log('soundRenderer.restart()')
        this.stop()
        await this.play()
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    stop()
    {
        console.log('soundRenderer.stop()')
        if (this.realtimeMode)
        {
            this.stopRealtimePlayback()
        }
        else
        {
            this.stopOfflinePlayback()
        }
        this.paused = true
    },

    stopOfflinePlayback()
    {
        if (this.mPlayNode !== null)
        {
            try { this.mPlayNode.stop(0) } catch (error) { console.warn('soundRenderer.stopOfflinePlayback stop failed:', error) }
            this.mPlayNode.disconnect()
            this.mPlayNode = null
        }
    },

    stopRealtimePlayback()
    {
        this.realtimePlaying = false
        if (this.workletNode !== null)
        {
            try
            {
                this.workletNode.port.postMessage({ type: 'flush' })
                this.workletNode.port.postMessage({ type: 'set-active', active: false })
            }
            catch (error)
            {
                console.warn('soundRenderer.stopRealtimePlayback flush failed:', error)
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    pause()
    {
        if (this.paused) this.play()
        else this.stop()
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    render()
    {
        this.applyRealtimePreference()
        if (this.realtimeMode)
        {
            this.handleRealtimeRender()
        }
        else
        {
            this.handleOfflineRender()
        }
    },

    handleRealtimeRender()
    {
        if (!this.ctx)
        {
            return
        }

        this.ensureRenderingTargets()
        this.ensureRealtimeChain()

        if (this.workletInitPromise !== null || this.workletNode === null)
        {
            this.realtimeNeedsReset = true
            return
        }

        this.resetRealtimeAfterCompile()
    },

    resetRealtimeAfterCompile()
    {
        if (!this.workletNode) return
        this.workletNode.port.postMessage({ type: 'flush' })
        this.realtimeCurrentSample = Math.max(0, Math.floor(this.getCurrentTime() * this.mSampleRate))

        if (this.realtimePlaying)
        {
            this.workletNode.port.postMessage({ type: 'set-active', active: true })
            this.primeRealtimeQueue(this.realtimePreRollChunks)
        }
    },

    handleOfflineRender()
    {
        if (!this.ctx) return
        this.ensureRenderingTargets()
        this.renderSamplesToBuffer(0, this.mPlaySamples, this.bufL, this.bufR)
        this.stopOfflinePlayback()
    },

    renderSamplesInternal(startSample, totalSamples, writer)
    {
        const soundBuffer = ShaderBoy.buffers['Sound']
        if (!soundBuffer || soundBuffer.shader === null) return 0

        this.ensureRenderingTargets()

        const shader = soundBuffer.shader

        gl.viewport(0, 0, this.mTextureDimensions, this.mTextureDimensions)
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0)
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.bindTexture(gl.TEXTURE_2D, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)

        shader.begin()

        let produced = 0
        while (produced < totalSamples)
        {
            const passSamples = Math.min(this.mTmpBufferSamples, totalSamples - produced)
            const blockSample = startSample + produced

            shader.uniforms.iSampleRate = this.mSampleRate
            shader.uniforms.iBlockOffset = blockSample / this.mSampleRate
            shader.uniforms.iSoundTexSize = this.mTextureDimensions
            shader.setKnobsUniforms()
            shader.setSliderUniforms()
            shader.setMIDIUniforms()
            shader.setShadetoySoundShaderUniforms()
            shader.drawTexture(this.framebuffer, this.texture)
            gl.readPixels(0, 0, this.mTextureDimensions, this.mTextureDimensions, gl.RGBA, gl.UNSIGNED_BYTE, this.pixelBuffer)

            if (writer)
            {
                writer(passSamples, produced, startSample)
            }

            produced += passSamples
        }

        shader.end()

        return totalSamples
    },

    renderSamplesToBuffer(startSample, totalSamples, targetL, targetR)
    {
        if (!targetL || !targetR) return 0
        return this.renderSamplesInternal(startSample, totalSamples, (passSamples, produced, baseSample) =>
        {
            for (let i = 0; i < passSamples; i++)
            {
                const sampleIndex = baseSample + produced + i
                const pixelIndex = i * 4
                targetL[sampleIndex] = -1.0 + 2.0 * (this.pixelBuffer[pixelIndex] + 256.0 * this.pixelBuffer[pixelIndex + 1]) / 65535.0
                targetR[sampleIndex] = -1.0 + 2.0 * (this.pixelBuffer[pixelIndex + 2] + 256.0 * this.pixelBuffer[pixelIndex + 3]) / 65535.0
            }
        })
    },

    renderSamplesInterleaved(startSample, totalSamples)
    {
        const interleaved = new Float32Array(totalSamples * 2)
        const producedSamples = this.renderSamplesInternal(startSample, totalSamples, (passSamples, produced) =>
        {
            for (let i = 0; i < passSamples; i++)
            {
                const idx = produced + i
                const pixelIndex = i * 4
                interleaved[idx * 2] = -1.0 + 2.0 * (this.pixelBuffer[pixelIndex] + 256.0 * this.pixelBuffer[pixelIndex + 1]) / 65535.0
                interleaved[idx * 2 + 1] = -1.0 + 2.0 * (this.pixelBuffer[pixelIndex + 2] + 256.0 * this.pixelBuffer[pixelIndex + 3]) / 65535.0
            }
        })
        if (producedSamples === 0) return null
        return interleaved
    },

    generateRealtimeChunk()
    {
        if (!this.realtimePlaying || this.workletNode === null) return false
        const chunk = this.renderSamplesInterleaved(this.realtimeCurrentSample, this.mTmpBufferSamples)
        if (!chunk) return false
        try
        {
            this.workletNode.port.postMessage({ type: 'chunk', buffer: chunk.buffer }, [chunk.buffer])
            this.realtimeCurrentSample = (this.realtimeCurrentSample + this.mTmpBufferSamples) % this.mPlaySamples
            return true
        }
        catch (error)
        {
            console.error('soundRenderer.generateRealtimeChunk failed:', error)
            return false
        }
    },

    primeRealtimeQueue(count = 1)
    {
        if (!this.realtimePlaying) return
        for (let i = 0; i < count; i++)
        {
            if (!this.generateRealtimeChunk()) break
        }
    },

    handleWorkletMessage(event)
    {
        const data = event.data || {}
        if (data.type === 'request')
        {
            this.generateRealtimeChunk()
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    downloadWav(filename)
    {
        const resumeRealtime = this.realtimeMode && this.realtimePlaying
        if (resumeRealtime)
        {
            this.stopRealtimePlayback()
        }

        // Ensure buffer reflects the latest shader state before exporting.
        this.renderSamplesToBuffer(0, this.mPlaySamples, this.bufL, this.bufR)
        const blob = this.bufferToWave(this.mBuffer, this.mPlaySamples)
        const url = URL.createObjectURL(blob)
        this.fakeDownloadLink.href = url
        this.fakeDownloadLink.download = `${filename}.wav`
        this.fakeDownloadLink.click()
        URL.revokeObjectURL(url)

        if (resumeRealtime)
        {
            this.startRealtimePlayback().catch((error) =>
            {
                console.error('soundRenderer.downloadWav(): failed to resume realtime playback.', error)
            })
        }
    },

    // Convert an AudioBuffer to a Blob using WAVE representation
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    bufferToWave(abuffer, len)
    {
        const numOfChan = abuffer.numberOfChannels
        const length = len * numOfChan * 2 + 44
        const buffer = new ArrayBuffer(length)
        const view = new DataView(buffer)
        const channels = []

        let i, sample, offset = 0, pos = 0

        const setUint16 = (data) => { view.setUint16(pos, data, true); pos += 2 }
        const setUint32 = (data) => { view.setUint32(pos, data, true); pos += 4 }

        // write WAVE header
        setUint32(0x46464952);                         // "RIFF"
        setUint32(length - 8);                         // file length - 8
        setUint32(0x45564157);                         // "WAVE"

        setUint32(0x20746d66);                         // "fmt " chunk
        setUint32(16);                                 // length = 16
        setUint16(1);                                  // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(abuffer.sampleRate);
        setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        setUint16(numOfChan * 2);                      // block-align
        setUint16(16);                                 // 16-bit (hardcoded in this demo)

        setUint32(0x61746164);                         // "data" - chunk
        setUint32(length - pos - 4);                   // chunk length

        // write interleaved data
        for (i = 0; i < abuffer.numberOfChannels; i++)
        {
            channels.push(abuffer.getChannelData(i))
        }

        while (pos < length)
        {
            for (i = 0; i < numOfChan; i++)
            {             // interleave channels
                sample = Math.max(-1, Math.min(1, channels[i][offset])) // clamp
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0 // scale to 16-bit signed int
                view.setInt16(pos, sample, true)          // write 16-bit sample
                pos += 2
            }
            offset++                                     // next source sample
        }

        // create Blob
        return new Blob([buffer], { type: "audio/wav" })
    }

}
