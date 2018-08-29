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
import './codemirror/lib/util/formatting';
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
            $(".CodeMirror").css('font-size', this.textSize + "pt");
        };

        this.widgets = [];

        let keyHide = '';
        switch (ShaderBoy.OS) {
            case 'Windows':
            case 'MacOS':
            case 'UNIX':
            case 'Linux':
                keyHide = 'ctrl+r';
                break;

            case 'iOS':
            case 'Android':
                keyHide = 'alt+h';
                break;

            default:
                keyHide = 'ctrl+r';
                break;
        }
        console.log('keyHide', keyHide);


        let keys = {};
        switch (ShaderBoy.OS) {
            case 'Windows':
                keys = {
                    "Ctrl-J": 'fold',
                    "Alt-J": 'unfold',
                    "Ctrl-K": 'foldAll',
                    "Alt-K": 'unfoldAll',
                    'Alt-Right': function () {
                        ShaderBoy.editor.selectBuffer('MainImage', false);
                    },
                    'Alt-Left': function () {
                        ShaderBoy.editor.selectBuffer('Common', false);
                    },
                    'Alt-Up': function () {
                        ShaderBoy.isPlaying = !ShaderBoy.isPlaying;
                        ShaderBoy.time.pause();
                    },
                    'Alt-Down': function () {
                        ShaderBoy.time.reset();
                        ShaderBoy.uniforms.iFrame = 0;
                    },
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
                    'Ctrl-Alt-+': function () {
                        if (ShaderBoy.editor.textSize < 64) ShaderBoy.editor.textSize++;
                        ShaderBoy.editor.setTextSize();
                    },
                    'Ctrl-Alt-=': function () {
                        if (ShaderBoy.editor.textSize < 64) ShaderBoy.editor.textSize++;
                        ShaderBoy.editor.setTextSize();
                    },
                    'Ctrl-Alt--': function () {
                        if (ShaderBoy.editor.textSize > 8) ShaderBoy.editor.textSize--;
                        ShaderBoy.editor.setTextSize();
                    },
                    'Alt-Enter': function (cm) { ShaderBoy.io.recompile(); },
                    'Ctrl-S': function (cm) { ShaderBoy.io.saveShader(); },
                    'Ctrl-Alt-L': function () { ShaderBoy.io.loadShader(); },
                    'Ctrl-Shift-N': function () { ShaderBoy.io.newShader(); },
                    'Ctrl-Space': 'autocomplete',
                    'Ctrl-Alt-F': function (cm) {
                        function getSelectedRange() {
                            return {
                                from: cm.getCursor(true),
                                to: cm.getCursor(false),
                            };
                        }
                        let range = getSelectedRange();
                        cm.autoFormatRange(range.from, range.to);
                    },
                    'Ctrl-Alt-H': function () {
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
                break;

            case 'MacOS':
            case 'UNIX':
            case 'Linux':
                keys = {
                    "Ctrl-J": 'fold',
                    "Alt-J": 'unfold',
                    "Ctrl-K": 'foldAll',
                    "Alt-K": 'unfoldAll',
                    'Alt-Right': function () {
                        ShaderBoy.editor.selectBuffer('MainImage', false);
                    },
                    'Alt-Left': function () {
                        ShaderBoy.editor.selectBuffer('Common', false);
                    },
                    'Alt-Up': function () {
                        ShaderBoy.isPlaying = !ShaderBoy.isPlaying;
                        ShaderBoy.time.pause();
                    },
                    'Alt-Down': function () {
                        ShaderBoy.time.reset();
                        ShaderBoy.uniforms.iFrame = 0;
                    },
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
                    'Cmd-Alt-+': function () {
                        if (ShaderBoy.editor.textSize < 64) ShaderBoy.editor.textSize++;
                        ShaderBoy.editor.setTextSize();
                    },
                    'Cmd-Alt-=': function () {
                        if (ShaderBoy.editor.textSize < 64) ShaderBoy.editor.textSize++;
                        ShaderBoy.editor.setTextSize();
                    },
                    'Cmd-Alt--': function () {
                        if (ShaderBoy.editor.textSize > 8) ShaderBoy.editor.textSize--;
                        ShaderBoy.editor.setTextSize();
                    },
                    'Alt-Enter': function (cm) { ShaderBoy.io.recompile(); },
                    'Cmd-S': function (cm) { ShaderBoy.io.saveShader(); },
                    'Cmd-Alt-L': function () { ShaderBoy.io.loadShader(); },
                    'Cmd-Shift-N': function () { ShaderBoy.io.newShader(); },
                    'Cmd-Space': 'autocomplete',
                    'Ctrl-Alt-F': function (cm) {
                        function getSelectedRange() {
                            return {
                                from: cm.getCursor(true),
                                to: cm.getCursor(false),
                            };
                        }
                        let range = getSelectedRange();
                        cm.autoFormatRange(range.from, range.to);
                    },
                    'Ctrl-Alt-H': function () {
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
                break;

            case 'iOS':
            case 'Android':
                keys = {
                    "Ctrl-J": 'fold',
                    "Alt-J": 'unfold',
                    "Ctrl-K": 'foldAll',
                    "Alt-K": 'unfoldAll',
                    'Alt-Right': function () {
                        ShaderBoy.editor.selectBuffer('MainImage', false);
                    },
                    'Alt-Left': function () {
                        ShaderBoy.editor.selectBuffer('Common', false);
                    },
                    'Alt-Up': function () {
                        ShaderBoy.isPlaying = !ShaderBoy.isPlaying;
                        ShaderBoy.time.pause();
                    },
                    'Alt-Down': function () {
                        ShaderBoy.time.reset();
                        ShaderBoy.uniforms.iFrame = 0;
                    },
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
                    'Ctrl-Alt-=': function () {
                        if (ShaderBoy.editor.textSize < 64) ShaderBoy.editor.textSize++;
                        ShaderBoy.editor.setTextSize();
                    },
                    'Ctrl-Alt-+': function () {
                        if (ShaderBoy.editor.textSize < 64) ShaderBoy.editor.textSize++;
                        ShaderBoy.editor.setTextSize();
                    },
                    'Ctrl-Alt--': function () {
                        if (ShaderBoy.editor.textSize > 8) ShaderBoy.editor.textSize--;
                        ShaderBoy.editor.setTextSize();
                    },
                    'Alt-Space': function (cm) { ShaderBoy.io.recompile(); },
                    'Ctrl-S': function (cm) { ShaderBoy.io.saveShader(); },
                    'Ctrl-Alt-L': function () { ShaderBoy.io.loadShader(); },
                    'Ctrl-Alt-N': function () { ShaderBoy.io.newShader(); },
                    'Ctrl-Space': 'autocomplete',
                    'Ctrl-Alt-F': function (cm) {
                        function getSelectedRange() {
                            return {
                                from: cm.getCursor(true),
                                to: cm.getCursor(false),
                            };
                        }
                        let range = getSelectedRange();
                        cm.autoFormatRange(range.from, range.to);
                    },
                    'Alt-H': function () {
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
                break;

            default:
                break;
        }

        this.codemirror = CodeMirror.fromTextArea(this.textArea, {
            lineNumbers: true,
            smartIndent: true,
            mode: 'x-shader/x-fragment',
            // mode: 'glsl',
            indentWithTabs: false,
            keyMap: 'sublime',
            autoCloseBrackets: true,
            matchBrackets: true,
            showCursorWhenSelecting: true,
            theme: '3024-night',
            foldGutter: true,
            autofocus: true,
            continuousScanning: 500,
            styleActiveLine: true,
            styleCursor: true,
            indentUnit: 4,
            showInvisibles: true,
            maxInvisibles: 16,
            selectionPointer: true,
            styleSelectedText: true,
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
    selectBuffer: function (name, isInit) {
        this.codemirror.save();
        var doc = this.codemirror.getDoc();
        var cursor = doc.getCursor();
        let curCursor = { line: this.oldCursor.line, ch: this.oldCursor.ch };
        this.oldCursor = { line: cursor.line, ch: cursor.ch };

        if (name === 'MainImage') {
            ShaderBoy.buffers['MainImage'].active = true;
            ShaderBoy.buffers['Common'].active = false;
            if (!isInit) {
                ShaderBoy.buffers['Common'].textData = this.codemirror.getValue();
            }
            this.codemirror.setValue(ShaderBoy.util.deepcopy(ShaderBoy.buffers['MainImage'].textData));
        }
        if (name === 'Common') {
            ShaderBoy.buffers['MainImage'].active = false;
            ShaderBoy.buffers['Common'].active = true;
            if (!isInit) {
                ShaderBoy.buffers['MainImage'].textData = this.codemirror.getValue();
            }
            this.codemirror.setValue(ShaderBoy.util.deepcopy(ShaderBoy.buffers['Common'].textData));
        }
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
                // let icon = msg.appendChild(document.createElement("span"));
                // icon.innerHTML = "!";
                // icon.className = "error-icon";
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