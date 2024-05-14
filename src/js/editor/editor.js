//   ___        _     _
//  (  _`\     ( ) _ ( )_
//  | (_(_)   _| |(_)| ,_)   _    _ __
//  |  _)_  /'_` || || |   /'_`\ ( '__)
//  | (_( )( (_| || || |_ ( (_) )| |
//  (____/'`\__,_)(_)`\__)`\___/'(_)

import ShaderBoy from '../shaderboy'
import bufferManager from '../buffer/buffer_manager'
import editor_hint from './editor_hint'

import $ from 'jquery'

import 'codemirror/keymap/sublime'
import 'codemirror/mode/clike/clike'
// import './codemirror/mode/glsl/glsl'
import 'codemirror/addon/selection/active-line'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror-formatting'
import 'codemirror/addon/search/match-highlighter'
import 'codemirror/addon/comment/comment'
// import 'codemirror/addon/hint/anyword-hint'
import 'codemirror/addon/hint/show-hint'
import './codemirror/addon/hint/glsl-hint'
import './codemirror/addon/hint/shadertoy-hint'
import './codemirror/addon/hint/javascript-hint'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/search/search'
import 'codemirror/addon/scroll/annotatescrollbar'
import 'codemirror/addon/search/matchesonscrollbar'
import 'codemirror/addon/search/jump-to-line'
import 'codemirror/addon/selection/selection-pointer'
import 'codemirror/addon/selection/mark-selection'
import CodeMirror from 'codemirror/lib/codemirror'
import gui_sidebar_ichannels from '../gui/gui_sidebar_ichannels'
import editor_hotkeys from './editor_hotkeys'

