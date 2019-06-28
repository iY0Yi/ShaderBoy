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

    function forEach(arr, f) {
        for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
    }

    function arrayContains(arr, item) {
        if (!Array.prototype.indexOf) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === item) {
                    return true;
                }
            }
            return false;
        }
        return arr.indexOf(item) != -1;
    }

    var glslTypes = ("float vec2 vec3 vec4 int ivec2 ivec3 ivec4 bool bvec2 bvec3 bvec4 mat2 mat3 mat4 " +
        "void sampler1D sampler2D sampler3D samplerCube sampler1DShadow sampler2DShadow").split(" ");

    var glslTypesQualifiers = ("uniform attribute varying const in out inout const").split(" ");
    var glslPreProcessor = ("#define #undef #if #ifdef #ifndef #else #elif #endif #error #pragma #line #version #extension").split(" ");

    var glslKeywords = ("break continue do for while if else true false " +
        "lowp mediump highp precision invariant discard return " +
        "gl_Position gl_PointSize gl_ClipVertex gl_Vertex gl_Normal gl_Color " +
        "gl_SecondaryColor gl_MultiTexCoord0 gl_MultiTexCoord1 gl_MultiTexCoord2 " +
        "gl_MultiTexCoord3 gl_MultiTexCoord4 gl_MultiTexCoord5 gl_MultiTexCoord6 " +
        "gl_MultiTexCoord7 gl_FogCoord gl_FrontColor gl_BackColor " +
        "gl_FrontSecondaryColor gl_BackSecondaryColor gl_TexCoord gl_FogFragCoord " +
        "gl_FragColor gl_FragData gl_FragDepth gl_Color gl_SecondaryColor gl_FogFragCoord " +
        "gl_FragCoord gl_FrontFacing").split(" ");

    var glslBuiltins = ("sin cos tan asin acos atan atan radians degrees " +
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
        "gl_TextureMatrixInverseTranspose gl_NormalMatrix gl_NormalScale ").split(" ");

    function scriptHint(editor, getToken, options) {
        // Find the token at the cursor
        var cur = editor.getCursor(), token = getToken(editor, cur), tprop = token;
        // If it's not a 'word-style' token, ignore the token.
        /*if (!/^[\w$_]*$/.test(token.string)) {
      token = tprop = {start: cur.ch, end: cur.ch, string: "", state: token.state,
                       type: token.string == "." ? "property" : null};
    }*/

        var variableNames = [];
        for (var line = 0; line < editor.lineCount() && line < editor.getCursor().line; line++) {
            var lineContent = editor.getLine(line);
            var containsType = false;
            var typeIndex;

            for (var i = 0, e = glslTypes.length; i < e; ++i) {
                typeIndex = lineContent.indexOf(glslTypes[i]);
                if (typeIndex != -1) {
                    containsType = true;
                    break;
                }
            }

            if (containsType) {
                var variableName = lineContent.substring(typeIndex);
                variableName = variableName.substring(variableName.search(/\s/));
                variableName = variableName.replace(/\s+/g, '');
                variableName = variableName.substring(0, variableName.search(/[^A-Za-z]/));
                if (variableName != "main")
                    variableNames.push(variableName);
            }

        }

        return {
            list: getCompletions(token, variableNames, options),
            from: { line: cur.line, ch: token.start },
            to: { line: cur.line, ch: token.end }
        };
    }

    CodeMirror.glslHint = function (editor, options) {
        return scriptHint(editor,
            function (e, cur) { return e.getTokenAt(cur); },
            options);
    };


    function getCompletions(token, variableNames, options) {
        var found = [], start = token.string;
        function maybeAdd(str) {
            if (str.indexOf(start) == 0 && !arrayContains(found, str)) found.push(str);
        }
        for (var i = 0; i < variableNames.length; i++) {
            maybeAdd(variableNames[i]);
        }

        forEach(glslTypes, maybeAdd);
        forEach(glslTypesQualifiers, maybeAdd);
        forEach(glslPreProcessor, maybeAdd);
        forEach(glslKeywords, maybeAdd);
        forEach(glslBuiltins, maybeAdd);

        return found;
    }
});
