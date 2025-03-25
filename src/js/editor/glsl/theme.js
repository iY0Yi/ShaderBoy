import ShaderBoy from '../../shaderboy';
import * as monaco from 'monaco-editor';
export default ShaderBoy.theme = {
    init() {
        console.log('ShaderBoy.theme.init() が呼び出されました');

        // モノクローム版テーマ定義
        monaco.editor.defineTheme('shaderboy-monotone', {
            base: 'vs-dark',
            inherit: false,
            rules: [
                // 基本スタイル - 背景色を設定
                { token: '', foreground: '848484', background: '262525' },

                // それぞれのトークンタイプに背景色を設定（キーポイント）
                { token: 'comment', foreground: '7F776AAA', fontStyle: 'italic', background: '262525' },
                { token: 'keyword', foreground: 'D4BE94', background: '262525' },
                { token: 'keyword.control', foreground: 'D4BE94', background: '262525' },
                { token: 'keyword.type', foreground: 'D4BE94a6', background: '262525' },
                { token: 'keyword.struct', foreground: 'D4BE94', background: '262525' },
                { token: 'keyword.function', foreground: 'D4BE94', background: '262525' },
                { token: 'keyword.storage', foreground: 'D4BE94', background: '262525' },
                { token: 'variable', foreground: 'D4BE94', background: '262525' },
                { token: 'variable.predefined', foreground: 'D4BE94', background: '262525' },
                { token: 'identifier', foreground: '848484', background: '262525' },
                { token: 'user.function', foreground: 'D4BE94', fontStyle: 'bold', background: '262525' },
                { token: 'struct.name', foreground: 'D4BE94', fontStyle: 'bold', background: '262525' },
                { token: 'string', foreground: 'D4BE94', background: '262525' },
                { token: 'constant', foreground: 'D4BE94', background: '262525' },
                { token: 'constant.language.boolean', foreground: 'D4BE94', background: '262525' },
                { token: 'number', foreground: 'D4BE94', background: '262525' },
                { token: 'number.float', foreground: 'D4BE94', background: '262525' },
                { token: 'number.hex', foreground: 'D4BE94', background: '262525' },
                { token: 'number.octal', foreground: 'D4BE94', background: '262525' },
                { token: 'operator', foreground: 'D4BE9483', background: '262525' },
                { token: 'preprocessor', foreground: 'D4BE94', background: '262525' },
                { token: 'delimiter', foreground: '555555', background: '262525' },
                { token: 'delimiter.square', foreground: '555555', background: '262525' },
                { token: 'delimiter.curly', foreground: '555555', background: '262525' },
                { token: 'delimiter.parenthesis', foreground: '555555', background: '262525' },
                { token: 'delimiter.angle', foreground: '555555', background: '262525' },
            ],
            colors: {
                // エディタ背景は transparent のままにする
                'editor.background': '#00000000',
                // エディタの色設定
                'editor.foreground': '#848484',
                'editor.selectionBackground': '#D4BE9444',
                'editor.lineHighlightBackground': '#D4BE9422',
                'editorCursor.foreground': '#D4BE94',
                'editorWhitespace.foreground': '#3B3B3B',
                'editorLineNumber.foreground': '#555555',
                'editorLineNumber.activeForeground': '#D4BE94',
                'editor.selectionHighlightBackground': '#D4BE9444',
                'editor.findMatchBackground': '#D4BE9466',
                'editor.findMatchHighlightBackground': '#D4BE9444',

                // フォーカス境界線を削除
                'focusBorder': '#00000000',
                'editorFocus.border': '#00000000',
                'editor.focusBorder': '#00000000',
                'inputOption.activeBorder': '#00000000',
                'list.focusBorder': '#00000000',
                'list.activeSelectionBorder': '#00000000',
                'editor.selectionBorder': '#00000000',

                // 概要ルーラー関連
                'editorOverviewRuler.background': '#262525',
                'minimapSlider.background': '#262525',

                // すでに設定しているスクロールバー関連
                'scrollbar.shadow': '#00000000',
            }
        });
        console.log('モノクロームテーマを定義しました');

        // カラーバージョンのテーマ定義
        monaco.editor.defineTheme('shaderboy-color', {
            base: 'vs-dark',
            inherit: false,
            rules: [
                // 基本スタイル
                { token: '', foreground: 'D4BE94', background: '00000000' },

                // コメント
                { token: 'comment', foreground: '7F776AAA', fontStyle: 'italic' },

                // キーワード系
                { token: 'keyword', foreground: 'D4BE94' },        // 黄色っぽい
                { token: 'keyword.control', foreground: 'e1c169' },
                { token: 'keyword.type', foreground: '3aab5f' },   // 緑
                { token: 'keyword.struct', foreground: '5acb65' }, // 緑
                { token: 'keyword.function', foreground: '6175bd' }, // 青
                { token: 'keyword.storage', foreground: 'e1c169' },

                // 変数と識別子
                { token: 'variable', foreground: 'D4BE94FF' },
                { token: 'variable.predefined', foreground: 'D4BE94FF' },
                { token: 'identifier', foreground: 'D4BE94' },

                // 関数とメソッド
                { token: 'user.function', foreground: '609cdf' },  // 青
                { token: 'struct.name', foreground: '5acb65' },    // 緑

                // 文字列と定数
                { token: 'string', foreground: 'D4BE94' },
                { token: 'constant', foreground: 'D4BE94' },
                { token: 'constant.language.boolean', foreground: 'e1c169' },

                // 数値
                { token: 'number', foreground: 'ac65c7' },        // 紫
                { token: 'number.float', foreground: 'ac65c7' },
                { token: 'number.hex', foreground: 'ac65c7' },
                { token: 'number.octal', foreground: 'ac65c7' },

                // 演算子
                { token: 'operator', foreground: 'FE8565' },      // オレンジ

                // プリプロセッサ
                { token: 'preprocessor', foreground: 'D4BE94' },  // 紫
            ],
            colors: {
                // エディタの色設定（モノクロームと同じ）
                'editor.foreground': '#848484',
                'editor.background': '#00000000', // 透明背景
                'editor.selectionBackground': '#D4BE9444',
                'editor.lineHighlightBackground': '#D4BE9422',
                'editorCursor.foreground': '#D4BE94',
                'editorWhitespace.foreground': '#3B3B3B',
                'editorLineNumber.foreground': '#555555',
                'editorLineNumber.activeForeground': '#D4BE94',
                'editor.selectionHighlightBackground': '#D4BE9444',
                'editor.findMatchBackground': '#D4BE9466',
                'editor.findMatchHighlightBackground': '#D4BE9444',

                // フォーカス境界線を削除
                'focusBorder': '#00000000',
                'editorFocus.border': '#00000000',
                'editor.focusBorder': '#00000000',
                'inputOption.activeBorder': '#00000000',
                'list.focusBorder': '#00000000',
                'list.activeSelectionBorder': '#00000000',
                'editor.selectionBorder': '#00000000',
                'minimap.background': '#00000000',

                'scrollbar.shadow': '#262525',              // スクロールバーの影（透明に）
                'scrollbarSlider.background': '#262525',    // スクロールバーの背景（半透明）
                'scrollbarSlider.hoverBackground': '#262525', // ホバー時の背景
                'scrollbarSlider.activeBackground': '#262525', // ドラッグ時の背景
                // 'editorGutter.background': '#262525',

                // 概要ルーラー関連
                'editorOverviewRuler.background': '#262525',
                // 'minimapSlider.background': '#262525',
            }
        });
        console.log('カラーテーマを定義しました');

        // フォント設定（CodeMirrorテーマから移植）
        this.editorFontFamily = "'Overpass Mono', monospace";
        this.editorFontWeight = 400;
        this.editorLineHeight = 1.2;
        this.editorLetterSpacing = 0;

        // モノトーンテーマ用のスタイル要素の内容を定義（まだDOMには追加しない）
        this.monotoneStyleContent = `
            /* モノトーンテーマ専用のスタイル - テキスト背景のみ */
            .monaco-editor .lines-content > .view-lines > .view-line > span {
                background-color: rgba(38, 37, 37, 0.95) !important;
            }
        `;

        // カスタムCSS追加
        this.injectCustomCSS();

        console.log('ShaderBoy.theme.init() が完了しました');
        return this;
    },

    // カスタムCSSをDOMに追加
    injectCustomCSS() {
        console.log('injectCustomCSS() が呼び出されました');

        const customCSS = `
            /* Codiconsフォントをウェブから読み込み */
            @import url('https://cdn.jsdelivr.net/gh/microsoft/vscode-codicons@main/dist/codicon.css');

            /* Monaco エディタのカスタムスタイル */
            .monaco-editor {
                position: absolute;
                margin-top: 45px;
                height: calc(100% - 90px);
                width: 100%;
                transition: width 0.3s;
            }

            .monaco-editor .expand-height {
                height: calc(100% - 45px);
            }

            .monaco-editor .monaco-editor-background {
                background-color: transparent !important;
            }

            /* 行番号部分の背景も合わせる */
            .monaco-editor.shaderboy-monotone-theme .margin-view-overlays .line-numbers {
                background-color: #262525 !important;
            }

            .monaco-editor .sticky-widget {
                box-shadow: none;
                background-color: #262525;
            }

            /* フォーカス時の青い境界線を完全に削除 */
            .monaco-editor .focused,
            .monaco-editor:focus,
            .monaco-editor-group-container.active,
            .monaco-editor .inputarea:focus,
            .monaco-editor .view-overlays .focused {
                outline: none !important;
                border-color: transparent !important;
            }

            /* アイコン定義（コード補完用） */
            .icon-code-st {
                display: inline-block;
                width: 8px;
                height: 8px;
                opacity: 0.4;
                background: transparent;
                background-image: url('data:image/svg+xml;charset=utf8,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%225.39px%22%20height%3D%228px%22%20viewBox%3D%220%200%205.39%208%22%20style%3D%22enable-background%3Anew%200%200%205.39%208%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%20.st0%7Bfill%3A%23D8D4C5%3B%7D%3C%2Fstyle%3E%3Cdefs%3E%3C%2Fdefs%3E%3Cpath%20class%3D%22st0%22%20d%3D%22M5.39%2C1.25c0%2C0.31-0.08%2C0.56-0.23%2C0.76C5%2C2.2%2C4.8%2C2.3%2C4.53%2C2.3c-0.2%2C0-0.36-0.07-0.48-0.22%20C4.19%2C2%2C4.31%2C1.87%2C4.39%2C1.71c0.09-0.17%2C0.13-0.34%2C0.13-0.52c0-0.18-0.05-0.34-0.17-0.48C4.25%2C0.57%2C4.04%2C0.5%2C3.75%2C0.5%20s-0.52%2C0.08-0.7%2C0.23S2.8%2C1.13%2C2.8%2C1.44c0%2C0.26%2C0.06%2C0.48%2C0.17%2C0.67S3.23%2C2.48%2C3.4%2C2.65c0.17%2C0.17%2C0.36%2C0.34%2C0.57%2C0.51%20c0.21%2C0.17%2C0.39%2C0.36%2C0.57%2C0.57c0.17%2C0.21%2C0.32%2C0.45%2C0.43%2C0.73c0.11%2C0.27%2C0.17%2C0.59%2C0.17%2C0.97c0%2C0.44-0.08%2C0.82-0.25%2C1.14%20s-0.38%2C0.59-0.65%2C0.8C3.97%2C7.58%2C3.66%2C7.74%2C3.3%2C7.84C2.95%2C7.95%2C2.58%2C8%2C2.21%2C8c-0.3%2C0-0.58-0.03-0.85-0.1%20c-0.27-0.06-0.5-0.16-0.7-0.31C0.46%2C7.46%2C0.3%2C7.27%2C0.18%2C7.05C0.06%2C6.83%2C0%2C6.56%2C0%2C6.24C0%2C5.96%2C0.05%2C5.71%2C0.14%2C5.5%20c0.09-0.21%2C0.21-0.39%2C0.36-0.54c0.15-0.14%2C0.31-0.25%2C0.5-0.32c0.18-0.07%2C0.36-0.11%2C0.55-0.11c0.09%2C0%2C0.19%2C0.01%2C0.29%2C0.03%20c0.1%2C0.02%2C0.2%2C0.06%2C0.28%2C0.11s0.16%2C0.12%2C0.22%2C0.21c0.06%2C0.09%2C0.1%2C0.2%2C0.12%2C0.33c-0.15%2C0-0.29%2C0.02-0.44%2C0.06%20c-0.15%2C0.04-0.28%2C0.1-0.4%2C0.18C1.5%2C5.54%2C1.4%2C5.64%2C1.33%2C5.77C1.25%2C5.9%2C1.21%2C6.05%2C1.21%2C6.23c0%2C0.26%2C0.09%2C0.49%2C0.26%2C0.67%20c0.18%2C0.18%2C0.43%2C0.27%2C0.77%2C0.27c0.36%2C0%2C0.64-0.11%2C0.87-0.35c0.22-0.23%2C0.33-0.57%2C0.33-1c0-0.3-0.05-0.57-0.16-0.81%20s-0.24-0.46-0.4-0.67c-0.16-0.21-0.33-0.4-0.52-0.59C2.19%2C3.56%2C2.02%2C3.37%2C1.86%2C3.17s-0.29-0.39-0.4-0.6%20c-0.1-0.21-0.16-0.45-0.16-0.7c0-0.27%2C0.06-0.52%2C0.19-0.75s0.3-0.42%2C0.51-0.59c0.21-0.17%2C0.47-0.3%2C0.76-0.39%20C3.06%2C0.05%2C3.38%2C0%2C3.71%2C0c0.12%2C0%2C0.28%2C0.01%2C0.47%2C0.04S4.55%2C0.11%2C4.73%2C0.2c0.18%2C0.08%2C0.33%2C0.21%2C0.47%2C0.37%20C5.32%2C0.74%2C5.39%2C0.97%2C5.39%2C1.25z%22%2F%3E%3C%2Fsvg%3E');
                background-repeat: no-repeat;
                background-position: center center;
                background-size: 60%;
                margin-right: 2px;
                vertical-align: middle;
            }

            .icon-code-gl {
                display: inline-block;
                width: 8.5px;
                height: 8.5px;
                opacity: 0.4;
                background: transparent;
                background-image: url('data:image/svg+xml;charset=utf8,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%2211.84px%22%20height%3D%227px%22%20viewBox%3D%220%200%2011.84%207%22%20style%3D%22enable-background%3Anew%200%200%2011.84%207%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%20.st0%7Bfill%3A%23D8D4C5%3B%7D%3C%2Fstyle%3E%3Cdefs%3E%3C%2Fdefs%3E%3Cg%3E%20%3Cpath%20class%3D%22st0%22%20d%3D%22M4.25%2C6.8C3.93%2C6.93%2C3.61%2C7%2C3.29%2C7C2.77%2C7%2C2.31%2C6.91%2C1.9%2C6.73C1.5%2C6.56%2C1.15%2C6.31%2C0.87%2C6%20c-0.28-0.31-0.5-0.68-0.65-1.1C0.07%2C4.47%2C0%2C4.02%2C0%2C3.53c0-0.5%2C0.07-0.96%2C0.22-1.39s0.36-0.8%2C0.64-1.12C1.15%2C0.7%2C1.49%2C0.45%2C1.9%2C0.27%20S2.77%2C0%2C3.28%2C0c0.34%2C0%2C0.67%2C0.05%2C0.99%2C0.16s0.61%2C0.26%2C0.87%2C0.45s0.47%2C0.45%2C0.64%2C0.74c0.17%2C0.29%2C0.27%2C0.63%2C0.31%2C1.01H4.7%20c-0.09-0.37-0.26-0.65-0.5-0.84S3.64%2C1.24%2C3.28%2C1.24c-0.33%2C0-0.61%2C0.06-0.84%2C0.19c-0.23%2C0.13-0.42%2C0.3-0.56%2C0.51%20S1.63%2C2.41%2C1.57%2C2.68c-0.06%2C0.27-0.1%2C0.56-0.1%2C0.85c0%2C0.28%2C0.03%2C0.55%2C0.1%2C0.82c0.06%2C0.27%2C0.17%2C0.5%2C0.31%2C0.72s0.33%2C0.38%2C0.56%2C0.51%20c0.23%2C0.13%2C0.51%2C0.19%2C0.84%2C0.19c0.49%2C0%2C0.86-0.12%2C1.13-0.37c0.27-0.25%2C0.42-0.6%2C0.47-1.07H3.4v-1.1h2.8v3.61H5.27L5.12%2C6.09%20C4.86%2C6.43%2C4.57%2C6.66%2C4.25%2C6.8z%22%2F%3E%20%3Cpath%20class%3D%22st0%22%20d%3D%22M8.58%2C0.17V5.6h3.26v1.24H7.12V0.17H8.58z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E');
                background-repeat: no-repeat;
                background-position: center center;
                background-size: 100%;
                margin-right: 2px;
                vertical-align: middle;
            }

            .icon-code-usr-st {
                display: inline-block;
                width: 8.5px;
                height: 8.5px;
                opacity: 0.4;
                background: transparent;
                background-image: url('data:image/svg+xml;charset=utf8,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%228.16px%22%20height%3D%226.62px%22%20viewBox%3D%220%200%208.16%206.62%22%20style%3D%22enable-background%3Anew%200%200%208.16%206.62%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%20.st0%7Bfill%3A%23D8D4C5%3B%7D%3C%2Fstyle%3E%3Cdefs%3E%3C%2Fdefs%3E%3Cg%3E%20%3Cg%3E%20%3Cpath%20class%3D%22st0%22%20d%3D%22M2.18%2C6.62C1.73%2C6.62%2C1.3%2C6.55%2C0.9%2C6.4C0.5%2C6.26%2C0.2%2C6.08%2C0%2C5.89l0.44-0.73c0.19%2C0.15%2C0.44%2C0.29%2C0.77%2C0.41%20c0.33%2C0.12%2C0.63%2C0.18%2C0.92%2C0.18c0.81%2C0%2C1.22-0.32%2C1.22-0.95c0-0.13-0.01-0.25-0.04-0.33C3.29%2C4.39%2C3.24%2C4.3%2C3.17%2C4.21%20C3.09%2C4.13%2C2.98%2C4.05%2C2.84%2C3.98S2.52%2C3.83%2C2.28%2C3.75c-0.06-0.02-0.16-0.06-0.3-0.1C1.85%2C3.61%2C1.76%2C3.58%2C1.71%2C3.56%20C1.32%2C3.44%2C1%2C3.3%2C0.77%2C3.15S0.35%2C2.81%2C0.22%2C2.58S0.03%2C2.06%2C0.03%2C1.72c0-0.37%2C0.1-0.69%2C0.29-0.95S0.78%2C0.31%2C1.1%2C0.19S1.79%2C0%2C2.21%2C0%20c0.38%2C0%2C0.7%2C0.03%2C0.98%2C0.1c0.28%2C0.07%2C0.5%2C0.15%2C0.66%2C0.24c0.16%2C0.1%2C0.32%2C0.22%2C0.47%2C0.37L3.81%2C1.39C3.63%2C1.22%2C3.41%2C1.09%2C3.15%2C1%20C2.89%2C0.91%2C2.62%2C0.87%2C2.35%2C0.87c-0.37%2C0-0.66%2C0.07-0.89%2C0.2C1.22%2C1.21%2C1.11%2C1.41%2C1.11%2C1.68c0%2C0.18%2C0.02%2C0.33%2C0.07%2C0.43%20c0.05%2C0.11%2C0.14%2C0.2%2C0.29%2C0.29C1.61%2C2.5%2C1.83%2C2.59%2C2.12%2C2.69c0.37%2C0.12%2C0.57%2C0.18%2C0.59%2C0.19C3.36%2C3.1%2C3.81%2C3.35%2C4.05%2C3.63%20s0.37%2C0.67%2C0.37%2C1.18c0%2C0.31-0.06%2C0.58-0.18%2C0.82C4.12%2C5.87%2C3.95%2C6.06%2C3.74%2C6.2S3.29%2C6.44%2C3.03%2C6.51S2.48%2C6.62%2C2.18%2C6.62z%22%2F%3E%20%3Cpath%20class%3D%22st0%22%20d%3D%22M8.16%2C6.51H7.74c-0.32%2C0-0.59-0.02-0.8-0.06S6.55%2C6.33%2C6.39%2C6.22S6.11%2C5.94%2C6.04%2C5.73%20C5.97%2C5.51%2C5.93%2C5.24%2C5.93%2C4.9V2.67h-0.9V2.01h0.92v-1.1l0.95-0.29v1.38h1.23v0.66H6.91v2.29c0%2C0.18%2C0.02%2C0.33%2C0.05%2C0.43%20c0.03%2C0.1%2C0.1%2C0.18%2C0.2%2C0.24s0.23%2C0.1%2C0.37%2C0.11s0.35%2C0.02%2C0.63%2C0.02V6.51z%22%2F%3E%20%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E');
                background-repeat: no-repeat;
                background-position: center center;
                background-size: 100%;
                margin-right: 2px;
                vertical-align: middle;
            }

            .icon-code-usr-fx {
                display: inline-block;
                width: 8.5px;
                height: 8.5px;
                opacity: 0.4;
                background: transparent;
                background-image: url('data:image/svg+xml;charset=utf8,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%228.6px%22%20height%3D%226.4px%22%20viewBox%3D%220%200%208.6%206.4%22%20style%3D%22enable-background%3Anew%200%200%208.6%206.4%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%20.st0%7Bfill%3A%23D8D4C5%3B%7D%3C%2Fstyle%3E%3Cdefs%3E%3C%2Fdefs%3E%3Cg%3E%20%3Cg%3E%20%3Cpath%20class%3D%22st0%22%20d%3D%22M0%2C6.4V0h3.82v0.86H1.01v1.81h2.64v0.87H1.01V6.4H0z%22%2F%3E%20%3Cpath%20class%3D%22st0%22%20d%3D%22M4.25%2C6.4l1.63-2.21L4.34%2C1.89h1.08l1.02%2C1.54l1.12-1.54h1.02l-1.6%2C2.18L8.6%2C6.4H7.53L6.44%2C4.82L5.29%2C6.4%20H4.25z%22%2F%3E%20%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E');
                background-repeat: no-repeat;
                background-position: center center;
                background-size: 100%;
                margin-right: 2px;
                vertical-align: middle;
            }

            .monaco-editor .suggestion-details,
            .monaco-editor .suggest-widget {
                font-family: "Fragment Mono", monospace;
                font-size: 14px;
                color: #D8D4C5;
                background-color: #262525;
            }

            /* メディアクエリ対応 */
            @media (max-width: 1080px) {
                .monaco-editor {
                    margin-top: 0px;
                    height: calc(100% - 35px);
                }
            }

            /* エラーウィジェットのスタイル */
            .monaco-editor .error-widget {
                background-color: rgba(255, 0, 0, 0.2);
                color: #ff6666;
                padding: 3px 8px;
                border-left: 2px solid #ff3333;
                font-family: "Fragment Mono", monospace;
                font-size: 13px;
            }

            .monaco-editor .error-widget.notify {
                background-color: rgba(255, 0, 0, 0.3);
                font-weight: bold;
            }

            /* エラー下線スタイルをカスタマイズ - オレンジ色に変更 */
            .monaco-editor .squiggly-error {
                background: url("data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%206%203'%20enable-background%3D'new%200%200%206%203'%20height%3D'3'%20width%3D'6'%3E%3Cg%20fill%3D'%23fe8565'%3E%3Cpolygon%20points%3D'5.5%2C0%202.5%2C3%201.1%2C3%204.1%2C0'%2F%3E%3Cpolygon%20points%3D'4%2C0%206%2C2%206%2C0.6%205.4%2C0'%2F%3E%3Cpolygon%20points%3D'0%2C2%201%2C3%202.4%2C3%200%2C0.6'%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E") repeat-x bottom left !important;
            }

            /* エラーガターアイコンの色も変更 */
            .monaco-editor .marker-widget.error {
                border-left-color: #fe8565 !important;
            }

            /* エラー概要ルーラーの色も変更 */
            .monaco-editor .editorOverviewRuler .errorForeground {
                background-color: #fe8565 !important;
            }

            /* エラー行のハイライト色も変更 */
            .monaco-editor .monaco-editor-background .errorHighlight {
                background-color: rgba(254, 133, 101, 0.2) !important;
                border: none !important;
            }

            /* 概要ルーラーのエラーマーカー色を変更 - より強力なセレクタ */
            .monaco-editor .decorationsOverviewRuler .errorOverviewRuler,
            .monaco-editor .decorationsOverviewRuler div[class*="errorForeground"],
            .monaco-editor .decorationsOverviewRuler .error,
            .monaco-editor-background .decorationsOverviewRuler .errorForeground {
                background-color: #fe8565 !important;
            }

            /* スクロールバー領域のエラーマーカー */
            .monaco-scrollable-element .decorationsOverviewRuler .errorOverviewRuler {
                background-color: #fe8565 !important;
            }

            /* エラー下線 */
            .monaco-editor .squiggly-error {
                background: url("data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%206%203'%20enable-background%3D'new%200%200%206%203'%20height%3D'3'%20width%3D'6'%3E%3Cg%20fill%3D'%23fe8565'%3E%3Cpolygon%20points%3D'5.5%2C0%202.5%2C3%201.1%2C3%204.1%2C0'%2F%3E%3Cpolygon%20points%3D'4%2C0%206%2C2%206%2C0.6%205.4%2C0'%2F%3E%3Cpolygon%20points%3D'0%2C2%201%2C3%202.4%2C3%200%2C0.6'%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E") repeat-x bottom left !important;
            }

            /* エラーパネル */
            .error-panel {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                // max-height: 120px;
                overflow-y: show;
                z-index: 100;
                font-family: Mulish, monospace;
                margin: 60px 40px
            }

            .error-list {
                list-style: none;
                margin: 0;
                padding: 0;
            }

            .error-item {
                padding: 4px 8px;
                color: #262525;
                cursor: pointer;
                font-size: 15px;
                line-height: 1.1;
                font-weight: 700;
                text-align: left;
                background-color: #fe8565;
                border-radius: 20px;
                margin-bottom: 2px;
            }

            .error-line {
                margin-right: 5px;
                padding-left: 0px !important;
            }

            .error-line::before {
                background-image: url(data:image/svg+xml;charset=utf8,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%2216px%22%20height%3D%2216px%22%20viewBox%3D%220%200%2016%2016%22%20style%3D%22enable-background%3Anew%200%200%2016%2016%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%20.st0%7Bfill-rule%3Aevenodd%3Bclip-rule%3Aevenodd%3Bfill%3A%231F1F1F%3B%7D%3C%2Fstyle%3E%3Cdefs%3E%3C%2Fdefs%3E%3Cpath%20class%3D%22st0%22%20d%3D%22M8%2C0C3.58%2C0%2C0%2C3.58%2C0%2C8c0%2C4.42%2C3.58%2C8%2C8%2C8c4.42%2C0%2C8-3.58%2C8-8C16%2C3.58%2C12.42%2C0%2C8%2C0z%20M11.42%2C10.04l-1.39%2C1.39%20L8%2C9.29l-2.04%2C2.14l-1.39-1.39L6.71%2C8L4.57%2C5.96l1.39-1.39L8%2C6.72l2.04-2.14l1.39%2C1.39L9.29%2C8L11.42%2C10.04z%22%2F%3E%3C%2Fsvg%3E) !important;
                content: "" !important;
                width: 16px !important;
                height: 16px !important;
                background-repeat: no-repeat !important;
                background-position: center !important;
                display: inline-block !important;
                background-size: 100% !important;
                vertical-align: middle !important;
                margin-left: 0px;
                margin-right: 4px;
                margin-bottom: 4px;
            }

            .error-element {
                margin-right: 5px;
            }

            /* カスタム型参照のハイライト */
            .monaco-editor .custom-type-reference {
                color: #5acb65; /* 構造体型の色を指定 */
                font-style: normal;
                font-weight: bold;
            }

            /* Codiconsフォントの読み込み */
            @font-face {
                font-family: 'codicon';
                src: url('./assets/codicon.ttf') format('truetype');
                font-weight: normal;
                font-style: normal;
            }

            /* アイコンスタイルの修正 */
            .codicon[class*='codicon-'] {
                font-family: 'codicon' !important;
            }

            /* 検索関連のアイコン修正 */
            .monaco-editor .find-widget .button {
                background-position: center center;
                background-repeat: no-repeat;
                background-size: 16px;
            }

            /* スクロールバー領域の背景色を修正 */
            .monaco-editor .scrollbar {
                background-color: #262525 !important;
            }

            /* 右端のスクロールバー背景 */
            .monaco-scrollable-element > .scrollbar.vertical,
            .monaco-scrollable-element > .scrollbar.vertical .slider-container {
                background-color: #262525 !important;
            }

            /* 下部のスクロールバー背景 */
            .monaco-scrollable-element > .scrollbar.horizontal,
            .monaco-scrollable-element > .scrollbar.horizontal .slider-container {
                background-color: #262525 !important;
            }

            /* スクロールバー周辺の影を削除 */
            .monaco-scrollable-element > .shadow {
                display: none !important;
            }

            /* デコレーションマージンの背景色（行番号がある左側部分など） */
            .monaco-editor .margin {
                background-color: #262525 !important;
            }

            /* CSSカスタム変数でテーマの状態を管理 */
            .monaco-editor {
                --char-bg-color: transparent;
            }

            /* 文字トークンに背景色を適用 - 選択は妨げない */
            .monaco-editor .view-line span {
                background-color: var(--char-bg-color);
                border-radius: 2px;
            }

            /* 選択されたテキストやカーソル位置では背景を表示しない */
            .monaco-editor .selected-text span,
            .monaco-editor .cursor-line span {
                background-color: transparent !important;
            }

            /* テキスト背景のスタイル */
            .monaco-editor .text-background {
                background-color: rgba(38, 37, 37, 0.95) !important;
                border-radius: 2px;
            }

            /* デバッグ用テキスト背景 - 非常に目立つスタイル */
            .monaco-editor .debug-text-background {
                background-color: rgba(255, 0, 0, 0.3) !important; /* 赤色の背景で確実に目立つように */
                border-radius: 0;
                display: inline-block;
            }

            /* モノトーンテーマ専用のスタイル */
            .monaco-editor.vs-dark[data-theme='shaderboy-monotone'] .view-line {
                background-color: #262525 !important;
            }

            .monaco-editor.vs-dark[data-theme='shaderboy-color'] .view-line {
                background-color: transparent !important;
            }
        `;

        // スタイルタグを作成して追加
        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.id = 'shaderboy-theme-style';
        styleElement.innerHTML = customCSS;
        document.head.appendChild(styleElement);

        console.log('カスタムCSSを追加しました。スタイル要素ID:', styleElement.id);
    },

    // テーマ適用
    applyTheme(editorInstance, colorTheme = false) {
        console.log('applyTheme() が呼び出されました。パラメータ:', { colorTheme });

        // テーマ名の決定
        const themeName = colorTheme ? 'shaderboy-color' : 'shaderboy-monotone';
        console.log('適用するテーマ:', themeName);

        // すべての古いスタイル要素を削除
        const oldStyles = document.querySelectorAll('style[id^="shaderboy-monotone-style"]');
        oldStyles.forEach(styleEl => {
            styleEl.remove();
            console.log('古いスタイル要素を削除しました:', styleEl.id);
        });

        // モノトーンテーマの場合のみ、新しいスタイル要素を作成して追加
        if (!colorTheme) {
            const styleEl = document.createElement('style');
            styleEl.id = `shaderboy-monotone-style-${Date.now()}`; // ユニークなIDを設定
            styleEl.textContent = this.monotoneStyleContent;
            document.head.appendChild(styleEl);
            console.log('新しいモノトーンスタイルを追加しました:', styleEl.id);
        }

        // エディタインスタンスの確認
        if (!editorInstance) {
            console.error('エディタインスタンスが無効です');
            return;
        }

        try {
            // テーマと関連する設定を適用
            editorInstance.updateOptions({
                theme: themeName,
                fontFamily: this.editorFontFamily,
                fontWeight: this.editorFontWeight,
                lineHeight: this.editorLineHeight,
                letterSpacing: this.editorLetterSpacing,
                renderFocusBorder: false,
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                folding: true,
                fixedOverflowWidgets: false,
                lineDecorationsWidth: 0,
                scrollBeyondLastLine: false,
            });
            console.log('テーマと設定を適用しました');

            // スタイルが正しく適用されるようにレイアウトを更新
            setTimeout(() => {
                editorInstance.layout();
                console.log('エディタレイアウトを更新しました');
            }, 50);
        } catch (error) {
            console.error('テーマ適用中にエラーが発生しました:', error);
        }
    }
};