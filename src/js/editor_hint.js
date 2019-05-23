import ShaderBoy from './shaderboy';

import $ from 'jquery';

import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/dialog/dialog';
import CodeMirror from 'codemirror/lib/codemirror';

// Module Private
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
let isFunction = (renderWordObj) =>
{ return renderWordObj.snippet !== null && renderWordObj.args !== null; };
let isStruct = (renderWordObj) =>
{ return renderWordObj.snippet !== null && renderWordObj.members !== null; };

export default ShaderBoy.editor_hint = {

    // init
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    init()
    {
        this.tryCount = 0;
        this.curCur = null;
        this.curToken = '';
        this.curStart = null;
        this.curEnd = null;
        this.curCh = null;
        this.curLine = null;
        this.curWord = '';
        this.workingCm = null;

        this.keywordWorker = new Worker('./js/keyword-worker.js');
        this.keywordWorker.postMessage(JSON.stringify({ name: 'initBltinDict', content: {} }, null, "\t"));
        this.keywordWorker.onmessage = (msg) =>
        {
            console.log('Worker says: ', msg.data);
            let data = JSON.parse(msg.data);
            console.log(data);
            switch (data.name)
            {
                case 'keyword':
                    let keyObj = data.content;
                    console.log(keyObj);
                    break;
                case 'userDict':
                    let userDictObj = data.content;
                    console.log('Main thread: ', userDictObj);
                    break;

                case 'filter_succeed':
                    this.showFilteredDict(data.content.list);
                    break;

                case 'filter_failed':
                    // this.filterDictByWord();
                    break;

                default:
                    break;
            }
        };
    },

    // 
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    syncUserDict()
    {
        let docLinesStr = ShaderBoy.editor.codemirror.doc.getValue();
        let curLineInfo = ShaderBoy.editor.codemirror.doc.lineInfo(ShaderBoy.editor.codemirror.getCursor().line);
        if (!curLineInfo.text.match(/\}/g)) docLinesStr = docLinesStr.replace(curLineInfo.text, '');
        this.keywordWorker.postMessage(JSON.stringify({ name: 'syncUserDict', content: { dictName: ShaderBoy.editingBuffer, strCode: docLinesStr } }, null, "\t"));
    },

    // 
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    filterDictByWord()
    {
        let isCalled = false;
        this.curCh--;
        while (this.curCh > -1 && !isCalled)
        {
            let ch = this.curCh;
            let line = this.curLine;
            let tmpToken = this.workingCm.getTokenAt({ ch, line }).string;

            if (this.curWord.match(/\./g))
            {
                let structName = this.workingCm.getTokenAt({ ch, line }).state.context.info;
                isCalled = true;
                this.keywordWorker.postMessage(JSON.stringify({ name: 'filterStructByWord', content: { dictName: ShaderBoy.editingBuffer, curWord: structName } }, null, "\t"));
                break;
            }
            else if (tmpToken.match(/\D/g) && this.curWord !== undefined)
            {
                isCalled = true;
                this.keywordWorker.postMessage(JSON.stringify({ name: 'filterDictByWord', content: { dictName: ShaderBoy.editingBuffer, curWord: this.curWord } }, null, "\t"));
                break;
            }
            else
            {
                break;
            }
            this.curWord = tmpToken + this.curWord;
            this.tryCount++;
            this.curCh -= this.tryCount;
        }
    },

    // 
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setSnippet(rawItem)
    {
        if (isFunction(rawItem) || isStruct(rawItem))
        {
            let initVarName = 'var_name';
            let chOffset = 0;
            let tabFollowWords = null;
            let offset = 0;

            if (isFunction(rawItem))
            {
                chOffset = rawItem.snippet.indexOf('(') + 1;
                tabFollowWords = rawItem.args;
                offset = 2;
            }
            else
            {
                chOffset = rawItem.snippet.indexOf(initVarName);
                tabFollowWords = rawItem.members;
                offset = chOffset + 3;
            }

            // The number of characters to offset when the tab key is pressed.
            let tabFollowWordsStrLen = [];
            for (let j = 0; j < tabFollowWords.length; j++)
            {
                tabFollowWordsStrLen[j] = tabFollowWords[j].type.length + tabFollowWords[j].name.length + 1;
            }

            // If the item is a struct, focus on the variable name first.
            if (isStruct(rawItem))
            {
                tabFollowWordsStrLen.unshift(initVarName.length);
            }

            let hintFunction = (cm, data, completion) =>
            {
                function getText(completion)
                {
                    if (typeof completion == "string") return completion;
                    else return completion.text;
                }
                cm.replaceRange(getText(completion), completion.from || data.from, completion.to || data.to, "complete");

                data.from.ch += chOffset;
                cm.setCursor(data.from);

                let to = new CodeMirror.Pos(data.from.line, data.from.ch + tabFollowWordsStrLen[0]);
                tabFollowWordsStrLen.shift();
                cm.setSelection(data.from, to);

                if (tabFollowWordsStrLen.length >= 0)
                {
                    ShaderBoy.gui.editorShortcuts.Tab = function (cm)
                    {
                        let cur = cm.getCursor();

                        let from = new CodeMirror.Pos(cur.line, cur.ch + offset);
                        let to = new CodeMirror.Pos(cur.line, cur.ch + offset + tabFollowWordsStrLen[0]);
                        tabFollowWordsStrLen.shift();
                        cm.setCursor(new CodeMirror.Pos(cur.line, cur.ch + 2));
                        cm.setSelection(from, to);
                        offset = 2;

                        if (tabFollowWordsStrLen.length <= 0)
                        {
                            ShaderBoy.gui.editorShortcuts.Tab = function (cm)
                            { //tab as space
                                if (cm.somethingSelected())
                                {
                                    cm.indentSelection("add");
                                } else
                                {
                                    cm.replaceSelection(cm.getOption("indentWithTabs") ? "\t" :
                                        Array(cm.getOption("indentUnit") + 1).join(" "), "end", "+input");
                                }
                            };
                            cm.setOption("extraKeys", ShaderBoy.gui.editorShortcuts);
                        }
                    };
                    cm.setOption("extraKeys", ShaderBoy.gui.editorShortcuts);
                }
            }
            return hintFunction;
        }
    },

    // 
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    showFilteredDict(filteredRenderWords)
    {
        this.hintList = [];
        for (let i = 0; i < filteredRenderWords.length; i++)
        {
            this.hintList[i] = {};
            this.hintList[i].text = (isFunction(filteredRenderWords[i]) || isStruct(filteredRenderWords[i])) ? filteredRenderWords[i].snippet : filteredRenderWords[i].name;
            if (filteredRenderWords[i].render)
            {
                this.hintList[i].render = (element) =>
                {
                    element.innerHTML = filteredRenderWords[i].render;
                };
            }
            this.hintList[i].hint = this.setSnippet(filteredRenderWords[i]);
        }

        CodeMirror.showHint(
            this.workingCm,
            function ()
            {
                let cur = ShaderBoy.editor_hint.workingCm.getCursor();
                let token = ShaderBoy.editor_hint.workingCm.getTokenAt(cur);
                let start = token.start;
                let end = cur.ch;
                let word = token.string.slice(0, end - start);
                let ch = cur.ch;
                let line = cur.line;

                return {
                    list: ShaderBoy.editor_hint.hintList,
                    from: CodeMirror.Pos(line, ch - token.string.length),
                    to: CodeMirror.Pos(line, end)
                };
            },
            {
                completeSingle: false,
                alignWithWord: true
            }
        );
    },

    // 
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getHintFunction()
    {
        return (cm) =>
        {
            ShaderBoy.editor_hint.curCur = cm.getCursor();
            ShaderBoy.editor_hint.curToken = cm.getTokenAt(ShaderBoy.editor_hint.curCur);
            ShaderBoy.editor_hint.curStart = ShaderBoy.editor_hint.curToken.start;
            ShaderBoy.editor_hint.curEnd = ShaderBoy.editor_hint.curCur.ch;
            ShaderBoy.editor_hint.curCh = ShaderBoy.editor_hint.curCur.ch;
            ShaderBoy.editor_hint.curLine = ShaderBoy.editor_hint.curCur.line;
            ShaderBoy.editor_hint.curWord = ShaderBoy.editor_hint.curToken.string;

            if (ShaderBoy.editor_hint.curWord.match(/[a-zA-Z]{2,}/) || ShaderBoy.editor_hint.curWord.match('.'))
            {
                // For init...
                ShaderBoy.editor_hint.syncUserDict();

                // Start filtering with Worker...
                ShaderBoy.editor_hint.workingCm = cm;
                ShaderBoy.editor_hint.filterDictByWord();
            }
        };
    }
}