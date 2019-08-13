const builtins_es300 = [
	{
		name: 'abs',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">abs</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'abs(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/abs.xhtml'
	},
	{
		name: 'acos',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">acos</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'acos(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/acos.xhtml'
	},
	{
		name: 'acosh',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">acosh</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'acosh(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/acosh.xhtml'
	},
	{
		name: 'all',
		type: 'builtin',
		args: [{ type: 'bvec', name: 'x' }],
		render: `<span class="autocomp-name">all</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'all(x@bvec)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/all.xhtml'
	},
	{
		name: 'any',
		type: 'builtin',
		args: [{ type: 'bvec', name: 'x' }],
		render: `<span class="autocomp-name">any</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'any(x@bvec)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/any.xhtml'
	},
	{
		name: 'asin',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">asin</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'asin(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/asin.xhtml'
	},
	{
		name: 'asinh',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">asinh</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'asinh(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/asinh.xhtml'
	},
	{
		name: 'atan',
		type: 'builtin',
		args: [{ type: 'genType', name: 'y' }, { type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">atan</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'atan(y@genType, x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/atan.xhtml'
	},
	{
		name: 'atanh',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">atanh</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'atanh(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/atanh.xhtml'
	},
	{
		name: 'ceil',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">ceil</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'ceil(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/ceil.xhtml'
	},
	{
		name: 'clamp',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }, { type: 'genType', name: 'minVal' }, { type: 'genType', name: 'maxVal' }],
		render: `<span class="autocomp-name">clamp</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'clamp(x@genType, minVal@genType, maxVal@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/clamp.xhtml'
	},
	{
		name: 'cos',
		type: 'builtin',
		args: [{ type: 'genType', name: 'angle' }],
		render: `<span class="autocomp-name">cos</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'cos(angle@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/cos.xhtml'
	},
	{
		name: 'cosh',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">cosh</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'cosh(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/cosh.xhtml'
	},
	{
		name: 'cross',
		type: 'builtin',
		args: [{ type: 'vec3', name: 'x' }, { type: 'vec3', name: 'y' }],
		render: `<span class="autocomp-name">cross</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'cross(x@vec3, y@vec3)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/cross.xhtml'
	},
	{
		name: 'degrees',
		type: 'builtin',
		args: [{ type: 'genType', name: 'radians' }],
		render: `<span class="autocomp-name">degrees</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'degrees(radians@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/degrees.xhtml'
	},
	{
		name: 'determinant',
		type: 'builtin',
		args: [{ type: 'matX', name: 'm' }],
		render: `<span class="autocomp-name">determinant</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'determinant(m@matX)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/determinant.xhtml'
	},
	{
		name: 'dFdx',
		type: 'builtin',
		args: [{ type: 'genType', name: 'p' }],
		render: `<span class="autocomp-name">dFdx</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'dFdx(p@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/dFdx.xhtml'
	},
	{
		name: 'dFdy',
		type: 'builtin',
		args: [{ type: 'genType', name: 'p' }],
		render: `<span class="autocomp-name">dFdy</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'dFdy(p@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/dFdx.xhtml'
	},
	{
		name: 'distance',
		type: 'builtin',
		args: [{ type: 'genType', name: 'p0' }, { type: 'genType', name: 'p1' }],
		render: `<span class="autocomp-name">distance</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'distance(p0@genType, p1@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/distance.xhtml'
	},
	{
		name: 'dot',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }, { type: 'genType', name: 'y' }],
		render: `<span class="autocomp-name">dot</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'dot(x@genType, y@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/dot.xhtml'
	},
	{
		name: 'equal',
		type: 'builtin',
		args: [{ type: 'vec', name: 'x' }, { type: 'vec', name: 'y' }],
		render: `<span class="autocomp-name">equal</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'equal(x@vec, y@vec)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/equal.xhtml'
	},
	{
		name: 'exp',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">exp</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'exp(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/exp.xhtml'
	},
	{
		name: 'exp2',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">exp2</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'exp2(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/exp2.xhtml'
	},
	{
		name: 'faceforward',
		type: 'builtin',
		args: [{ type: 'genType', name: 'N' }, { type: 'genType', name: 'I' }, { type: 'genType', name: 'Nref' }],
		render: `<span class="autocomp-name">faceforward</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'faceforward(N@genType, I@genType, Nref@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/faceforward.xhtml'
	},
	{
		name: 'floatBitsToInt',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">floatBitsToInt</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'floatBitsToInt(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/floatBitsToInt.xhtml'
	},
	{
		name: 'floatBitsToUint',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">floatBitsToUint</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'floatBitsToUint(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/floatBitsToInt.xhtml'
	},
	{
		name: 'floor',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">floor</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'floor(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/floor.xhtml'
	},
	{
		name: 'fract',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">fract</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'fract(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/fract.xhtml'
	},
	{
		name: 'fwidth',
		type: 'builtin',
		args: [{ type: 'genType', name: 'p' }],
		render: `<span class="autocomp-name">fwidth</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'fwidth(p@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/fwidth.xhtml'
	},
	{
		name: 'greaterThan',
		type: 'builtin',
		args: [{ type: 'vec', name: 'x' }, { type: 'vec', name: 'y' }],
		render: `<span class="autocomp-name">greaterThan</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'greaterThan(x@vec, y@vec)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/greaterThan.xhtml'
	},
	{
		name: 'greaterThanEqual',
		type: 'builtin',
		args: [{ type: 'vec', name: 'x' }, { type: 'vec', name: 'y' }],
		render: `<span class="autocomp-name">greaterThanEqual</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'greaterThanEqual(x@vec, y@vec)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/greaterThanEqual.xhtml'
	},
	{
		name: 'intBitsToFloat',
		type: 'builtin',
		args: [{ type: 'genIType', name: 'x' }],
		render: `<span class="autocomp-name">intBitsToFloat</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'intBitsToFloat(x@genIType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/intBitsToFloat.xhtml'
	},
	{
		name: 'uintBitsToFloat',
		type: 'builtin',
		args: [{ type: 'genUType', name: 'x' }],
		render: `<span class="autocomp-name">uintBitsToFloat</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'uintBitsToFloat(x@genUType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/intBitsToFloat.xhtml'
	},
	{
		name: 'inverse',
		type: 'builtin',
		args: [{ type: 'matX', name: 'm' }],
		render: `<span class="autocomp-name">inverse</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'inverse(m@matX)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/inverse.xhtml'
	},
	{
		name: 'inversesqrt',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">inversesqrt</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'inversesqrt(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/inversesqrt.xhtml'
	},
	{
		name: 'isinf',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">isinf</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'isinf(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/isinf.xhtml'
	},
	{
		name: 'isnan',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">isnan</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'isnan(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/isnan.xhtml'
	},
	{
		name: 'length',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">length</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'length(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/length.xhtml'
	},
	{
		name: 'lessThan',
		type: 'builtin',
		args: [{ type: 'vec', name: 'x' }, { type: 'vec', name: 'y' }],
		render: `<span class="autocomp-name">lessThan</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'lessThan(x@vec, y@vec)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/lessThan.xhtml'
	},
	{
		name: 'lessThanEqual',
		type: 'builtin',
		args: [{ type: 'vec', name: 'x' }, { type: 'vec', name: 'y' }],
		render: `<span class="autocomp-name">lessThanEqual</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'lessThanEqual(x@vec, y@vec)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/lessThanEqual.xhtml'
	},
	{
		name: 'lessThanEqual',
		type: 'builtin',
		args: [{ type: 'vec', name: 'x' }, { type: 'vec', name: 'y' }],
		render: `<span class="autocomp-name">lessThanEqual</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'lessThanEqual(x@vec, y@vec)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/lessThanEqual.xhtml'
	},
	{
		name: 'log',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">log</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'log(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/log.xhtml'
	},
	{
		name: 'log2',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">log2</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'log2(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/log2.xhtml'
	},
	{
		name: 'max',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }, { type: 'genType', name: 'y' }],
		render: `<span class="autocomp-name">max</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'max(x@genType, y@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/max.xhtml'
	},
	{
		name: 'min',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }, { type: 'genType', name: 'y' }],
		render: `<span class="autocomp-name">min</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'min(x@genType, y@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/min.xhtml'
	},
	{
		name: 'mix',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }, { type: 'genType', name: 'y' }, { type: 'genType', name: 'a' }],
		render: `<span class="autocomp-name">mix</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'mix(x@genType, y@genType, a@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/mix.xhtml'
	},
	{
		name: 'mod',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }, { type: 'float', name: 'y' }],
		render: `<span class="autocomp-name">mod</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'mod(x@genType, y@float)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/mod.xhtml'
	},
	{
		name: 'modf',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }, { type: 'genType', name: 'i' }],
		render: `<span class="autocomp-name">modf</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'modf(x@genType, out_i@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/modf.xhtml'
	},
	{
		name: 'normalize',
		type: 'builtin',
		args: [{ type: 'genType', name: 'v' }],
		render: `<span class="autocomp-name">normalize</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'normalize(v@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/normalize.xhtml'
	},
	{
		name: 'not',
		type: 'builtin',
		args: [{ type: 'bvec', name: 'x' }],
		render: `<span class="autocomp-name">not</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'not(x@bvec)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/not.xhtml'
	},
	{
		name: 'notEqual',
		type: 'builtin',
		args: [{ type: 'vec', name: 'x' }, { type: 'vec', name: 'y' }],
		render: `<span class="autocomp-name">notEqual</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'notEqual(x@vec, y@vec)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/notEqual.xhtml'
	},
	{
		name: 'outerProduct',
		type: 'builtin',
		args: [{ type: 'vec2', name: 'c' }, { type: 'vec2', name: 'r' }],
		render: `<span class="autocomp-name">outerProduct</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'outerProduct(c@vec2, r@vec2)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/outerProduct.xhtml'
	},
	{
		name: 'packHalf2x16',
		type: 'builtin',
		args: [{ type: 'vec2', name: 'v' }],
		render: `<span class="autocomp-name">packHalf2x16</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'packHalf2x16(v@vec2)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/packHalf2x16.xhtml'
	},
	{
		name: 'packUnorm2x16',
		type: 'builtin',
		args: [{ type: 'vec2', name: 'v' }],
		render: `<span class="autocomp-name">packUnorm2x16</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'packUnorm2x16(v@vec2)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/packUnorm.xhtml'
	},
	{
		name: 'packSnorm2x16',
		type: 'builtin',
		args: [{ type: 'vec2', name: 'v' }],
		render: `<span class="autocomp-name">packSnorm2x16</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'packSnorm2x16(v@vec2)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/packUnorm.xhtml'
	},
	{
		name: 'pow',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }, { type: 'genType', name: 'y' }],
		render: `<span class="autocomp-name">pow</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'pow(x@genType, y@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/pow.xhtml'
	},
	{
		name: 'radians',
		type: 'builtin',
		args: [{ type: 'genType', name: 'degrees' }],
		render: `<span class="autocomp-name">radians</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'radians(degrees@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/radians.xhtml'
	},
	{
		name: 'reflect',
		type: 'builtin',
		args: [{ type: 'genType', name: 'I' }, { type: 'genType', name: 'N' }],
		render: `<span class="autocomp-name">reflect</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'reflect(I@genType, N@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/reflect.xhtml'
	},
	{
		name: 'refract',
		type: 'builtin',
		args: [{ type: 'genType', name: 'I' }, { type: 'genType', name: 'N' }, { type: 'float', name: 'eta' }],
		render: `<span class="autocomp-name">refract</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'refract(I@genType, N@genType, eta@float)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/refract.xhtml'
	},
	{
		name: 'round',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">round</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'round(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/round.xhtml'
	},
	{
		name: 'roundEven',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">roundEven</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'roundEven(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/roundEven.xhtml'
	},
	{
		name: 'sign',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">sign</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'sign(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/sign.xhtml'
	},
	{
		name: 'sin',
		type: 'builtin',
		args: [{ type: 'genType', name: 'angle' }],
		render: `<span class="autocomp-name">sin</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'sin(angle@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/sin.xhtml'
	},
	{
		name: 'sinh',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">sinh</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'sinh(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/sinh.xhtml'
	},
	{
		name: 'smoothstep',
		type: 'builtin',
		args: [{ type: 'genType', name: 'edge0' }, { type: 'genType', name: 'edge1' }, { type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">smoothstep</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'smoothstep(edge0@genType, edge1@genType, x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/smoothstep.xhtml'
	},
	{
		name: 'sqrt',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">sqrt</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'sqrt(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/sqrt.xhtml'
	},
	{
		name: 'step',
		type: 'builtin',
		args: [{ type: 'genType', name: 'edge' }, { type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">step</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'step(edge@genType, x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/step.xhtml'
	},
	{
		name: 'tan',
		type: 'builtin',
		args: [{ type: 'genType', name: 'angle' }],
		render: `<span class="autocomp-name">tan</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'tan(angle@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/tan.xhtml'
	},
	{
		name: 'tanh',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">tanh</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'tanh(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/tanh.xhtml'
	},
	{
		name: 'texelFetch',
		type: 'builtin',
		args: [{ type: 'gsampler2D', name: 'sampler' }, { type: 'ivec2', name: 'P' }, { type: 'int', name: 'lod' }],
		render: `<span class="autocomp-name">texelFetch</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'texelFetch(sampler@gsampler2D, P@ivec2, lod@int)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/texelFetch.xhtml'
	},
	{
		name: 'texelFetchOffset',
		type: 'builtin',
		args: [{ type: 'gsampler2D', name: 'sampler' }, { type: 'ivec2', name: 'P' }, { type: 'int', name: 'lod' }, { type: 'ivec2', name: 'offset' }],
		render: `<span class="autocomp-name">texelFetchOffset</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'texelFetchOffset(sampler@gsampler2D, P@ivec2, lod@int, offset@ivec2)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/texelFetchOffset.xhtml'
	},
	{
		name: 'texture',
		type: 'builtin',
		args: [{ type: 'gsampler2D', name: 'sampler' }, { type: 'vec2', name: 'P' }, { type: 'float', name: 'bias' }],
		render: `<span class="autocomp-name">texture</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'texture(sampler@gsampler2D, P@vec2, bias@float_array)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/texture.xhtml'
	},
	{
		name: 'textureGrad',
		type: 'builtin',
		args: [{ type: 'gsampler2D', name: 'sampler' }, { type: 'vec2', name: 'P' }, { type: 'vec2', name: 'dPdx' }, { type: 'vec2', name: 'dPdy' }],
		render: `<span class="autocomp-name">textureGrad</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'textureGrad(sampler@gsampler2D, P@vec2, dPdx@vec2, dPdy@vec2)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/textureGrad.xhtml'
	},
	{
		name: 'textureGradOffset',
		type: 'builtin',
		args: [{ type: 'gsampler2D', name: 'sampler' }, { type: 'vec2', name: 'P' }, { type: 'vec2', name: 'dPdx' }, { type: 'vec2', name: 'dPdy' }, { type: 'ivec2', name: 'offset' }],
		render: `<span class="autocomp-name">textureGradOffset</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'textureGradOffset(sampler@gsampler2D, P@vec2, dPdx@vec2, dPdy@vec2, ioffset@vec2)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/textureGradOffset.xhtml'
	},
	{
		name: 'textureLod',
		type: 'builtin',
		args: [{ type: 'gsampler2D', name: 'sampler' }, { type: 'vec2', name: 'P' }, { type: 'float', name: 'lod' }],
		render: `<span class="autocomp-name">textureLod</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'textureLod(sampler@gsampler2D, P@vec2, lod@float)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/textureLod.xhtml'
	},
	{
		name: 'textureLodOffset',
		type: 'builtin',
		args: [{ type: 'gsampler2D', name: 'sampler' }, { type: 'vec2', name: 'P' }, { type: 'float', name: 'lod' }, { type: 'ivec2', name: 'offset' }],
		render: `<span class="autocomp-name">textureLodOffset</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'textureLodOffset(sampler@gsampler2D, P@vec2, lod@float, offset@ivec2)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/textureLodOffset.xhtml'
	},
	{
		name: 'textureOffset',
		type: 'builtin',
		args: [{ type: 'gsampler2D', name: 'sampler' }, { type: 'vec2', name: 'P' }, { type: 'ivec2', name: 'offset' }, { type: 'float', name: 'bias' }],
		render: `<span class="autocomp-name">textureOffset</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'textureOffset(sampler@gsampler2D, P@vec2, offset@ivec2, bias@float_array)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/textureOffset.xhtml'
	},
	{
		name: 'textureProj',
		type: 'builtin',
		args: [{ type: 'gsampler2D', name: 'sampler' }, { type: 'vec3', name: 'P' }, { type: 'float', name: 'bias' }],
		render: `<span class="autocomp-name">textureProj</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'textureProj(sampler@gsampler2D, P@vec3, bias@float_array)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/textureProj.xhtml'
	},
	{
		name: 'textureProjGrad',
		type: 'builtin',
		args: [{ type: 'gsampler2D', name: 'sampler' }, { type: 'vec3', name: 'P' }, { type: 'vec2', name: 'dPdx' }, { type: 'vec2', name: 'dPdy' }],
		render: `<span class="autocomp-name">textureProjGrad</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'textureProjGrad(sampler@gsampler2D, P@vec3, dPdx@vec2, dPdy@vec2',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/textureProjGrad.xhtml'
	},
	{
		name: 'textureProjGradOffset',
		type: 'builtin',
		args: [{ type: 'gsampler2D', name: 'sampler' }, { type: 'vec3', name: 'P' }, { type: 'vec2', name: 'dPdx' }, { type: 'vec2', name: 'dPdy' }, { type: 'ivec2', name: 'offset' }],
		render: `<span class="autocomp-name">textureProjGradOffset</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'textureProjGradOffset(sampler@gsampler2D, P@vec3, dPdx@vec2, dPdy@vec2, offset@ivec2)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/textureProjGradOffset.xhtml'
	},
	{
		name: 'textureProjLod',
		type: 'builtin',
		args: [{ type: 'gsampler2D', name: 'sampler' }, { type: 'vec3', name: 'P' }, { type: 'float', name: 'lod' }],
		render: `<span class="autocomp-name">textureProjLod</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'textureProjLod(sampler@gsampler2D, P@vec3, lod@float)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/textureProjLod.xhtml'
	},
	{
		name: 'textureProjLodOffset',
		type: 'builtin',
		args: [{ type: 'gsampler2D', name: 'sampler' }, { type: 'vec3', name: 'P' }, { type: 'float', name: 'lod' }, { type: 'ivec2', name: 'offset' }],
		render: `<span class="autocomp-name">textureProjLodOffset</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'textureProjLodOffset(sampler@gsampler2D, P@vec3, lod@float, offset@ivec2)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/textureProjLodOffset.xhtml'
	},
	{
		name: 'textureProjOffset',
		type: 'builtin',
		args: [{ type: 'gsampler2D', name: 'sampler' }, { type: 'vec3', name: 'P' }, { type: 'ivec2', name: 'offset' }, { type: 'float', name: 'bias' }],
		render: `<span class="autocomp-name">textureProjOffset</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'textureProjOffset(sampler@gsampler2D, P@vec3, offset@ivec2, bias@float_array)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/textureProjOffset.xhtml'
	},
	{
		name: 'textureSize',
		type: 'builtin',
		args: [{ type: 'gsampler2D', name: 'sampler' }, { type: 'int', name: 'lod' }],
		render: `<span class="autocomp-name">textureSize</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'textureSize(sampler@gsampler2D, lod@int)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/textureSize.xhtml'
	},
	{
		name: 'transpose',
		type: 'builtin',
		args: [{ type: 'matX', name: 'm' }],
		render: `<span class="autocomp-name">transpose</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'transpose(m@matX)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/transpose.xhtml'
	},
	{
		name: 'trunc',
		type: 'builtin',
		args: [{ type: 'genType', name: 'x' }],
		render: `<span class="autocomp-name">trunc</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'trunc(x@genType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/trunc.xhtml'
	},
	{
		name: 'intBitsToFloat',
		type: 'builtin',
		args: [{ type: 'genIType', name: 'x' }],
		render: `<span class="autocomp-name">intBitsToFloat</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'intBitsToFloat(x@genIType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/intBitsToFloat.xhtml'
	},
	{
		name: 'uintBitsToFloat',
		type: 'builtin',
		args: [{ type: 'genUType', name: 'x' }],
		render: `<span class="autocomp-name">uintBitsToFloat</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'uintBitsToFloat(x@genUType)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/intBitsToFloat.xhtml'
	},
	{
		name: 'unpackHalf2x16',
		type: 'builtin',
		args: [{ type: 'uint', name: 'v' }],
		render: `<span class="autocomp-name">unpackHalf2x16</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'unpackHalf2x16(v@uint)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/unpackHalf2x16.xhtml'
	},
	{
		name: 'unpackSnorm2x16',
		type: 'builtin',
		args: [{ type: 'uint', name: 'p' }],
		render: `<span class="autocomp-name">unpackSnorm2x16</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'unpackSnorm2x16(p@uint)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/unpackUnorm.xhtml'
	},
	{
		name: 'unpackUnorm2x16',
		type: 'builtin',
		args: [{ type: 'uint', name: 'p' }],
		render: `<span class="autocomp-name">unpackUnorm2x16</span><div class="icon-code-gl"></div><span class="autocomp-type">builtin</span>`,
		snippet: 'unpackUnorm2x16(p@uint)',
		url: 'https: //www.khronos.org/registry/OpenGL-Refpages/es3.0/html/unpackUnorm.xhtml'
	}
]

export default builtins_es300