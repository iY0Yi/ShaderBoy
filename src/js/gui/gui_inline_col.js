import * as monaco from "monaco-editor";
import ShaderBoy from "../shaderboy";

export default ShaderBoy.gui_inline_col = {
  // 初期設定
  setup() {
    console.log("Inline vec3 Color Picker setup initialized");
    this.offsetR = 0.0;
    this.offsetG = 0.0;
    this.offsetB = 0.0;
    // HSV値も保持
    this.offsetH = 0.0;
    this.offsetS = 0.0;
    this.offsetV = 0.0;
    this.name = "u_editorColorValue";

    this._active = false;
    this._editorInstance = null;
    this._precision = 4;
    this._originalValueR = 0.0;
    this._originalValueG = 0.0;
    this._originalValueB = 0.0;
    this._decorationIds = [];
    this._targetLine = null;
    this._targetValue = null;
    this._targetStartCol = null;
    this._targetEndCol = null;
    this._widget = null;

    ShaderBoy.gui.inline3fUniformFS = `uniform vec3 ${this.name};\n`;
  },

  // エディタへの登録
  register(editor) {
    if (!editor) {
      console.error('エディタが指定されていません');
      return;
    }

    this._editorInstance = editor;

    // 既存のイベントリスナーを解除
    if (this._disposable) {
      this._disposable.dispose();
      this._disposable = null;
    }

    // カラーマーカーを更新
    this._updateColorMarkers(editor);

    // タップ検出のための変数
    let lastTapTime = 0;
    let tapTimeout = null;
    let tapPosition = null;

    // エディタマウスダウン/タッチのイベントハンドラ
    this._disposable = editor.onMouseDown((e) => {
      // 現在の時刻を取得
      const currentTime = new Date().getTime();
      const tapDelay = currentTime - lastTapTime;

      // ターゲットの位置情報を取得
      const target = e.target;
      if (!target || !target.position) {
        return;
      }

      // クリックされた位置
      const lineNumber = target.position.lineNumber;
      const column = target.position.column;

      // カラーピッカーが既に表示されている場合は処理しない
      if (this._active) {
        return;
      }

      // ダブルタップ/ダブルクリック判定
      // デスクトップ環境のダブルクリック
      const isDoubleClick = e.event.detail === 2;

      // モバイル環境のダブルタップ (500ms以内の2回目のタップで、ほぼ同じ位置)
      const isDoubleTap = tapDelay < 500 && tapPosition &&
                          Math.abs(tapPosition.lineNumber - lineNumber) < 2 &&
                          Math.abs(tapPosition.column - column) < 5;

      // 位置を保存
      tapPosition = { lineNumber, column };
      lastTapTime = currentTime;

      // ダブルクリック/ダブルタップでない場合は次の処理へ進まない
      if (!isDoubleClick && !isDoubleTap) {
        return;
      }

      // 現在の行のコンテンツを取得
      const model = editor.getModel();
      if (!model) {
        return;
      }
      const lineContent = model.getLineContent(lineNumber);

      // マーカーの位置にクリックがあったかチェック
      const isClickOnMarker = this._isClickOnColorMarker(lineContent, column);

      // マーカーのクリックでない場合は処理しない
      if (!isClickOnMarker) {
        return;
      }

      // クリック位置以降のvec3関数を検出
      const vec3Pos = this._findVec3AtMarkerPosition(lineContent, column);
      if (vec3Pos === null) {
        return;
      }

      // vec3関数の値を解析
      const colorInfo = this._parseVec3Color(lineContent, vec3Pos.start);
      if (!colorInfo) {
        return;
      }

      // カラーピッカーを表示
      this._buildGUI(
        editor,
        lineNumber,
        colorInfo.startCol,
        colorInfo.endCol,
        colorInfo.r,
        colorInfo.g,
        colorInfo.b,
        lineContent
      );

      // イベントの伝播を止める
      e.event.preventDefault();
      e.event.stopPropagation();
    });

    // CSSスタイルを追加（一度だけ）
    if (!document.getElementById('color-marker-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'color-marker-styles';

      // エディタからフォントサイズを取得
      const fontSize = editor.getOption(monaco.editor.EditorOption.fontSize);
      // マーカーサイズをフォントサイズに基づいて計算（少し大きめに）
      const markerSize = Math.floor(fontSize * 0.8);

      styleEl.textContent = `
        /* カラーマーカー関連のスタイル */
        .inline_col-dot {
          font-size: ${markerSize}px !important;
          margin-right: 2px !important;
          vertical-align: baseline !important;
        }

        /* カラーピッカー関連のスタイル */
        .inline_col-picker-container-wrapper {
          // Just for avoid the parent node layout
        }

        .inline_col-picker-container {
          width: 360px;
          display: flex;
          flex-direction: row;
          align-items: center;
          margin-top: 0px;
          background: #262525;
          border-radius: 0px;
          padding: 0px;
          text-align: center;
          box-shadow: 0px 0.2px 0.2px hsl(0deg 3% 4% / 0.63),
                      0px 0.3px 0.2px -0.5px hsl(0deg 3% 4% / 0.57),
                      0px 0.5px 0.4px -1.1px hsl(0deg 3% 4% / 0.51),
                      0px 1px 0.8px -1.6px hsl(0deg 3% 4% / 0.45),
                      -0.1px 2px 1.6px -2.1px hsl(0deg 3% 4% / 0.39),
                      -0.1px 3.6px 2.8px -2.6px hsl(0deg 3% 4% / 0.33),
                      -0.2px 6px 4.7px -3.2px hsl(0deg 3% 4% / 0.27),
                      -0.3px 9.3px 7.3px -3.7px hsl(0deg 3% 4% / 0.21),
                      -0.4px 13.8px 10.9px -4.2px hsl(0deg 3% 4% / 0.15),
                      -0.6px 19.4px 15.3px -4.7px hsl(0deg 3% 4% / 0.09);
          z-index: 1000;
        }

        /* プレビューコンテナの改善 */
        .inline_col-color-preview {
          width: 90px;
          height: 90px;
          margin-right: 20px;
          border-radius: 0px;
          border: 0px solid rgba(0,0,0,0);
        }

        /* スライダーコンテナのスタイル改善 */
        .inline_col-slider-container-parent {
          margin: 0px;
          padding: 0px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 230px;
          height: 90px;
          vertical-align: middle;
          justify-content: center;
        }

        /* 新しい階層構造用のスタイル */
        .inline_col-slider-wrapper {
          position: relative;
          height: 20px;
          display: flex;
          align-items: center;
        }

        /* 視覚的なトラック - 3pxの高さ */
        .inline_col-slider-track {
          position: absolute;
          width: 100%;
          height: 3px;
          border-radius: 2px;
          background: #2C2C2C;
          z-index: 1;
        }

        /* HSVスライダー用のトラックスタイル - 透明度を追加して背景色と混合 */
        .inline_col-slider-track.hue {
          background: linear-gradient(to right,
              rgba(255,0,0,0.2), rgba(255,255,0,0.2), rgba(0,255,0,0.2),
              rgba(0,255,255,0.2), rgba(0,0,255,0.2), rgba(255,0,255,0.2), rgba(255,0,0,0.2)),
              #2C2C2C;
          background-blend-mode: screen;
        }

        .inline_col-slider-track.saturation {
          --hue-color: 0;
          background: linear-gradient(to right,
                       rgba(128,128,128,0.1), rgba(255,255,255,0)),
                       linear-gradient(to right,
                       rgba(255,255,255,0.1), hsla(var(--hue-color), 100%, 50%, 0.1)),
                       #2C2C2C;
          background-blend-mode: screen;
        }

        .inline_col-slider-track.value {
          --hue-color: 0;
          --sat-percent: 100%;
          background: linear-gradient(to right,
                       rgba(0,0,0,0.8), hsla(var(--hue-color), var(--sat-percent), 50%, 0.2)),
                       #2C2C2C;
          background-blend-mode: screen;
        }

        /* 実際のスライダー入力 - 完全に透明で広いクリッカブルエリア */
        .inline_col-slider {
          -webkit-appearance: none;
          appearance: none;
          position: absolute;
          width: 100%;
          height: 20px;
          background-color: transparent;
          z-index: 2;
          cursor: pointer;
          margin: 0;
        }

        /* スライダーのトラックを透明に */
        .inline_col-slider::-webkit-slider-runnable-track {
          height: 20px;
          background: transparent;
          border: none;
        }

        .inline_col-slider::-moz-range-track {
          height: 20px;
          background: transparent;
          border: none;
        }

        /* スライダーのつまみ */
        .inline_col-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 10px;
          height: 10px;
          margin-top: 5px;
          background: #D4BE98;
          border-radius: 50%;
          border: 0px solid rgba(0, 0, 0, 0);
          cursor: pointer;
          z-index: 3;
        }

        .inline_col-slider::-moz-range-thumb {
          width: 10px;
          height: 10px;
          background: #D4BE98;
          border-radius: 50%;
          border: 0px solid rgba(0, 0, 0, 0);
          cursor: pointer;
          z-index: 3;
        }
      `;
      document.head.appendChild(styleEl);
    }

    // エディタのコンテンツ変更イベントを監視
    editor.onDidChangeModelContent(() => {
      // 内容変更時にマーカーを更新
      this._updateColorMarkers(editor);
    });

    // エディタ初期化後にマーカーを表示
    setTimeout(() => {
      this._updateColorMarkers(editor);
    }, 500);
  },

  // マーカーの位置にクリックがあったかチェックする
  _isClickOnColorMarker(lineContent, column) {
    // lineContentの各文字を調べ、column位置の前にvec3があるかをチェック
    // マーカーはvec3の直前にあるので、vec3の位置-1がマーカーの位置と考える

    // vec3関数を検出する正規表現
    const vec3Pattern = /vec3\s*\(/g;
    let match;
    while ((match = vec3Pattern.exec(lineContent)) !== null) {
      const vec3Start = match.index;
      // マーカーの位置はvec3の直前とその周辺
      // クリック位置がvec3の開始位置の前後3文字以内ならマーカークリックとみなす
      if (column >= vec3Start - 3 && column <= vec3Start + 1) {
        return true;
      }
    }
    return false;
  },

  // マーカー位置に対応するvec3関数の位置を見つける
  _findVec3AtMarkerPosition(lineContent, column) {
    // vec3関数を検出する正規表現
    const vec3Pattern = /vec3\s*\(\s*([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s*(?:,\s*([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s*,\s*([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s*)?\)/g;

    let match;
    while ((match = vec3Pattern.exec(lineContent)) !== null) {
      const vec3Start = match.index;
      const vec3End = vec3Start + match[0].length;

      // マーカー位置（vec3の直前）に近いクリックかチェック
      if (column >= vec3Start - 3 && column <= vec3Start + 1) {
        return {
          start: vec3Start,
          end: vec3End,
          text: match[0]
        };
      }
    }
    return null;
  },

  // vec3関数の色情報を解析
  _parseVec3Color(lineContent, startPos) {
    // vec3関数を検出する正規表現
    const vec3Pattern = /vec3\s*\(\s*([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s*(?:,\s*([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s*,\s*([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s*)?\)/g;

    // 正規表現を開始位置から実行
    vec3Pattern.lastIndex = startPos;
    const match = vec3Pattern.exec(lineContent);

    if (!match) {
      return null;
    }

    // vec3の開始位置と終了位置
    const startCol = match.index + 1; // Monaco Editorのカラムは1から始まる
    const endCol = startCol + match[0].length - 1;

    let r, g, b;

    // 3つの値があるか単一値かを判定
    if (match[2] !== undefined && match[3] !== undefined) {
      // 3つの値がある場合
      r = parseFloat(match[1]);
      g = parseFloat(match[2]);
      b = parseFloat(match[3]);
    } else {
      // 単一の値の場合
      r = g = b = parseFloat(match[1]);
    }

    // 値が正しく解析されたか確認
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return null;
    }

    // 値を0〜1の範囲に制限
    r = Math.min(1, Math.max(0, r));
    g = Math.min(1, Math.max(0, g));
    b = Math.min(1, Math.max(0, b));

    return {
      startCol,
      endCol,
      r,
      g,
      b
    };
  },

  // シェーダーコードにエディタの変更を適用
  insertUniform(shaderCode) {
    // 非アクティブなら何もしない
    if (!this._active) {
      return shaderCode;
    }

    // uniform宣言を追加
    let modifiedCode = shaderCode;

    // ターゲット行とvec3値を見つけて置換
    const result = this._replaceTargetVec3(modifiedCode);
    modifiedCode = result.code;

    if (result.modified) {
      console.log("Color Picker: Inserted uniform", this.name, result.code);
    }

    return modifiedCode;
  },

  // カラーマーカー表示の更新
  _updateColorMarkers(editor) {
    // _disposables 配列を初期化 (存在しない場合)
    if (!this._disposables) {
      this._disposables = [];
    }

    // 既存のリスナーをクリーンアップ
    this._disposables.forEach(d => d.dispose());
    this._disposables = [];

    // 既にマネージャーが存在すれば破棄
    if (this._decorationManager) {
      this._decorationManager.dispose();
    }

    // 新しいデコレーションマネージャーを作成
    this._decorationManager = new SafeDecorationManager(editor);

    // 初期デコレーションをスケジュール
    setTimeout(() => {
      this._decorationManager.scheduleUpdate();
    }, 500);

    // コンテンツ変更時にデコレーションを更新
    this._disposables.push(
      editor.onDidChangeModelContent(() => {
        this._decorationManager.scheduleUpdate();
      })
    );

    // モデル変更時のリスナー
    this._disposables.push(
      editor.onDidChangeModel(() => {
        // 一度クリアしてから新しいモデルにデコレーションを適用
        this._decorationManager.dispose();
        setTimeout(() => {
          this._decorationManager.scheduleUpdate();
        }, 500);
      })
    );

    // スタイルを追加
    this._addColorMarkerStyles();
  },

  // スタイルの追加
  _addColorMarkerStyles() {
    // スタイルは既にregisterメソッドで追加済みなので何もしない
  },

  // ターゲット行のvec3値を見つけて置換する処理
  _replaceTargetVec3(shaderCode) {
    const targetLine = this._targetLine;
    const targetValue = this._targetValue;

    console.log("Target line:", JSON.stringify(targetLine));
    console.log("Original vec3 value:", targetValue);

    if (
      !targetLine ||
      !targetValue ||
      targetValue.r === undefined ||
      targetValue.g === undefined ||
      targetValue.b === undefined
    ) {
      return { code: shaderCode, modified: false };
    }

    const lines = shaderCode.split("\n");
    let modified = false;

    // ターゲット行と一致する行を探す
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === targetLine.trim()) {
        console.log(`Found matching line at index ${i}: ${lines[i]}`);

        // vec3表現を検索して置換
        const vec3Pattern =
          /vec3\s*\(\s*(\d*\.\d+|\d+\.\d*|\d+)\s*,\s*(\d*\.\d+|\d+\.\d*|\d+)\s*,\s*(\d*\.\d+|\d+\.\d*|\d+)\s*\)/g;

        lines[i] = lines[i].replace(vec3Pattern, (match, r, g, b) => {
          // 数値が一致するか確認
          const foundR = parseFloat(r);
          const foundG = parseFloat(g);
          const foundB = parseFloat(b);

          // ターゲットの値と一致するvec3を検索
          if (
            Math.abs(foundR - targetValue.r) < 0.0001 &&
            Math.abs(foundG - targetValue.g) < 0.0001 &&
            Math.abs(foundB - targetValue.b) < 0.0001
          ) {
            // uniform変数で完全に置き換え
            modified = true;
            return this.name;
          }

          return match; // 一致しない場合は変更なし
        });

        break;
      }
    }

    return {
      code: lines.join("\n"),
      modified,
    };
  },

  // デコレーション更新
  _updateDecorations(editor, lineNumber, startCol, endCol, newR, newG, newB) {
    // 既存のデコレーションを削除
    if (this._decorationIds.length > 0) {
      editor.deltaDecorations(this._decorationIds, []);
    }

    // 新しいデコレーションを追加
    this._decorationIds = editor.deltaDecorations(
      [],
      [
        {
          range: new monaco.Range(lineNumber, startCol, lineNumber, endCol),
          options: {
            inlineClassName: "color-modified-value",
            after: {
              content: ` → vec3(${newR.toFixed(
                this._precision
              )}, ${newG.toFixed(this._precision)}, ${newB.toFixed(
                this._precision
              )})`,
              inlineClassName: "color-value-overlay",
            },
            before: {
              content: "",
              inlineClassName: "color-preview-inline",
              inlineClassNameAffectsLetterSpacing: false,
              contentLeft: "2px",
              backgroundColor: `rgb(${newR * 255}, ${newG * 255}, ${
                newB * 255
              })`,
              border: "1px solid #00000044",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
            },
          },
        },
      ]
    );
  },

  // エディタを閉じるためのメソッド
  _destroyGUI() {
    console.log("Closing color picker without applying changes");

    // アクティブな参照がなければ何もしない
    if (!this._active || !this._widget) {
      return;
    }

    // エディタインスタンスを取得
    const editor = this._editorInstance;
    if (!editor) {
      console.warn("No editor instance found to hide color picker");
      return;
    }

    // カラーピッカー状態をリセット
    this._active = false;

    // デコレーションを削除
    if (this._decorationIds && this._decorationIds.length > 0) {
      editor.deltaDecorations(this._decorationIds, []);
      this._decorationIds = [];
    }

    // ウィジェットを削除
    if (this._widget) {
      editor.removeContentWidget(this._widget);
      this._widget = null;
    }

    // カラーマーカーを更新
    this._updateColorMarkers(editor);

    console.log("Color picker closed successfully");
  },

  // カラーピッカー生成
  _buildGUI(
    editor,
    lineNumber,
    startCol,
    endCol,
    valueR,
    valueG,
    valueB,
    originalText
  ) {
    // 既存のウィジェットを削除
    if (this._widget) {
      editor.removeContentWidget(this._widget);
      this._widget = null;
    }

    // 状態を初期化
    this._active = true;
    this._originalValueR = valueR;
    this._originalValueG = valueG;
    this._originalValueB = valueB;

    // offsetの初期値を元の値と同じに設定
    this.offsetR = valueR;
    this.offsetG = valueG;
    this.offsetB = valueB;

    // RGB値からHSV値を計算
    const [h, s, v] = this._rgbToHsv(valueR, valueG, valueB);
    this.offsetH = h;
    this.offsetS = s;
    this.offsetV = v;

    this._targetLine = originalText;
    this._targetValue = { r: valueR, g: valueG, b: valueB };
    this._targetStartCol = startCol;
    this._targetEndCol = endCol;

    console.log("Color Picker: Setting global state", this._active);
    console.log(
      "Color Picker: Original values:",
      this._originalValueR,
      this._originalValueG,
      this._originalValueB
    );
    ShaderBoy.forceCompile = true; // コンパイルをトリガー

    // メインコンテナ
    const container = document.createElement("div");
    container.className = "inline_col-picker-container-wrapper";

    // ピッカーコンテナ
    const pickerContainer = document.createElement("div");
    pickerContainer.className = "inline_col-picker-container";

    // カラープレビューエリア
    const previewContainer = document.createElement("div");
    previewContainer.className = "inline_col-color-preview";
    previewContainer.style.backgroundColor = `rgb(${valueR * 255}, ${valueG * 255}, ${valueB * 255})`;
    pickerContainer.appendChild(previewContainer);

    // HSVスライダーのコンテナ
    const slidersContainer = document.createElement("div");
    slidersContainer.className = "inline_col-slider-container-parent";

    pickerContainer.appendChild(slidersContainer);

    // HSVスライダーの作成
    const createHsvSlider = (label, value, max, sliderClass, updateFn) => {
      // ラッパーコンテナ作成
      const sliderContainer = document.createElement("div");
      sliderContainer.className = "inline_col-slider-container";

      // スライダーラッパー
      const sliderWrapper = document.createElement("div");
      sliderWrapper.className = "inline_col-slider-wrapper";

      // 視覚的なトラック
      const sliderTrack = document.createElement("div");
      sliderTrack.className = `inline_col-slider-track ${sliderClass}`;

      // HSV値によるトラック色の設定
      if (sliderClass === "saturation") {
        sliderTrack.style.setProperty('--hue-color', this.offsetH);
      } else if (sliderClass === "value") {
        sliderTrack.style.setProperty('--hue-color', this.offsetH);
        sliderTrack.style.setProperty('--sat-percent', `${this.offsetS * 100}%`);
      }

      // 実際のスライダー入力
      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "0";
      slider.max = max.toString();
      slider.step = "0.0001";
      slider.value = value;
      slider.className = "inline_col-slider";

      // スライダーのイベントリスナー
      slider.addEventListener("input", (e) => {
        const newValue = parseFloat(e.target.value);
        updateFn(newValue);
        ShaderBoy.forceDraw = true;
      });

      // 要素を組み立て
      sliderWrapper.appendChild(sliderTrack);
      sliderWrapper.appendChild(slider);
      sliderContainer.appendChild(sliderWrapper);

      return sliderContainer;
    };

    // 色相スライダー
    const hueSlider = createHsvSlider("Hue", h, 360, "hue", (value) => {
      this.offsetH = value;

      // HSVからRGB値を更新
      const [newR, newG, newB] = this._hsvToRgb(this.offsetH, this.offsetS, this.offsetV);
      this.offsetR = newR;
      this.offsetG = newG;
      this.offsetB = newB;

      // 彩度・明度スライダーの色を更新 - トラック要素を参照
      const satTrack = document.querySelector('.inline_col-slider-track.saturation');
      const valTrack = document.querySelector('.inline_col-slider-track.value');

      if (satTrack) satTrack.style.setProperty('--hue-color', this.offsetH);
      if (valTrack) {
        valTrack.style.setProperty('--hue-color', this.offsetH);
        valTrack.style.setProperty('--sat-percent', `${this.offsetS * 100}%`);
      }

      // プレビュー更新
      previewContainer.style.backgroundColor = `rgb(${newR * 255}, ${newG * 255}, ${newB * 255})`;

      // エディタ上のデコレーション更新
      this._updateDecorations(editor, lineNumber, startCol, endCol, newR, newG, newB);
    });
    slidersContainer.appendChild(hueSlider);

    // 彩度スライダー
    const satSlider = createHsvSlider("Saturation", s, 1, "saturation", (value) => {
      this.offsetS = value;

      // HSVからRGB値を更新
      const [newR, newG, newB] = this._hsvToRgb(this.offsetH, this.offsetS, this.offsetV);
      this.offsetR = newR;
      this.offsetG = newG;
      this.offsetB = newB;

      // 明度スライダーの色を更新
      const valTrack = document.querySelector('.inline_col-slider-track.value');
      if (valTrack) {
        valTrack.style.setProperty('--sat-percent', `${this.offsetS * 100}%`);
      }

      // プレビュー更新
      previewContainer.style.backgroundColor = `rgb(${newR * 255}, ${newG * 255}, ${newB * 255})`;

      // エディタ上のデコレーション更新
      this._updateDecorations(editor, lineNumber, startCol, endCol, newR, newG, newB);
    });
    slidersContainer.appendChild(satSlider);

    // 明度スライダー
    const valueSlider = createHsvSlider("Value", v, 1, "value", (value) => {
      this.offsetV = value;

      // HSVからRGB値を更新
      const [newR, newG, newB] = this._hsvToRgb(this.offsetH, this.offsetS, this.offsetV);
      this.offsetR = newR;
      this.offsetG = newG;
      this.offsetB = newB;

      // プレビュー更新
      previewContainer.style.backgroundColor = `rgb(${newR * 255}, ${newG * 255}, ${newB * 255})`;

      // エディタ上のデコレーション更新
      this._updateDecorations(editor, lineNumber, startCol, endCol, newR, newG, newB);
    });
    slidersContainer.appendChild(valueSlider);

    container.appendChild(pickerContainer);

    // エディタにウィジェットとして追加
    const widget = {
      getId: () => "color-picker-widget",
      getDomNode: () => container,
      getPosition: () => ({
        position: {
          lineNumber: lineNumber,
          column: endCol + 2,
        },
        preference: [
          monaco.editor.ContentWidgetPositionPreference.BELOW,
          monaco.editor.ContentWidgetPositionPreference.ABOVE,
        ],
      }),
    };

    // ウィジェットを保存
    this._widget = widget;
    editor.addContentWidget(widget);

    // エディタ上のデコレーション更新
    this._updateDecorations(
      editor,
      lineNumber,
      startCol,
      endCol,
      valueR,
      valueG,
      valueB
    );

    // イベントリスナー変数の定義
    let currentOutsideClickHandler = null;
    let handleOutsideTap = null;

    // 確定処理のメソッド
    const confirmValues = () => {
      console.log(
        "Color picker confirmed with values:",
        this.offsetR,
        this.offsetG,
        this.offsetB
      );

      // 最終的な色の値を計算
      const finalR = this.offsetR;
      const finalG = this.offsetG;
      const finalB = this.offsetB;

      // エディタのモデルを取得
      const model = editor.getModel();
      if (model) {
        // 対象行のテキストを取得
        const lineContent = model.getLineContent(lineNumber);

        // vec3パターンにマッチする部分を探す
        const vec3Pattern = /vec3\s*\(\s*(\d*\.\d+|\d+\.\d*|\d+)\s*,\s*(\d*\.\d+|\d+\.\d*|\d+)\s*,\s*(\d*\.\d+|\d+\.\d*|\d+)\s*\)/g;

        let newLineContent = lineContent;
        let match;
        while ((match = vec3Pattern.exec(lineContent)) !== null) {
          // 元の値を取得
          const foundR = parseFloat(match[1]);
          const foundG = parseFloat(match[2]);
          const foundB = parseFloat(match[3]);

          // 元の値と一致するvec3を検索
          if (Math.abs(foundR - this._originalValueR) < 0.0001 &&
            Math.abs(foundG - this._originalValueG) < 0.0001 &&
            Math.abs(foundB - this._originalValueB) < 0.0001) {

            // 新しい値でvec3を置換
            const newVec3 = `vec3(${finalR.toFixed(this._precision)}, ${finalG.toFixed(this._precision)}, ${finalB.toFixed(this._precision)})`;
            newLineContent = lineContent.substring(0, match.index) +
              newVec3 +
              lineContent.substring(match.index + match[0].length);
            break;
          }
        }

        // 変更があった場合のみエディタを更新
        if (newLineContent !== lineContent) {
          model.pushEditOperations(
            [],
            [{
              range: new monaco.Range(lineNumber, 1, lineNumber, lineContent.length + 1),
              text: newLineContent
            }],
            () => null
          );
        }
      }

      // イベントリスナーのクリーンアップ
      if (currentOutsideClickHandler) {
        document.removeEventListener('dblclick', currentOutsideClickHandler);
        if (handleOutsideTap) {
          document.removeEventListener('touchstart', handleOutsideTap);
        }
        currentOutsideClickHandler = null;
        handleOutsideTap = null;
      }

      // カラーピッカーを非アクティブにする
      this._active = false;

      // デコレーションを削除
      if (this._decorationIds.length > 0) {
        editor.deltaDecorations(this._decorationIds, []);
        this._decorationIds = [];
      }

      // ウィジェットを削除
      editor.removeContentWidget(widget);
      this._widget = null;

      // カラーマーカーを更新
      this._updateColorMarkers(editor);

      // 再コンパイルをトリガー
      ShaderBoy.forceCompile = true;
    };

    // カラーピッカー上のダブルクリック検出と確定処理
    setTimeout(() => {
      // カラーピッカーコンテナがないか既に削除されている場合は終了
      if (!container || !container.isConnected) {
        return;
      }

      // ダブルクリック検出用変数
      let lastClickTime = 0;

      // ピッカー内のダブルクリックで確定
      container.addEventListener("dblclick", (e) => {
        console.log("Double click in color picker - applying changes");
        e.preventDefault();
        e.stopPropagation();
        confirmValues();
      });

      // モバイル用ダブルタップ検出（ピッカー内）
      container.addEventListener(
        "touchstart",
        (e) => {
          const currentTime = Date.now();
          const tapLength = currentTime - lastClickTime;

          // ダブルタップとして処理（300ms以内の2回のタップ）
          if (tapLength < 300 && tapLength > 0) {
            console.log("Double tap in color picker - applying changes");
            e.preventDefault();
            e.stopPropagation();
            confirmValues();
            lastClickTime = 0; // リセット
          } else {
            lastClickTime = currentTime;
          }
        },
        { passive: false }
      );

      // 外部クリックイベントでのクリーンアップをダブルクリック/タップに変更
      const handleOutsideAction = (e) => {
        // カラーピッカーの DOM 要素を取得
        const containerElement = container;

        // ダブルクリック/タップがコンテナ外かどうかをチェック
        if (!containerElement.contains(e.target)) {
          // 外部ダブルクリック/タップを検出
          console.log("Outside double click detected - canceling");

          // イベントリスナーを削除（クリーンアップ）
          document.removeEventListener("dblclick", handleOutsideAction);
          if (handleOutsideTap) {
            document.removeEventListener("touchstart", handleOutsideTap);
            handleOutsideTap = null;
          }
          currentOutsideClickHandler = null;

          // カラーピッカー状態をリセット
          this._active = false;

          // デコレーションを削除
          if (this._decorationIds.length > 0) {
            editor.deltaDecorations(this._decorationIds, []);
            this._decorationIds = [];
          }

          // ウィジェットを削除
          editor.removeContentWidget(widget);
          this._widget = null;

          // カラーマーカーを更新
          this._updateColorMarkers(editor);

          // 再コンパイルをトリガー
          ShaderBoy.forceCompile = true;
        }
      };

      // モバイル用ダブルタップ処理
      let lastOutsideTapTime = 0;
      handleOutsideTap = (e) => {
        const containerElement = container;

        // コンテナ外のタップのみ処理
        if (!containerElement.contains(e.target)) {
          const now = Date.now();
          const tapLength = now - lastOutsideTapTime;

          // ダブルタップとして処理（300ms以内の2回のタップ）
          if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();
            e.stopPropagation();

            // 上記の handleOutsideAction と同様の処理
            console.log("Outside double tap detected - canceling");

            // イベントリスナーを削除
            document.removeEventListener("dblclick", handleOutsideAction);
            document.removeEventListener("touchstart", handleOutsideTap);
            currentOutsideClickHandler = null;
            handleOutsideTap = null;

            // カラーピッカー状態をリセット
            this._active = false;

            // デコレーションを削除
            if (this._decorationIds.length > 0) {
              editor.deltaDecorations(this._decorationIds, []);
              this._decorationIds = [];
            }

            // ウィジェットを削除
            editor.removeContentWidget(widget);
            this._widget = null;

            // カラーマーカーを更新
            this._updateColorMarkers(editor);

            // 再コンパイルをトリガー
            ShaderBoy.forceCompile = true;

            lastOutsideTapTime = 0; // リセット
          } else {
            lastOutsideTapTime = now;
          }
        }
      };

      // 既存のイベントリスナーを削除
      if (currentOutsideClickHandler) {
        document.removeEventListener("dblclick", currentOutsideClickHandler);
        document.removeEventListener("touchstart", currentOutsideClickHandler);
      }

      // 新しいハンドラーを保存
      currentOutsideClickHandler = handleOutsideAction;

      // ダブルクリックとタッチのイベントをリッスン
      document.addEventListener("dblclick", handleOutsideAction);
      document.addEventListener("touchstart", handleOutsideTap, {
        passive: false,
      });
    }, 100);
  },

  // RGBからHSVへの変換関数
  _rgbToHsv(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h, s, v = max;

    // 彩度の計算
    s = max === 0 ? 0 : delta / max;

    // 色相の計算
    if (delta === 0) {
      h = 0; // 彩度がゼロの場合は色相は未定義
    } else {
      if (max === r) {
        h = ((g - b) / delta) % 6;
      } else if (max === g) {
        h = (b - r) / delta + 2;
      } else { // max === b
        h = (r - g) / delta + 4;
      }

      h *= 60; // 度数に変換
      if (h < 0) h += 360;
    }

    return [h, s, v];
  },

  // HSVからRGBへの変換関数
  _hsvToRgb(h, s, v) {
    let r, g, b;

    const i = Math.floor(h / 60) % 6;
    const f = h / 60 - Math.floor(h / 60);
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }

    return [r, g, b];
  },

  // カラーマーカー用のCSSスタイルを更新
  _updateColorStyles(decorations) {
    // 古いスタイル要素を削除
    document.querySelectorAll('style[id^="color-marker-style-"]').forEach(el => {
      el.remove();
    });

    // 新しいスタイル要素を追加
    if (this._processedColors && this._processedColors.size > 0) {
      const styleEl = document.createElement('style');
      styleEl.id = `color-marker-styles-dynamic`;

      let styleText = ``;

      // 各色に対応するスタイルを追加
      this._processedColors.forEach((colorInfo, colorKey) => {
        const { r, g, b, markerId } = colorInfo;
        styleText += `
          .${markerId} {
            color: rgb(${r}, ${g}, ${b}) !important;
          }
        `;
      });

      styleEl.textContent = styleText;
      document.head.appendChild(styleEl);

      console.log(`${this._processedColors.size}色のスタイルを適用しました`);
    }
  },
};

// 安全なデコレーション更新のためのクラス
class SafeDecorationManager {
    constructor(editor) {
      this.editor = editor;
      this.decorationIds = [];
      this.pendingUpdate = false;
      this.updateQueued = false;
      this.updateTimer = null;
      this._processedColors = new Map();
    }

    scheduleUpdate() {
      if (this.pendingUpdate) {
        this.updateQueued = true;
        return;
      }

      if (this.updateTimer) {
        clearTimeout(this.updateTimer);
      }

      this.updateTimer = setTimeout(() => {
        this.performUpdate();
      }, 300);
    }

    async performUpdate() {
      if (this.pendingUpdate) {
        this.updateQueued = true;
        return;
      }

      this.pendingUpdate = true;
      try {
        // エディタがフォーカスを持っていない場合は遅延
        if (!this.editor.hasTextFocus()) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // 新しいデコレーションを取得
        const decorations = this._findColorDecorations();

        // マイクロタスクで実行して他のUI更新を先に行う
        await new Promise(resolve => setTimeout(resolve, 0));

        // デコレーションをエディタに適用（既存のものを置き換え）
        this.decorationIds = this.editor.deltaDecorations(this.decorationIds, decorations);

        // カラーマーカー用のスタイルを更新
        this._updateColorStyles();

        console.log(`${decorations.length}個のユニークな色マーカーが追加されました`);
      } catch (error) {
        console.warn('カラーマーカー更新に失敗:', error);
      } finally {
        this.pendingUpdate = false;

        // 更新が要求されていた場合は再度スケジュール
        if (this.updateQueued) {
          this.updateQueued = false;
          setTimeout(() => this.scheduleUpdate(), 100);
        }
      }
    }

    _findColorDecorations() {
      const model = this.editor.getModel();
      if (!model) return [];

      const decorations = [];
      const processedColors = new Map();

      // 全行のコードを調査
      const lineCount = model.getLineCount();

      for (let i = 1; i <= lineCount; i++) {
        const lineContent = model.getLineContent(i);

        // vec3関数全体を検出 (vec3の位置を特定するため)
        const pattern = /vec3\s*\(\s*([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s*(?:,\s*([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s*,\s*([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)\s*)?\)/g;

        let match;
        while ((match = pattern.exec(lineContent)) !== null) {
          // vec3の位置を取得
          const startPos = match.index;

          let r, g, b;

          // 3つの値があるか単一値かを判定
          if (match[2] !== undefined && match[3] !== undefined) {
            r = parseFloat(match[1]);
            g = parseFloat(match[2]);
            b = parseFloat(match[3]);
          } else {
            r = g = b = parseFloat(match[1]);
          }

          // 値が正しく解析されたか確認
          if (isNaN(r) || isNaN(g) || isNaN(b)) {
            continue;
          }

          // 値を0〜1の範囲に制限
          r = Math.min(1, Math.max(0, r));
          g = Math.min(1, Math.max(0, g));
          b = Math.min(1, Math.max(0, b));

          const rInt = Math.round(r * 255);
          const gInt = Math.round(g * 255);
          const bInt = Math.round(b * 255);

          // 色キーを生成
          const colorKey = `${rInt},${gInt},${bInt}`;

          // 重複チェック
          if (processedColors.has(colorKey)) {
            continue;
          }

          // マーカーの一意なIDを生成
          const markerId = `inline_col-marker-${Math.random().toString(36).substring(2, 9)}`;

          // 色情報を保存
          processedColors.set(colorKey, {
            r: rInt,
            g: gInt,
            b: bInt,
            markerId: markerId
          });

          // 行頭のデコレーションではなく、vec3を直接デコレーション
          decorations.push({
            range: {
              startLineNumber: i,
              startColumn: startPos + 1, // vec3の最初の文字位置
              endLineNumber: i,
              endColumn: startPos + 5  // 'vec3'の終わり
            },
            options: {
              before: {
                content: "●",
                inlineClassName: `inline_col-dot ${markerId}`
              }
            }
          });
        }
      }

      this._processedColors = processedColors;
      return decorations;
    }

    // カラーマーカー用のCSSスタイルを更新する新しいメソッド
    _updateColorStyles() {
      // 古いスタイル要素を削除
      document.querySelectorAll('style[id="color-marker-styles-dynamic"]').forEach(el => {
        el.remove();
      });

      // 新しいスタイル要素を追加
      if (this._processedColors && this._processedColors.size > 0) {
        const styleEl = document.createElement('style');
        styleEl.id = `color-marker-styles-dynamic`;

        let styleText = ``;

        // 各色に対応するスタイルを追加
        this._processedColors.forEach((colorInfo, colorKey) => {
          const { r, g, b, markerId } = colorInfo;
          styleText += `
            .${markerId} {
              color: rgb(${r}, ${g}, ${b}) !important;
            }
          `;
        });

        styleEl.textContent = styleText;
        document.head.appendChild(styleEl);

        console.log(`${this._processedColors.size}色のスタイルを適用しました`);
      }
    }

    dispose() {
      if (this.updateTimer) {
        clearTimeout(this.updateTimer);
      }
      if (this.decorationIds.length > 0) {
        this.editor.deltaDecorations(this.decorationIds, []);
        this.decorationIds = [];
      }

      // スタイル要素も削除
      document.querySelectorAll('style[id="color-marker-styles-dynamic"]').forEach(el => {
        el.remove();
      });
    }
}