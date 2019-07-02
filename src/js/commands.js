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
        const codeEl = document.getElementById('code')
        codeEl.classList.add('code-container-mov-l')
        setTimeout(() =>
        {
            const codeEl = document.getElementById('code')
            codeEl.classList.remove('code-container-mov-l')
        }, 1000 * 0.2)
        console.log(codeEl.classList)
        ShaderBoy.editor.moveBuffer(1)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setNextBuffer()
    {
        const codeEl = document.getElementById('code')
        codeEl.classList.add('code-container-mov-l')
        setTimeout(() =>
        {
            const codeEl = document.getElementById('code')
            codeEl.classList.remove('code-container-mov-l')
        }, 1000 * 0.2)
        console.log(codeEl.classList)
        ShaderBoy.editor.moveBuffer(-1)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    pauseResumeTimeline()
    {
        if (!ShaderBoy.isCanvasHidden)
        {
            if (!ShaderBoy.isRecording)
            {
                ShaderBoy.isPlaying = !ShaderBoy.isPlaying
                if (ShaderBoy.buffers['Sound'].active)
                {
                    ShaderBoy.soundRenderer.pause()
                }
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    pauseTimeline()
    {
        if (!ShaderBoy.isCanvasHidden)
        {
            if (!ShaderBoy.isRecording)
            {
                ShaderBoy.isPlaying = false
                if (ShaderBoy.buffers['Sound'].active)
                {
                    ShaderBoy.soundRenderer.stop()
                }
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    playTimeline()
    {
        if (!ShaderBoy.isCanvasHidden)
        {
            if (!ShaderBoy.isRecording)
            {
                ShaderBoy.isPlaying = true
                if (ShaderBoy.buffers['Sound'].active)
                {
                    ShaderBoy.soundRenderer.play()
                }
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    resetTimeline()
    {
        if (!ShaderBoy.isCanvasHidden)
        {
            gui_timeline.reset()
            if (ShaderBoy.isRecording !== true && ShaderBoy.isPlaying)
            {
                if (ShaderBoy.buffers['Sound'].active)
                {
                    ShaderBoy.soundRenderer.restart()
                }
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    stopTimeline()
    {
        if (!ShaderBoy.isCanvasHidden)
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
        if (ShaderBoy.isTrialMode)
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
        const textformEl = document.getElementById('gp-textarea')
        const shaderlistEl = document.getElementById('gp-shader-list')
        if (textformEl.classList.contains('hide')) textformEl.classList.remove('hide')
        if (!shaderlistEl.classList.contains('hide')) shaderlistEl.classList.add('hide')
        ShaderBoy.commands.pauseTimeline()

        ShaderBoy.editor.codemirror.display.input.blur()
        key('esc', () =>
        {
            document.getElementById("div-textarea").contentEditable = "false"
            gui_panel_textform.reset('', () => { })
            ShaderBoy.commands.playTimeline()
            key.unbind('esc')
        })
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    forkShader()
    {
        if (ShaderBoy.isTrialMode)
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
        const textformEl = document.getElementById('gp-textarea')
        const shaderlistEl = document.getElementById('gp-shader-list')
        if (textformEl.classList.contains('hide')) textformEl.classList.remove('hide')
        if (!shaderlistEl.classList.contains('hide')) shaderlistEl.classList.add('hide')
        ShaderBoy.commands.pauseTimeline()

        ShaderBoy.editor.codemirror.display.input.blur()
        key('esc', () =>
        {
            document.getElementById("div-textarea").contentEditable = "false"
            gui_panel_textform.reset('', () => { })
            ShaderBoy.commands.playTimeline()
            key.unbind('esc')
        })
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    saveShader()
    {
        if (!ShaderBoy.isTrialMode)
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
        if (ShaderBoy.isTrialMode)
        {
            alert('Oops! You are in test mode. Please reload this page and authorize.')
            return
        }

        const isPlaying = ShaderBoy.isPlaying
        if (isPlaying)
        {
            ShaderBoy.commands.pause()
        }
        gui_panel_shaderlist.show()

        key('esc', () =>
        {
            const textformEl = document.getElementById('gp-textarea')
            const shaderlistEl = document.getElementById('gp-shader-list')
            if (!textformEl.classList.contains('hide')) textformEl.classList.add('hide')
            if (!shaderlistEl.classList.contains('hide')) shaderlistEl.classList.add('hide')
            if (isPlaying)
            {
                ShaderBoy.commands.pause()
            }
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
        if (!ShaderBoy.isCanvasHidden)
        {
            document.getElementById('ctrl').classList.toggle('ctrl_hide')
            document.getElementById('ctrl-wrapper').classList.toggle('ctrl-wrapper_hide')
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    showAssetsPanel()
    {
        const leftSidebarEl = document.getElementById('gui-sidebar-left')
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
        if (!ShaderBoy.isCanvasHidden)
        {
            const tlel = document.getElementById('timeline')
            tlel.classList.toggle('tl_hide')
            document.querySelector('.CodeMirror').classList.toggle('expand-height')
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    hideEditor()
    {
        if (!ShaderBoy.isCanvasHidden)
        {
            ShaderBoy.isEditorHidden = !ShaderBoy.isEditorHidden

            const hdrEl = document.getElementById('gui-header')
            const tlEl = document.getElementById('timeline')
            const codeEl = document.getElementById('code')
            const ctrlEl = document.getElementById('ctrl')
            ShaderBoy.isHeaderHidden = false
            ShaderBoy.isTimelineHidden = false
            ShaderBoy.isCodePaneHidden = false
            ShaderBoy.isKnobsHidden = false

            if (ctrlEl.classList.contains('ctrl_hide'))
            {
                ShaderBoy.isKnobsHidden = true
            }
            ctrlEl.classList.add('ctrl_hide')

            const ms = (ShaderBoy.isKnobsHidden) ? 0 : 400
            setTimeout(() =>
            {
                if (hdrEl.classList.contains('hdr_hide'))
                {
                    ShaderBoy.isHeaderHidden = true
                }
                hdrEl.classList.add('hdr_hide')

                if (tlEl.classList.contains('tl_hide'))
                {
                    ShaderBoy.isTimelineHidden = true
                }
                tlEl.classList.add('tl_hide')

                if (codeEl.classList.contains('code_hide'))
                {
                    ShaderBoy.isCodePaneHidden = true
                }
                codeEl.classList.add('code_hide')

                ShaderBoy.editor.codemirror.display.input.blur()

                key('ctrl+1', () =>
                {
                    ShaderBoy.commands.setResolution1()
                })
                key('ctrl+2', () =>
                {
                    ShaderBoy.commands.setResolution2()
                })
                key('ctrl+3', () =>
                {
                    ShaderBoy.commands.setResolution3()
                })
                key('ctrl+4', () =>
                {
                    ShaderBoy.commands.setResolution4()
                })
                key('⌥+up', () =>
                {
                    ShaderBoy.commands.pauseResumeTimeline()

                })
                key('⌥+down', () =>
                {
                    ShaderBoy.commands.resetTimeline()
                })

                const hide = () =>
                {
                    if (!ShaderBoy.isHeaderHidden)
                    {
                        hdrEl.classList.remove('hdr_hide')
                    }

                    if (!ShaderBoy.isTimelineHidden)
                    {
                        tlEl.classList.remove('tl_hide')
                    }

                    if (!ShaderBoy.isCodePaneHidden)
                    {
                        codeEl.classList.remove('code_hide')
                    }

                    if (!ShaderBoy.isKnobsHidden)
                    {
                        const ms = 400
                        setTimeout(() =>
                        {
                            ctrlEl.classList.remove('ctrl_hide')
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
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    hideCanvas()
    {
        const tlEl = document.getElementById('timeline')
        const ctrlEl = document.getElementById('ctrl')

        if (!ShaderBoy.isCanvasHidden)
        {
            ShaderBoy.commands.pauseTimeline()
            ShaderBoy.isEditorHidden = false

            ShaderBoy.isKnobsHidden = false
            ShaderBoy.isTimelineHidden = false

            ShaderBoy.canvas.style.opacity = '0.0'
            $('.cm-s-3024-monotone span').css('background', '#1e1e1e00')
            $('.cm-s-3024-monotone .CodeMirror-code').toggleClass('concentrating')
            $('.cm-s-3024-monotone').toggleClass('color')

            if (ctrlEl.classList.contains('ctrl_hide'))
            {
                ShaderBoy.isKnobsHidden = true
            }
            ctrlEl.classList.add('ctrl_hide')
            document.getElementById('ctrl-wrapper').classList.add('ctrl-wrapper_hide')

            if (tlEl.classList.contains('tl_hide'))
            {
                ShaderBoy.isTimelineHidden = true
            }
            tlEl.classList.add('tl_hide')
            ShaderBoy.isCanvasHidden = true
        }
        else
        {
            ShaderBoy.isCanvasHidden = false
            ShaderBoy.commands.playTimeline()
            ShaderBoy.canvas.style.opacity = '1.0'
            $('.cm-s-3024-monotone span').css('background', '#1e1e1eFF')
            $('.cm-s-3024-monotone .CodeMirror-code').toggleClass('concentrating')
            $('.cm-s-3024-monotone').toggleClass('color')

            if (!ShaderBoy.isTimelineHidden)
            {
                tlEl.classList.remove('tl_hide')
            }

            if (!ShaderBoy.isKnobsHidden)
            {
                ctrlEl.classList.remove('ctrl_hide')
                document.getElementById('ctrl-wrapper').classList.remove('ctrl-wrapper_hide')
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    showRecordingHeader()
    {
        if (!ShaderBoy.isCanvasHidden)
        {
            const recEl = document.getElementById('ghdr-rec-base')
            const tlEl = document.getElementById('timeline')
            const codeEl = document.getElementById('code')
            const ctrlEl = document.getElementById('ctrl')
            document.getElementById('res-x').value = ShaderBoy.canvas.width
            document.getElementById('res-y').value = ShaderBoy.canvas.height

            let isTimelineHidden = false
            let isCodePaneHidden = false
            let isKnobsHidden = false

            recEl.classList.remove('rec_hide')

            if (ctrlEl.classList.contains('ctrl_hide'))
            {
                isKnobsHidden = true
            }
            ctrlEl.classList.add('ctrl_hide')

            const ms = (isKnobsHidden) ? 0 : 400

            setTimeout(() =>
            {
                if (tlEl.classList.contains('tl_hide'))
                {
                    isTimelineHidden = true
                }
                tlEl.classList.remove('tl_hide')

                if (codeEl.classList.contains('code_hide'))
                {
                    isCodePaneHidden = true
                }
                codeEl.classList.add('code_hide')

                ShaderBoy.editor.codemirror.display.input.blur()

                const wasPlaying = ShaderBoy.isPlaying
                ShaderBoy.commands.stopTimeline()

                key('ctrl+1', () =>
                {
                    ShaderBoy.commands.setResolution1()
                })
                key('ctrl+2', () =>
                {
                    ShaderBoy.commands.setResolution2()
                })
                key('ctrl+3', () =>
                {
                    ShaderBoy.commands.setResolution3()
                })
                key('ctrl+4', () =>
                {
                    ShaderBoy.commands.setResolution4()
                })
                key('⌥+up', () =>
                {
                    ShaderBoy.commands.pauseResumeTimeline()
                })
                key('⌥+down', () =>
                {
                    ShaderBoy.commands.resetTimeline()
                })

                const toEditorMode = () =>
                {
                    recEl.classList.add('rec_hide')

                    if (isTimelineHidden)
                    {
                        tlEl.classList.add('tl_hide')
                    }

                    if (!isCodePaneHidden)
                    {
                        codeEl.classList.remove('code_hide')
                    }

                    if (!isKnobsHidden)
                    {
                        const ms = 400
                        setTimeout(() =>
                        {
                            ctrlEl.classList.remove('ctrl_hide')
                        }, ms)
                    }

                    if (wasPlaying)
                    {
                        ShaderBoy.commands.resetTimeline()
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
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    fullScreen()
    {
        const element = document.body
        // Supports most browsers and their versions.
        const requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen

        if (requestMethod)
        {
            // Native full screen.
            requestMethod.call(element)
        }
        else if (typeof window.ActiveXObject !== "undefined")
        {
            // Older IE.
            const wscript = new ActiveXObject("WScript.Shell")
            if (wscript !== null)
            {
                wscript.SendKeys("{F11}")
            }
        }
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