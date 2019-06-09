import KeywordDictionary from './keyword_dictionary'
import Keyword from './keyword'

// Builtin lists
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const gl_Types = ("float vec2 vec3 vec4 int ivec2 ivec3 ivec4 bool bvec2 bvec3 bvec4 mat2 mat3 mat4 void").split(" ")
const gl_Keywords = ("break continue do for while if else true false lowp mediump highp precision discard return").split(" ")
const gl_TypesQualifiers = ("in out inout const").split(" ")
const gl_PreProcessor = ("#define #undef #if #ifdef #ifndef #else #elif #endif").split(" ")
const gl_Builtins = ("sin cos tan asin acos atan atan radians degrees pow exp log exp2 log2 sqrt inversesqrt abs ceil clamp floor fract max min mix mod sign smoothstep step ftransform cross distance dot faceforward length normalize reflect refract dFdx dFdy fwidth matrixCompMult all any equal greaterThan greaterThanEqual lessThan lessThanEqual notEqual texelFetch texture textureLod").split(" ")
const st_Uniforms = ("iResolution iTime iTimeDelta iFrame iFrameRate iDate iMouse iChannel0 iChannel1 iChannel2 iChannel3 iSampleRate").split(" ")
const st_Variables = ("fragColor fragCoord").split(" ")
const st_Exclusions = ("mainImage mainSound mainCubemap mainVR").split(" ")
const gl_Types_and_define = gl_Types.concat(); // For detecting "#define" as type.
gl_Types_and_define.push('#define')
const allTypes = gl_Types_and_define.concat()

let Builtins = {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    init()
    {
        console.log('started: Builtins.init...')
        this.dictionary = new KeywordDictionary('Builtins')
        const registerBltins = (list, type, categoryId) =>
        {
            for (const item of list)
            {
                this.dictionary.add(
                    new Keyword(
                        {
                            type: 'fixed',
                            name: item,
                            render: '<span class="autocomp-name">' + item + '</span><div class="icon-code-' + categoryId + '"></div><span class="autocomp-type">' + type + '</span>'
                        }),
                )
            }
        }
        registerBltins(gl_Types, 'types', 'gl')
        registerBltins(gl_Keywords, 'keywords', 'gl')
        registerBltins(gl_TypesQualifiers, 'type qualifier', 'gl')
        registerBltins(gl_PreProcessor, 'pre processor', 'gl')
        registerBltins(gl_Builtins, 'builtin', 'gl')
        registerBltins(st_Uniforms, 'uniform', 'st')
        registerBltins(st_Variables, 'variable', 'st')
    },

    // Check if the word is a type.
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    isType(str)
    {
        for (const type of allTypes)
        {
            if (str === type) return true
        }
        return false
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    isExclusionWord(name)
    {
        for (const exclusions of st_Exclusions)
        {
            if (name === exclusions) return true
        }
        return false
    }
}

export default Builtins;