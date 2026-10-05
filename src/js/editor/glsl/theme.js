import ShaderBoy from '../../shaderboy';
import * as monaco from 'monaco-editor';
import palette from '../../palette';

const ui = palette.ui;
const urlHex = (c) => `%23${c.slice(1, 7)}`;

const NO_FOCUS_BORDER = {
    'focusBorder': '#00000000',
    'editorFocus.border': '#00000000',
    'editor.focusBorder': '#00000000',
    'inputOption.activeBorder': '#00000000',
    'list.focusBorder': '#00000000',
    'list.activeSelectionBorder': '#00000000',
    'editor.selectionBorder': '#00000000',
};

function defineDarkThemes() {
    // 重ね表示用 (文字背景付き)
    monaco.editor.defineTheme('shaderboy-monotone', {
        base: 'vs-dark',
        inherit: false,
        rules: [
            { token: '', foreground: '848484', background: '252525' },
            { token: 'comment', foreground: '7F776AAA', fontStyle: 'italic', background: '252525' },
            { token: 'keyword', foreground: 'D4BE94', background: '252525' },
            { token: 'keyword.control', foreground: 'D4BE94', background: '252525' },
            { token: 'keyword.type', foreground: 'D4BE94a6', background: '252525' },
            { token: 'keyword.struct', foreground: 'D4BE94', background: '252525' },
            { token: 'keyword.function', foreground: 'D4BE94', background: '252525' },
            { token: 'keyword.storage', foreground: 'D4BE94', background: '252525' },
            { token: 'variable', foreground: 'D4BE94', background: '252525' },
            { token: 'variable.predefined', foreground: 'D4BE94', background: '252525' },
            { token: 'identifier', foreground: '848484', background: '252525' },
            { token: 'user.function', foreground: 'D4BE94', fontStyle: 'bold', background: '252525' },
            { token: 'struct.name', foreground: 'D4BE94', fontStyle: 'bold', background: '252525' },
            { token: 'string', foreground: 'D4BE94', background: '252525' },
            { token: 'constant', foreground: 'D4BE94', background: '252525' },
            { token: 'constant.language.boolean', foreground: 'D4BE94', background: '252525' },
            { token: 'number', foreground: 'D4BE94', background: '252525' },
            { token: 'number.float', foreground: 'D4BE94', background: '252525' },
            { token: 'number.hex', foreground: 'D4BE94', background: '252525' },
            { token: 'number.octal', foreground: 'D4BE94', background: '252525' },
            { token: 'operator', foreground: 'D4BE9483', background: '252525' },
            { token: 'preprocessor', foreground: 'D4BE94', background: '252525' },
            { token: 'delimiter', foreground: '555555', background: '252525' },
            { token: 'delimiter.square', foreground: '555555', background: '252525' },
            { token: 'delimiter.curly', foreground: '555555', background: '252525' },
            { token: 'delimiter.parenthesis', foreground: '555555', background: '252525' },
            { token: 'delimiter.angle', foreground: '555555', background: '252525' },
        ],
        colors: {
            'editor.background': '#00000000',
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
            ...NO_FOCUS_BORDER,
            'editorOverviewRuler.background': '#252525',
            'minimapSlider.background': '#252525',
            'scrollbar.shadow': '#00000000',
        }
    });

    // 分割表示用
    monaco.editor.defineTheme('shaderboy-color', {
        base: 'vs-dark',
        inherit: false,
        rules: [
            { token: '', foreground: 'D4BE94', background: '00000000' },
            { token: 'comment', foreground: '7F776AAA', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'D4BE94' },
            { token: 'keyword.control', foreground: 'e1c169' },
            { token: 'keyword.type', foreground: '3aab5f' },
            { token: 'keyword.struct', foreground: '5acb65' },
            { token: 'keyword.function', foreground: '6175bd' },
            { token: 'keyword.storage', foreground: 'e1c169' },
            { token: 'variable', foreground: 'D4BE94FF' },
            { token: 'variable.predefined', foreground: 'D4BE94FF' },
            { token: 'identifier', foreground: 'D4BE94' },
            { token: 'user.function', foreground: '609cdf' },
            { token: 'struct.name', foreground: '5acb65' },
            { token: 'string', foreground: 'D4BE94' },
            { token: 'constant', foreground: 'D4BE94' },
            { token: 'constant.language.boolean', foreground: 'e1c169' },
            { token: 'number', foreground: 'ac65c7' },
            { token: 'number.float', foreground: 'ac65c7' },
            { token: 'number.hex', foreground: 'ac65c7' },
            { token: 'number.octal', foreground: 'ac65c7' },
            { token: 'operator', foreground: 'FE8565' },
            { token: 'preprocessor', foreground: 'D4BE94' },
            { token: 'delimiter', foreground: '555555' },
            { token: 'delimiter.square', foreground: '555555' },
            { token: 'delimiter.curly', foreground: '555555' },
            { token: 'delimiter.parenthesis', foreground: '555555' },
            { token: 'delimiter.angle', foreground: '555555' },
        ],
        colors: {
            'editor.foreground': '#848484',
            'editor.background': '#00000000',
            'editor.selectionBackground': '#D4BE9444',
            'editor.lineHighlightBackground': '#D4BE9422',
            'editorCursor.foreground': '#D4BE94',
            'editorWhitespace.foreground': '#3B3B3B',
            'editorLineNumber.foreground': '#555555',
            'editorLineNumber.activeForeground': '#D4BE94',
            'editor.selectionHighlightBackground': '#D4BE9444',
            'editor.findMatchBackground': '#D4BE9466',
            'editor.findMatchHighlightBackground': '#D4BE9444',
            ...NO_FOCUS_BORDER,
            'minimap.background': '#00000000',
            'scrollbar.shadow': '#252525',
            'scrollbarSlider.background': '#252525',
            'scrollbarSlider.hoverBackground': '#252525',
            'scrollbarSlider.activeBackground': '#252525',
            'editorOverviewRuler.background': '#252525',
        }
    });
}

