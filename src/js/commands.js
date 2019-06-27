//   ___                                                   _       
//  (  _`\                                                ( )      
//  | ( (_)   _     ___ ___    ___ ___     _ _   ___     _| |  ___ 
//  | |  _  /'_`\ /' _ ` _ `\/' _ ` _ `\ /'_` )/' _ `\ /'_` |/',__)
//  | (_( )( (_) )| ( ) ( ) || ( ) ( ) |( (_| || ( ) |( (_| |\__, \
//  (____/'`\___/'(_) (_) (_)(_) (_) (_)`\__,_)(_) (_)`\__,_)(____/

import ShaderBoy from './shaderboy'
import key from 'keymaster'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/brace-fold'
import $ from 'jquery'
import CodeMirror from 'codemirror/lib/codemirror'
import gui_header from './gui/gui_header'
import gui_header_rec from './gui/gui_header_rec'
import gui_timeline from './gui/gui_timeline'
import gui_knobs from './gui/gui_knobs'
import gui_midi from './gui/gui_midi'
import gui_panel_shaderlist from './gui/gui_panel_shaderlist'
import gui_panel_textform from './gui/gui_panel_textform'
import gui_sidebar_ichannels from './gui/gui_sidebar_ichannels'

export default ShaderBoy.commands = {
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setPrevBuffer()
    {
        let codeEl = document.getElementById('code')
        codeEl.classList.add('code-container-mov-l')
        setTimeout(() =>
        {
            let codeEl = document.getElementById('code')
            codeEl.classList.remove('code-container-mov-l')
        }, 1000 * 0.2)
        console.log(codeEl.classList)
        ShaderBoy.editor.moveBuffer(1)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setNestBuffer()
    {
        let codeEl = document.getElementById('code')
        codeEl.classList.add('code-container-mov-l')
        setTimeout(() =>
        {
            let codeEl = document.getElementById('code')
            codeEl.classList.remove('code-container-mov-l')
        }, 1000 * 0.2)
        console.log(codeEl.classList)
        ShaderBoy.editor.moveBuffer(-1)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    pauseTimeline()
    {
        if (ShaderBoy.isRecording !== true)
        {
            ShaderBoy.isPlaying = !ShaderBoy.isPlaying
            if (ShaderBoy.buffers['Sound'].active)
            {
                ShaderBoy.soundRenderer.pause()
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    resetTimeline()
    {
        gui_timeline.reset()
        if (ShaderBoy.isRecording !== true && ShaderBoy.isPlaying)
        {
            if (ShaderBoy.buffers['Sound'].active)
            {
                ShaderBoy.soundRenderer.restart()
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    stopTimeline()
    {
        ShaderBoy.isPlaying = false
        gui_timeline.reset()
        if (ShaderBoy.isRecording !== true)
        {
            if (ShaderBoy.buffers['Sound'].active)
            {
                ShaderBoy.soundRenderer.stop()
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    incTextSize()
    {
        ShaderBoy.editor.incTextSize()
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    decTextSize()
    {
        ShaderBoy.editor.decTextSize()
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setResolution1()
    {
        ShaderBoy.renderScale = 1
        ShaderBoy.bufferManager.setFBOsProps()
        if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setResolution2()
    {
        ShaderBoy.renderScale = 2
        ShaderBoy.bufferManager.setFBOsProps()
        if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setResolution3()
    {
        ShaderBoy.renderScale = 3
        ShaderBoy.bufferManager.setFBOsProps()
        if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setResolution4()
    {
        ShaderBoy.renderScale = 4
        ShaderBoy.bufferManager.setFBOsProps()
        if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    compileShader()
    {
        ShaderBoy.bufferManager.buildShaderFromBuffers()
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    newShader()
    {
        if (ShaderBoy.runInDevMode)
        {
            alert('Oops! You are in test mode. Please reload this page and authorize.')
            return
        }

        document.getElementById("div-textarea").contentEditable = "true"
        gui_panel_textform.reset('New Shader Name', '', () =>
        {
            console.log(gui_panel_textform.result)
            ShaderBoy.io.newShader(gui_panel_textform.result)
        })
        let textformEl = document.getElementById('gp-textarea')
        let shaderlistEl = document.getElementById('gp-shader-list')
        if (textformEl.classList.contains('hide')) textformEl.classList.remove('hide')
        if (!shaderlistEl.classList.contains('hide')) shaderlistEl.classList.add('hide')
        ShaderBoy.isPlaying = false

        ShaderBoy.editor.codemirror.display.input.blur()
        key('esc', () =>
        {
            document.getElementById("div-textarea").contentEditable = "false"
            gui_panel_textform.reset('', () => { })
            ShaderBoy.isPlaying = true
            key.unbind('esc')
        })
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    forkShader()
    {
        // ShaderBoy.util.requestFullScreen()

        if (ShaderBoy.runInDevMode)
        {
            alert('Oops! You are in test mode. Please reload this page and authorize.')
            return
        }

        // "Set focus on div contenteditable element":
        // via: https://stackoverflow.com/questions/2388164/set-focus-on-div-contenteditable-element
        const form = document.getElementById("div-textarea")
        form.contentEditable = "true"
        setTimeout(() =>
        {
            form.focus();
        }, 0);

        gui_panel_textform.reset('Fork:', `${ShaderBoy.activeShaderName}:Forked`, () =>
        {
            console.log(gui_panel_textform.result)
            ShaderBoy.io.newShader(gui_panel_textform.result, true)
        })
        let textformEl = document.getElementById('gp-textarea')
        let shaderlistEl = document.getElementById('gp-shader-list')
        if (textformEl.classList.contains('hide')) textformEl.classList.remove('hide')
        if (!shaderlistEl.classList.contains('hide')) shaderlistEl.classList.add('hide')
        ShaderBoy.isPlaying = false

        ShaderBoy.editor.codemirror.display.input.blur()
        key('esc', () =>
        {
            document.getElementById("div-textarea").contentEditable = "false"
            gui_panel_textform.reset('', () => { })
            ShaderBoy.isPlaying = true
            key.unbind('esc')
        })
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    saveShader()
    {
        if (!ShaderBoy.runInDevMode)
        {
            ShaderBoy.io.saveShader()
        }
        else
        {
            alert('Oops! You are in test mode. Please reload this page and authorize.')
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    openShader()
    {
        if (ShaderBoy.runInDevMode)
        {
            alert('Oops! You are in test mode. Please reload this page and authorize.')
            return
        }

        gui_panel_shaderlist.show()

        key('esc', () =>
        {
            let textformEl = document.getElementById('gp-textarea')
            let shaderlistEl = document.getElementById('gp-shader-list')
            if (!textformEl.classList.contains('hide')) textformEl.classList.add('hide')
            if (!shaderlistEl.classList.contains('hide')) shaderlistEl.classList.add('hide')
            gui_panel_shaderlist.show()
            key.unbind('esc')
        })
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    switchInfo()
    {
        ShaderBoy.gui_header.switchInfo()
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    showKnobsPanel()
    {
        if (!ShaderBoy.isConcentrating)
        {
            document.getElementById('ctrl').classList.toggle('ctrl_hide')
            document.getElementById('ctrl-wrapper').classList.toggle('ctrl-wrapper_hide')
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    showAssetsPanel()
    {
        let leftSidebarEl = document.getElementById('gui-sidebar-left')
        if (leftSidebarEl.classList.contains('gsbl-container-hidden'))
        {
            leftSidebarEl.classList.remove('gsbl-container-hidden')
            leftSidebarEl.classList.remove('gsbl-container-hide')
            leftSidebarEl.classList.add('gsbl-container-appear')
        }
        else
        {
            if (leftSidebarEl.classList.contains('gsbl-container-appear'))
            {
                leftSidebarEl.classList.remove('gsbl-container-appear')
                leftSidebarEl.classList.add('gsbl-container-hide')
            }
            else if (leftSidebarEl.classList.contains('gsbl-container-hide'))
            {
                leftSidebarEl.classList.remove('gsbl-container-hide')
                leftSidebarEl.classList.add('gsbl-container-appear')
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    showTimeline()
    {
        if (!ShaderBoy.isConcentrating)
        {
            let tlel = document.getElementById('timeline')
            tlel.classList.toggle('tl_hide')
            document.querySelector('.CodeMirror').classList.toggle('expand-height')
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    hideEditor()
    {
        ShaderBoy.isEditorHide = !ShaderBoy.isEditorHide

        this.hdrEl = document.getElementById('gui-header')
        this.tlEl = document.getElementById('timeline')
        this.codeEl = document.getElementById('code')
        this.ctrlEl = document.getElementById('ctrl')
        this.isHdrElHidden = false
        this.isTlElHidden = false
        this.isCodeElHidden = false
        this.isCtrlElHidden = false

        if (this.ctrlEl.classList.contains('ctrl_hide'))
        {
            this.isCtrlElHidden = true
        }
        this.ctrlEl.classList.add('ctrl_hide')

        let ms = (this.isCtrlElHidden) ? 0 : 400
        setTimeout(() =>
        {
            if (this.hdrEl.classList.contains('hdr_hide'))
            {
                this.isHdrElHidden = true
            }
            this.hdrEl.classList.add('hdr_hide')

            if (this.tlEl.classList.contains('tl_hide'))
            {
                this.isTlElHidden = true
            }
            this.tlEl.classList.add('tl_hide')

            if (this.codeEl.classList.contains('code_hide'))
            {
                this.isCodeElHidden = true
            }
            this.codeEl.classList.add('code_hide')

            ShaderBoy.editor.codemirror.display.input.blur()

            key('ctrl+1', () =>
            {
                ShaderBoy.renderScale = 1
                ShaderBoy.bufferManager.setFBOsProps()
                if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
            })
            key('ctrl+2', () =>
            {
                ShaderBoy.renderScale = 2
                ShaderBoy.bufferManager.setFBOsProps()
                if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
            })
            key('ctrl+3', () =>
            {
                ShaderBoy.renderScale = 3
                ShaderBoy.bufferManager.setFBOsProps()
                if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
            })
            key('ctrl+4', () =>
            {
                ShaderBoy.renderScale = 4
                ShaderBoy.bufferManager.setFBOsProps()
                if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
            })
            key('⌥+up', () =>
            {
                if (ShaderBoy.isRecording !== true)
                {
                    ShaderBoy.isPlaying = !ShaderBoy.isPlaying
                }
            })
            key('⌥+down', () =>
            {
                if (ShaderBoy.isRecording !== true)
                {
                }
            })

            let hide = () =>
            {
                if (!this.isHdrElHidden)
                {
                    this.hdrEl.classList.remove('hdr_hide')
                }

                if (!this.isTlElHidden)
                {
                    this.tlEl.classList.remove('tl_hide')
                }

                if (!this.isCodeElHidden)
                {
                    this.codeEl.classList.remove('code_hide')
                }

                if (!this.isCtrlElHidden)
                {
                    let ms = 400
                    setTimeout(() =>
                    {
                        this.ctrlEl.classList.remove('ctrl_hide')
                    }, ms)
                }

                ShaderBoy.editor.codemirror.focus()
                key.unbind('⌘+⇧+⌥+h', 'ctrl+⇧+⌥+h')
                key.unbind('ctrl+1')
                key.unbind('ctrl+2')
                key.unbind('ctrl+3')
                key.unbind('ctrl+4')
                key.unbind('⌥+up')
                key.unbind('⌥+down')
                if (ShaderBoy.OS === 'iOS' || ShaderBoy.OS === 'Android')
                {
                    key.unbind('⌥+h')
                }
            }
            key('⌘+⇧+⌥+h', hide)
            key('ctrl+⇧+⌥+h', hide)
            if (ShaderBoy.OS === 'iOS' || ShaderBoy.OS === 'Android')
            {
                key('⌥+h', hide)
            }
        }
            , ms)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    hideCanvas()
    {
        ShaderBoy.isConcentrating = !ShaderBoy.isConcentrating

        this.tlEl = document.getElementById('timeline')
        this.ctrlEl = document.getElementById('ctrl')

        if (ShaderBoy.isConcentrating)
        {
            ShaderBoy.isPlaying = false
            ShaderBoy.isEditorHide = false
            ShaderBoy.canvas.style.opacity = '0.0'
            $('.cm-s-3024-monotone span').css('background', '#1e1e1e00')
            $('.cm-s-3024-monotone .CodeMirror-code').toggleClass('concentrating')
            $('.cm-s-3024-monotone').toggleClass('color')

            this.isCtrlElHidden = false
            this.isTlElHidden = false

            if (this.ctrlEl.classList.contains('ctrl_hide'))
            {
                this.isCtrlElHidden = true
            }
            this.ctrlEl.classList.add('ctrl_hide')
            document.getElementById('ctrl-wrapper').classList.add('ctrl-wrapper_hide')

            if (this.tlEl.classList.contains('tl_hide'))
            {
                this.isTlElHidden = true
            }
            this.tlEl.classList.add('tl_hide')
        }
        else
        {
            ShaderBoy.isPlaying = true
            ShaderBoy.canvas.style.opacity = '1.0'
            $('.cm-s-3024-monotone span').css('background', '#1e1e1eFF')
            $('.cm-s-3024-monotone .CodeMirror-code').toggleClass('concentrating')
            $('.cm-s-3024-monotone').toggleClass('color')

            if (!this.isTlElHidden)
            {
                this.tlEl.classList.remove('tl_hide')
            }

            if (!this.isCtrlElHidden)
            {
                this.ctrlEl.classList.remove('ctrl_hide')
                document.getElementById('ctrl-wrapper').classList.remove('ctrl-wrapper_hide')
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    showRecordingHeader()
    {
        this.recEl = document.getElementById('ghdr-rec-base')
        this.tlEl = document.getElementById('timeline')
        this.codeEl = document.getElementById('code')
        this.ctrlEl = document.getElementById('ctrl')
        document.getElementById('res-x').value = ShaderBoy.canvas.width
        document.getElementById('res-y').value = ShaderBoy.canvas.height

        this.isTlElHidden = false
        this.isCodeElHidden = false
        this.isCtrlElHidden = false
        this.isPlaying = false
        this.recEl.classList.remove('rec_hide')

        if (this.ctrlEl.classList.contains('ctrl_hide'))
        {
            this.isCtrlElHidden = true
        }
        this.ctrlEl.classList.add('ctrl_hide')

        let ms = (this.isCtrlElHidden) ? 0 : 400

        setTimeout(() =>
        {
            if (this.tlEl.classList.contains('tl_hide'))
            {
                this.isTlElHidden = true
            }
            this.tlEl.classList.remove('tl_hide')

            if (this.codeEl.classList.contains('code_hide'))
            {
                this.isCodeElHidden = true
            }
            this.codeEl.classList.add('code_hide')

            ShaderBoy.editor.codemirror.display.input.blur()

            let isPlaying = ShaderBoy.isPlaying
            ShaderBoy.isPlaying = false
            gui_timeline.reset()

            if (ShaderBoy.buffers['Sound'].active)
            {
                ShaderBoy.soundRenderer.stop()
            }

            key('ctrl+1', () =>
            {
                ShaderBoy.renderScale = 1
                ShaderBoy.bufferManager.setFBOsProps()
                if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
            })
            key('ctrl+2', () =>
            {
                ShaderBoy.renderScale = 2
                ShaderBoy.bufferManager.setFBOsProps()
                if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
            })
            key('ctrl+3', () =>
            {
                ShaderBoy.renderScale = 3
                ShaderBoy.bufferManager.setFBOsProps()
                if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
            })
            key('ctrl+4', () =>
            {
                ShaderBoy.renderScale = 4
                ShaderBoy.bufferManager.setFBOsProps()
                if (ShaderBoy.isPlaying !== true) ShaderBoy.forceDraw = true
            })
            key('⌥+up', () =>
            {
                if (ShaderBoy.isRecording !== true)
                {
                    ShaderBoy.isPlaying = !ShaderBoy.isPlaying
                }
            })
            key('⌥+down', () =>
            {
                if (ShaderBoy.isRecording !== true)
                {
                }
            })
            let toEditorMode = () =>
            {
                this.recEl.classList.add('rec_hide')

                if (this.isTlElHidden)
                {
                    this.tlEl.classList.add('tl_hide')
                }

                if (!this.isCodeElHidden)
                {
                    this.codeEl.classList.remove('code_hide')
                }

                if (!this.isCtrlElHidden)
                {
                    let ms = 400
                    setTimeout(() =>
                    {
                        this.ctrlEl.classList.remove('ctrl_hide')
                    }, ms)
                }

                ShaderBoy.isPlaying = isPlaying

                if (ShaderBoy.buffers['Sound'].active && isPlaying)
                {
                    ShaderBoy.soundRenderer.restart()
                }

                ShaderBoy.editor.codemirror.focus()
                key.unbind('⌘+⇧+⌥+r', 'ctrl+⇧+⌥+r')
                key.unbind('ctrl+1')
                key.unbind('ctrl+2')
                key.unbind('ctrl+3')
                key.unbind('ctrl+4')
                key.unbind('⌥+up')
                key.unbind('⌥+down')
            }
            key('⌘+⇧+⌥+r', toEditorMode)
            key('ctrl+⇧+⌥+r', toEditorMode)
        }, ms)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    mute()
    {
        if (ShaderBoy.buffers['Sound'].active)
        {
            ShaderBoy.soundRenderer.mute()
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    formatCode(cm)
    {
        const getSelectedRange = () =>
        {
            return {
                from: cm.getCursor(true),
                to: cm.getCursor(false),
            }
        }
        const range = getSelectedRange()
        cm.autoFormatRange(range.from, range.to)
    }
}