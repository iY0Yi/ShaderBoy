//
//   ___        _     _                
//  (  _`\     ( ) _ ( )_              
//  | (_(_)   _| |(_)| ,_)   _    _ __ 
//  |  _)_  /'_` || || |   /'_`\ ( '__)
//  | (_( )( (_| || || |_ ( (_) )| |   
//  (____/'`\__,_)(_)`\__)`\___/'(_)   
//                                     
//                                     

import ShaderBoy from './shaderboy';
import bufferManager from './buffer_manager';

import $ from 'jquery';

import 'codemirror/keymap/sublime';
import 'codemirror/mode/clike/clike';
// import './codemirror/mode/glsl/glsl';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror-formatting';
import 'codemirror/addon/search/match-highlighter';
import 'codemirror/addon/comment/comment';
// import 'codemirror/addon/hint/anyword-hint';
import 'codemirror/addon/hint/show-hint';
import './codemirror/addon/hint/glsl-hint';
import './codemirror/addon/hint/shadertoy-hint';
import './codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/search';
import 'codemirror/addon/scroll/annotatescrollbar';
import 'codemirror/addon/search/matchesonscrollbar';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/selection/selection-pointer';
import 'codemirror/addon/selection/mark-selection';
import CodeMirror from 'codemirror/lib/codemirror';

import gui_sidebar_ichannels from './gui/gui_sidebar_ichannels';

import * as Comlink from "comlink";
// import 'comlink-loader';
// import { MyClass } from 'comlink-loader!./worker/my-class';

