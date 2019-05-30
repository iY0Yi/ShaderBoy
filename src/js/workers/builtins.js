import KeywordDictionary from './keyword_dictionary';
import Keyword from './keyword';

// Builtin lists
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
let shadertoyTypes = ("float vec2 vec3 vec4 int ivec2 ivec3 ivec4 bool bvec2 bvec3 bvec4 mat2 mat3 mat4 void").split(" ");
let shadertoyTypes_and_define = shadertoyTypes.concat(); // For detecting "#define" as type.
shadertoyTypes_and_define.push('#define');
let allTypes = shadertoyTypes_and_define.concat();
let shadertoyUniforms = ("iResolution iTime iTimeDelta iFrame iFrameRate iDate iMouse iChannel0 iChannel1 iChannel2 iChannel3 iSampleRate").split(" ");
let shadertoyVariables = ("fragColor fragCoord").split(" ");
let shadertoyKeywords = ("break continue do for while if else true false lowp mediump highp precision discard return").split(" ");
let shadertoyTypesQualifiers = ("in out inout const").split(" ");
let shadertoyPreProcessor = ("#define #undef #if #ifdef #ifndef #else #elif #endif").split(" ");
let shadertoyBuiltins = ("sin cos tan asin acos atan atan radians degrees " +
    "pow exp log exp2 log2 sqrt inversesqrt abs ceil " +
    "clamp floor fract max min mix mod sign smoothstep " +
    "step ftransform cross distance dot faceforward " +
    "length normalize reflect refract dFdx dFdy fwidth " +
    "matrixCompMult all any equal greaterThan greaterThanEqual " +
    "lessThan lessThanEqual notEqual texelFetch texture textureLod").split(" ");

let Builtins;
export default Builtins = {

    init()
    {
        console.log('started: Builtins.init...');
        this.dictionary = new KeywordDictionary('Builtins');
        let registerBltins = (list, type, categoryId) =>
        {
            for (let i = 0; i < list.length; i++)
            {
                this.dictionary.add(
                    new Keyword(
                        {
                            type: 'fixed',
                            name: list[i],
                            render: '<span class="autocomp-name">' + list[i] + '</span><div class="icon-code-' + categoryId + '"></div><span class="autocomp-type">' + type + '</span>'
                        }),
                );
            };
        }
        registerBltins(shadertoyTypes, 'types', 'gl');
        registerBltins(shadertoyKeywords, 'keywords', 'gl');
        registerBltins(shadertoyTypesQualifiers, 'type qualifier', 'gl');
        registerBltins(shadertoyPreProcessor, 'pre processor', 'gl');
        registerBltins(shadertoyBuiltins, 'builtin', 'gl');
        registerBltins(shadertoyUniforms, 'uniform', 'st');
        registerBltins(shadertoyVariables, 'variable', 'st');
    },

    // Check if the word is a type.
    isType(str)
    {
        for (let i = 0; i < allTypes.length; i++)
        {
            if (str === allTypes[i]) return true;
        }
        return false;
    }
};