// Vitesse Light Soft (antfu/vscode-theme-vitesse) のトークン色を GLSL のトークンに対応付けたもの
function defineLightTheme() {
    monaco.editor.defineTheme('shaderboy-light', {
        base: 'vs',
        inherit: false,
        rules: [
            { token: '', foreground: '393a34' },
            { token: 'comment', foreground: 'a0ada0' },
            { token: 'keyword', foreground: '1e754f' },
            { token: 'keyword.control', foreground: '1e754f' },
            { token: 'keyword.type', foreground: '2e8f82' },
            { token: 'keyword.struct', foreground: '1e754f' },
            { token: 'keyword.function', foreground: '998418' },
            { token: 'keyword.storage', foreground: 'ab5959' },
            { token: 'variable', foreground: 'a65e2b' },
            { token: 'variable.predefined', foreground: 'a65e2b' },
            { token: 'identifier', foreground: 'b07d48' },
            { token: 'user.function', foreground: '59873a' },
            { token: 'struct.name', foreground: '2e8f82' },
            { token: 'string', foreground: 'b56959' },
            { token: 'constant', foreground: 'a65e2b' },
            { token: 'constant.language.boolean', foreground: '1e754f' },
            { token: 'number', foreground: '2f798a' },
            { token: 'number.float', foreground: '2f798a' },
            { token: 'number.hex', foreground: '2f798a' },
            { token: 'number.octal', foreground: '2f798a' },
            { token: 'operator', foreground: 'ab5959' },
            { token: 'preprocessor', foreground: '1e754f' },
            { token: 'delimiter', foreground: '999999' },
            { token: 'delimiter.square', foreground: '999999' },
            { token: 'delimiter.curly', foreground: '999999' },
            { token: 'delimiter.parenthesis', foreground: '999999' },
            { token: 'delimiter.angle', foreground: '999999' },
        ],
        colors: {
            'editor.background': '#00000000',
            'editor.foreground': '#393a34',
            'editor.selectionBackground': '#22222218',
            'editor.selectionHighlightBackground': '#22222210',
            'editor.lineHighlightBackground': '#E7E5DB',
            'editor.findMatchBackground': '#e6cc7744',
            'editor.findMatchHighlightBackground': '#e6cc7766',
            'editorBracketMatch.background': '#1c6b4820',
            'editorCursor.foreground': '#393a34',
            'editorWhitespace.foreground': '#00000015',
            'editorIndentGuide.background': '#00000015',
            'editorLineNumber.foreground': '#393a3450',
            'editorLineNumber.activeForeground': '#4e4f47',
            'editorWidget.background': ui['col-bg'],
            ...NO_FOCUS_BORDER,
            'minimap.background': '#00000000',
            'scrollbar.shadow': '#00000000',
            'scrollbarSlider.background': '#393a3410',
            'scrollbarSlider.hoverBackground': '#393a3450',
            'scrollbarSlider.activeBackground': '#393a3450',
            'editorOverviewRuler.background': ui['col-bg'],
        }
    });
}

