//   ___        _     _
//  (  _`\     ( ) _ ( )_
//  | (_(_)   _| |(_)| ,_)   _    _ __
//  |  _)_  /'_` || || |   /'_`\ ( '__)
//  | (_( )( (_| || || |_ ( (_) )| |
//  (____/'`\__,_)(_)`\__)`\___/'(_)

import * as monaco from "monaco-editor";
import syntax from "./glsl/syntax";
import theme from "./glsl/theme";
import ShaderBoy from "../shaderboy";
import gui_sidebar_ichannels from "../gui/gui_sidebar_ichannels";
import editor_hotkeys from "./editor_hotkeys";
import gui_inline_1f from "../gui/gui_inline_1f";
import gui_inline_2f from "../gui/gui_inline_2f";
import gui_inline_col from "../gui/gui_inline_col";
import commands from "../commands";

// シンプルなエディタAPIを提供
export default ShaderBoy.editor = {
  // 内部プロパティ
  _monaco: null, // Monaco エディタのインスタンス
  _container: null, // エディタのコンテナ要素
  models: {}, // バッファ用のモデル格納
  // ミニマップ状態を追跡
  _isMinimapEnabled: false,

  // ========== 初期化 ==========
  init() {
    syntax.init();
    theme.init();

    // バッファモデルとエディタの関連付け
    this.models = {};
    this.activeModelId = null;

    // テキストサイズの初期化 - localStorage から読み込むか、デフォルト値を設定
    this.textSize = localStorage.textSize
      ? parseInt(localStorage.textSize, 10)
      : 14;

    this.domElement = document.getElementById("code");
    this.textArea = document.getElementById("editor");
    this.textArea.innerHTML = "";

    // エディタオプションの設定
    const editorOptions = {
      value: "", // 初期値は空
      language: "glsl", // GLSL言語指定
      theme: "shaderboy-color", // ここで直接テーマを指定
      fontSize: this.textSize,
      lineNumbers: true,
      scrollBeyondLastLine: true,
      scrollBeyondLastColumn: 10, // 水平方向にも余裕を持たせる
      minimap: {
        enabled: false, // ミニマップを有効化
        side: "right", // 右側に表示
        showSlider: "mouseover", // マウスオーバー時にスライダー表示
        renderCharacters: false, // 文字はレンダリングしない
        maxColumn: 80, // 最大幅を制限
        scale: 1, // スケールを整数に固定
      },
      automaticLayout: true,
      tabSize: 4,
      insertSpaces: true,
      wordWrap: "off",
      folding: true,
      matchBrackets: "near",
      renderWhitespace: "all",
      cursorBlinking: "phase",
      cursorStyle: "line",
      fixedOverflowWidgets: true,
      renderFocusBorder: false,
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true,
      lineDecorationsWidth: 0,
      glyphMargin: false,
      renderLineHighlight: "line",
      bracketPairColorization: { enabled: false }, // 括弧ペアの色分けを無効化
      links: true,
      contextmenu: true,
      mouseWheelZoom: true,
      overviewRulerLanes: 3,
      colorDecorators: true,
    };

    this._monaco = monaco.editor.create(this.textArea, editorOptions);
    monaco.editor.setTheme(false);
    this.createErrorPanel();
    this.setTextSize(this.textSize);

    theme.applyTheme(this._monaco, false);
    editor_hotkeys.setup();
    gui_inline_1f.register(this._monaco);
    gui_inline_2f.register(this._monaco);
    gui_inline_col.register(this._monaco);

    // addDecorationStyles();
    // setupDecorationUpdater(this._monaco);

    // 初期化後に設定を明示的に適用（タイミングの問題を回避）
    setTimeout(() => {
      this._monaco.updateOptions({
        scrollBeyondLastLine: true,
        scrollBeyondLastColumn: 10,
        matchBrackets: { beforeCursor: true, afterCursor: false },
        bracketPairColorization: { enabled: false }, // 括弧ペアの色分けを無効化
      });
      // レイアウトの再計算を強制
      this._monaco.layout();
    }, 100);

    // モナコエディタのキーバインディングを上書き
    this._monaco.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.UpArrow,
      () => {
        commands.pauseResumeTimeline();
        return false;
      }
    );

    this._monaco.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.DownArrow,
      () => {
        commands.resetTimeline();
        return false;
      }
    );

    return this;
  },

  // ========== 基本エディタ操作 ==========
  getValue() {
    return this._monaco ? this._monaco.getValue() : "";
  },

  setValue(code) {
    if (this._monaco) {
      this._monaco.setValue(code);
    }
    return this;
  },

  setTheme(isMonotone = false) {
    theme.applyTheme(this._monaco, isMonotone);
    return this;
  },

  setTextSize(size) {
    if (this._monaco) {
      this._monaco.updateOptions({ fontSize: size });
    }
    return this;
  },

  // ========== DOM操作 ==========
  getDomNode() {
    return this._monaco ? this._monaco.getDomNode() : null;
  },

  focus() {
    if (this._monaco) {
      this._monaco.focus();
    }
    return this;
  },

  layout() {
    if (this._monaco) {
      this._monaco.layout();
    }
    return this;
  },

  // ========== モデル管理 ==========
  createModel(name, content, language = "glsl") {
    if (!this.models[name]) {
      this.models[name] = monaco.editor.createModel(content, language);
    } else {
      this.models[name].setValue(content);
    }
    return this.models[name];
  },

  getModel(name) {
    return this.models[name] || null;
  },

  setBuffer(bufferName, showNow = false) {
    const resetScroll = true;
    const curBufName = ShaderBoy.editingBuffer;
    const newBufName = bufferName;

    // UI 連携: 編集中のバッファ名を設定
    ShaderBoy.editingBuffer = bufferName;

    // UI 連携: サイドバーの更新
    if (
      gui_sidebar_ichannels &&
      typeof gui_sidebar_ichannels.readiChannels === "function"
    ) {
      gui_sidebar_ichannels.readiChannels(bufferName);
    }

    // UI 連携: ヘッダーUI更新
    if (
      ShaderBoy.gui_header &&
      typeof ShaderBoy.gui_header.setActive === "function"
    ) {
      ShaderBoy.gui_header.setActive(bufferName);
    }

    // 既存のバッファがあれば、そのモデルを取得または作成
    if (!this.models[bufferName]) {
      // 新しいモデルを作成
      this.models[bufferName] = monaco.editor.createModel(
        ShaderBoy.buffers[bufferName]
          ? ShaderBoy.buffers[bufferName].getValue()
          : "",
        "glsl"
      );
      // エラーマークを保持する配列
      ShaderBoy.buffers[bufferName].errorMarkers = [];
    }

    // エディタのモデルを設定
    this._monaco.setModel(this.models[bufferName]);
    this.activeModelId = bufferName;

    if (resetScroll) {
      this._monaco.revealPositionInCenter({ lineNumber: 1, column: 1 });
    }

    // エディタにフォーカス
    this._monaco.focus();

    if (!this._isMinimapEnabled) {
      this.enableMinimap();
    }

    return this._monaco;
  },

  moveBuffer(offset) {
    const curBufName =
      ShaderBoy.activeBufferIds[ShaderBoy.bufferManager.currentBufferDataId];
    ShaderBoy.bufferManager.currentBufferDataId += offset;
    ShaderBoy.bufferManager.currentBufferDataId = Math.max(
      Math.min(
        ShaderBoy.activeBufferIds.length - 1,
        ShaderBoy.bufferManager.currentBufferDataId
      ),
      0
    );
    const newBufName =
      ShaderBoy.activeBufferIds[ShaderBoy.bufferManager.currentBufferDataId];

    if (curBufName !== newBufName) {
      this.setBuffer(newBufName);
    }

    return newBufName;
  },

  // 次のバッファに移動
  nextBuffer() {
    return this.moveBuffer(1);
  },

  // 前のバッファに移動
  prevBuffer() {
    return this.moveBuffer(-1);
  },

  // CodeMirror.Doc の代替として、モデルを使う
  createDoc(content, language) {
    return monaco.editor.createModel(content, language || "glsl");
  },

  // バッファの内容を取得
  getBufferContent(bufferName) {
    if (this.models[bufferName]) {
      return this.models[bufferName].getValue();
    }
    return "";
  },

  // ========== カーソル操作 ==========
  getPosition() {
    return this._monaco
      ? this._monaco.getPosition()
      : { lineNumber: 1, column: 1 };
  },

  setPosition(position) {
    if (this._monaco) {
      this._monaco.setPosition(position);
    }
    return this;
  },

  // ========== 選択操作 ==========
  getSelection() {
    return this._monaco ? this._monaco.getSelection() : null;
  },

  setSelection(selection) {
    if (this._monaco) {
      this._monaco.setSelection(selection);
    }
    return this;
  },

  // ========== エラー/警告表示 ==========
  // エラーパネルを作成
  createErrorPanel() {
    if (!this._monaco) return;

    // エディタコンテナを取得
    const editorContainer = this._monaco.getContainerDomNode().parentElement;

    // エラーパネルのコンテナを作成
    this.errorPanel = document.createElement("div");
    this.errorPanel.id = "error-panel";
    this.errorPanel.className = "error-panel";
    this.errorPanel.style.display = "none"; // 初期状態では非表示

    // エラーリストを格納する要素
    this.errorList = document.createElement("ul");
    this.errorList.className = "error-list";
    this.errorPanel.appendChild(this.errorList);

    // エラーパネルをエディタコンテナに追加
    editorContainer.appendChild(this.errorPanel);
  },

  showError(message, lineNumber) {
    const markers = [
      {
        severity: monaco.MarkerSeverity.Error,
        message: message,
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: 1000,
      },
    ];

    monaco.editor.setModelMarkers(
      this._monaco.getModel(),
      "shader-errors",
      markers
    );

    return this;
  },

  clearErrors() {
    if (this._monaco) {
      monaco.editor.setModelMarkers(
        this._monaco.getModel(),
        "shader-errors",
        []
      );
    }
    return this;
  },

  // エラー表示機能
  updateErrorInfo(bufName, errors) {
    // エラー表示パネルをリセット
    this.errorList.innerHTML = "";

    // エラーがなければパネルを非表示にして終了
    if (!errors || errors.length === 0) {
      this.errorPanel.style.display = "none";

      // モデルにマーカーが設定されていれば削除
      if (this.models[bufName]) {
        monaco.editor.setModelMarkers(this.models[bufName], "glsl", []);
      }
      return;
    }

    // パネルを表示
    this.errorPanel.style.display = "block";

    // マーカー情報を準備
    const markers = [];

    // 各エラーをパネルに追加
    for (let i = 0; i < errors.length; i++) {
      const err = errors[i];
      if (!err) continue;

      // エラーリスト項目を作成
      const errorItem = document.createElement("li");
      errorItem.className = "error-item";
      errorItem.innerHTML = `<span class="error-line">ln${err.lineNum}</span> <span class="error-element">${err.element}:</span> <span class="error-message">${err.msg}</span>`;

      // クリックしたらエラー行にジャンプ
      errorItem.addEventListener("click", () => {
        if (this.activeModelId === bufName) {
          this._monaco.revealPositionInCenter({
            lineNumber: err.lineNum,
            column: 1,
          });
          this._monaco.setPosition({
            lineNumber: err.lineNum,
            column: 1,
          });
          this._monaco.focus();
        }
      });

      this.errorList.appendChild(errorItem);

      // マーカー情報を追加（エディタのエラー行表示用）
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        message: `${err.element}: ${err.msg}`,
        startLineNumber: err.lineNum,
        startColumn: 1,
        endLineNumber: err.lineNum,
        endColumn: 1000,
        // カスタムタグを追加して識別しやすくする
        tags: ["custom-error"],
        // カスタムプロパティを追加
        customColor: "#fe8565",
      });
    }
  },

  // ========== ユーティリティ ==========
  isAvailable() {
    return !!this._monaco;
  },

  getMonaco() {
    // 必要な場合のみMonacoインスタンスへの直接アクセスを許可
    return this._monaco;
  },

  // テキストサイズ取得機能
  getTextSize() {
    // Monaco Editorのインスタンスから直接取得
    if (this._monaco) {
      return this._monaco.getOption(monaco.editor.EditorOption.fontSize);
    }

    // Monaco Editorが初期化されていない場合は保存されている値か、デフォルト値を返す
    return this.textSize || 14;
  },

  // テキストサイズ変更機能
  setTextSize(size) {
    if (!this._monaco) return;

    // 有効な範囲に制限 (例: 6px〜20px)
    size = Math.max(6, Math.min(20, size));

    // エディタのフォントサイズを更新
    this._monaco.updateOptions({
      fontSize: size,
    });

    // 新しいサイズを保存
    this.textSize = size;
    localStorage.textSize = size;

    // UIに反映（必要に応じて）
    if (document.getElementById("textSize")) {
      document.getElementById("textSize").innerHTML = size;
    }

    return size;
  },

  // テキストサイズを増やす
  incTextSize() {
    return this.setTextSize(this.textSize + 1);
  },

  // テキストサイズを減らす
  decTextSize() {
    return this.setTextSize(this.textSize - 1);
  },

  // ========== ミニマップ制御用API ==========

  /**
   * ミニマップを有効化する
   * @param {Object} options - オプションのミニマップ設定（省略可）
   * @returns {Object} this - メソッドチェーン用
   */
  enableMinimap(options = {}) {
    if (!this._monaco) return this;

    try {
      const minimapOptions = {
        enabled: true,
        side: "right",
        showSlider: "mouseover",
        renderCharacters: false,
        maxColumn: 80,
        scale: 1,
        ...options, // 追加のカスタムオプション
      };

      console.log("ミニマップを有効化します");
      this._monaco.updateOptions({ minimap: minimapOptions });
      this._isMinimapEnabled = true;
    } catch (err) {
      console.warn("ミニマップの有効化中にエラーが発生しました:", err);
    }

    return this;
  },

  /**
   * ミニマップを無効化する
   * @returns {Object} this - メソッドチェーン用
   */
  disableMinimap() {
    if (!this._monaco) return this;

    try {
      console.log("ミニマップを無効化します");
      this._monaco.updateOptions({ minimap: { enabled: false } });
      this._isMinimapEnabled = false;
    } catch (err) {
      console.warn("ミニマップの無効化中にエラーが発生しました:", err);
    }

    return this;
  },

  /**
   * ミニマップの現在の状態を取得する
   * @returns {boolean} ミニマップが有効かどうか
   */
  isMinimapEnabled() {
    return this._isMinimapEnabled;
  },

  /**
   * ミニマップの状態をトグルする
   * @returns {Object} this - メソッドチェーン用
   */
  toggleMinimap() {
    return this._isMinimapEnabled
      ? this.disableMinimap()
      : this.enableMinimap();
  },
};
