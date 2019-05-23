export let shadertoyTypes = ("float vec2 vec3 vec4 int ivec2 ivec3 ivec4 bool bvec2 bvec3 bvec4 mat2 mat3 mat4 void").split(" ");
export let shadertoyTypes_and_define = shadertoyTypes.concat(); // For detecting "#define" as type.
shadertoyTypes_and_define.push('#define');
export let allTypes = shadertoyTypes_and_define.concat();
export let shadertoyUniforms = ("iResolution iTime iTimeDelta iFrame iFrameRate iDate iMouse iChannel0 iChannel1 iChannel2 iChannel3 iSampleRate").split(" ");
export let shadertoyVariables = ("fragColor fragCoord").split(" ");
export let shadertoyKeywords = ("break continue do for while if else true false lowp mediump highp precision discard return").split(" ");
export let shadertoyTypesQualifiers = ("in out inout const").split(" ");
export let shadertoyPreProcessor = ("#define #undef #if #ifdef #ifndef #else #elif #endif").split(" ");
export let shadertoyBuiltins = ("sin cos tan asin acos atan atan radians degrees pow exp log exp2 log2 sqrt inversesqrt abs ceil clamp floor fract max min mix mod sign smoothstep step ftransform cross distance dot faceforward length normalize reflect refract dFdx dFdy fwidth matrixCompMult all any equal greaterThan greaterThanEqual lessThan lessThanEqual notEqual texelFetch texture textureLod").split(" ");