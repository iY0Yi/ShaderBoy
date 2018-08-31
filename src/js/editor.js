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

import $ from 'jquery';

import 'codemirror/keymap/sublime';
import 'codemirror/mode/clike/clike';
import './codemirror/mode/glsl/glsl';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror-formatting';
import 'codemirror/addon/search/match-highlighter';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/hint/anyword-hint';
import 'codemirror/addon/hint/show-hint';
import './codemirror/addon/hint/glsl-hint';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/search';
import 'codemirror/addon/scroll/annotatescrollbar';
import 'codemirror/addon/search/matchesonscrollbar';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/selection/selection-pointer';
import 'codemirror/addon/selection/mark-selection';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import CodeMirror from 'codemirror/lib/codemirror';

export default ShaderBoy.editor = {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    init: function () {
        this.buffers = { "main": null, "common": null };
        this.oldCursor = { line: 0, ch: 0 };

        this.domElement = document.getElementById('code');
        this.domElement.style.top = ShaderBoy.style.buttonHeight + 'px';
        this.domElement.style.width = window.innerWidth + 'px';
        this.domElement.style.height = window.innerHeight - ShaderBoy.style.buttonHeight + 'px';

        this.textArea = document.getElementById('editor');
        this.textArea.setAttribute('rows', '200');
        this.textArea.setAttribute('cols', '50');
        this.textArea.style.width = this.domElement.style.width;
        this.textArea.style.height = this.domElement.style.height;
        this.textArea.value = ShaderBoy.buffers['MainImage'].textData;

        this.textSize = (localStorage.textSize !== undefined) ? localStorage.textSize : 14;

        this.setTextSize = function () {
            if (this.textSize <= 8) this.textSize = 8;
            if (this.textSize >= 64) this.textSize = 64;
            $(".CodeMirror").css('font-size', this.textSize + "pt");
        };
        this.incTextSize = function () {
            if (this.textSize < 64) {
                this.textSize++;
                $(".CodeMirror").css('font-size', this.textSize + "pt");
            }
        };
        this.decTextSize = function () {
            if (this.textSize > 8) {
                this.textSize--;
                $(".CodeMirror").css('font-size', this.textSize + "pt");
            }
        };

        this.widgets = [];
        this.currentBufferId = 0;
        this.bufferNames = ['Common', 'MainImage'];//, 'BufferA', 'BufferB', 'BufferC', 'BufferD'];

        let keys = {
            "Shift-Cmd-Alt-J": 'unfoldAll', // just for register fold command.
            "Ctrl-K": function (cm) {
                cm.operation(function () {
                    for (var i = cm.firstLine(), e = cm.lastLine(); i <= e; i++)
                        cm.foldCode(CodeMirror.Pos(i, 0));
                });
            },
            "Alt-K": function (cm) { cm.foldCode(cm.getCursor()); },
            'Alt-Right': function () {
                ShaderBoy.editor.moveBuffer(1);
            },
            'Alt-Left': function () {
                ShaderBoy.editor.moveBuffer(-1);
            },
            'Alt-Up': function () {
                ShaderBoy.isPlaying = !ShaderBoy.isPlaying;
                ShaderBoy.time.pause();
            },
            'Alt-Down': function () {
                ShaderBoy.time.reset();
                ShaderBoy.uniforms.iFrame = 0;
            },
            'Alt-Enter': function (cm) { ShaderBoy.io.recompile(); },
            'Cmd-S': function (cm) { ShaderBoy.io.saveShader(); },
            'Ctrl-S': function (cm) { ShaderBoy.io.saveShader(); },
            'Ctrl-1': function () {
                ShaderBoy.isPlaying = false;
                ShaderBoy.renderScale = 1;
                ShaderBoy.renderer.createBuffer(false);
                ShaderBoy.isPlaying = true;
            },
            'Ctrl-2': function () {
                ShaderBoy.isPlaying = false;
                ShaderBoy.renderScale = 2;
                ShaderBoy.renderer.createBuffer(false);
                ShaderBoy.isPlaying = true;
            },
            'Ctrl-3': function () {
                ShaderBoy.isPlaying = false;
                ShaderBoy.renderScale = 3;
                ShaderBoy.renderer.createBuffer(false);
                ShaderBoy.isPlaying = true;
            },
            'Ctrl-4': function () {
                ShaderBoy.isPlaying = false;
                ShaderBoy.renderScale = 4;
                ShaderBoy.renderer.createBuffer(false);
                ShaderBoy.isPlaying = true;
            },
            'Shift-Cmd-Alt-+': function () {
                ShaderBoy.editor.incTextSize();
            },
            'Shift-Ctrl-Alt-+': function () {
                ShaderBoy.editor.incTextSize();
            },
            'Shift-Cmd-Alt-;': function () {
                ShaderBoy.editor.incTextSize();
            },
            'Shift-Ctrl-Alt-;': function () {
                ShaderBoy.editor.incTextSize();
            },
            'Shift-Cmd-Alt-=': function () {
                ShaderBoy.editor.incTextSize();
            },
            'Shift-Ctrl-Alt-=': function () {
                ShaderBoy.editor.incTextSize();
            },
            'Shift-Cmd-Alt--': function () {
                ShaderBoy.editor.decTextSize();
            },
            'Shift-Ctrl-Alt--': function () {
                ShaderBoy.editor.decTextSize();
            },
            'Shift-Cmd-Alt-_': function () {
                ShaderBoy.editor.decTextSize();
            },
            'Shift-Ctrl-Alt-_': function () {
                ShaderBoy.editor.decTextSize();
            },
            'Shift-Cmd-Alt-L': function () { ShaderBoy.io.loadShader(function () { }); },
            'Shift-Ctrl-Alt-L': function () { ShaderBoy.io.loadShader(function () { }); },
            'Shift-Cmd-Alt-N': function () { ShaderBoy.io.newShader(); },
            'Shift-Ctrl-Alt-N': function () { ShaderBoy.io.newShader(); },
            'Shift-Cmd-Alt-F': function (cm) {
                function getSelectedRange() {
                    return {
                        from: cm.getCursor(true),
                        to: cm.getCursor(false),
                    };
                }
                let range = getSelectedRange();
                cm.autoFormatRange(range.from, range.to);
            },
            'Shift-Ctrl-Alt-F': function (cm) {
                function getSelectedRange() {
                    return {
                        from: cm.getCursor(true),
                        to: cm.getCursor(false),
                    };
                }
                let range = getSelectedRange();
                cm.autoFormatRange(range.from, range.to);
            },
            'Shift-Ctrl-F': function (cm) {
                function getSelectedRange() {
                    return {
                        from: cm.getCursor(true),
                        to: cm.getCursor(false),
                    };
                }
                let range = getSelectedRange();
                cm.autoFormatRange(range.from, range.to);
            },

            'Shift-Cmd-Alt-H': function () {
                ShaderBoy.isEditorHide = !ShaderBoy.isEditorHide;
                if (ShaderBoy.isEditorHide) {
                    ShaderBoy.editor.domElement.style.opacity = '0.0';
                    ShaderBoy.gui.header.base.domElement.style.opacity = '0.0';
                }
                else {
                    ShaderBoy.editor.domElement.style.opacity = '1.0';
                    ShaderBoy.gui.header.base.domElement.style.opacity = '1.0';
                }
            },
            'Shift-Ctrl-Alt-H': function () {
                ShaderBoy.isEditorHide = !ShaderBoy.isEditorHide;
                if (ShaderBoy.isEditorHide) {
                    ShaderBoy.editor.domElement.style.opacity = '0.0';
                    ShaderBoy.gui.header.base.domElement.style.opacity = '0.0';
                }
                else {
                    ShaderBoy.editor.domElement.style.opacity = '1.0';
                    ShaderBoy.gui.header.base.domElement.style.opacity = '1.0';
                }
            },
        };

        // if (ShaderBoy.OS !== 'Windows' && ShaderBoy.OS !== 'MacOS' && ShaderBoy.OS !== 'UNIX' && ShaderBoy.OS !== 'Linux')
        {
            keys['Alt-Space'] = function (cm) { ShaderBoy.io.recompile(); };
            keys['Shift-Ctrl-N'] = function () { ShaderBoy.io.newShader(); };
            keys['Shift-Ctrl-L'] = function () { ShaderBoy.io.loadShader(function () { }); };
            keys['Alt-H'] = function () {
                ShaderBoy.isEditorHide = !ShaderBoy.isEditorHide;
                if (ShaderBoy.isEditorHide) {
                    ShaderBoy.editor.domElement.style.opacity = '0.0';
                    ShaderBoy.gui.header.base.domElement.style.opacity = '0.0';
                }
                else {
                    ShaderBoy.editor.domElement.style.opacity = '1.0';
                    ShaderBoy.gui.header.base.domElement.style.opacity = '1.0';
                }
            };
            keys['Ctrl-Up'] = function () {
                ShaderBoy.editor.incTextSize();
            };
            keys['Ctrl-Down'] = function () {
                ShaderBoy.editor.decTextSize();
            };
        }

        this.codemirror = CodeMirror.fromTextArea(this.textArea, {
            lineNumbers: true,
            smartIndent: true,
            mode: 'x-shader/x-fragment',
            indentWithTabs: false,
            indentUnit: 4,
            showInvisibles: true,
            maxInvisibles: 16,
            keyMap: 'sublime',
            theme: '3024-night',
            styleActiveLine: true,
            styleSelectedText: true,
            styleCursor: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            showCursorWhenSelecting: true,
            selectionPointer: true,
            autofocus: true,
            continuousScanning: 500,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            Tab: function (cm) { //tab as space
                if (cm.somethingSelected()) {
                    cm.indentSelection("add");
                } else {
                    cm.replaceSelection(cm.getOption("indentWithTabs") ? "\t" :
                        Array(cm.getOption("indentUnit") + 1).join(" "), "end", "+input");
                }
            },
            extraKeys: keys,
        });

        this.codemirror.parent = this;
        this.setSize(this.domElement.style.width, this.domElement.style.height);
        this.setTextSize();
        this.save();
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    selectBuffer: function (bufName, isInit) {
        this.codemirror.save();

        let curCursor = { line: this.oldCursor.line, ch: this.oldCursor.ch };

        let doc = this.codemirror.getDoc();
        let cursor = doc.getCursor();
        this.oldCursor = { line: cursor.line, ch: cursor.ch };

        let oldBufName = this.bufferNames[this.currentBufferId];
        this.currentBufferId = this.bufferNames.indexOf(bufName);
        let newBufName = bufName;

        // save current buffer text data.
        if (!isInit) {
            ShaderBoy.buffers[oldBufName].textData = this.codemirror.getValue();
        }
        // set inactive for all buffers.
        for (const name in ShaderBoy.buffers) {
            if (ShaderBoy.buffers.hasOwnProperty(name)) {
                ShaderBoy.buffers[name].active = false;
            }
        }

        // bind new buffer.
        ShaderBoy.buffers[newBufName].active = true;
        this.codemirror.setValue(ShaderBoy.util.deepcopy(ShaderBoy.buffers[newBufName].textData));
        this.codemirror.setCursor({ line: curCursor.line, ch: curCursor.ch });
        this.codemirror.refresh();
    },

    moveBuffer: function (offset) {
        this.codemirror.save();

        let curCursor = { line: this.oldCursor.line, ch: this.oldCursor.ch };

        let doc = this.codemirror.getDoc();
        let cursor = doc.getCursor();
        this.oldCursor = { line: cursor.line, ch: cursor.ch };

        let oldBufName = this.bufferNames[this.currentBufferId];
        this.currentBufferId += offset;
        this.currentBufferId = Math.max(Math.min(this.bufferNames.length - 1, this.currentBufferId), 0);
        console.log(this.currentBufferId);
        let newBufName = this.bufferNames[this.currentBufferId];

        // save current buffer text data.
        ShaderBoy.buffers[oldBufName].textData = this.codemirror.getValue();
        // set inactive for all buffers.
        for (const name in ShaderBoy.buffers) {
            if (ShaderBoy.buffers.hasOwnProperty(name)) {
                ShaderBoy.buffers[name].active = false;
            }
        }

        // bind new buffer.
        ShaderBoy.buffers[newBufName].active = true;
        this.codemirror.setValue(ShaderBoy.util.deepcopy(ShaderBoy.buffers[newBufName].textData));
        this.codemirror.setCursor({ line: curCursor.line, ch: curCursor.ch });
        this.codemirror.refresh();
    },

    updateErrorInfo: function (errors) {
        this.codemirror.operation(function () {
            let scope = ShaderBoy.editor;
            for (let i = 0; i < scope.widgets.length; ++i)
                scope.codemirror.removeLineWidget(scope.widgets[i]);
            scope.widgets.length = 0;

            for (let i = 0; i < errors.length; ++i) {
                let err = errors[i];
                if (!err) continue;
                let msg = document.createElement("div");
                msg.appendChild(document.createTextNode(err.element + ': ' + err.msg));
                msg.className = "error";
                scope.widgets.push(scope.codemirror.addLineWidget(err.lineNum - 1, msg, { coverGutter: false, noHScroll: true }));
            }
        });
        let info = this.codemirror.getScrollInfo();
        let after = this.codemirror.charCoords({ line: this.codemirror.getCursor().line + 1, ch: 0 }, "local").top;
        if (info.top + info.clientHeight < after)
            this.codemirror.scrollTo(null, after - info.clientHeight + 3);
    },
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    save: function () {
        this.codemirror.save();
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    setSize: function (w, h) {
        this.codemirror.setSize(w, h);
    }
}