export default ShaderBoy.editor = {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    init: function ()
    {
        // Worker
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.tryCount = 0;
        this.curCur = null;
        this.curToken = '';
        this.curStart = null;
        this.curEnd = null;
        this.curCh = null;
        this.curLine = null;
        this.curWord = '';
        this.workingCm = null;

        let keywordWorker = new Worker('./js/keyword-worker.js');
        keywordWorker.postMessage(JSON.stringify({ name: 'initBltinDict', content: {} }, null, "\t"));

        keywordWorker.onmessage = (msg) =>
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

        this.syncUserDict = function ()
        {
            let docLinesStr = ShaderBoy.editor.codemirror.doc.getValue();
            let curLineInfo = ShaderBoy.editor.codemirror.doc.lineInfo(ShaderBoy.editor.codemirror.getCursor().line);
            if (!curLineInfo.text.match(/\}/g)) docLinesStr = docLinesStr.replace(curLineInfo.text, '');
            keywordWorker.postMessage(JSON.stringify({ name: 'syncUserDict', content: { dictName: ShaderBoy.editingBuffer, strCode: docLinesStr } }, null, "\t"));
        };

        this.filterDictByWord = function ()
        {
            let isCalled = false;
            this.curCh--;
            while (this.curCh > -1 && !isCalled)
            {
                let ch = this.curCh;
                let line = this.curLine;
                let tmpToken = this.workingCm.getTokenAt({ ch, line }).string;
                console.log('tmpToken: ', tmpToken);
                if (this.curWord.match(/\./g))
                {
                    let structName = this.workingCm.getTokenAt({ ch, line }).state.context.info;
                    isCalled = true;
                    keywordWorker.postMessage(JSON.stringify({ name: 'filterStructByWord', content: { dictName: ShaderBoy.editingBuffer, curWord: structName } }, null, "\t"));
                    break;
                }
                else if (tmpToken.match(/\D/g) && this.curWord !== undefined)
                {
                    isCalled = true;
                    keywordWorker.postMessage(JSON.stringify({ name: 'filterDictByWord', content: { dictName: ShaderBoy.editingBuffer, curWord: this.curWord } }, null, "\t"));
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
        };

        this.showFilteredDict = function (list)
        {
            this.filteredlist = [];
            for (let i = 0; i < list.length; i++)
            {
                this.filteredlist[i] = {};
                this.filteredlist[i].text = list[i].name;
                if (list[i].render)
                {
                    this.filteredlist[i].render = (element) =>
                    {
                        element.innerHTML = list[i].render;
                    };
                }

                // Function only...
                if (list[i].args !== null)
                {
                    let chOffset = list[i].name.indexOf('(') + 1;

                    let args = list[i].args;
                    let argStrLen = [];
                    for (let j = 0; j < args.length; j++)
                    {
                        argStrLen[j] = args[j].type.length + args[j].name.length + 1;
                    }

                    this.filteredlist[i].hint = (cm, data, completion) =>
                    {
                        console.log('data: ', data);
                        console.log('completion: ', completion);
                        console.log('argStrLen: ', argStrLen);

                        function getText(completion)
                        {
                            if (typeof completion == "string") return completion;
                            else return completion.text;
                        }
                        cm.replaceRange(getText(completion), completion.from || data.from,
                            completion.to || data.to, "complete");

                        data.from.ch += chOffset;
                        cm.setCursor(data.from);
                        let to = new CodeMirror.Pos(data.from.line, data.from.ch + argStrLen[0]);
                        argStrLen.shift();
                        cm.setSelection(data.from, to);

                        if (argStrLen.length >= 0)
                        {
                            ShaderBoy.gui.editorShortcuts.Tab = function (cm)
                            {
                                let cur = cm.getCursor();
                                let from = new CodeMirror.Pos(cur.line, cur.ch + 2);
                                let to = new CodeMirror.Pos(cur.line, cur.ch + 2 + argStrLen[0]);
                                argStrLen.shift();
                                cm.setCursor(new CodeMirror.Pos(cur.line, cur.ch + 2));
                                cm.setSelection(from, to);

                                if (argStrLen.length <= 0)
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
                }

                // Struct only...
                if (list[i].members !== null)
                {
                    let initVarName = 'var_name';
                    let chOffset = list[i].name.indexOf(initVarName);

                    let members = list[i].members;
                    let memberStrLen = [];
                    memberStrLen[0] = initVarName.length;
                    for (let j = 0; j < members.length; j++)
                    {
                        memberStrLen[j + 1] = members[j].type.length + members[j].name.length + 1;
                    }

                    this.filteredlist[i].hint = (cm, data, completion) =>
                    {
                        console.log('data: ', data);
                        console.log('completion: ', completion);
                        console.log('memberStrLen: ', memberStrLen);

                        function getText(completion)
                        {
                            if (typeof completion == "string") return completion;
                            else return completion.text;
                        }
                        cm.replaceRange(getText(completion), completion.from || data.from,
                            completion.to || data.to, "complete");

                        data.from.ch += chOffset;
                        cm.setCursor(data.from);

                        let to = new CodeMirror.Pos(data.from.line, data.from.ch + memberStrLen[0]);
                        memberStrLen.shift();
                        cm.setSelection(data.from, to);

                        if (memberStrLen.length >= 0)
                        {
                            ShaderBoy.gui.editorShortcuts.Tab = function (cm)
                            {
                                let cur = cm.getCursor();
                                let offset = (memberStrLen.length >= members.length) ? 3 + chOffset : 2;
                                let from = new CodeMirror.Pos(cur.line, cur.ch + offset);
                                let to = new CodeMirror.Pos(cur.line, cur.ch + offset + memberStrLen[0]);
                                console.log('from: ', from);
                                console.log('to: ', to);
                                console.log('memberStrLen[0]: ', memberStrLen[0]);
                                memberStrLen.shift();
                                cm.setCursor(new CodeMirror.Pos(cur.line, cur.ch + 2));
                                cm.setSelection(from, to);

                                if (memberStrLen.length <= 0)
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
                }
            }

            // console.log(list);
            // console.log(this.filteredlist);

            CodeMirror.showHint(
                this.workingCm,
                function ()
                {
                    let cur = ShaderBoy.editor.workingCm.getCursor();
                    let token = ShaderBoy.editor.workingCm.getTokenAt(cur);
                    let start = token.start;
                    let end = cur.ch;
                    let word = token.string.slice(0, end - start);
                    let ch = cur.ch;
                    let line = cur.line;

                    return {
                        list: ShaderBoy.editor.filteredlist,
                        from: CodeMirror.Pos(line, ch - token.string.length),
                        to: CodeMirror.Pos(line, end)
                    };
                },
                {
                    completeSingle: false,
                    alignWithWord: false
                }
            );

        }

        ShaderBoy.editor.autoComplete = function (cm)
        {
            console.log('autoComplete: ');

            ShaderBoy.editor.curCur = cm.getCursor();
            ShaderBoy.editor.curToken = cm.getTokenAt(ShaderBoy.editor.curCur);
            ShaderBoy.editor.curStart = ShaderBoy.editor.curToken.start;
            ShaderBoy.editor.curEnd = ShaderBoy.editor.curCur.ch;
            ShaderBoy.editor.curCh = ShaderBoy.editor.curCur.ch;
            ShaderBoy.editor.curLine = ShaderBoy.editor.curCur.line;
            ShaderBoy.editor.curWord = ShaderBoy.editor.curToken.string;


            if (ShaderBoy.editor.curWord.match(/[a-zA-Z]{2,}/) || ShaderBoy.editor.curWord.match('.'))
            {
                // For init...
                ShaderBoy.editor.syncUserDict();

                console.log('ShaderBoy.editor.curWord: ', ShaderBoy.editor.curWord);
                // Start filtering with Worker...
                ShaderBoy.editor.workingCm = cm;
                ShaderBoy.editor.filterDictByWord();
            }
        };


        // Editor
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.domElement = document.getElementById('code');

        this.textArea = document.getElementById('editor');
        this.textArea.setAttribute('rows', '200');
        this.textArea.setAttribute('cols', '50');
        this.textArea.value = '';

        this.textSize = (localStorage.textSize !== undefined) ? localStorage.textSize : 11;

        this.errorWidgets = [];

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
            extraKeys: ShaderBoy.gui.editorShortcuts
        });

        this.codemirror.on('change', ShaderBoy.editor.autoComplete);

        this.codemirror.parent = this;
        this.setTextSize();
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setTextSize: function ()
    {
        if (this.textSize <= 8) this.textSize = 8;
        if (this.textSize >= 64) this.textSize = 64;
        $(".CodeMirror").css('font-size', this.textSize + "pt");
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    incTextSize: function ()
    {
        if (this.textSize < 64)
        {
            this.textSize++;
            $(".CodeMirror").css('font-size', this.textSize + "pt");
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    decTextSize: function ()
    {
        if (this.textSize > 8)
        {
            this.textSize--;
            $(".CodeMirror").css('font-size', this.textSize + "pt");
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setBuffer: function (bufName, needForceChange)
    {
        let curBufName = ShaderBoy.editingBuffer;
        let newBufName = bufName;

        if (curBufName !== newBufName || needForceChange === true)
        {
            ShaderBoy.editingBuffer = bufName;
            gui_sidebar_ichannels.readiChannels(bufName);
            ShaderBoy.gui_header.setActive(bufName);

            let buf = ShaderBoy.buffers[bufName].cm;
            if (buf.getEditor()) buf = buf.linkedDoc({ sharedHist: true });
            let old = this.codemirror.swapDoc(buf);
            let linked;
            let fnc = function (doc) { linked = doc; };
            linked = old.iterLinkedDocs(fnc);
            if (linked)
            {
                // Make sure the document in ShaderBoy.buffers is the one the other view is looking at
                for (let name in ShaderBoy.buffers)
                {
                    if (ShaderBoy.buffers[name].cm == old)
                    {
                        ShaderBoy.buffers[name].cm = linked;
                    }
                    old.unlinkDoc(linked);
                }
            }

            this.codemirror.focus();
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    moveBuffer: function (offset)
    {
        let curBufName = ShaderBoy.activeBufferIds[ShaderBoy.bufferManager.currentBufferDataId];
        ShaderBoy.bufferManager.currentBufferDataId += offset;
        ShaderBoy.bufferManager.currentBufferDataId = Math.max(Math.min(ShaderBoy.activeBufferIds.length - 1, ShaderBoy.bufferManager.currentBufferDataId), 0);
        let newBufName = ShaderBoy.activeBufferIds[ShaderBoy.bufferManager.currentBufferDataId];
        if (curBufName !== newBufName)
        {
            this.setBuffer(newBufName);
        }
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    updateErrorInfo: function (bufName, errors)
    {
        if (ShaderBoy.buffers[bufName] !== undefined)
        {
            if (this.direct === undefined)
            {
                this.direct = false;
            }

            let prevDirect = !(!this.direct);

            if (ShaderBoy.buffers['Image'].active && !ShaderBoy.buffers['BufferA'].active && !ShaderBoy.buffers['BufferB'].active && !ShaderBoy.buffers['BufferC'].active && !ShaderBoy.buffers['BufferD'].active && !ShaderBoy.buffers['Sound'].active)
            {
                this.direct = true;
            }
            console.log('this.direct: ', this.direct);

            this.codemirror.operation(function ()
            {
                let scope = ShaderBoy.editor;


                if (scope.direct)
                {
                    for (let i = 0; i < ShaderBoy.buffers[bufName].errorWidgets.length; ++i)
                        ShaderBoy.buffers[bufName].cm.removeLineWidget(ShaderBoy.buffers[bufName].errorWidgets[i]);
                    ShaderBoy.buffers[bufName].errorWidgets.length = 0;
                }
                else
                {
                    for (let i = 0; i < ShaderBoy.buffers[bufName].errorWidgets.length; ++i)
                        ShaderBoy.buffers[bufName].cm.removeLineWidget(ShaderBoy.buffers[bufName].errorWidgets[i]);
                    ShaderBoy.buffers[bufName].errorWidgets.length = 0;
                }

                let curline = 0;
                for (let i = 0; i < errors.length; ++i)
                {
                    let err = errors[i];
                    if (!err) continue;
                    let msg = document.createElement("div");
                    msg.appendChild(document.createTextNode(err.element + ': ' + err.msg));
                    if (err.lineNum > curline)
                    {
                        msg.className = "error notify";
                        curline = err.lineNum;
                    }
                    else
                    {
                        msg.className = "error";
                    }

                    if (scope.direct)
                    {
                        ShaderBoy.buffers[bufName].errorWidgets.push(ShaderBoy.buffers[bufName].cm.addLineWidget(err.lineNum, msg, { coverGutter: false, noHScroll: true }));
                    }
                    else
                    {
                        ShaderBoy.buffers[bufName].errorWidgets.push(ShaderBoy.buffers[bufName].cm.addLineWidget(err.lineNum, msg, { coverGutter: false, noHScroll: true }));
                    }
                }
            });
            let info = this.codemirror.getScrollInfo();
            let after = this.codemirror.charCoords({ line: this.codemirror.getCursor().line, ch: 0 }, "local").top;
            if (info.top + info.clientHeight < after)
            {
                this.codemirror.scrollTo(null, after - info.clientHeight + 3);
            }
        }
    }
}