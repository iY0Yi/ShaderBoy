// comment out on codepen.
import ShaderBoy from '../shaderboy'

// comment out on ShaderBoy.
// console.clear()
// let ShaderBoy = {
//     isPlaying: true,
//     uniforms: {
//         iTime: 0,
//         iFrame: 0
//     }
// }

const isTest = false; // set "true" on codepen.

export default ShaderBoy.gui_midi = { // comment out on codepen.
    // ShaderBoy.gui_midi = {  // comment out on ShaderBoy.
    // "Web MIDI API Example" by Rumyra:
    // https://codepen.io/Rumyra/pen/NxdbzL
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setup()
    {
        // start talking to MIDI controller
        if (navigator.requestMIDIAccess)
        {
            navigator.requestMIDIAccess({
                sysex: false
            }).then(this.onSuccess, this.onFailure)
        } else
        {
            console.warn("No MIDI support in your browser")
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    onSuccess(midi)
    {
        const allInputs = midi.inputs.values()
        // loop over all available inputs and listen for any MIDI input
        for (let input = allInputs.next(); input && !input.done; input = allInputs.next())
        {
            // when a MIDI value is received call the onMIDIMessage function
            input.value.onmidimessage = ShaderBoy.gui.gotMessage
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    onFailure()
    {
        console.warn("Not recognising MIDI controller")
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    gotMessage(e)
    {
        // "midigui" by pqml:
        // https://github.com/pqml/midigui/blob/b2739d972fa2522f988ea96e9ddc7fce2054c882/build/midigui.js
        const cmd = e.data[0] >> 4
        function message(channel, pitch, velocity)
        {
            return {
                channel: channel,
                pitch: pitch,
                velocity: (velocity / 127).toFixed(3)
            }
        }
        const msg = message(e.data[0] & 0xf, e.data[1], e.data[2])
        let data = { 'name': null, 'value': null }
        if (cmd === 8 || cmd === 9 && msg.velocity === 0)
        {
            // noteOff
            data.name = 'midi_n' + msg.pitch
            data.value = msg.velocity
        } else if (cmd === 9)
        {
            // noteOn
            data.name = 'midi_n' + msg.pitch
            data.value = msg.velocity
        } else if (cmd === 11)
        {
            // controller message
            data.name = 'midi_c' + msg.pitch
            data.value = msg.velocity
        } else
        {
            // sysex or other
            data.name = 'midi_s' + msg.pitch
            data.value = msg.velocity
        }

        if (ShaderBoy.gui.midis === null)
        {
            ShaderBoy.gui.midis = {}
        }

        if (ShaderBoy.gui.midis !== null && ShaderBoy.gui.midis[data.name] !== undefined)
        {
            ShaderBoy.gui.midis[data.name] = data.value
        }
        ShaderBoy.forceDraw = (ShaderBoy.isPlaying !== true)

        ShaderBoy.gui_header.setStatus('suc3', 'MIDI: ' + data.name + ' = ' + data.value, 3000)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    collectUniforms()
    {
        let midiUniformNames = []
        for (const name in ShaderBoy.buffers)
        {
            if (name !== 'Config' && name !== 'Setting' && ShaderBoy.buffers[name].active)
            {
                const srctxt = ShaderBoy.buffers[name].cm.getValue()
                let midi_c = srctxt.match(/midi_c\d+/g)
                midiUniformNames = midiUniformNames.concat(midi_c)
                let midi_n = srctxt.match(/midi_n\d+/g)
                midiUniformNames = midiUniformNames.concat(midi_n)
            }
        }
        midiUniformNames = Array.from(new Set(midiUniformNames))
        midiUniformNames = midiUniformNames.filter(function (a)
        {
            return a !== null
        })

        ShaderBoy.gui.midis = null
        ShaderBoy.gui.midiUniformFS = '\n'

        if (midiUniformNames.length >= 0)
        {
            ShaderBoy.gui.midis = {}

            for (let i = 0; i < midiUniformNames.length; i++)
            {
                const name = midiUniformNames[i]
                ShaderBoy.gui.midis[name] = 0.0
                ShaderBoy.gui.midiUniformFS += 'uniform float ' + name + ';\n'
            }
        }
    }
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
if (isTest)
{
    ShaderBoy.gui_midi.setup(true)
}