export default ShaderBoy.editor = {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    init()
    {
        this.domElement = document.getElementById('code')
        this.textArea = document.getElementById('editor')
        this.textArea.setAttribute('rows', '200')
        this.textArea.setAttribute('cols', '50')
        this.textArea.value = ''

        this.textSize = (localStorage.textSize !== undefined) ? localStorage.textSize : 9
        this.errorWidgets = []

        this.codemirror = CodeMirror(this.textArea, {
            lineNumbers: true,
            cursorBlinkRate: 530,
            smartIndent: true,
            mode: 'x-shader/x-fragment',
            indentWithTabs: false,
            indentUnit: 4,
            showInvisibles: true,
            maxInvisibles: 16,
            keyMap: 'sublime',
            // viewportMargin: 'Infinity',
            // cursorScrollMargin: 90,
            // theme: '3024-day',
            theme: '3024-monotone',
            styleActiveLine: true,
            styleSelectedText: true,
            styleCursor: true,
            autoCloseBrackets: false,
            matchBrackets: true,
            showCursorWhenSelecting: true,
            selectionPointer: true,
            autofocus: true,
            continuousScanning: 500,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            extraKeys: ShaderBoy.editor_hotkeys.keys
        })

        this.codemirror.on('change', editor_hint.getHintFunction())

        this.codemirror.parent = this
        this.setTextSize(this.textSize)

        editor_hint.setup()
        editor_hotkeys.setup()
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setTextSize(size)
    {
        this.textSize = size
        if (this.textSize <= 8) this.textSize = 8
        if (this.textSize >= 64) this.textSize = 64
        $(".CodeMirror").css('font-size', this.textSize + "pt")
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    incTextSize()
    {
        if (this.textSize < 64)
        {
            this.textSize++
            $(".CodeMirror").css('font-size', this.textSize + "pt")
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    decTextSize()
    {
        if (this.textSize > 8)
        {
            this.textSize--
            $(".CodeMirror").css('font-size', this.textSize + "pt")
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setBuffer(bufName, needForceChange)
    {
        const curBufName = ShaderBoy.editingBuffer
        const newBufName = bufName

        if (curBufName !== newBufName || needForceChange === true)
        {
            ShaderBoy.editingBuffer = bufName
            gui_sidebar_ichannels.readiChannels(bufName)
            ShaderBoy.gui_header.setActive(bufName)

            let buf = ShaderBoy.buffers[bufName].cm
            if (buf.getEditor()) buf = buf.linkedDoc({ sharedHist: true })
            const old = this.codemirror.swapDoc(buf)
            let linked
            const fnc = (doc) => { linked = doc; }
            linked = old.iterLinkedDocs(fnc)
            if (linked)
            {
                // Make sure the document in ShaderBoy.buffers is the one the other view is looking at
                for (const name in ShaderBoy.buffers)
                {
                    if (ShaderBoy.buffers[name].cm == old)
                    {
                        ShaderBoy.buffers[name].cm = linked
                    }
                    old.unlinkDoc(linked)
                }
            }

            this.codemirror.focus()
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    moveBuffer(offset)
    {
        const curBufName = ShaderBoy.activeBufferIds[ShaderBoy.bufferManager.currentBufferDataId]
        ShaderBoy.bufferManager.currentBufferDataId += offset
        ShaderBoy.bufferManager.currentBufferDataId = Math.max(Math.min(ShaderBoy.activeBufferIds.length - 1, ShaderBoy.bufferManager.currentBufferDataId), 0)
        const newBufName = ShaderBoy.activeBufferIds[ShaderBoy.bufferManager.currentBufferDataId]
        if (curBufName !== newBufName)
        {
            this.setBuffer(newBufName)
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    updateErrorInfo(bufName, errors)
    {
        if (ShaderBoy.buffers[bufName] !== undefined)
        {
            if (this.direct === undefined)
            {
                this.direct = false
            }

            if (ShaderBoy.buffers['Image'].active && !ShaderBoy.buffers['BufferA'].active && !ShaderBoy.buffers['BufferB'].active && !ShaderBoy.buffers['BufferC'].active && !ShaderBoy.buffers['BufferD'].active && !ShaderBoy.buffers['Sound'].active)
            {
                this.direct = true
            }

            this.codemirror.operation(() =>
            {
                if (this.direct)
                {
                    for (let i = 0; i < ShaderBoy.buffers[bufName].errorWidgets.length; ++i)
                        ShaderBoy.buffers[bufName].cm.removeLineWidget(ShaderBoy.buffers[bufName].errorWidgets[i])
                    ShaderBoy.buffers[bufName].errorWidgets.length = 0
                }
                else
                {
                    for (let i = 0; i < ShaderBoy.buffers[bufName].errorWidgets.length; ++i)
                        ShaderBoy.buffers[bufName].cm.removeLineWidget(ShaderBoy.buffers[bufName].errorWidgets[i])
                    ShaderBoy.buffers[bufName].errorWidgets.length = 0
                }

                let curline = 0
                for (let i = 0; i < errors.length; ++i)
                {
                    const err = errors[i]
                    if (!err) continue
                    const msg = document.createElement("div")
                    msg.appendChild(document.createTextNode(`${err.element}: ${err.msg}`))
                    if (err.lineNum > curline)
                    {
                        msg.className = "error notify"
                        curline = err.lineNum
                    }
                    else
                    {
                        msg.className = "error"
                    }

                    if (this.direct)
                    {
                        ShaderBoy.buffers[bufName].errorWidgets.push(ShaderBoy.buffers[bufName].cm.addLineWidget(err.lineNum, msg, { coverGutter: false, noHScroll: true }))
                    }
                    else
                    {
                        ShaderBoy.buffers[bufName].errorWidgets.push(ShaderBoy.buffers[bufName].cm.addLineWidget(err.lineNum, msg, { coverGutter: false, noHScroll: true }))
                    }
                }
            })
            const info = this.codemirror.getScrollInfo()
            const after = this.codemirror.charCoords({ line: this.codemirror.getCursor().line, ch: 0 }, "local").top
            if (info.top + info.clientHeight < after)
            {
                this.codemirror.scrollTo(null, after - info.clientHeight + 3)
            }
        }
    }
}