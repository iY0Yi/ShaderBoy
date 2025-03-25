import * as monaco from 'monaco-editor';
import ShaderBoy from '../shaderboy'

export default ShaderBoy.gui_inline_2f = {
    // 初期設定
    setup() {
        console.log('Inline vec2 GUI setup initialized');
        this.offsetX = 0.0;
        this.offsetY = 0.0;
        this.name = 'u_editorVec2Value';

        this._active = false;
        this._editorInstance = null;
        this._precisionX = 4;
        this._precisionY = 4;
        this._originalValueX = 0.0;
        this._originalValueY = 0.0;
        this._decorationIds = [];
        this._targetLine = null;
        this._targetValue = null;
        this._targetStartCol = null;
        this._targetEndCol = null;
        this._widget = null;

        ShaderBoy.gui.inline2fUniformFS = `uniform vec2 ${this.name};\n`
    },

    // エディタへの登録
    register(editor) {
        console.log('Vec2 editor: Editor reference set successfully');
        this._editorInstance = editor;

        // スタイルを一度だけ追加
        if (!document.getElementById('inline_2f-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'inline_2f-styles';
            styleEl.textContent = `
                /* vec2エディタコンテナ */
                .inline_2f-editor-container {
                    margin-top: 0px;
                    background: #262525;
                    border-radius: 0px;
                    padding: 12.5px;
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

                /* 2Dパッド */
                .inline_2f-pad {
                    width: 270px;
                    height: 270px;
                    background: #262525;
                    border-radius: 0px;
                    position: relative;
                    border: 0px;
                    overflow: show;
                    background-image: radial-gradient(circle, #2c2c2c 2px, transparent 2px);
                    background-size: 10px 10px;
                    background-position: 5px 5px;
                }

                /* 中央点マーカー */
                .inline_2f-center-point {
                    width: 4px;
                    height: 4px;
                    background: #D4BE9855;
                    border-radius: 50%;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 1;
                    box-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
                }

                /* 接続線 */
                .inline_2f-connecting-line {
                    height: 1px;
                    background: #D4BE9855;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform-origin: left center;
                    z-index: 2;
                }

                /* ポインタ */
                .inline_2f-pointer {
                    width: 10px;
                    height: 10px;
                    background: #D4BE98;
                    border-radius: 50%;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    cursor: pointer;
                    z-index: 3;
                }

                /* テーブルレイアウト */
                .inline_2f-table {
                    border-collapse: collapse;
                    border-spacing: 0;
                    width: 100%;
                }

                /* パッドセル */
                .inline_2f-pad-cell {
                    padding-bottom: 0px;
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
            const isSamePosition = e.target.position && this._lastPosition &&
                e.target.position.lineNumber === this._lastPosition.lineNumber &&
                Math.abs(e.target.position.column - this._lastPosition.column) <= 3;

            const isDoubleClick = (now - this._lastClickTime) < 300 && isSamePosition;

            // ダブルクリック以外またはアクティブ中は処理しない
            if (!isDoubleClick || this._active) {
                this._lastClickTime = now;
                this._lastPosition = e.target.position;
                return;
            }

            // ダブルクリック検出をリセット
            this._lastClickTime = 0;

            console.log('DIY Double-click detected in editor for vec2');

            // クリック位置の情報を取得
            const position = e.target.position;
            if (!position) return;

            const model = editor.getModel();
            const lineContent = model.getLineContent(position.lineNumber);
            console.log('Line content:', lineContent);

            // vec2の文字列を検出するパターン - "vec2"という文字列を検索
            const vec2Pattern = /vec2\s*\(\s*(-?\d*\.\d+|-?\d+\.\d*|-?\d+)\s*,\s*(-?\d*\.\d+|-?\d+\.\d*|-?\d+)\s*\)/g;

            let match;
            while ((match = vec2Pattern.exec(lineContent)) !== null) {
                const fullMatch = match[0]; // vec2(x, y) 全体
                const start = match.index;
                const end = start + fullMatch.length;

                console.log(`Found vec2 at [${start}-${end}]: ${fullMatch}`);

                // クリックが "vec2" の文字の部分に含まれるか確認
                const vec2TextStart = start;
                const vec2TextEnd = start + 4; // "vec2" は4文字

                if (position.column >= vec2TextStart && position.column <= vec2TextEnd + 1) {
                    console.log('Click inside vec2 text range');

                    // 値を解析
                    const valueX = parseFloat(match[1]);
                    const valueY = parseFloat(match[2]);

                    // イベントをキャンセル - Monaco Editor用に修正
                    if (e.event && typeof e.event.preventDefault === 'function') {
                        e.event.preventDefault();
                        e.event.stopPropagation();
                    }

                    // 編集インターフェースを表示
                    this._buildGUI(
                        editor,
                        position.lineNumber,
                        start + 1,
                        end + 1,
                        valueX,
                        valueY,
                        fullMatch
                    );

                    break;
                } else {
                    console.log(`Click at column ${position.column} outside vec2 text range (${vec2TextStart}-${vec2TextEnd})`);
                }
            }
        });

        // モバイル用のタッチイベント
        // vec2値を検出する関数（再利用のため抽出）
        const detectVec2 = (editor, lineNumber, column) => {
            const model = editor.getModel();
            const lineContent = model.getLineContent(lineNumber);

            // vec2の形式を検出するパターン - 負の値にも対応
            const vec2Pattern = /vec2\s*\(\s*(-?\d*\.\d+|-?\d+\.\d*|-?\d+)\s*,\s*(-?\d*\.\d+|-?\d+\.\d*|-?\d+)\s*\)/g;

            let match;
            while ((match = vec2Pattern.exec(lineContent)) !== null) {
                const fullMatch = match[0]; // vec2(x, y) 全体
                const start = match.index;
                const end = start + fullMatch.length;

                // "vec2" の文字部分の範囲
                const vec2TextStart = start;
                const vec2TextEnd = start + 4; // "vec2" は4文字

                // タップが "vec2" 文字部分の範囲内にあるか確認
                if (column >= vec2TextStart && column <= vec2TextEnd + 1) {
                    return {
                        valueX: parseFloat(match[1]),
                        valueY: parseFloat(match[2]),
                        start: start + 1,
                        end: end + 1,
                        text: fullMatch
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
            editorDomNode.addEventListener('touchstart', (e) => {
                // モバイルデバイスのみで処理
                const isMobile = ['Android', 'iOS', 'iPadOS'].includes(ShaderBoy.OS);
                if (!isMobile) return;

                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastEditorTapTime;

                // タッチ位置からエディタの位置情報を取得
                const touch = e.touches[0];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                const position = editor.getTargetAtClientPoint(touch.clientX, touch.clientY);

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
                    console.log('Double tap detected in editor', position.position);

                    // vec2値を検出
                    const vec2Data = detectVec2(
                        editor,
                        position.position.lineNumber,
                        position.position.column
                    );

                    if (vec2Data) {
                        // vec2を検出した場合、編集インターフェースを表示
                        e.preventDefault();

                        this._buildGUI(
                            editor,
                            position.position.lineNumber,
                            vec2Data.start,
                            vec2Data.end,
                            vec2Data.valueX,
                            vec2Data.valueY,
                            vec2Data.text
                        );
                    }

                    lastEditorTapTime = 0;
                } else {
                    // 最初のタップ - 位置を記録
                    lastEditorTapTime = currentTime;
                    lastTapPosition = {
                        lineNumber: position.position.lineNumber,
                        column: position.position.column
                    };
                }
            });
        }

        console.log('Vec2 editor provider registered');
    },

    // シェーダーコードにエディタの変更を適用
    insertUniform(shaderCode) {
        // 非アクティブなら何もしない
        if (!this._active) {
            return shaderCode;
        }

        // uniform宣言を追加
        let modifiedCode = shaderCode;

        // ターゲット行とvec2値を見つけて置換
        const result = this._replaceTargetVec2(modifiedCode);
        modifiedCode = result.code;

        if(result.modified) {
            console.log('Vec2 editor: Inserted uniform', this.name, result.code);
        }

        return modifiedCode;
    },

    // ターゲット行のvec2値を見つけて置換する処理
    _replaceTargetVec2(shaderCode) {
        const targetLine = this._targetLine;
        const targetValue = this._targetValue;

        console.log("Target line:", JSON.stringify(targetLine));
        console.log("Original vec2 value:", targetValue);

        if (!targetLine || !targetValue || (targetValue.x === undefined) || (targetValue.y === undefined)) {
            return { code: shaderCode, modified: false };
        }

        const lines = shaderCode.split("\n");
        let modified = false;

        // ターゲット行と一致する行を探す
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === targetLine.trim()) {
                console.log(`Found matching line at index ${i}: ${lines[i]}`);

                // vec2表現を検索して置換
                const vec2Pattern = /vec2\s*\(\s*(-?\d*\.\d+|-?\d+\.\d*|-?\d+)\s*,\s*(-?\d*\.\d+|-?\d+\.\d*|-?\d+)\s*\)/g;

                lines[i] = lines[i].replace(vec2Pattern, (match, x, y) => {
                    // 数値が一致するか確認
                    const foundX = parseFloat(x);
                    const foundY = parseFloat(y);

                    // ターゲットの値と一致するvec2を検索
                    if (Math.abs(foundX - targetValue.x) < 0.0001 &&
                        Math.abs(foundY - targetValue.y) < 0.0001) {

                        // 置換後のvec2表現を生成
                        const newX = this._originalValueX + this.offsetX * this._originalValueX;
                        const newY = this._originalValueY + this.offsetY * this._originalValueY;

                        modified = true;
                        return `(vec2(${newX.toFixed(this._precisionX)}, ${newY.toFixed(this._precisionY)}) + ${this.name})`;
                    }

                    return match; // 一致しない場合は変更なし
                });

                break;
            }
        }

        return {
            code: lines.join("\n"),
            modified
        };
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 編集インターフェースの表示
    _buildGUI(editor, lineNumber, startCol, endCol, valueX, valueY, originalText) {
        // 既存のウィジェットを削除
        if (this._widget) {
            editor.removeContentWidget(this._widget);
            this._widget = null;
        }

        // ターゲット行の完全なテキストを取得
        const model = editor.getModel();
        const lineContent = model.getLineContent(lineNumber);

        this._active = true;
        this._originalValueX = valueX;
        this._originalValueY = valueY;
        this.offsetX = 0.0;
        this.offsetY = 0.0;
        const hasDecimalPointX = String(valueX).includes('.');
        if (hasDecimalPointX) {
            // 小数点以下の桁数を維持
            const decimalPart = String(valueX).split('.')[1] || '';
            const precision = Math.max(decimalPart.length+2, 3);
            // this._precisionX = precision;
            console.log('valueX:', valueX);
            console.log('String(valueX):', String(valueX));
            console.log('decimalPart:', precision);
            console.log('precisionX:', precision);
        }
        const hasDecimalPointY = String(valueY).includes('.');
        if (hasDecimalPointY) {
            // 小数点以下の桁数を維持
            const decimalPart = String(valueY).split('.')[1] || '';
            const precision = Math.max(decimalPart.length+2, 3);
            // this._precisionY = precision;
            console.log('valueY:', valueY);
            console.log('String(valueY):', String(valueY));
            console.log('decimalPart:', precision);
            console.log('precisionY:', precision);
        }
        this._targetLine = lineContent;
        this._targetValue = { x: valueX, y: valueY };
        this._targetStartCol = startCol;
        this._targetEndCol = endCol;

        console.log('Vec2 editor: Setting global state', this._active);
        console.log('Vec2 editor: Original values:', this._originalValueX, this._originalValueY);
        ShaderBoy.forceCompile = true; // コンパイルをトリガー

        // メインコンテナ
        const container = document.createElement('div');
        container.className = 'inline_2f-editor-container';

        // テーブルレイアウト
        const table = document.createElement('table');
        table.className = 'inline_2f-table';

        // 2Dパッド用の行
        const padRow = document.createElement('tr');
        const padCell = document.createElement('td');
        padCell.setAttribute('colspan', '2');
        padCell.className = 'inline_2f-pad-cell';

        // 2Dパッド - 点グリッドパターンを中央点に合わせて調整
        const pad = document.createElement('div');
        pad.className = 'inline_2f-pad';

        // 中央点を示すマーカー - グリッドの点と完全に一致するよう調整
        const centerPoint = document.createElement('div');
        centerPoint.className = 'inline_2f-center-point';
        pad.appendChild(centerPoint);

        // 中央とポインタを結ぶ線
        const connectingLine = document.createElement('div');
        connectingLine.className = 'inline_2f-connecting-line';
        pad.appendChild(connectingLine);

        // ポインタ
        const pointer = document.createElement('div');
        pointer.className = 'inline_2f-pointer';
        pad.appendChild(pointer);

        // グローバル変数を追加して現在のイベントリスナーを追跡
        let currentOutsideClickHandler = null;

        // パッドのドラッグ操作
        let isDragging = false;

        // パッドの値更新関数 - マウスとタッチの両方で使用
        const updatePadValue = (clientX, clientY) => {
            const rect = pad.getBoundingClientRect();

            // パッド内の相対位置を計算 (0-1の範囲)
            let x = (clientX - rect.left) / rect.width;
            let y = (clientY - rect.top) / rect.height;

            // 範囲を制限
            x = Math.max(0, Math.min(1, x));
            y = Math.max(0, Math.min(1, y));

            // Y軸を反転（上が0、下が1）
            y = 1 - y;

            // 値を-1から1の範囲にマッピング
            const mappedX = x * 2 - 1;
            const mappedY = y * 2 - 1;

            // オフセットとして設定
            let multiplierX = ShaderBoy.gui_inline_2f._originalValueX;
            if (multiplierX === 0) {
                multiplierX = 1;
            }
            ShaderBoy.gui_inline_2f.offsetX = mappedX * multiplierX;
            let multiplierY = ShaderBoy.gui_inline_2f._originalValueY;
            if (multiplierY === 0) {
                multiplierY = 1;
            }
            ShaderBoy.gui_inline_2f.offsetY = mappedY * multiplierY;


            // ポインタの位置を更新
            pointer.style.left = `${x * 100}%`;
            pointer.style.top = `${(1 - y) * 100}%`;

            // 中央からポインタまでの線を更新
            // 距離の計算（ピクセル単位）
            const padWidth = rect.width;
            const padHeight = rect.height;
            const centerX = padWidth / 2;
            const centerY = padHeight / 2;
            const pointerX = x * padWidth;
            const pointerY = (1 - y) * padHeight;

            // 中心とポインタの間の距離を計算
            const deltaX = pointerX - centerX;
            const deltaY = pointerY - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // 角度を計算（ラジアン）
            const angle = Math.atan2(deltaY, deltaX);

            // 線の長さと角度を設定
            connectingLine.style.width = `${distance}px`;
            connectingLine.style.transform = `rotate(${angle}rad)`;

            // 値表示を更新
            const newX = ShaderBoy.gui_inline_2f._originalValueX + ShaderBoy.gui_inline_2f.offsetX;
            const newY = ShaderBoy.gui_inline_2f._originalValueY + ShaderBoy.gui_inline_2f.offsetY;

            // デコレーション更新
            ShaderBoy.gui_inline_2f._updateDecorations(editor, lineNumber, startCol, endCol,
                ShaderBoy.gui_inline_2f._originalValueX, ShaderBoy.gui_inline_2f._originalValueY,
                newX, newY);
            ShaderBoy.forceDraw = true;
        };

        // マウスイベント用ラッパー
        const handleMouseMove = (e) => {
            if (isDragging) {
                updatePadValue(e.clientX, e.clientY);
            }
        };

        // マウスのパッド操作
        pad.onmousedown = (e) => {
            e.stopPropagation();
            e.preventDefault();
            isDragging = true;
            updatePadValue(e.clientX, e.clientY);
        };

        document.addEventListener('mousemove', handleMouseMove);

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // タッチイベントの追加
        pad.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                updatePadValue(touch.clientX, touch.clientY);
            }
        }, { passive: false });

        pad.addEventListener('touchmove', (e) => {
            e.preventDefault(); // デフォルトのスクロール動作を防止
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                updatePadValue(touch.clientX, touch.clientY);
            }
        });

        pad.addEventListener('touchend', (e) => {
            e.preventDefault(); // デフォルトのスクロール動作を防止
        });

        // 要素の組み立て
        padCell.appendChild(pad);
        padRow.appendChild(padCell);
        table.appendChild(padRow);
        container.appendChild(table);

        // ウィジェット設定
        const widget = {
            getId: () => 'inline_2f-editor-widget',
            getDomNode: () => container,
            getPosition: () => ({
                position: {
                    lineNumber: lineNumber,
                    column: startCol
                },
                preference: [
                    monaco.editor.ContentWidgetPositionPreference.BELOW,
                    monaco.editor.ContentWidgetPositionPreference.ABOVE
                ]
            })
        };

        editor.addContentWidget(widget);
        this._widget = widget;

        console.log('Vec2 editor widget displayed');

        // ダブルクリック/ダブルタップ処理を追加
        const confirmValues = () => {
            console.log('Confirming values with double click/tap');

            // 新しい値を計算
            const newX = ShaderBoy.gui_inline_2f._originalValueX + ShaderBoy.gui_inline_2f.offsetX;
            const newY = ShaderBoy.gui_inline_2f._originalValueY + ShaderBoy.gui_inline_2f.offsetY;

            // イベントリスナーを削除
            if (currentOutsideClickHandler) {
                document.removeEventListener('mousedown', currentOutsideClickHandler);
                document.removeEventListener('touchstart', currentOutsideClickHandler);
                document.removeEventListener('dblclick', currentOutsideClickHandler);
                currentOutsideClickHandler = null;
            }
            document.removeEventListener('mousemove', handleMouseMove);

            // エディタのモデルを取得
            const model = editor.getModel();
            if (!model) return;

            // 新しい vec2 値をフォーマット
            const text = `vec2(${newX.toFixed(ShaderBoy.gui_inline_2f._precisionX)}, ${newY.toFixed(ShaderBoy.gui_inline_2f._precisionY)})`;

            // 範囲を設定
            const range = new monaco.Range(
                lineNumber,
                startCol,
                lineNumber,
                endCol
            );

            // エディタのテキストを編集
            editor.executeEdits('inline_2f-editor', [{
                range: range,
                text: text,
                forceMoveMarkers: true
            }]);

            // 状態をリセット
            ShaderBoy.gui_inline_2f._active = false;

            // デコレーションを削除
            if (ShaderBoy.gui_inline_2f._decorationIds.length > 0) {
                editor.deltaDecorations(ShaderBoy.gui_inline_2f._decorationIds, []);
                ShaderBoy.gui_inline_2f._decorationIds = [];
            }

            // ウィジェットを削除
            editor.removeContentWidget(widget);
            ShaderBoy.gui_inline_2f._widget = null;

            // 再コンパイルをトリガー
            ShaderBoy.forceCompile = true;
        };

        // 領域内のダブルクリック/タップで確定
        container.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            confirmValues();
        });

        // モバイル用のダブルタップ検出
        let lastTapTime = 0;
        container.addEventListener('touchstart', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;

            // ダブルタップとして処理（300ms以内の2回のタップ）
            if (tapLength < 300 && tapLength > 0) {
                e.preventDefault();
                e.stopPropagation();
                confirmValues();
                lastTapTime = 0; // リセット
            } else {
                lastTapTime = currentTime;
            }
        }, { passive: false });

        // 外部クリックイベントでのクリーンアップをダブルクリック/タップに変更
        setTimeout(() => {
            const handleOutsideAction = (e) => {
                // スライダーの DOM 要素を取得
                const containerElement = container;

                // ダブルクリック/タップがコンテナ外かどうかをチェック
                if (!containerElement.contains(e.target)) {
                    // 外部ダブルクリック/タップを検出
                    console.log('Outside double click/tap detected');

                    // イベントリスナーを削除（クリーンアップ）
                    document.removeEventListener('dblclick', handleOutsideAction);
                    document.removeEventListener('mousedown', handleOutsideClick);
                    document.removeEventListener('mousemove', handleMouseMove);
                    currentOutsideClickHandler = null;

                    // スライダー状態をリセット
                    ShaderBoy.gui_inline_2f._active = false;

                    // デコレーションを削除
                    if (ShaderBoy.gui_inline_2f._decorationIds.length > 0) {
                        editor.deltaDecorations(ShaderBoy.gui_inline_2f._decorationIds, []);
                        ShaderBoy.gui_inline_2f._decorationIds = [];
                    }

                    // ウィジェットを削除
                    editor.removeContentWidget(widget);
                    ShaderBoy.gui_inline_2f._widget = null;

                    // 再コンパイルをトリガー
                    ShaderBoy.forceCompile = true;
                }
            };

            // ここから重要な修正: 外部クリック処理を改善して不要なGUI閉じを防止
            // 単一クリックでGUIを閉じないようにし、ダブルクリックのみに反応するように変更
            let outsideClickTime = 0;
            let outsideClickCount = 0;

            const handleOutsideClick = (e) => {
                const containerElement = container;

                // GUIの外側をクリックした場合
                if (!containerElement.contains(e.target)) {
                    const now = Date.now();

                    // 前回のクリックから300ms以内なら、ダブルクリックとしてカウント
                    if (now - outsideClickTime < 300) {
                        outsideClickCount++;

                        // ダブルクリックとして処理（2回目のクリック）
                        if (outsideClickCount >= 2) {
                            handleOutsideAction(e);
                            outsideClickCount = 0;
                        }
                    } else {
                        // 新しいクリックシーケンスを開始
                        outsideClickCount = 1;
                    }

                    outsideClickTime = now;
                }
            };

            // 外部クリック検出用のイベントリスナーを変更
            document.addEventListener('mousedown', handleOutsideClick);
            currentOutsideClickHandler = handleOutsideClick;
        }, 0);
    },

    // エディタのデコレーションを更新
    _updateDecorations(editor, lineNumber, startCol, endCol, originalX, originalY, newX, newY) {
        // 既存のデコレーションを削除
        if (this._decorationIds.length > 0) {
            editor.deltaDecorations(this._decorationIds, []);
        }

        // 新しいデコレーションを作成
        let decorations = [{
            range: new monaco.Range(
                lineNumber,
                startCol,
                lineNumber,
                endCol
            ),
            options: {
                inlineClassName: 'inline_2f-value-highlight',
                className: 'inline_2f-highlight-background',
                after: {
                    content: ` → vec2(${newX.toFixed(this._precisionX)}, ${newY.toFixed(this._precisionY)})`,
                    inlineClassName: 'slider-value-overlay',
                },
                hoverMessage: {
                    value: `Original: vec2(${originalX}, ${originalY})\nNew: vec2(${newX.toFixed(this._precisionX)}, ${newY.toFixed(this._precisionY)})`
                }
            }
        }];

        // デコレーションを適用
        this._decorationIds = editor.deltaDecorations(this._decorationIds, decorations);
    },

    // エディタのショートカットを処理
    handleShortcut(editor, e) {
        if (!this._active) return false;

        // ESCキーで編集をキャンセル
        if (e.keyCode === monaco.KeyCode.Escape) {
            this._active = false;

            // デコレーションを削除
            if (this._decorationIds.length > 0) {
                editor.deltaDecorations(this._decorationIds, []);
                this._decorationIds = [];
            }

            // ウィジェットを削除
            if (this._widget) {
                editor.removeContentWidget(this._widget);
                this._widget = null;
            }

            // 再コンパイルをトリガー
            ShaderBoy.forceCompile = true;
            return true;
        }

        return false;
    }
};