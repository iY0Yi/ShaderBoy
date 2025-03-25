//   ___        _     _
//  (  _`\     ( ) _ ( )_
//  | (_(_)   _| |(_)| ,_)   _    _ __
//  |  _)_  /'_` || || |   /'_`\ ( '__)
//  | (_( )( (_| || || |_ ( (_) )| |
//  (____/'`\__,_)(_)`\__)`\___/'(_)
//   _   _            _
//  ( ) ( ) _        ( )_
//  | |_| |(_)  ___  | ,_)
//  |  _  || |/' _ `\| |
//  | | | || || ( ) || |_
//  (_) (_)(_)(_) (_)`\__)
//

import ShaderBoy from '../shaderboy'
import Worker from '../workers/keyword.worker'
import $ from 'jquery'
import * as monaco from 'monaco-editor'

// Module Private
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const isFunction = (renderWordObj) =>
{ return renderWordObj.snippet !== null && renderWordObj.args !== null; }
const isStruct = (renderWordObj) =>
{ return renderWordObj.snippet !== null && renderWordObj.members !== null; }
const needSnippet = (renderWord) =>
{ return (isFunction(renderWord) || isStruct(renderWord)); }

export default ShaderBoy.editor_hint = {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setup()
    {
        this.tryCount = 0
        this.curCur = null
        this.curToken = ''
        this.curStart = null
        this.curEnd = null
        this.curCh = null
        this.curLine = null
        this.curWord = ''
        this.workingCm = null

        this.keywordWorker = new Worker()
        this.keywordWorker.postMessage(JSON.stringify({ name: 'initBltinDict', content: {} }, null, "\t"))
        this.keywordWorker.onmessage = (msg) =>
        {
            console.log('Worker says: ', msg.data)
            const data = JSON.parse(msg.data)
            switch (data.name)
            {
                case 'keyword':
                    const keyObj = data.content
                    break
                case 'userDict':
                    const userDictObj = data.content
                    console.log('Main thread: ', userDictObj)
                    break

                case 'filter_succeed':
                    this.showFilteredDict(data.content.list)
                    break

                case 'filter_failed':
                    // this.filterDictByWord()
                    break

                default:
                    break
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    syncUserDict()
    {
        let docLinesStr = ''
        const curBufName = ShaderBoy.activeBufferIds[ShaderBoy.bufferManager.currentBufferDataId]

        // Common バッファの内容を取得
        if (curBufName !== 'Common' && ShaderBoy.buffers['Common'].active)
        {
            // バッファの実装に合わせて値を取得
            docLinesStr += ShaderBoy.buffers['Common'].getValue()
        }

        // 現在のエディタの内容を取得
        docLinesStr += ShaderBoy.editor._monaco.getModel().getValue()

        // 現在の行を取得してフィルタリング
        const position = ShaderBoy.editor._monaco.getPosition();
        if (position) {
            const lineNumber = position.lineNumber;
            const model = ShaderBoy.editor._monaco.getModel();
            if (model) {
                const lineContent = model.getLineContent(lineNumber);
                if (!lineContent.match(/\}/g)) {
                    docLinesStr = docLinesStr.replace(lineContent, '');
                }
            }
        }

        this.keywordWorker.postMessage(JSON.stringify({
            name: 'syncUserDict',
            content: {
                dictName: ShaderBoy.editingBuffer,
                strCode: docLinesStr
            }
        }, null, "\t"))
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    filterDictByWord()
    {
        const ch = this.curCh
        const line = this.curLine

        if (this.curWord.match(/\./g))
        {
            const structName = this.workingCm.getTokenAt({ ch, line }).state.context.info
            this.keywordWorker.postMessage(JSON.stringify({ name: 'filterStructByWord', content: { dictName: ShaderBoy.editingBuffer, curWord: structName } }, null, "\t"))
        }
        else if (this.curWord.match(/\w/g))
        {
            this.keywordWorker.postMessage(JSON.stringify({ name: 'filterDictByWord', content: { dictName: ShaderBoy.editingBuffer, curWord: this.curWord } }, null, "\t"))
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setSnippet(rawItem)
    {
        if (isFunction(rawItem) || isStruct(rawItem))
        {
            const initVarName = 'var_name'
            let chOffset = 0
            let tabFollowWords = null
            let offset = 0

            if (isFunction(rawItem))
            {
                chOffset = rawItem.snippet.indexOf('(') + 1
                tabFollowWords = rawItem.args
                offset = 2
            }
            else
            {
                chOffset = rawItem.snippet.indexOf(initVarName)
                tabFollowWords = rawItem.members
                offset = chOffset + 3
            }

            // The number of characters to offset when the tab key is pressed.
            let tabFollowWordsStrLen = []
            for (let j = 0; j < tabFollowWords.length; j++)
            {
                tabFollowWordsStrLen[j] = tabFollowWords[j].type.length + tabFollowWords[j].name.length + 1
            }

            // If the item is a struct, focus on the variable name first.
            if (isStruct(rawItem))
            {
                tabFollowWordsStrLen.unshift(initVarName.length)
            }

            const hintFunction = (cm, data, completion) =>
            {
                // const getText = (completion) =>
                // {
                //     if (typeof completion == "string") return completion
                //     else return completion.text
                // }
                // cm.replaceRange(getText(completion), completion.from || data.from, completion.to || data.to, "complete")

                // data.from.ch += chOffset
                // cm.setCursor(data.from)

                // const to = new CodeMirror.Pos(data.from.line, data.from.ch + tabFollowWordsStrLen[0])
                // tabFollowWordsStrLen.shift()
                // cm.setSelection(data.from, to)

                // if (tabFollowWordsStrLen.length >= 0)
                // {
                //     ShaderBoy.editor_hotkeys.keys.Tab = (cm) =>
                //     {
                //         const cur = cm.getCursor()

                //         const from = new CodeMirror.Pos(cur.line, cur.ch + offset)
                //         const to = new CodeMirror.Pos(cur.line, cur.ch + offset + tabFollowWordsStrLen[0])
                //         tabFollowWordsStrLen.shift()
                //         cm.setCursor(new CodeMirror.Pos(cur.line, cur.ch + 2))
                //         cm.setSelection(from, to)
                //         offset = 2

                //         if (tabFollowWordsStrLen.length <= 0)
                //         {
                //             ShaderBoy.editor_hotkeys.keys.Tab = (cm) =>
                //             { //tab as space
                //                 if (cm.somethingSelected())
                //                 {
                //                     cm.indentSelection("add")
                //                 } else
                //                 {
                //                     cm.replaceSelection(cm.getOption("indentWithTabs") ? "\t" :
                //                         Array(cm.getOption("indentUnit") + 1).join(" "), "end", "+input")
                //                 }
                //             }
                //             cm.setOption("extraKeys", ShaderBoy.editor_hotkeys.keys)
                //         }
                //     }
                //     cm.setOption("extraKeys", ShaderBoy.editor_hotkeys.keys)
                // }
            }
            return hintFunction
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    showFilteredDict(filteredRenderWords)
    {
        this.hintList = []
        for (let i = 0; i < filteredRenderWords.length; i++)
        {
            this.hintList[i] = {}
            this.hintList[i].text = (needSnippet(filteredRenderWords[i])) ? filteredRenderWords[i].snippet : filteredRenderWords[i].name
            if (filteredRenderWords[i].render)
            {
                this.hintList[i].render = (element) =>
                {
                    element.innerHTML = filteredRenderWords[i].render
                }
            }
            this.hintList[i].hint = this.setSnippet(filteredRenderWords[i])
        }

        // MonacoエディタでのコードスニペットとCode Actionsの表示
        if (this.workingCm && ShaderBoy.editor._monaco) {
            // Monaco向けの補完候補表示
            const position = this.workingCm.getPosition()
            if (position) {
                // Monacoではコンテンツウィジェットを使った独自UIも可能だが
                // 今回は組み込み補完機能のトリガーを使用
                ShaderBoy.editor._monaco.trigger('editor', 'editor.action.triggerSuggest', {})

                // ここで補完候補のリストをMonaco用に変換・登録することも可能
                // 完全な実装では、monaco.languages.registerCompletionItemProviderを使用
            }
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getHintFunction()
    {
        return (cm) =>
        {
            ShaderBoy.gui_header.setDirty(true)

            // MonacoエディタからカーソルとトークンのInformation
            const monaco_cm = ShaderBoy.editor._monaco
            if (!monaco_cm) return

            const position = monaco_cm.getPosition()
            if (!position) return

            this.curCur = position
            this.curCh = position.column
            this.curLine = position.lineNumber

            // モデルからトークン情報を取得
            const model = monaco_cm.getModel()
            if (!model) return

            const wordAtPosition = model.getWordAtPosition(position)
            this.curWord = wordAtPosition ? wordAtPosition.word : ''

            // モデルの現在の行を取得
            const lineContent = model.getLineContent(position.lineNumber)

            // ドット演算子の検出
            const isDot = lineContent.substring(0, position.column - 1).endsWith('.')
            if (isDot) {
                this.curWord = '.'
            }

            if ((this.curWord.match(/[a-zA-Z_-]{2,}/) && !isDot) || this.curWord === '.') {
                this.syncUserDict()

                // 作業中のエディタはMonacoインスタンス
                this.workingCm = monaco_cm
                this.filterDictByWord()
            }
        }
    }
}