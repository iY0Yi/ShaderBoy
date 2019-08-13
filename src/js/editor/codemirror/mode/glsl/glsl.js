// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function (mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function (CodeMirror) {
    CodeMirror.defineMode("glsl", function (config, parserConfig) {
        var indentUnit = config.indentUnit,
            keywords = parserConfig.keywords || {},
            builtins = parserConfig.builtins || {},
            blockKeywords = parserConfig.blockKeywords || {},
            atoms = parserConfig.atoms || {},
            hooks = parserConfig.hooks || {},
            multiLineStrings = parserConfig.multiLineStrings;
        var isOperatorChar = /[+\-*&%=<>!?|\/]/;

        var curPunc;

        function tokenBase(stream, state) {
            var ch = stream.next();
            if (hooks[ch]) {
                var result = hooks[ch](stream, state);
                if (result !== false) return result;
            }
            if (ch == '"' || ch == "'") {
                state.tokenize = tokenString(ch);
                return state.tokenize(stream, state);
            }
            if (/[\[\]{}\(\),;\:\.]/.test(ch)) {
                curPunc = ch;
                return "bracket";
            }
            if (/\d/.test(ch)) {
                stream.eatWhile(/[\w\.]/);
                return "number";
            }
            if (ch == "/") {
                if (stream.eat("*")) {
                    state.tokenize = tokenComment;
                    return tokenComment(stream, state);
                }
                if (stream.eat("/")) {
                    stream.skipToEnd();
                    return "comment";
                }
            }
            if (isOperatorChar.test(ch)) {
                stream.eatWhile(isOperatorChar);
                return "operator";
            }
            stream.eatWhile(/[\w\$_]/);
            var cur = stream.current();
            if (keywords.propertyIsEnumerable(cur)) {
                if (blockKeywords.propertyIsEnumerable(cur)) curPunc = "newstatement";
                return "keyword";
            }
            if (builtins.propertyIsEnumerable(cur)) {
                return "builtin";
            }
            if (atoms.propertyIsEnumerable(cur)) return "atom";
            return "word";
        }

        function tokenString(quote) {
            return function (stream, state) {
                var escaped = false, next, end = false;
                while ((next = stream.next()) != null) {
                    if (next == quote && !escaped) { end = true; break; }
                    escaped = !escaped && next == "\\";
                }
                if (end || !(escaped || multiLineStrings))
                    state.tokenize = tokenBase;
                return "string";
            };
        }

        function tokenComment(stream, state) {
            var maybeEnd = false, ch;
            while (ch = stream.next()) {
                if (ch == "/" && maybeEnd) {
                    state.tokenize = tokenBase;
                    break;
                }
                maybeEnd = (ch == "*");
            }
            return "comment";
        }

        function Context(indented, column, type, align, prev) {
            this.indented = indented;
            this.column = column;
            this.type = type;
            this.align = align;
            this.prev = prev;
        }
        function pushContext(state, col, type) {
            return state.context = new Context(state.indented, col, type, null, state.context);
        }
        function popContext(state) {
            var t = state.context.type;
            if (t == ")" || t == "]" || t == "}")
                state.indented = state.context.indented;
            return state.context = state.context.prev;
        }

        // Interface

        return {
            startState: function (basecolumn) {
                return {
                    tokenize: null,
                    context: new Context((basecolumn || 0) - indentUnit, 0, "top", false),
                    indented: 0,
                    startOfLine: true
                };
            },

            token: function (stream, state) {
                var ctx = state.context;
                if (stream.sol()) {
                    if (ctx.align == null) ctx.align = false;
                    state.indented = stream.indentation();
                    state.startOfLine = true;
                }
                if (stream.eatSpace()) return null;
                curPunc = null;
                var style = (state.tokenize || tokenBase)(stream, state);
                if (style == "comment" || style == "meta") return style;
                if (ctx.align == null) ctx.align = true;

                if ((curPunc == ";" || curPunc == ":") && ctx.type == "statement") popContext(state);
                else if (curPunc == "{") pushContext(state, stream.column(), "}");
                else if (curPunc == "[") pushContext(state, stream.column(), "]");
                else if (curPunc == "(") pushContext(state, stream.column(), ")");
                else if (curPunc == "}") {
                    while (ctx.type == "statement") ctx = popContext(state);
                    if (ctx.type == "}") ctx = popContext(state);
                    while (ctx.type == "statement") ctx = popContext(state);
                }
                else if (curPunc == ctx.type) popContext(state);
                else if (ctx.type == "}" || ctx.type == "top" || (ctx.type == "statement" && curPunc == "newstatement"))
                    pushContext(state, stream.column(), "statement");
                state.startOfLine = false;
                return style;
            },

            indent: function (state, textAfter) {
                if (state.tokenize != tokenBase && state.tokenize != null) return 0;
                var firstChar = textAfter && textAfter.charAt(0), ctx = state.context, closing = firstChar == ctx.type;
                if (ctx.type == "statement") return ctx.indented + (firstChar == "{" ? 0 : indentUnit);
                else if (ctx.align) return ctx.column + (closing ? 0 : 1);
                else return ctx.indented + (closing ? 0 : indentUnit);
            },

            electricChars: "{}"
        };
    });

    (function () {
        function words(str) {
            var obj = {}, words = str.split(" ");
            for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
            return obj;
        }
        var glslKeywords = "float vec2 vec3 vec4 int ivec2 ivec3 ivec4 bool bvec2 bvec3 bvec4 mat2 mat3 mat4 " +
            "void sampler1D sampler2D sampler3D samplerCube sampler1DShadow sampler2DShadow " +
            "uniform attribute varying const in out inout const " +
            "#define #undef #if #ifdef #ifndef #else #elif #endif #error #pragma #line #version #extension " +
            "break continue do for while if else true false " +
            "lowp mediump highp precision invariant discard return " +
            "gl_Position gl_PointSize gl_ClipVertex gl_Vertex gl_Normal gl_Color " +
            "gl_SecondaryColor gl_MultiTexCoord0 gl_MultiTexCoord1 gl_MultiTexCoord2 " +
            "gl_MultiTexCoord3 gl_MultiTexCoord4 gl_MultiTexCoord5 gl_MultiTexCoord6 " +
            "gl_MultiTexCoord7 gl_FogCoord gl_FrontColor gl_BackColor " +
            "gl_FrontSecondaryColor gl_BackSecondaryColor gl_TexCoord gl_FogFragCoord " +
            "gl_FragColor gl_FragData gl_FragDepth gl_Color gl_SecondaryColor gl_FogFragCoord " +
            "gl_FragCoord gl_FrontFacing";

        var glslBuiltins = "sin cos tan asin acos atan atan radians degrees " +
            "pow exp log exp2 log2 sqrt inversesqrt abs ceil " +
            "clamp floor fract max min mix mod sign smoothstep " +
            "step ftransform cross distance dot faceforward " +
            "length normalize reflect refract dFdx dFdy fwidth " +
            "matrixCompMult all any equal greaterThan greaterThanEqual " +
            "lessThan lessThanEqual notEqual " +
            "texture1D texture1DProj texture1DProj " +
            "texture2D texture2DProj texture2DProj " +
            "texture3D texture3DProj " +
            "textureCube shadow1D shadow2D shadow1DProj shadow2DProj " +
            "texture1DLod texture1DProjLod texture1DProjLod " +
            "texture2DLod texture2DProjLod texture2DProjLod texture3DProjLod " +
            "textureCubeLod shadow1DLod shadow2DLod shadow1DProjLod shadow2DProjLod " +
            "gl_ModelViewMatrix gl_ModelViewProjectionMatrix gl_ProjectionMatrix " +
            "gl_TextureMatrix gl_ModelViewMatrixInverse gl_ModelViewProjectionMatrixInverse " +
            "gl_ProjectionMatrixInverse gl_TextureMatrixInverse gl_ModelViewMatrixTranspose " +
            "gl_ModelViewProjectionMatrixTranspose gl_ProjectionMatrixTranspose " +
            "gl_TextureMatrixTranspose gl_ModelViewMatrixInverseTranspose " +
            "gl_ModelViewProjectionMatrixInverseTranspose gl_ProjectionMatrixInverseTranspose " +
            "gl_TextureMatrixInverseTranspose gl_NormalMatrix gl_NormalScale ";

        function cppHook(stream, state) {
            if (!state.startOfLine) return false;
            stream.skipToEnd();
            return "meta";
        }

        // C#-style strings where "" escapes a quote.
        function tokenAtString(stream, state) {
            var next;
            while ((next = stream.next()) != null) {
                if (next == '"' && !stream.eat('"')) {
                    state.tokenize = null;
                    break;
                }
            }
            return "string";
        }

        CodeMirror.defineMIME("text/x-glsl", {
            name: "glsl",
            keywords: words(glslKeywords),
            builtins: words(glslBuiltins),
            blockKeywords: words("case do else for if switch while struct"),
            atoms: words("null"),
            hooks: { "#": cppHook }
        });
    })();
});