function injectCustomCSS() {
    const iconBase = `
                display: inline-block;
                width: 8.5px;
                height: 8.5px;
                opacity: 0.4;
                background: transparent;
                background-repeat: no-repeat;
                background-position: center center;
                background-size: 100%;
                margin-right: 2px;
                vertical-align: middle;`;

    const customCSS = `
            @import url('https://cdn.jsdelivr.net/gh/microsoft/vscode-codicons@main/dist/codicon.css');

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

            .monaco-editor .sticky-widget {
                box-shadow: none;
                background-color: ${ui['col-bg']};
            }

            .monaco-editor .focused,
            .monaco-editor:focus,
            .monaco-editor-group-container.active,
            .monaco-editor .inputarea:focus,
            .monaco-editor .view-overlays .focused {
                outline: none !important;
                border-color: transparent !important;
            }

            /* コード補完のアイコン */
            .icon-code-st {${iconBase}
                width: 8px;
                height: 8px;
                background-size: 60%;
                background-image: url('data:image/svg+xml;charset=utf8,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%225.39px%22%20height%3D%228px%22%20viewBox%3D%220%200%205.39%208%22%20style%3D%22enable-background%3Anew%200%200%205.39%208%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%20.st0%7Bfill%3A${urlHex(ui['col-frnt'])}%3B%7D%3C%2Fstyle%3E%3Cdefs%3E%3C%2Fdefs%3E%3Cpath%20class%3D%22st0%22%20d%3D%22M5.39%2C1.25c0%2C0.31-0.08%2C0.56-0.23%2C0.76C5%2C2.2%2C4.8%2C2.3%2C4.53%2C2.3c-0.2%2C0-0.36-0.07-0.48-0.22%20C4.19%2C2%2C4.31%2C1.87%2C4.39%2C1.71c0.09-0.17%2C0.13-0.34%2C0.13-0.52c0-0.18-0.05-0.34-0.17-0.48C4.25%2C0.57%2C4.04%2C0.5%2C3.75%2C0.5%20s-0.52%2C0.08-0.7%2C0.23S2.8%2C1.13%2C2.8%2C1.44c0%2C0.26%2C0.06%2C0.48%2C0.17%2C0.67S3.23%2C2.48%2C3.4%2C2.65c0.17%2C0.17%2C0.36%2C0.34%2C0.57%2C0.51%20c0.21%2C0.17%2C0.39%2C0.36%2C0.57%2C0.57c0.17%2C0.21%2C0.32%2C0.45%2C0.43%2C0.73c0.11%2C0.27%2C0.17%2C0.59%2C0.17%2C0.97c0%2C0.44-0.08%2C0.82-0.25%2C1.14%20s-0.38%2C0.59-0.65%2C0.8C3.97%2C7.58%2C3.66%2C7.74%2C3.3%2C7.84C2.95%2C7.95%2C2.58%2C8%2C2.21%2C8c-0.3%2C0-0.58-0.03-0.85-0.1%20c-0.27-0.06-0.5-0.16-0.7-0.31C0.46%2C7.46%2C0.3%2C7.27%2C0.18%2C7.05C0.06%2C6.83%2C0%2C6.56%2C0%2C6.24C0%2C5.96%2C0.05%2C5.71%2C0.14%2C5.5%20c0.09-0.21%2C0.21-0.39%2C0.36-0.54c0.15-0.14%2C0.31-0.25%2C0.5-0.32c0.18-0.07%2C0.36-0.11%2C0.55-0.11c0.09%2C0%2C0.19%2C0.01%2C0.29%2C0.03%20c0.1%2C0.02%2C0.2%2C0.06%2C0.28%2C0.11s0.16%2C0.12%2C0.22%2C0.21c0.06%2C0.09%2C0.1%2C0.2%2C0.12%2C0.33c-0.15%2C0-0.29%2C0.02-0.44%2C0.06%20c-0.15%2C0.04-0.28%2C0.1-0.4%2C0.18C1.5%2C5.54%2C1.4%2C5.64%2C1.33%2C5.77C1.25%2C5.9%2C1.21%2C6.05%2C1.21%2C6.23c0%2C0.26%2C0.09%2C0.49%2C0.26%2C0.67%20c0.18%2C0.18%2C0.43%2C0.27%2C0.77%2C0.27c0.36%2C0%2C0.64-0.11%2C0.87-0.35c0.22-0.23%2C0.33-0.57%2C0.33-1c0-0.3-0.05-0.57-0.16-0.81%20s-0.24-0.46-0.4-0.67c-0.16-0.21-0.33-0.4-0.52-0.59C2.19%2C3.56%2C2.02%2C3.37%2C1.86%2C3.17s-0.29-0.39-0.4-0.6%20c-0.1-0.21-0.16-0.45-0.16-0.7c0-0.27%2C0.06-0.52%2C0.19-0.75s0.3-0.42%2C0.51-0.59c0.21-0.17%2C0.47-0.3%2C0.76-0.39%20C3.06%2C0.05%2C3.38%2C0%2C3.71%2C0c0.12%2C0%2C0.28%2C0.01%2C0.47%2C0.04S4.55%2C0.11%2C4.73%2C0.2c0.18%2C0.08%2C0.33%2C0.21%2C0.47%2C0.37%20C5.32%2C0.74%2C5.39%2C0.97%2C5.39%2C1.25z%22%2F%3E%3C%2Fsvg%3E');
            }

            .icon-code-gl {${iconBase}
                background-image: url('data:image/svg+xml;charset=utf8,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%2211.84px%22%20height%3D%227px%22%20viewBox%3D%220%200%2011.84%207%22%20style%3D%22enable-background%3Anew%200%200%2011.84%207%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%20.st0%7Bfill%3A${urlHex(ui['col-frnt'])}%3B%7D%3C%2Fstyle%3E%3Cdefs%3E%3C%2Fdefs%3E%3Cg%3E%20%3Cpath%20class%3D%22st0%22%20d%3D%22M4.25%2C6.8C3.93%2C6.93%2C3.61%2C7%2C3.29%2C7C2.77%2C7%2C2.31%2C6.91%2C1.9%2C6.73C1.5%2C6.56%2C1.15%2C6.31%2C0.87%2C6%20c-0.28-0.31-0.5-0.68-0.65-1.1C0.07%2C4.47%2C0%2C4.02%2C0%2C3.53c0-0.5%2C0.07-0.96%2C0.22-1.39s0.36-0.8%2C0.64-1.12C1.15%2C0.7%2C1.49%2C0.45%2C1.9%2C0.27%20S2.77%2C0%2C3.28%2C0c0.34%2C0%2C0.67%2C0.05%2C0.99%2C0.16s0.61%2C0.26%2C0.87%2C0.45s0.47%2C0.45%2C0.64%2C0.74c0.17%2C0.29%2C0.27%2C0.63%2C0.31%2C1.01H4.7%20c-0.09-0.37-0.26-0.65-0.5-0.84S3.64%2C1.24%2C3.28%2C1.24c-0.33%2C0-0.61%2C0.06-0.84%2C0.19c-0.23%2C0.13-0.42%2C0.3-0.56%2C0.51%20S1.63%2C2.41%2C1.57%2C2.68c-0.06%2C0.27-0.1%2C0.56-0.1%2C0.85c0%2C0.28%2C0.03%2C0.55%2C0.1%2C0.82c0.06%2C0.27%2C0.17%2C0.5%2C0.31%2C0.72s0.33%2C0.38%2C0.56%2C0.51%20c0.23%2C0.13%2C0.51%2C0.19%2C0.84%2C0.19c0.49%2C0%2C0.86-0.12%2C1.13-0.37c0.27-0.25%2C0.42-0.6%2C0.47-1.07H3.4v-1.1h2.8v3.61H5.27L5.12%2C6.09%20C4.86%2C6.43%2C4.57%2C6.66%2C4.25%2C6.8z%22%2F%3E%20%3Cpath%20class%3D%22st0%22%20d%3D%22M8.58%2C0.17V5.6h3.26v1.24H7.12V0.17H8.58z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E');
            }

            .icon-code-usr-st {${iconBase}
                background-image: url('data:image/svg+xml;charset=utf8,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%228.16px%22%20height%3D%226.62px%22%20viewBox%3D%220%200%208.16%206.62%22%20style%3D%22enable-background%3Anew%200%200%208.16%206.62%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%20.st0%7Bfill%3A${urlHex(ui['col-frnt'])}%3B%7D%3C%2Fstyle%3E%3Cdefs%3E%3C%2Fdefs%3E%3Cg%3E%20%3Cg%3E%20%3Cpath%20class%3D%22st0%22%20d%3D%22M2.18%2C6.62C1.73%2C6.62%2C1.3%2C6.55%2C0.9%2C6.4C0.5%2C6.26%2C0.2%2C6.08%2C0%2C5.89l0.44-0.73c0.19%2C0.15%2C0.44%2C0.29%2C0.77%2C0.41%20c0.33%2C0.12%2C0.63%2C0.18%2C0.92%2C0.18c0.81%2C0%2C1.22-0.32%2C1.22-0.95c0-0.13-0.01-0.25-0.04-0.33C3.29%2C4.39%2C3.24%2C4.3%2C3.17%2C4.21%20C3.09%2C4.13%2C2.98%2C4.05%2C2.84%2C3.98S2.52%2C3.83%2C2.28%2C3.75c-0.06-0.02-0.16-0.06-0.3-0.1C1.85%2C3.61%2C1.76%2C3.58%2C1.71%2C3.56%20C1.32%2C3.44%2C1%2C3.3%2C0.77%2C3.15S0.35%2C2.81%2C0.22%2C2.58S0.03%2C2.06%2C0.03%2C1.72c0-0.37%2C0.1-0.69%2C0.29-0.95S0.78%2C0.31%2C1.1%2C0.19S1.79%2C0%2C2.21%2C0%20c0.38%2C0%2C0.7%2C0.03%2C0.98%2C0.1c0.28%2C0.07%2C0.5%2C0.15%2C0.66%2C0.24c0.16%2C0.1%2C0.32%2C0.22%2C0.47%2C0.37L3.81%2C1.39C3.63%2C1.22%2C3.41%2C1.09%2C3.15%2C1%20C2.89%2C0.91%2C2.62%2C0.87%2C2.35%2C0.87c-0.37%2C0-0.66%2C0.07-0.89%2C0.2C1.22%2C1.21%2C1.11%2C1.41%2C1.11%2C1.68c0%2C0.18%2C0.02%2C0.33%2C0.07%2C0.43%20c0.05%2C0.11%2C0.14%2C0.2%2C0.29%2C0.29C1.61%2C2.5%2C1.83%2C2.59%2C2.12%2C2.69c0.37%2C0.12%2C0.57%2C0.18%2C0.59%2C0.19C3.36%2C3.1%2C3.81%2C3.35%2C4.05%2C3.63%20s0.37%2C0.67%2C0.37%2C1.18c0%2C0.31-0.06%2C0.58-0.18%2C0.82C4.12%2C5.87%2C3.95%2C6.06%2C3.74%2C6.2S3.29%2C6.44%2C3.03%2C6.51S2.48%2C6.62%2C2.18%2C6.62z%22%2F%3E%20%3Cpath%20class%3D%22st0%22%20d%3D%22M8.16%2C6.51H7.74c-0.32%2C0-0.59-0.02-0.8-0.06S6.55%2C6.33%2C6.39%2C6.22S6.11%2C5.94%2C6.04%2C5.73%20C5.97%2C5.51%2C5.93%2C5.24%2C5.93%2C4.9V2.67h-0.9V2.01h0.92v-1.1l0.95-0.29v1.38h1.23v0.66H6.91v2.29c0%2C0.18%2C0.02%2C0.33%2C0.05%2C0.43%20c0.03%2C0.1%2C0.1%2C0.18%2C0.2%2C0.24s0.23%2C0.1%2C0.37%2C0.11s0.35%2C0.02%2C0.63%2C0.02V6.51z%22%2F%3E%20%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E');
            }

            .icon-code-usr-fx {${iconBase}
                background-image: url('data:image/svg+xml;charset=utf8,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%228.6px%22%20height%3D%226.4px%22%20viewBox%3D%220%200%208.6%206.4%22%20style%3D%22enable-background%3Anew%200%200%208.6%206.4%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%20.st0%7Bfill%3A${urlHex(ui['col-frnt'])}%3B%7D%3C%2Fstyle%3E%3Cdefs%3E%3C%2Fdefs%3E%3Cg%3E%20%3Cg%3E%20%3Cpath%20class%3D%22st0%22%20d%3D%22M0%2C6.4V0h3.82v0.86H1.01v1.81h2.64v0.87H1.01V6.4H0z%22%2F%3E%20%3Cpath%20class%3D%22st0%22%20d%3D%22M4.25%2C6.4l1.63-2.21L4.34%2C1.89h1.08l1.02%2C1.54l1.12-1.54h1.02l-1.6%2C2.18L8.6%2C6.4H7.53L6.44%2C4.82L5.29%2C6.4%20H4.25z%22%2F%3E%20%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E');
            }

            .monaco-editor .suggestion-details,
            .monaco-editor .suggest-widget {
                font-family: "Fragment Mono", monospace;
                font-size: 14px;
                color: ${ui['col-frnt']};
                background-color: ${ui['col-bg']};
            }

            @media (max-width: 1080px) {
                .monaco-editor {
                    margin-top: 0px;
                    height: calc(100% - 35px);
                }
            }

            .monaco-editor .squiggly-error {
                background: url("data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%206%203'%20enable-background%3D'new%200%200%206%203'%20height%3D'3'%20width%3D'6'%3E%3Cg%20fill%3D'${urlHex(ui['col-error'])}'%3E%3Cpolygon%20points%3D'5.5%2C0%202.5%2C3%201.1%2C3%204.1%2C0'%2F%3E%3Cpolygon%20points%3D'4%2C0%206%2C2%206%2C0.6%205.4%2C0'%2F%3E%3Cpolygon%20points%3D'0%2C2%201%2C3%202.4%2C3%200%2C0.6'%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E") repeat-x bottom left !important;
            }

            .monaco-editor .marker-widget.error {
                border-left-color: ${ui['col-error']} !important;
            }

            .monaco-editor .monaco-editor-background .errorHighlight {
                background-color: ${ui['col-error']}33 !important;
                border: none !important;
            }

            .monaco-editor .editorOverviewRuler .errorForeground,
            .monaco-editor .decorationsOverviewRuler .errorOverviewRuler,
            .monaco-editor .decorationsOverviewRuler div[class*="errorForeground"],
            .monaco-editor .decorationsOverviewRuler .error,
            .monaco-editor-background .decorationsOverviewRuler .errorForeground,
            .monaco-scrollable-element .decorationsOverviewRuler .errorOverviewRuler {
                background-color: ${ui['col-error']} !important;
            }

            .error-panel {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
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
                color: ${ui['col-bg']};
                cursor: pointer;
                font-size: 15px;
                line-height: 1.1;
                font-weight: 700;
                text-align: left;
                background-color: ${ui['col-error']};
                border-radius: 0px;
                margin-bottom: 2px;
            }

            .error-line {
                margin-right: 5px;
                padding-left: 0px !important;
            }

            .error-line::before {
                background-image: url(data:image/svg+xml;charset=utf8,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%2216px%22%20height%3D%2216px%22%20viewBox%3D%220%200%2016%2016%22%20style%3D%22enable-background%3Anew%200%200%2016%2016%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%20.st0%7Bfill-rule%3Aevenodd%3Bclip-rule%3Aevenodd%3Bfill%3A${urlHex(ui['col-on-accent'])}%3B%7D%3C%2Fstyle%3E%3Cdefs%3E%3C%2Fdefs%3E%3Cpath%20class%3D%22st0%22%20d%3D%22M8%2C0C3.58%2C0%2C0%2C3.58%2C0%2C8c0%2C4.42%2C3.58%2C8%2C8%2C8c4.42%2C0%2C8-3.58%2C8-8C16%2C3.58%2C12.42%2C0%2C8%2C0z%20M11.42%2C10.04l-1.39%2C1.39%20L8%2C9.29l-2.04%2C2.14l-1.39-1.39L6.71%2C8L4.57%2C5.96l1.39-1.39L8%2C6.72l2.04-2.14l1.39%2C1.39L9.29%2C8L11.42%2C10.04z%22%2F%3E%3C%2Fsvg%3E) !important;
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
                margin-bottom: 2px;
            }

            .error-element {
                margin-right: 5px;
            }

            @font-face {
                font-family: 'codicon';
                src: url('./assets/codicon.ttf') format('truetype');
                font-weight: normal;
                font-style: normal;
            }

            .codicon[class*='codicon-'] {
                font-family: 'codicon' !important;
            }

            .monaco-editor .find-widget .button {
                background-position: center center;
                background-repeat: no-repeat;
                background-size: 16px;
            }

            .monaco-editor .scrollbar,
            .monaco-scrollable-element > .scrollbar.vertical,
            .monaco-scrollable-element > .scrollbar.vertical .slider-container,
            .monaco-scrollable-element > .scrollbar.horizontal,
            .monaco-scrollable-element > .scrollbar.horizontal .slider-container,
            .monaco-editor .margin {
                background-color: ${ui['col-bg']} !important;
            }

            .monaco-scrollable-element > .shadow {
                display: none !important;
            }

            .monaco-editor .view-line span {
                border-radius: 2px;
            }

            /* シェーダーの上に重ねて表示するときだけ、可読性のため文字に背景を敷く */
            .sb-text-bg .monaco-editor .view-lines > .view-line > span,
            .sb-text-bg .monaco-editor .minimap {
                background-color: ${palette.editor.textBg} !important;
            }
        `;

    const styleElement = document.createElement('style');
    styleElement.id = 'shaderboy-theme-style';
    styleElement.textContent = customCSS;
    document.head.appendChild(styleElement);
}

export default ShaderBoy.theme = {
    init() {
        if (SB_THEME === 'light') {
            defineLightTheme();
        } else {
            defineDarkThemes();
        }
        injectCustomCSS();
        return this;
    },

    applyTheme(editorInstance, { split }) {
        let themeName = 'shaderboy-light';
        if (SB_THEME !== 'light') {
            themeName = split ? 'shaderboy-color' : 'shaderboy-monotone';
        }
        editorInstance.getContainerDomNode().classList.toggle('sb-text-bg', !split);
        editorInstance.updateOptions({
            theme: themeName,
            fontFamily: "'Overpass Mono', monospace",
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: 0,
            renderFocusBorder: false,
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            folding: true,
            fixedOverflowWidgets: false,
            lineDecorationsWidth: 0,
            scrollBeyondLastLine: true,
            minimap: { enabled: true },
        });
        setTimeout(() => editorInstance.layout(), 50);
    }
};
