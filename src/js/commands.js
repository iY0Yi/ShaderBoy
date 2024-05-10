//   ___                                                   _
//  (  _`\                                                ( )
//  | ( (_)   _     ___ ___    ___ ___     _ _   ___     _| |  ___
//  | |  _  /'_`\ /' _ ` _ `\/' _ ` _ `\ /'_` )/' _ `\ /'_` |/',__)
//  | (_( )( (_) )| ( ) ( ) || ( ) ( ) |( (_| || ( ) |( (_| |\__, \
//  (____/'`\___/'(_) (_) (_)(_) (_) (_)`\__,_)(_) (_)`\__,_)(____/

import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter'
import $ from 'jquery'
import key from 'keymaster'
import gui_panel_shaderlist from './gui/gui_panel_shaderlist'
import gui_panel_textform from './gui/gui_panel_textform'
import gui_timeline from './gui/gui_timeline'
import ShaderBoy from './shaderboy'

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
        ShaderBoy.forceDraw = !ShaderBoy.isPlaying
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setResolution2()
    {
        ShaderBoy.renderScale = 2
        ShaderBoy.bufferManager.setFBOsProps()
        ShaderBoy.forceDraw = !ShaderBoy.isPlaying
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setResolution3()
    {
        ShaderBoy.renderScale = 3
        ShaderBoy.bufferManager.setFBOsProps()
        ShaderBoy.forceDraw = !ShaderBoy.isPlaying
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setResolution4()
    {
        ShaderBoy.renderScale = 4
        ShaderBoy.bufferManager.setFBOsProps()
        ShaderBoy.forceDraw = !ShaderBoy.isPlaying
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

        // "Set focus on div contenteditable element":
        // via: https://stackoverflow.com/questions/2388164/set-focus-on-div-contenteditable-element
        const form = document.getElementById("div-textarea")
        form.contentEditable = "true"
        setTimeout(() =>
        {
            form.focus();
        }, 0);

        gui_panel_textform.reset('New Shader Name', '', () =>
        {
            console.log(gui_panel_textform.result)
            ShaderBoy.io.newShader(gui_panel_textform.result, false)
        })
        const textformEl = document.getElementById('gp-textarea')
        const shaderlistEl = document.getElementById('gp-shader-list')
        if (textformEl.classList.contains('hide')) textformEl.classList.remove('hide')
        if (!shaderlistEl.classList.contains('hide')) shaderlistEl.classList.add('hide')
        ShaderBoy.commands.pauseTimeline()

        ShaderBoy.editor.codemirror.display.input.blur()
        key('esc', 'default', () =>
        {
            document.getElementById("div-textarea").contentEditable = "false"
            gui_panel_textform.reset('', '', () => { })
            ShaderBoy.commands.playTimeline()
            key.unbind('esc', 'default')
        })
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    toggleFullscreen()
    {
        if(ShaderBoy.OS === 'Android')
        {
            if(!document.fullscreenElement) {
                document.documentElement.requestFullscreen()
            }
        }
        else
        {
            if(!document.fullscreenElement) {
                document.documentElement.requestFullscreen()
            }else if(document.exitFullscreen) {
                document.exitFullscreen()
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    importShader()
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

        gui_panel_textform.reset('Shader ID', '', () =>
        {
            console.log(gui_panel_textform.result)
            const shaderID = gui_panel_textform.result;
            const apiKey = 'fdrtwW';
            const url = `https://www.shadertoy.com/api/v1/shaders/${shaderID}?key=${apiKey}`;
            console.log('url: ', url)

            fetch(url)
                .then(response => response.json()) // レスポンスのJSONを解析
                .then(data => {
                    console.log(data); // 取得したシェーダのデータをコンソールに表示
                })
                .catch(error => {
                    console.error('Error fetching data:', error); // エラーハンドリング
                });

            // ShaderBoy.io.newShader(gui_panel_textform.result, false)
        })
        const textformEl = document.getElementById('gp-textarea')
        const shaderlistEl = document.getElementById('gp-shader-list')
        if (textformEl.classList.contains('hide')) textformEl.classList.remove('hide')
        if (!shaderlistEl.classList.contains('hide')) shaderlistEl.classList.add('hide')
        ShaderBoy.commands.pauseTimeline()

        ShaderBoy.editor.codemirror.display.input.blur()
        key('esc', 'default', () =>
        {
            document.getElementById("div-textarea").contentEditable = "false"
            gui_panel_textform.reset('', () => { })
            ShaderBoy.commands.playTimeline()
            key.unbind('esc', 'default')
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
        key('esc', 'default', () =>
        {
            document.getElementById("div-textarea").contentEditable = "false"
            gui_panel_textform.reset('', () => { })
            ShaderBoy.commands.playTimeline()
            key.unbind('esc', 'default')
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

        const wasPlaying = ShaderBoy.isPlaying
        ShaderBoy.commands.pauseTimeline()
        gui_panel_shaderlist.show()
        key('d', 'default', ShaderBoy.commands.sortByDate)
        key('n', 'default', ShaderBoy.commands.sortByName)

        key('esc', 'default', () =>
        {
            const textformEl = document.getElementById('gp-textarea')
            const shaderlistEl = document.getElementById('gp-shader-list')
            if (!textformEl.classList.contains('hide')) textformEl.classList.add('hide')
            if (!shaderlistEl.classList.contains('hide')) shaderlistEl.classList.add('hide')
            if (wasPlaying)
            {
                ShaderBoy.commands.playTimeline()
            }
            gui_panel_shaderlist.show()
            key.unbind('d', 'default')
            key.unbind('n', 'default')
            key.unbind('esc', 'default')
        })
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    sortByName()
    {
        ShaderBoy.gui_panel_shaderlist.sortBy = 'name'
        ShaderBoy.gui_panel_shaderlist.sort()
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    sortByDate()
    {
        ShaderBoy.gui_panel_shaderlist.sortBy = 'date'
        ShaderBoy.gui_panel_shaderlist.sort()
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    switchInfo()
    {
        if (!ShaderBoy.isCanvasHidden)
        {
            ShaderBoy.gui_header.switchInfo()
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    showInfoName()
    {
        ShaderBoy.gui_header.showInfoName()
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    showInfoFPS()
    {
        ShaderBoy.gui_header.showInfoFPS()
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
            ShaderBoy.isEditorHidden = true

            const hdrEl = document.getElementById('gui-header')
            const tlEl = document.getElementById('timeline')
            const codeEl = document.getElementById('code')
            const ctrlEl = document.getElementById('ctrl')
            ShaderBoy.isHeaderHidden = false
            ShaderBoy.isTimelineHidden = false
            ShaderBoy.isCodePaneHidden = false
            ShaderBoy.isKnobsHidden = false

            ShaderBoy.isKnobsHidden = (ctrlEl.classList.contains('ctrl_hide'))

            ctrlEl.classList.add('ctrl_hide')

            const ms = (ShaderBoy.isKnobsHidden) ? 0 : 400
            setTimeout(() =>
            {
                ShaderBoy.isHeaderHidden = (hdrEl.classList.contains('hdr_hide'))
                hdrEl.classList.add('hdr_hide')

                ShaderBoy.isTimelineHidden = (tlEl.classList.contains('tl_hide'))
                tlEl.classList.add('tl_hide')

                ShaderBoy.isCodePaneHidden = (codeEl.classList.contains('code_hide'))
                codeEl.classList.add('code_hide')

                ShaderBoy.editor.codemirror.display.input.blur()
            }
            , ms)
            key.setScope('editor_hidden');
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    showEditor()
    {
        const hdrEl = document.getElementById('gui-header')
        const tlEl = document.getElementById('timeline')
        const codeEl = document.getElementById('code')
        const ctrlEl = document.getElementById('ctrl')
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

        ShaderBoy.isEditorHidden = false
        ShaderBoy.editor.codemirror.focus()
        key.setScope('default')
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

            if (!ShaderBoy.isTimelineHidden)
            {
                ShaderBoy.commands.showTimeline()
            }

            ShaderBoy.commands.showInfoName()

            ShaderBoy.isCanvasHidden = true
        }
        else
        {
            ShaderBoy.isCanvasHidden = false
            ShaderBoy.commands.showInfoFPS()
            ShaderBoy.commands.playTimeline()
            ShaderBoy.canvas.style.opacity = '1.0'
            $('.cm-s-3024-monotone span').css('background', '#1e1e1eFF')
            $('.cm-s-3024-monotone .CodeMirror-code').toggleClass('concentrating')
            $('.cm-s-3024-monotone').toggleClass('color')

            if (!ShaderBoy.isTimelineHidden)
            {
                ShaderBoy.commands.showTimeline()
            }

            if (!ShaderBoy.isKnobsHidden)
            {
                ctrlEl.classList.remove('ctrl_hide')
                document.getElementById('ctrl-wrapper').classList.remove('ctrl-wrapper_hide')
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    toggleSplitView()
    {
        console.log('toggleSplitView()')
        $('.cm-s-3024-monotone').toggleClass('color')
        $('#gui-header').toggleClass('splited')
        $('#gl_canvas').toggleClass('splited')
        $('.code-container').toggleClass('splited')
        ShaderBoy.isSplited = !ShaderBoy.isSplited
        ShaderBoy.resetViewportSize()
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    showRecordingHeader()
    {
        if (!ShaderBoy.isCanvasHidden)
        {
            const hdrEl = document.getElementById('gui-header')
            const recEl = document.getElementById('ghdr-rec-base')
            const tlEl = document.getElementById('timeline')
            const codeEl = document.getElementById('code')
            const ctrlEl = document.getElementById('ctrl')

            ShaderBoy.isHeaderHidden = false
            ShaderBoy.isTimelineHidden = false
            ShaderBoy.isCodePaneHidden = false
            ShaderBoy.isKnobsHidden = false

            document.getElementById('res-x').value = ShaderBoy.canvas.width
            document.getElementById('res-y').value = ShaderBoy.canvas.height

            recEl.classList.remove('rec_hide')

            ShaderBoy.isKnobsHidden = (ctrlEl.classList.contains('ctrl_hide'))

            ctrlEl.classList.add('ctrl_hide')

            const ms = (ShaderBoy.isKnobsHidden) ? 0 : 400

            setTimeout(() =>
            {
                ShaderBoy.isHeaderHidden = (hdrEl.classList.contains('hdr_hide'))
                ShaderBoy.isTimelineHidden = (tlEl.classList.contains('tl_hide'))
                ShaderBoy.isCodePaneHidden = (codeEl.classList.contains('code_hide'))

                tlEl.classList.remove('tl_hide')
                codeEl.classList.add('code_hide')
                // hdrEl.classList.add('hdr_hide')

                ShaderBoy.editor.codemirror.display.input.blur()

                ShaderBoy.wasPlaying = ShaderBoy.isPlaying
                ShaderBoy.commands.stopTimeline()
            }, ms)
            key.setScope('rec_shown')
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    hideRecordingHeader()
    {
        const hdrEl = document.getElementById('gui-header')
        const recEl = document.getElementById('ghdr-rec-base')
        const tlEl = document.getElementById('timeline')
        const codeEl = document.getElementById('code')
        const ctrlEl = document.getElementById('ctrl')

        recEl.classList.add('rec_hide')

        // if (!ShaderBoy.isHeaderHidden)
        // {
        //     hdrEl.classList.remove('hdr_hide')
        // }

        if (!ShaderBoy.isCodePaneHidden)
        {
            codeEl.classList.remove('code_hide')
        }

        if (ShaderBoy.isTimelineHidden)
        {
            tlEl.classList.add('tl_hide')
        }

        if (!ShaderBoy.isKnobsHidden)
        {
            const ms = 400
            setTimeout(() =>
            {
                ctrlEl.classList.remove('ctrl_hide')
            }, ms)
        }

        if (ShaderBoy.wasPlaying)
        {
            ShaderBoy.commands.resetTimeline()
        }

        ShaderBoy.editor.codemirror.focus()
        key.setScope('default')
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