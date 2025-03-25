import * as monaco from 'monaco-editor';
import ShaderBoy from '../../shaderboy';

export default ShaderBoy.syntax = {
    init() {
        // GLSL言語定義
        monaco.languages.register({ id: 'glsl' });

        // シンタックスハイライトルールの設定
        monaco.languages.setMonarchTokensProvider('glsl', {
            // トークン化ルール
            tokenizer: {
                root: [
                    // コメント
                    [/\/\/.*$/, 'comment'],
                    [/\/\*/, 'comment', '@comment'],

                    // プリプロセッサディレクティブ
                    [/#.*$/, 'preprocessor'],

                    // 文字列
                    [/"([^"\\]|\\.)*$/, 'string.invalid'],
                    [/"/, 'string', '@string'],

                    // 数値
                    [/[0-9]+\.[0-9]*([eE][-+]?[0-9]+)?/, 'number.float'],
                    [/\.[0-9]+([eE][-+]?[0-9]+)?/, 'number.float'],
                    [/[0-9]+[eE][-+]?[0-9]+/, 'number.float'],
                    [/0[xX][0-9a-fA-F]+/, 'number.hex'],
                    [/0[0-7]+/, 'number.octal'],
                    [/[0-9]+/, 'number'],

                    // 括弧類を明示的に定義（新規追加）
                    [/[\[\]]/, 'delimiter.square'],     // 角括弧
                    [/[{}]/, 'delimiter.curly'],        // 中括弧
                    [/[()]/, 'delimiter.parenthesis'],  // 丸括弧
                    [/[<>]/, 'delimiter.angle'],        // 山括弧
                    [/[;,]/, 'delimiter'],              // セミコロン、カンマ

                    // structキーワードとその後の識別子をハイライト
                    [/\b(struct)\b/, 'keyword.struct', '@struct_def'],

                    // 組み込み変数
                    [/\b(gl_\w+)\b/, 'variable.predefined'],

                    // 型
                    [/\b(void|bool|int|uint|float|double|vec[2-4]|dvec[2-4]|bvec[2-4]|ivec[2-4]|uvec[2-4]|mat[2-4]|mat[2-4]x[2-4]|dmat[2-4]|dmat[2-4]x[2-4]|sampler[1-3]D|image[1-3]D|samplerCube|imageCube|sampler[1-2]DShadow|sampler[1-2]DArray|image[1-2]DArray|samplerBuffer|imageBuffer|sampler2DRect|image2DRect|sampler[1-2]DArrayShadow|samplerCubeShadow|samplerCubeArray|imageCubeArray|samplerCubeArrayShadow|isampler[1-3]D|iimage[1-3]D|isamplerCube|iimageCube|isampler[1-2]DArray|iimage[1-2]DArray|isamplerBuffer|iimageBuffer|isampler2DRect|iimage2DRect|isamplerCubeArray|iimageCubeArray|usampler[1-3]D|uimage[1-3]D|usamplerCube|uimageCube|usampler[1-2]DArray|uimage[1-2]DArray|usamplerBuffer|uimageBuffer|usampler2DRect|uimage2DRect|usamplerCubeArray|uimageCubeArray|atomic_uint)\b/, 'keyword.type'],

                    // 関数定義（型の後にある識別子+括弧の形式）
                    [/\b([a-zA-Z_]\w*)\s*(?=\()/, {
                        cases: {
                            // 組み込み関数はすでに別の定義で処理されるので、それ以外をユーザー定義関数として扱う
                            '@builtinFunctions': 'keyword.function',
                            '@default': 'user.function'
                        }
                    }],

                    // 制御フロー
                    [/\b(break|case|continue|default|discard|do|else|for|if|return|switch|while)\b/, 'keyword.control'],

                    // 修飾子
                    [/\b(attribute|const|uniform|varying|buffer|shared|coherent|volatile|restrict|readonly|writeonly|layout|centroid|flat|smooth|noperspective|patch|sample|subroutine|in|out|inout|invariant|precise|lowp|mediump|highp)\b/, 'keyword.storage'],

                    // 予約語
                    [/\b(asm|class|union|enum|typedef|template|this|packed|goto|inline|noinline|volatile|public|static|extern|external|interface|long|short|half|fixed|unsigned|superp|input|output|hvec[2-4]|fvec[2-4]|sampler3DRect|filter|sizeof|cast|namespace|using)\b/, 'keyword.reserved'],

                    // 組み込み関数
                    [/\b(abs|acos|acosh|all|any|asin|asinh|atan|atanh|atomicAdd|atomicAnd|atomicCompSwap|atomicCounter|atomicCounterDecrement|atomicCounterIncrement|atomicExchange|atomicMax|atomicMin|atomicOr|atomicXor|barrier|bitCount|bitfieldExtract|bitfieldInsert|bitfieldReverse|ceil|clamp|cos|cosh|cross|degrees|determinant|dFdx|dFdy|dFdxCoarse|dFdyCoarse|dFdxFine|dFdyFine|distance|dot|EmitStreamVertex|EmitVertex|EndPrimitive|EndStreamPrimitive|equal|exp|exp2|faceforward|findLSB|findMSB|floatBitsToInt|floatBitsToUint|floor|fma|fract|frexp|ftransform|fwidth|fwidthCoarse|fwidthFine|greaterThan|greaterThanEqual|imageAtomicAdd|imageAtomicAnd|imageAtomicCompSwap|imageAtomicExchange|imageAtomicMax|imageAtomicMin|imageAtomicOr|imageAtomicXor|imageLoad|imageSize|imageStore|imulExtended|intBitsToFloat|interpolateAtCentroid|interpolateAtOffset|interpolateAtSample|inverse|inversesqrt|isinf|isnan|ldexp|length|lessThan|lessThanEqual|log|log2|matrixCompMult|max|memoryBarrier|memoryBarrierAtomicCounter|memoryBarrierBuffer|memoryBarrierImage|memoryBarrierShared|min|mix|mod|modf|noise|noise[1-4]|normalize|not|notEqual|outerProduct|packDouble2x32|packHalf2x16|packSnorm2x16|packSnorm4x8|packUnorm2x16|packUnorm4x8|pow|radians|reflect|refract|round|roundEven|sign|sin|sinh|smoothstep|sqrt|step|tan|tanh|texelFetch|texelFetchOffset|texture|textureGather|textureGatherOffset|textureGatherOffsets|textureGrad|textureGradOffset|textureLod|textureLodOffset|textureOffset|textureProj|textureProjGrad|textureProjGradOffset|textureProjLod|textureProjLodOffset|textureProjOffset|textureQueryLevels|textureQueryLod|textureSize|transpose|trunc|uaddCarry|uintBitsToFloat|umulExtended|unpackDouble2x32|unpackHalf2x16|unpackSnorm2x16|unpackSnorm4x8|unpackUnorm2x16|unpackUnorm4x8|usubBorrow)\b/, 'keyword.function'],

                    // 定数
                    [/\b(true|false)\b/, 'constant.language.boolean'],

                    // 演算子
                    [/[+\-*/=<>!~^|&%]+/, 'operator'],

                    // 識別子
                    [/[a-zA-Z_]\w*/, 'identifier'],
                ],

                // structキーワードの後のトークンを処理
                struct_def: [
                    [/\s+/, 'white'],
                    [/([a-zA-Z_]\w*)/, 'struct.name', '@pop'],
                    [/./, 'text', '@pop'] // 何か別のものがあれば終了
                ],

                comment: [
                    [/[^/*]+/, 'comment'],
                    [/\/\*/, 'comment', '@push'], // 入れ子コメント
                    [/\*\//, 'comment', '@pop'],
                    [/[/*]/, 'comment']
                ],

                string: [
                    [/[^\\"]+/, 'string'],
                    [/\\./, 'string.escape'],
                    [/"/, 'string', '@pop']
                ],
            },

            // 組み込み関数のリスト（チェック用）
            builtinFunctions: [
                'abs', 'acos', 'acosh', 'all', 'any', 'asin', 'asinh', 'atan', 'atanh',
                'atomicAdd', 'atomicAnd', 'atomicCompSwap', 'atomicCounter', 'atomicCounterDecrement',
                'atomicCounterIncrement', 'atomicExchange', 'atomicMax', 'atomicMin', 'atomicOr',
                'atomicXor', 'barrier', 'bitCount', 'bitfieldExtract', 'bitfieldInsert',
                'bitfieldReverse', 'ceil', 'clamp', 'cos', 'cosh', 'cross', 'degrees', 'determinant',
                'dFdx', 'dFdy', 'dFdxCoarse', 'dFdyCoarse', 'dFdxFine', 'dFdyFine', 'distance', 'dot',
                'EmitStreamVertex', 'EmitVertex', 'EndPrimitive', 'EndStreamPrimitive', 'equal', 'exp',
                'exp2', 'faceforward', 'findLSB', 'findMSB', 'floatBitsToInt', 'floatBitsToUint',
                'floor', 'fma', 'fract', 'frexp', 'ftransform', 'fwidth', 'fwidthCoarse', 'fwidthFine',
                'greaterThan', 'greaterThanEqual', 'imageAtomicAdd', 'imageAtomicAnd', 'imageAtomicCompSwap',
                'imageAtomicExchange', 'imageAtomicMax', 'imageAtomicMin', 'imageAtomicOr',
                'imageAtomicXor', 'imageLoad', 'imageSize', 'imageStore', 'imulExtended',
                'intBitsToFloat', 'interpolateAtCentroid', 'interpolateAtOffset', 'interpolateAtSample',
                'inverse', 'inversesqrt', 'isinf', 'isnan', 'ldexp', 'length', 'lessThan',
                'lessThanEqual', 'log', 'log2', 'matrixCompMult', 'max', 'memoryBarrier',
                'memoryBarrierAtomicCounter', 'memoryBarrierBuffer', 'memoryBarrierImage',
                'memoryBarrierShared', 'min', 'mix', 'mod', 'modf', 'noise', 'noise1', 'noise2',
                'noise3', 'noise4', 'normalize', 'not', 'notEqual', 'outerProduct', 'packDouble2x32',
                'packHalf2x16', 'packSnorm2x16', 'packSnorm4x8', 'packUnorm2x16', 'packUnorm4x8',
                'pow', 'radians', 'reflect', 'refract', 'round', 'roundEven', 'sign', 'sin', 'sinh',
                'smoothstep', 'sqrt', 'step', 'tan', 'tanh', 'texelFetch', 'texelFetchOffset',
                'texture', 'textureGather', 'textureGatherOffset', 'textureGatherOffsets',
                'textureGrad', 'textureGradOffset', 'textureLod', 'textureLodOffset',
                'textureOffset', 'textureProj', 'textureProjGrad', 'textureProjGradOffset',
                'textureProjLod', 'textureProjLodOffset', 'textureProjOffset', 'textureQueryLevels',
                'textureQueryLod', 'textureSize', 'transpose', 'trunc', 'uaddCarry',
                'uintBitsToFloat', 'umulExtended', 'unpackDouble2x32', 'unpackHalf2x16',
                'unpackSnorm2x16', 'unpackSnorm4x8', 'unpackUnorm2x16', 'unpackUnorm4x8', 'usubBorrow'
            ]
        });

        // カラーテーマの設定
        monaco.editor.defineTheme('glsl-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '608B4E', fontStyle: 'italic' },
                { token: 'preprocessor', foreground: 'BD63C5' },
                { token: 'keyword.type', foreground: '569CD6' },
                { token: 'keyword.control', foreground: 'C586C0' },
                { token: 'keyword.storage', foreground: '4EC9B0' },
                { token: 'keyword.function', foreground: 'DCDCAA' },
                { token: 'constant.language.boolean', foreground: '569CD6' },
                { token: 'variable.predefined', foreground: '9CDCFE' },
                { token: 'number', foreground: 'B5CEA8' },
                { token: 'number.float', foreground: 'B5CEA8' },
                { token: 'number.hex', foreground: 'B5CEA8' },
                { token: 'number.octal', foreground: 'B5CEA8' },
                { token: 'string', foreground: 'CE9178' },
                { token: 'string.escape', foreground: 'D7BA7D' },
                { token: 'operator', foreground: 'D4D4D4' },
                // ユーザー定義関数のハイライト
                { token: 'user.function', foreground: '4EC9B0', fontStyle: 'bold' },
                // struct名のハイライト
                { token: 'struct.name', foreground: '4EC9B0', fontStyle: 'bold' },
                { token: 'keyword.struct', foreground: 'C586C0' },
            ],
            colors: {
                'editor.foreground': '#D4D4D4',
                'editor.background': '#1E1E1E',
                'editor.selectionBackground': '#264F78',
                'editor.lineHighlightBackground': '#2D2D30',
                'editorCursor.foreground': '#AEAFAD',
                'editorWhitespace.foreground': '#3B3B3B'
            }
        });

        // コード補完機能のセットアップ
        monaco.languages.setLanguageConfiguration('glsl', {
            comments: {
                lineComment: '//',
                blockComment: ['/*', '*/']
            },
            brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')']
            ],
            autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
            ],
            surroundingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
            ]
        });

        return this;
    }
};