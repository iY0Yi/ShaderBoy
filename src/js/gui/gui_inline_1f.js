import * as monaco from "monaco-editor";
import ShaderBoy from "../shaderboy";

export default ShaderBoy.gui_inline_1f = {
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  setup() {
    console.log("Inline GUI setup initialized");
    this.offset = 0.0;
    this.name = "u_editorSliderValue";

    this._editorInstance = null;
    this._active = false;
    this._originalValue = 0.0;
    this._precision = 4;
    this._decorationIds = [];
    this._targetLine = null;
    this._targetValue = null;
    this._targetStartCol = null;
    this._targetEndCol = null;
    this._widget = null;

    ShaderBoy.gui.inline1fUniformFS = `uniform float ${this.name};\n`;
  },

  register(editor) {
    console.log("Float editor: Editor reference set successfully");
    this._editorInstance = editor;

    // スタイルを一度だけ追加
    if (!document.getElementById('inline_1f-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'inline_1f-styles';
        styleEl.textContent = `
            /* フロートエディタコンテナ */
            .inline_1f-container {
                height: 45px;
                margin-top: 0px;
                background: #262525;
                border-radius: 0px;
                padding: 20px;
                width: 400px;
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

            /* スライダーセル */
            .inline_1f-slider-cell {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
            }

            /* スライダートラック */
            .inline_1f-track {
                width: 100%;
                height: 4px;
                top: 0px;
                background: #2c2c2c;
                border-radius: 2px;
                position: relative;
            }

            /* スライダー入力 - クリッカブル領域を拡大 */
            .inline_1f-slider {
                position: absolute;
                width: 100%;
                height: 45px;  /* 28pxから40pxに増加 */
                top: -22.5px;    /* 上部方向に拡張 */
                opacity: 0;
                cursor: pointer;
                margin: 0;
                z-index: 10;
            }

            /* スライダーノブ */
            .inline_1f-knob {
                position: absolute;
                width: 10px;
                height: 10px;
                background: #D4BE98;
                border-radius: 50%;
                top: -2px;
                left: 50%;
                transform: translateX(-50%);
                pointer-events: none;
            }
        `;
        document.head.appendChild(styleEl);
    }

    // ダブルクリック検出用の変数を初期化
    this._lastClickTime = 0;
    this._lastPosition = null;

    // クリックイベントでダブルクリックを自前で検出
    editor.onMouseDown((e) => {
      // シンプルなフラグとタイマーでダブルクリックを検出
      const now = Date.now();
      if (!this._lastClickTime) {
        this._lastClickTime = now;
        this._lastPosition = e.target.position;
        return;
      }

      // 同じ位置での300ms以内のクリックをダブルクリックとして処理
      const isSamePosition =
        e.target.position &&
        this._lastPosition &&
        e.target.position.lineNumber === this._lastPosition.lineNumber &&
        Math.abs(e.target.position.column - this._lastPosition.column) <= 3;

      const isDoubleClick = now - this._lastClickTime < 300 && isSamePosition;

      // ダブルクリック以外またはアクティブ中は処理しない
      if (!isDoubleClick) {
        this._lastClickTime = now;
        this._lastPosition = e.target.position;
        return;
      }

      // ダブルクリック検出をリセット
      this._lastClickTime = 0;

      console.log("DIY Double-click detected in editor for float");

      // vec2エディタが既にアクティブな場合は何もしない
      if (ShaderBoy.gui_inline_2f && ShaderBoy.gui_inline_2f._active) {
        return;
      }

      // 浮動小数点スライダーが既にアクティブな場合は何もしない
      if (this._active) {
        return;
      }

      // クリック位置の情報を取得
      const position = e.target.position;
      if (!position) return;

      const model = editor.getModel();
      const lineContent = model.getLineContent(position.lineNumber);
      console.log("Float line content:", lineContent);

      // フロート値のパターン
      const floatPattern = /(\d*\.\d+|\d+\.\d*)/g;

      let match;
      while ((match = floatPattern.exec(lineContent)) !== null) {
        const start = match.index;
        const end = start + match[0].length;

        console.log(`Found float at [${start}-${end}]: ${match[0]}`);

        // クリックがフロート値の範囲内にあるか確認
        if (position.column >= start && position.column <= end + 1) {
          console.log("Click inside float range");

          // 数値を解析
          const value = parseFloat(match[0]);
          const valueText = match[0];

          // イベントをキャンセル - Monaco Editor用に修正
          if (e.event && typeof e.event.preventDefault === "function") {
            e.event.preventDefault();
            e.event.stopPropagation();
          }

          // スライダーを表示
          this._buildGUI(
            editor,
            position.lineNumber,
            start + 1,
            end + 1,
            value,
            valueText
          );

          break;
        } else {
          console.log(
            `Click at column ${position.column} outside float range (${start}-${end})`
          );
        }
      }
    });

    // モバイル用のタッチイベント
    // 浮動小数点値を検出する関数（再利用のため抽出）
    const detectFloat = (editor, lineNumber, column) => {
      const model = editor.getModel();
      const lineContent = model.getLineContent(lineNumber);

      // フロート値のパターン
      const floatPattern = /(\d*\.\d+|\d+\.\d*)/g;

      let match;
      while ((match = floatPattern.exec(lineContent)) !== null) {
        const start = match.index;
        const end = start + match[0].length;

        // タップがフロート値の範囲内にあるか確認
        if (column > start && column <= end + 1) {
          // vec2パターンかどうかをチェック
          const beforeText = lineContent.substring(0, start);
          if (beforeText.match(/vec2\s*\(\s*$/)) {
            continue; // vec2の最初の引数は無視
          }

          const afterText = lineContent.substring(end);
          if (afterText.match(/^\s*,\s*(\d*\.\d+|\d+\.\d*|\d+)\s*\)/)) {
            continue; // vec2の2番目の引数は無視
          }

          // 値を返す
          return {
            value: parseFloat(match[0]),
            text: match[0],
            start: start + 1,
            end: end + 1,
          };
        }
      }
      return null;
    };

    // モバイル用ダブルタップ処理の設定
    let lastEditorTapTime = 0;
    let lastTapPosition = { lineNumber: 0, column: 0 };

    // エディタにタッチイベントリスナーを追加
    const editorDomNode = editor.getDomNode();
    if (editorDomNode) {
      editorDomNode.addEventListener("touchstart", (e) => {
        // モバイルデバイスのみで処理
        const isMobile = ["Android", "iOS", "iPadOS"].includes(ShaderBoy.OS);
        if (!isMobile) return;

        // vec2エディタが既にアクティブな場合は処理しない
        if (ShaderBoy.gui_inline_2f && ShaderBoy.gui_inline_2f._active) {
          return;
        }

        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastEditorTapTime;

        // タッチ位置からエディタの位置情報を取得
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const position = editor.getTargetAtClientPoint(
          touch.clientX,
          touch.clientY
        );

        if (!position || !position.position) {
          lastEditorTapTime = 0;
          return;
        }

        // 同じ位置の連続タップかチェック（10ピクセル以内の誤差を許容）
        const isSamePosition =
          lastTapPosition.lineNumber === position.position.lineNumber &&
          Math.abs(lastTapPosition.column - position.position.column) < 10;

        if (tapLength < 300 && tapLength > 0 && isSamePosition) {
          // ダブルタップとして処理
          console.log(
            "Double tap detected in editor for float value",
            position.position
          );

          // 浮動小数点値を検出
          const floatData = detectFloat(
            editor,
            position.position.lineNumber,
            position.position.column
          );

          if (floatData) {
            // 浮動小数点を検出した場合、スライダーを表示
            e.preventDefault();

            this._buildGUI(
              editor,
              position.position.lineNumber,
              floatData.start,
              floatData.end,
              floatData.value,
              floatData.text
            );
          }

          lastEditorTapTime = 0;
        } else {
          // 最初のタップ - 位置を記録
          lastEditorTapTime = currentTime;
          lastTapPosition = {
            lineNumber: position.position.lineNumber,
            column: position.position.column,
          };
        }
      });
    }

    console.log("Float slider provider registered");
  },

  // シェーダーコードにスライダー関連の変更を適用する
  insertUniform(shaderCode) {
    // スライダーが非アクティブなら何もしない
    if (!this._active) {
      return shaderCode;
    }

    // uniform宣言を追加
    let modifiedCode = shaderCode;

    // ターゲット値を置換
    const replaceResult = this._replaceTargetValue(modifiedCode);
    modifiedCode = replaceResult.code;

    if(replaceResult.modified) {
      console.log('Float editor: Inserted uniform', this.name, replaceResult.code);
    }

    return modifiedCode;
  },

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  _buildGUI(editor, lineNumber, startCol, endCol, value, originalText) {
    // 既存のウィジェットを削除
    if (this._widget) {
      editor.removeContentWidget(this._widget);
      this._widget = null;
    }

    // ターゲット行の完全なテキストを取得
    const model = editor.getModel();
    const lineContent = model.getLineContent(lineNumber);

    this.offset = 0.0;
    this._active = true;
    this._originalValue = value;
    this._targetLine = lineContent;
    this._targetValue = value;
    this._targetStartCol = startCol;
    this._targetEndCol = endCol;
    const hasDecimalPoint = originalText.includes(".");
    if (hasDecimalPoint) {
      // 小数点以下の桁数を維持
      const decimalPart = originalText.split(".")[1] || "";
      const precision = Math.max(decimalPart.length + 2, 3);
      this._precision = precision;
    }

    console.log("Float slider: Setting global state", this._active);
    console.log("Float slider: Original value:", this._originalValue);
    ShaderBoy.forceCompile = true; // コンパイルをトリガー

    // オリジナルのテキストの長さを保存
    let originalLength = originalText.length;
    console.log(
      `Float slider: Original text: "${originalText}", length: ${originalLength}`
    );

    // メインコンテナ
    const container = document.createElement("div");
    container.className = "inline_1f-container";

    // スライダーセル
    const sliderCell = document.createElement("div");
    sliderCell.className = "inline_1f-slider-cell";

    // スライダートラック
    const track = document.createElement("div");
    track.className = "inline_1f-track";

    // スライダー（非表示）
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "-2";
    slider.max = "2";
    slider.step = "0.01";
    slider.value = "0";
    slider.className = "inline_1f-slider";

    // モバイルタッチ対応を追加
    slider.addEventListener('touchstart', function(e) {
      e.stopPropagation(); // タッチイベントのバブリングを防止
    }, { passive: false });

    slider.addEventListener('touchmove', function(e) {
      e.stopPropagation(); // タッチイベントのバブリングを防止
    }, { passive: false });

    // スライダーノブ
    const knob = document.createElement("div");
    knob.className = "inline_1f-knob";

    // イベントハンドラ
    slider.oninput = function () {
      const offset = parseFloat(this.value);
      let multiplier = ShaderBoy.gui_inline_1f._originalValue;
      if (multiplier === 0) {
        multiplier = 1;
      }
      ShaderBoy.gui_inline_1f.offset = offset * multiplier;

      // ノブ位置更新
      const percent =
        (parseFloat(this.value) - parseFloat(this.min)) /
        (parseFloat(this.max) - parseFloat(this.min));
      knob.style.left = `${percent * 100}%`;

      // デコレーション更新
      const newValue =
        ShaderBoy.gui_inline_1f._originalValue + ShaderBoy.gui_inline_1f.offset;
      ShaderBoy.gui_inline_1f._updateDecorations(
        editor,
        lineNumber,
        startCol,
        endCol,
        newValue
      );
      ShaderBoy.forceDraw = true;
    };

    // グローバル変数を追加して現在のイベントリスナーを追跡
    let currentOutsideClickHandler = null;

    // ダブルクリック/タップで値を確定する関数
    const confirmValue = () => {
      console.log("Confirming float value with double click/tap");

      // 新しい値を計算
      const newValue =
        ShaderBoy.gui_inline_1f._originalValue + ShaderBoy.gui_inline_1f.offset;

      // イベントリスナーの削除
      if (currentOutsideClickHandler) {
        document.removeEventListener("dblclick", currentOutsideClickHandler);
        document.removeEventListener("touchstart", currentOutsideClickHandler);
        currentOutsideClickHandler = null;
      }

      // エディタのモデルを取得
      const model = editor.getModel();
      if (!model) return;

      // 元の数値形式を保持
      const formattedValue = ShaderBoy.gui_inline_1f._formatValueLikeOriginal(
        originalText,
        Math.abs(newValue)
      );

      // 範囲とテキストを決定
      let range, text;

      if (newValue < 0) {
        // 負の値の場合は演算子も含めて置換するかどうかを判断
        const lineContent = model.getLineContent(lineNumber);

        // カーソル位置の前にあるテキストを取得
        const textBeforeCursor = lineContent.substring(0, startCol - 1);

        // カーソルの位置の直前に演算子があるかチェック
        const operatorCheck = textBeforeCursor.match(/([+\-*/])\s*$/);

        if (operatorCheck) {
          const operator = operatorCheck[1];
          const operatorPos = textBeforeCursor.lastIndexOf(operator);

          // 演算子の位置に基づいて、演算子も含めて置換するかを決定
          switch (operator) {
            case "+":
              // + を - に置き換え
              range = new monaco.Range(
                lineNumber,
                operatorPos + 1,
                lineNumber,
                endCol
              );
              text = "- " + formattedValue;
              break;

            case "-":
              // 前の - を残す場合（二重否定になる場合は + に）
              range = new monaco.Range(
                lineNumber,
                startCol,
                lineNumber,
                endCol
              );
              text = formattedValue;
              break;

            case "*":
            case "/":
              // * や / の後に -value を配置
              range = new monaco.Range(
                lineNumber,
                startCol,
                lineNumber,
                endCol
              );
              text = "-" + formattedValue;
              break;

            default:
              range = new monaco.Range(
                lineNumber,
                startCol,
                lineNumber,
                endCol
              );
              text = "-" + formattedValue;
          }
        } else {
          // 演算子が見つからない場合は通常の置換
          range = new monaco.Range(lineNumber, startCol, lineNumber, endCol);
          text = "-" + formattedValue;
        }
      } else {
        // 正の値の場合は通常の置換
        range = new monaco.Range(lineNumber, startCol, lineNumber, endCol);
        text = formattedValue;
      }

      // エディタのテキストを編集
      editor.executeEdits("float-slider", [
        {
          range: range,
          text: text,
          forceMoveMarkers: true,
        },
      ]);

      // スライダー状態をリセット
      ShaderBoy.gui_inline_1f._active = false;

      // デコレーションを削除
      if (ShaderBoy.gui_inline_1f._decorationIds.length > 0) {
        editor.deltaDecorations(ShaderBoy.gui_inline_1f._decorationIds, []);
        ShaderBoy.gui_inline_1f._decorationIds = [];
      }

      // ウィジェットを削除
      editor.removeContentWidget(this._widget);
      this._widget = null;

      // 再コンパイルをトリガー
      ShaderBoy.forceCompile = true;
    };

    // 領域内のダブルクリック/タップで確定
    container.addEventListener("dblclick", (e) => {
      e.preventDefault();
      e.stopPropagation();
      confirmValue();
    });

    // 要素の組み立て
    track.appendChild(slider);
    track.appendChild(knob);
    sliderCell.appendChild(track);
    container.appendChild(sliderCell);

    // ウィジェット設定
    const widget = {
      getId: () => "float-slider-widget",
      getDomNode: () => container,
      getPosition: () => ({
        position: {
          lineNumber: lineNumber,
          column: startCol,
        },
        preference: [
          monaco.editor.ContentWidgetPositionPreference.BELOW,
          monaco.editor.ContentWidgetPositionPreference.ABOVE,
        ],
      }),
    };

    editor.addContentWidget(widget);
    this._widget = widget;

    console.log("Float slider widget displayed");

    // スライダー要素への参照を保存（hide用）
    this.sliderElement = container;

    // エディタインスタンスへの参照を保存（hide用）
    this._editorInstance = editor;

    setTimeout(() => {
      // ダブルクリック/ダブルタップ用の変数
      let lastOutsideClickTime = 0;
      let lastOutsideTapTime = 0;

      // 領域外のクリック/タップ処理
      const handleOutsideAction = (e) => {
        // `this` が ShaderBoy.gui_inline_1f を指すようにする
        const self = ShaderBoy.gui_inline_1f;

        // エディタの領域内かどうかチェック
        const isInside = self._isPointInsideElement(
          e.clientX,
          e.clientY,
          self.sliderElement
        );

        if (isInside) {
          // 領域内のクリック - ダブルクリックの場合は値を確定
          const now = Date.now();
          const clickLength = now - lastOutsideClickTime;

          if (clickLength < 300 && clickLength > 0) {
            console.log("Double click inside slider - confirming value");
            lastOutsideClickTime = 0;

            // ダブルクリックで値を確定
            confirmValue();
          } else {
            lastOutsideClickTime = now;
          }
        } else {
          // 領域外のクリック - ダブルクリックの場合はエディタを閉じる
          const now = Date.now();
          const clickLength = now - lastOutsideClickTime;

          if (clickLength < 300 && clickLength > 0) {
            console.log("Double click outside slider - discarding editor");
            lastOutsideClickTime = 0;

            // ダブルクリックでエディタを閉じる
            self._destroyGUI();
            e.preventDefault();
            e.stopPropagation();
          } else {
            lastOutsideClickTime = now;
          }
        }
      };

      // モバイル用のタップ処理（こちらも this 参照を修正）
      const handleOutsideTap = (e) => {
        // `this` が ShaderBoy.gui_inline_1f を指すようにする
        const self = ShaderBoy.gui_inline_1f;

        if (e.touches.length !== 1) return;

        const touch = e.touches[0];
        const isInside = self._isPointInsideElement(
          touch.clientX,
          touch.clientY,
          self.sliderElement
        );

        if (isInside) {
          // 領域内のタップ - ダブルタップの場合は値を確定
          const now = Date.now();
          const tapLength = now - lastOutsideTapTime;

          if (tapLength < 300 && tapLength > 0) {
            console.log("Double tap inside slider - confirming value");
            lastOutsideTapTime = 0;

            // ダブルタップで値を確定
            confirmValue();

            e.preventDefault();
          } else {
            lastOutsideTapTime = now;
          }
        } else {
          // 領域外のタップ - ダブルタップの場合はエディタを閉じる
          const now = Date.now();
          const tapLength = now - lastOutsideTapTime;

          if (tapLength < 300 && tapLength > 0) {
            console.log("Double tap outside slider - discarding editor");
            lastOutsideTapTime = 0;

            // ダブルタップでエディタを閉じる
            self._destroyGUI();
            e.preventDefault();
          } else {
            lastOutsideTapTime = now;
          }
        }
      };

      // 既存のイベントリスナーを削除
      if (ShaderBoy.gui_inline_1f.currentOutsideClickHandler) {
        document.removeEventListener(
          "mousedown",
          ShaderBoy.gui_inline_1f.currentOutsideClickHandler
        );
        document.removeEventListener(
          "touchstart",
          ShaderBoy.gui_inline_1f.currentOutsideClickHandler
        );
      }

      // 新しいハンドラーを保存
      ShaderBoy.gui_inline_1f.currentOutsideClickHandler = handleOutsideAction;
      currentOutsideClickHandler = handleOutsideAction; // グローバル変数を更新

      // マウスとタッチのイベントをリッスン
      document.addEventListener("mousedown", handleOutsideAction);
      document.addEventListener("touchstart", handleOutsideTap, {
        passive: false,
      });

      console.log("Float editor: Outside click/tap handlers installed");
    }, 100);
  },

  // エディタを閉じるためのメソッド
  _destroyGUI() {
    console.log("Closing float editor without applying changes");

    // アクティブな参照がなければ何もしない
    if (!this._active || !this._widget) {
      return;
    }

    // エディタインスタンスを取得
    const editor = this._editorInstance;
    if (!editor) {
      console.warn("No editor instance found to hide float editor");
      return;
    }

    // スライダー状態をリセット
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

    console.log("float editor closed successfully");
  },

  _updateDecorations(editor, lineNumber, startCol, endCol, newValue) {
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
            inlineClassName: "slider-modified-value",
            after: {
              content: ` → ${newValue.toFixed(this._precision)}`,
              inlineClassName: "slider-value-overlay",
            },
          },
        },
      ]
    );
  },

  // ターゲット行とターゲット値を見つけて置換
  _replaceTargetValue(shaderCode) {
    const targetLine = this._targetLine;
    const targetValue = this._targetValue;

    console.log("Target line:", JSON.stringify(targetLine));
    console.log("Original value:", targetValue);

    if (!targetLine || targetValue === undefined || targetValue === null) {
      return { code: shaderCode, modified: false };
    }

    const lines = shaderCode.split("\n");
    let modified = false;

    // ターゲット行と一致する行を探す
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === targetLine.trim()) {
        console.log(`Found matching line at index ${i}: ${lines[i]}`);
        const result = this._findAndReplaceNumberInLine(lines[i], targetValue);
        lines[i] = result.line;
        modified = result.modified || modified;
        break;
      }
    }

    return {
      code: lines.join("\n"),
      modified,
    };
  },

  // 1行内で最適な数値を見つけて置換
  _findAndReplaceNumberInLine(line, targetValue) {
    // 数値だけを抽出する正規表現（符号は含まない）
    const numberRegex = /(\d+\.\d*|\.\d+|\d+)/g;
    const matches = [...line.matchAll(numberRegex)];

    console.log(
      "Line contains these numbers:",
      matches.map((m) => m[0])
    );

    // ターゲット値の絶対値
    const absTargetValue = Math.abs(targetValue);

    // クリック位置情報を取得して詳細にログ出力
    const clickPosFromLog = this.targetPosition;
    console.log("Click position from log:", JSON.stringify(clickPosFromLog));

    // 位置情報があれば使用
    if (clickPosFromLog) {
      const column = clickPosFromLog;
      console.log(`Using click position: Column ${column}`);

      // 各数値の位置とクリック位置の関係をログ出力
      matches.forEach((match, index) => {
        const startCol = match.index;
        const endCol = startCol + match[0].length;
        const distance =
          column >= startCol && column <= endCol
            ? "EXACT MATCH"
            : Math.abs(column - (startCol + endCol) / 2);

        console.log(
          `Number #${index}: '${match[0]}' at cols ${startCol}-${endCol}, ` +
            `distance from click: ${distance}`
        );
      });

      // クリックした位置に最も近い数値を探す
      let bestMatch = null;
      let smallestDistance = Infinity;

      for (const match of matches) {
        const startCol = match.index;
        const endCol = startCol + match[0].length;

        // クリック位置が数値の範囲内かどうか確認
        if (column >= startCol && column <= endCol) {
          console.log(
            `Found exact match for click: ${match[0]} at position ${startCol}`
          );
          bestMatch = match;
          break; // 完全一致を見つけた
        }

        // クリック位置との距離を計算
        const midPoint = (startCol + endCol) / 2;
        const distance = Math.abs(column - midPoint);

        if (distance < smallestDistance) {
          smallestDistance = distance;
          bestMatch = match;
          console.log(
            `Found better match: ${match[0]} at distance ${distance}`
          );
        }
      }

      if (bestMatch) {
        console.log(
          `Selected best match: ${bestMatch[0]} at position ${bestMatch.index}`
        );
        return this._replaceNumberMatch(line, bestMatch);
      } else {
        console.warn("No match found despite having click position");
      }
    } else {
      console.log(
        "No click position available, falling back to value-based matching"
      );

      // 位置情報がない場合は値の近さで判断
      let bestMatch = null;
      let smallestDiff = Infinity;

      for (const match of matches) {
        const matchValue = parseFloat(match[0]);
        const diff = Math.abs(matchValue - absTargetValue);

        console.log(
          `Comparing ${match[0]} with target ${absTargetValue}, diff: ${diff}`
        );

        // より近い値が見つかった場合、それを採用
        if (diff < smallestDiff) {
          smallestDiff = diff;
          bestMatch = match;
          console.log(
            `Found better value match: ${match[0]} with diff ${diff}`
          );
        }
      }

      if (bestMatch) {
        console.log(`Selected best value match: ${bestMatch[0]}`);
        return this._replaceNumberMatch(line, bestMatch);
      }
    }

    console.warn("対象行に一致する数値が見つかりませんでした");
    return { line, modified: false };
  },

  // 見つかった数値マッチを置換する
  _replaceNumberMatch(line, match) {
    const originalStr = match[0]; // 純粋な数値部分
    const matchValue = parseFloat(originalStr);
    const matchIndex = match.index;

    // _formatValueLikeOriginalメソッドを再利用して重複コードを削除
    const formattedValue = this._formatValueLikeOriginal(
      originalStr,
      matchValue
    );

    // 置換後の文字列（括弧で囲む）
    const replacement = `(${formattedValue} + ${this.name})`;

    // 行内の該当箇所を置換
    const modifiedLine =
      line.substring(0, matchIndex) +
      replacement +
      line.substring(matchIndex + originalStr.length);

    console.log(`Found match: ${originalStr} at position ${matchIndex}`);
    console.log(`Modified to: ${modifiedLine}`);
    console.log(
      `Original format preserved: ${originalStr} -> ${formattedValue}`
    );

    return { line: modifiedLine, modified: true };
  },

  // 元の数値形式を保持して新しい値をフォーマットする
  _formatValueLikeOriginal(originalText, newValue) {
    // 元の数値表記の特徴を保持
    const hasDecimalPoint = originalText.includes(".");
    const hasDecimalDigits =
      hasDecimalPoint && originalText.split(".")[1]?.length > 0;

    // 元の形式を維持して新しい値をフォーマット
    let formattedValue;
    if (hasDecimalPoint) {
      // 小数点以下の桁数を維持
      const decimalPart = originalText.split(".")[1] || "";
      const precision = Math.max(decimalPart.length, 3);

      // 元の形式に合わせる
      if (decimalPart.length === 0) {
        // "0." のような形式
        formattedValue = newValue.toFixed(0) + ".";
      } else {
        // "0.5" のような形式
        formattedValue = newValue.toFixed(precision);
      }
    } else {
      // 整数の場合
      formattedValue = newValue.toFixed(0);
    }

    return formattedValue;
  },

  // この補助関数を追加
  _isPointInsideElement(x, y, element) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  },
};
