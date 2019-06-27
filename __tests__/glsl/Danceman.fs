//   ___                                              
//  (  _`\                                            
//  | ( (_)   _     ___ ___    ___ ___     _     ___  
//  | |  _  /'_`\ /' _ ` _ `\/' _ ` _ `\ /'_`\ /' _ `\
//  | (_( )( (_) )| ( ) ( ) || ( ) ( ) |( (_) )| ( ) |
//  (____/'`\___/'(_) (_) (_)(_) (_) (_)`\___/'(_) (_)
//                                                    


//#######################################
//#                                     #
//#  Useful tools to render SDF scenes  #
//#                                     #
//#######################################

// For Blender
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//#define BLENDER
#ifdef BLENDER
uniform float iTime;
uniform vec2 iResolution;
uniform float iDebugAlpha;
uniform float fov;
uniform vec3 eye;
uniform vec3 lookat;
varying vec2 fragCoord;
#define fragColor gl_FragColor
#endif

// Constants
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
#define PI 3.14159265
#define HALF_PI 1.5707963267948966
#define SQRT2 1.41421356237
#define TAU (2*PI)
#define PHI (sqrt(5)*0.5 + 0.5)
#define saturate(x) clamp(x, 0.0, 1.0)

// Commonalized uniforms
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
float cTime=0.0;
float cTimeDelta=0.0;
int cFrame=0;
vec2 cResolution=vec2(0.0);
void commonalizeUniforms(float time, float timeDelta, int frame, vec2 resolution)
{cTime=time;cTimeDelta=timeDelta;cFrame=frame;cResolution=resolution;}

// Random Generators
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// "Hash without Sine" by Dave_Hoskins
// https://www.shadertoy.com/view/4djSRW
// #define HASHSCALE1 .1031 /*Use this for integer stepped ranges, ie Value-Noise/Perlin noise functions.*/
#define HASHSCALE1 443.8975 /*For smaller input rangers like audio tick or 0-1 UVs use these...*/
float hash11(float p){vec3 p3 = fract(vec3(p) * HASHSCALE1);p3 += dot(p3, p3.yzx + 19.19);return fract((p3.x + p3.y) * p3.z);}
float hash12(vec2 p){vec3 p3 = fract(vec3(p.xyx) * HASHSCALE1);p3 += dot(p3, p3.yzx + 19.19);return fract((p3.x + p3.y) * p3.z);}
float hash13(vec3 p3){p3 = fract(p3 * HASHSCALE1);p3 += dot(p3, p3.yzx + 19.19);return fract((p3.x + p3.y) * p3.z);}
// "Random number generator"
// https://www.ci.i.u-tokyo.ac.jp/~hachisuka/tdf2015.pdf
vec4 seed = vec4(0);
float rnd(inout vec4 n){const vec4 q=vec4(1225.0,1585.0,2457.0,2098.0);const vec4 r=vec4(1112.0,367.0,92.0,265.0);const vec4 a=vec4(3423.0,2646.0,1707.0,1999.0);const vec4 m=vec4(4194287.0,4194277.0,4194191.0,4194167.0);vec4 beta=floor(n/q);vec4 p=a*(n-beta*q)-beta*r;beta=(sign(-p)+vec4(1.0))*vec4(0.5)*m;n=(p+beta);return fract(dot(n/m,vec4(1.0,-1.0,1.0,-1.0)));}
// Famouses
float hash( vec2 p ){float h = dot(p,vec2(127.1,311.7));return -1.0 + 2.0*fract(sin(h)*43758.5453123);}
float noise(vec2 p){vec2 i = floor( p );vec2 f = fract( p );vec2 u = f*f*(3.0-2.0*f);return mix( mix( hash( i + vec2(0.0,0.0) ), hash( i + vec2(1.0,0.0) ), u.x),mix( hash( i + vec2(0.0,1.0)), hash( i + vec2(1.0,1.0) ), u.x), u.y);}
float fbm(vec2 p){const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );float f = 0.0;f += 0.5000*noise( p ); p = m*p*2.02;f += 0.2500*noise( p ); p = m*p*2.03;f += 0.1250*noise( p ); p = m*p*2.01;f += 0.0625*noise( p );return f/0.9375;}
vec2 fbm2(vec2 p){return vec2( fbm(p.xy), fbm(p.yx));}
vec3 fbm3(vec3 p){return vec3( fbm(p.xy), fbm(p.zx), fbm(p.yz));}

// Easings
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// "glsl-easings": https://github.com/glslify/glsl-easings
float linear(float t){return t;}
float sineInOut(float t){return -0.5 * (cos(PI * t) - 1.0);}
float quadraticInOut(float t){float p = 2.0 * t * t; return t < 0.5 ? p : -p + (4.0 * t) - 1.0;}
float cubicInOut(float t){return t < 0.5 ? 4.0 * t * t * t : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;}
float quarticOut(float t){return pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;}
float qinticInOut(float t){return t < 0.5 ? +16.0 * pow(t, 5.0) : -0.5 * pow(2.0 * t - 2.0, 5.0) + 1.0;}
float exponentialInOut(float t){return t == 0.0 || t == 1.0 ? t : t < 0.5 ? +0.5 * pow(2.0, (20.0 * t) - 10.0) : -0.5 * pow(2.0, 10.0 - (t * 20.0)) + 1.0;}
float circularInOut(float t){return t < 0.5 ? 0.5 * (1.0 - sqrt(1.0 - 4.0 * t * t)) : 0.5 * (sqrt((3.0 - 2.0 * t) * (2.0 * t - 1.0)) + 1.0);}
float elasticInOut(float t){return t < 0.5 ? 0.5 * sin(+13.0 * HALF_PI * 2.0 * t) * pow(2.0, 10.0 * (2.0 * t - 1.0)) : 0.5 * sin(-13.0 * HALF_PI * ((2.0 * t - 1.0) + 1.0)) * pow(2.0, -10.0 * (2.0 * t - 1.0)) + 1.0;}
float backInOut(float t){float f = t < 0.5 ? 2.0 * t : 1.0 - (2.0 * t - 1.0);float g = pow(f, 3.0) - f * sin(f * PI); return t < 0.5 ? 0.5 * g : 0.5 * (1.0 - g) + 0.5;}
float bounceOut(float t){const float a = 4.0 / 11.0; const float b = 8.0 / 11.0; const float c = 9.0 / 10.0; const float ca = 4356.0 / 361.0; const float cb = 35442.0 / 1805.0; const float cc = 16061.0 / 1805.0; float t2 = t * t; return t < a ? 7.5625 * t2 : t < b ? 9.075 * t2 - 9.9 * t + 3.4 : t < c ? ca * t2 - cb * t + cc : 10.8 * t * t - 20.52 * t + 10.72;}
float bounceInOut(float t){return t < 0.5 ? 0.5 * (1.0 - bounceOut(1.0 - t * 2.0)) : 0.5 * bounceOut(t * 2.0 - 1.0) + 0.5;}

// Other Utils
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
vec3 rX(vec3 p,float rx){float sinx=sin(rx);float cosx=cos(rx);return mat3(1.,0.,0.,0.,cosx,sinx,0.,-sinx,cosx)*p;}
vec3 rY(vec3 p,float ry){float sinx=sin(ry);float cosx=cos(ry);return mat3(cosx,0.,-sinx,0.,1.,0.,sinx,0.,cosx)*p;}
vec3 rZ(vec3 p,float rz){float sinx=sin(rz);float cosx=cos(rz);return mat3(cosx,sinx,0.,-sinx,cosx,0.,0.,0.,1.)*p;}
mat2 rot2D(float angle){float c=cos(angle);float s=sin(angle);return mat2(c,s,-s,c);}
mat3 rotXY(vec2 angle) {vec2 c=cos(angle);vec2 s=sin(angle);return mat3(c.y,0.0,-s.y,s.y*s.x,c.x,c.y*s.x,s.y*c.x,-s.x,c.y*c.x);}
vec3 rXY(vec3 p,vec2 r){return rX(rY(p,r.y),r.x);}
vec3 rXZ(vec3 p,vec2 r){return rX(rZ(p,r.y),r.x);}
vec3 rYZ(vec3 p,vec2 r){return rY(rZ(p,r.y),r.y);}
vec3 rot(vec3 p,vec3 r){return rX(rY(rZ(p,r.z),r.y),r.x);}
float sgn(float x){return(x<0.0)?-1.0:1.0;}
vec2 sgn(vec2 v){return vec2((v.x<0.0)?-1.0:1.0,(v.y<0.0)?-1.0:1.0);}
float vmax(vec3 v){return max(max(v.x, v.y), v.z);}

// SDFs
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
float sdPlane(in vec3 p){return p.y;}
float sdSphere(in vec3 p,in float r){return length(p)-r;}
float sdEllipsoid(in vec3 p, in vec3 r){return (length(p/r)-1.0)*min(min(r.x,r.y),r.z);}
float sdCapsule(vec3 p, float r, float c) {return mix(length(p.xz) - r, length(vec3(p.x, abs(p.y) - c, p.z)) - r, step(c, abs(p.y)));}
float udBox(vec3 p,vec3 b){return length(max(abs(p)-b*0.5,0.0));}
float udRoundBox( vec3 p,vec3 b,float r){return length(max(abs(p)-b,0.0))-r;}
float sdTorus( vec3 p, vec2 t ){vec2 q = vec2(length(p.xz)-t.x,p.y);return length(q)-t.y;}
float sdCappedCylinder( vec3 p, vec2 h ){vec2 d = abs(vec2(length(p.xz),p.y)) - h;return (min(max(d.x,d.y),0.0) + length(max(d,0.0)));}
float sdConeSection(in vec3 p,in float h, in float r1,in float r2){float d1=-p.y-h; float q=p.y-h; float si=0.5*(r1-r2)/h; float d2=max(sqrt(dot(p.xz,p.xz)*(1.0-si*si))+q*si-r2,q); return length(max(vec2(d1,d2),0.0))+min(max(d1,d2),0.);}
float sdBox(vec3 p,vec3 b){vec3 d=abs(p)-b;return length(max(d,vec3(0)))+vmax(min(d,vec3(0)));}

float opU(in float a,in float b){return a<b?a:b;}
float opSU(float a,float b,float k){float h=clamp(0.5+0.5*(b-a)/k,0.0,1.0);return mix(b,a,h)-k*h*(1.0-h);}
float opS(in float a,in float b){return max(-a, b);}
float opSS( float a,float b,float k){return opSU(-a, b, -k);}
float opI(in float a,in float b){return max(a, b);}
float opSI( float a,float b,float k){return opSU(a, b, -k);}

vec2 opU(in vec2 a,in vec2 b){return a.x<b.x?a:b;}
vec2 opSU(vec2 a,vec2 b,float k){float h=clamp(0.5+0.5*(b.x-a.x)/k,0.0,1.0);return mix(b,a,h)-k*h*(1.0-h);}
vec2 opS(in vec2 a,in vec2 b){float res = max(-a.x, b.x); return (res==-a.x)?vec2(-a.x, a.y):b;}
vec2 opSS( vec2 a,vec2 b,float k){return opSU(vec2(-a.x,a.y), b, -k);}
vec2 opI(in vec2 a,in vec2 b){float res = max(a.x, b.x); return (res==a.x)?a:b;}
vec2 opSI( vec2 a,vec2 b,float k){return opSU(a, b, -k);}

float pModPolar(inout vec2 p, float repetitions) {float angle = 2.0*PI/repetitions;float a = atan(p.y, p.x) + angle/2.0;float r = length(p);float id = floor(a/angle);a = mod(a,angle) - angle/2.;p = vec2(cos(a), sin(a))*r;if (abs(id) >= (repetitions/2.0)) id = abs(id);return id;}

// Debugging
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
float sampleFont (vec4 size, vec2 character, vec2 uv, in sampler2D texSlot){if(uv.x>size.x&&uv.y>size.y&&uv.x<size.x+size.z&&uv.y<size.y+size.w)return smoothstep(0.0,0.8, texture(texSlot, (vec2((uv.x-size.x)/size.z, (uv.y-size.y)/size.w)+character)/16.).r);}
#define t(x) fill = max(fill,sampleFont(vec4(align, size), x, uv, texSlot));
vec3 text(in float num, in vec3 dest, in vec2 uv, in sampler2D texSlot){vec3 col=vec3(1.0,1.0,1.0);int digits = 5;vec2 size = vec2(0.05);vec2 spacing = vec2(size.x*0.44, 0.0);vec2 align = vec2(0.0, -size.y/2.);vec2 coord = vec2(0.0, -1.0);uv+=coord; uv.y+=size.x;vec2 sgn = vec2((num<0.0)?13:0,13);num=abs(num);vec2 hundreds = vec2(floor(mod(num/100., 10.)), 12);vec2 tens = vec2(floor(mod(num/10., 10.)), 12);vec2 ones = vec2(floor(mod(num, 10.)), 12);vec2 tenths = vec2(floor(mod(num*10., 10.)), 12);vec2 hundredths = vec2(floor(mod(num*100., 10.)), 12);vec2 dp=vec2(14,13);float fill = 0.; align+=spacing;t(sgn)t(hundreds)t(tens)t(ones)t(dp)t(tenths)t(hundredths)return mix(dest,col,fill);}





//################
//#              #
//#  For PICNIC  #
//#              #
//################


// Refferenced Functions
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// "Shepherd Drone" by eiffie: https://www.shadertoy.com/view/XsG3Rd
vec2 bx_cos(vec2 a) {return clamp(abs(mod(a, 8.0) - 4.0) - 2.0, -1.0, 1.0);}
vec2 bx_cossin(float a) {return bx_cos(vec2(a, a - 2.0));}
float bx_length(vec2 p) {return max(abs(p.x), abs(p.y));}
vec2 rotate(vec2 v, float angle) {return cos(angle)*v+sin(angle)*vec2(v.y,-v.x);}

// "bicubic" by simesgreen: https://www.shadertoy.com/view/4df3Dn
float w0(float a){return (1.0/6.0)*(a*(a*(-a + 3.0) - 3.0) + 1.0);}
float w1(float a){return (1.0/6.0)*(a*a*(3.0*a - 6.0) + 4.0);}
float w2(float a){return (1.0/6.0)*(a*(a*(-3.0*a + 3.0) + 3.0) + 1.0);}
float w3(float a){return (1.0/6.0)*(a*a*a);}
float g0(float a){return w0(a) + w1(a);}
float g1(float a){return w2(a) + w3(a);}
float h0(float a){return -1.0 + w1(a) / (w0(a) + w1(a));}
float h1(float a){return 1.0 + w3(a) / (w2(a) + w3(a));}
vec4 texture_bicubic(sampler2D tex, vec2 uv, vec4 texelSize){uv = uv*texelSize.zw + 0.5;vec2 iuv = floor( uv );vec2 fuv = fract( uv );float g0x = g0(fuv.x);float g1x = g1(fuv.x);float h0x = h0(fuv.x);float h1x = h1(fuv.x);float h0y = h0(fuv.y);float h1y = h1(fuv.y);vec2 p0 = (vec2(iuv.x + h0x, iuv.y + h0y) - 0.5) * texelSize.xy;vec2 p1 = (vec2(iuv.x + h1x, iuv.y + h0y) - 0.5) * texelSize.xy;vec2 p2 = (vec2(iuv.x + h0x, iuv.y + h1y) - 0.5) * texelSize.xy;vec2 p3 = (vec2(iuv.x + h1x, iuv.y + h1y) - 0.5) * texelSize.xy;return g0(fuv.y) * (g0x * texture(tex, p0)  +g1x * texture(tex, p1)) +g1(fuv.y) * (g0x * texture(tex, p2)  +g1x * texture(tex, p3));}

//"poisson-disc-blur-fs.glsl" by spite: https://github.com/spite/Wagner/blob/master/fragment-shaders/poisson-disc-blur-fs.glsl
const int NUM_TAPS=27;
const float rcp_maxdist=1.0/4.22244;
vec3 poissonSampling(sampler2D buffer, vec2 uv, float max_siz){vec2 fTaps_Poisson[NUM_TAPS];fTaps_Poisson[0]=rcp_maxdist*vec2(-0.8835609,2.523391);fTaps_Poisson[1]=rcp_maxdist*vec2(-1.387375,1.056318);fTaps_Poisson[2]=rcp_maxdist*vec2(-2.854452,1.313645);fTaps_Poisson[3]=rcp_maxdist*vec2(0.6326182,1.14569);fTaps_Poisson[4]=rcp_maxdist*vec2(1.331515,3.637297);fTaps_Poisson[5]=rcp_maxdist*vec2(-2.175307,3.885795);fTaps_Poisson[6]=rcp_maxdist*vec2(-0.5396664,4.1938);fTaps_Poisson[7]=rcp_maxdist*vec2(-0.6708734,-0.36875);fTaps_Poisson[8]=rcp_maxdist*vec2(-2.083908,-0.6921188);fTaps_Poisson[9]=rcp_maxdist*vec2(-3.219028,2.85465);fTaps_Poisson[10]=rcp_maxdist*vec2(-1.863933,-2.742254);fTaps_Poisson[11]=rcp_maxdist*vec2(-4.125739,-1.283028);fTaps_Poisson[12]=rcp_maxdist*vec2(-3.376766,-2.81844);fTaps_Poisson[13]=rcp_maxdist*vec2(-3.974553,0.5459405);fTaps_Poisson[14]=rcp_maxdist*vec2(3.102514,1.717692);fTaps_Poisson[15]=rcp_maxdist*vec2(2.951887,3.186624);fTaps_Poisson[16]=rcp_maxdist*vec2(1.33941,-0.166395);fTaps_Poisson[17]=rcp_maxdist*vec2(2.814727,-0.3216669);fTaps_Poisson[18]=rcp_maxdist*vec2(0.7786853,-2.235639);fTaps_Poisson[19]=rcp_maxdist*vec2(-0.7396695,-1.702466);fTaps_Poisson[20]=rcp_maxdist*vec2(0.4621856,-3.62525);fTaps_Poisson[21]=rcp_maxdist*vec2(4.181541,0.5883132);fTaps_Poisson[22]=rcp_maxdist*vec2(4.22244,-1.11029);fTaps_Poisson[23]=rcp_maxdist*vec2(2.116917,-1.789436);fTaps_Poisson[24]=rcp_maxdist*vec2(1.915774,-3.425885);fTaps_Poisson[25]=rcp_maxdist*vec2(3.142686,-2.656329);fTaps_Poisson[26]=rcp_maxdist*vec2(-1.108632,-4.023479);vec4 sum = vec4(0);vec2 seed = uv;seed += fract( cTime);float rnd = 6.28*hash12(seed);vec4 basis = vec4( rotate(vec2(1,0),rnd), rotate(vec2(0,1),rnd));for (int i=0; i < NUM_TAPS; i++){vec2 ofs = fTaps_Poisson[i]; ofs = vec2(dot(ofs,basis.xz),dot(ofs,basis.yw));vec2 texcoord = uv + max_siz*ofs /cResolution.xy;sum += texture(buffer, texcoord, -10.0);}return vec4(sum / vec4(NUM_TAPS)).xyz;}


// Split/Shrink rendering
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// #define SPLIT_RENDER

// Should be x8.0 number.
#define WAVEFRONT_UNIT 64.0

// 1.0:60.0fps / 2.0:30.0fps / 3.0:20.0fps...
#define SPLIT_NUM 5.0

// 1.0 is full quality.
#define SHRINK_RENDER 0.9

#define FULLSCREEN_RESOLUTION 2048.0
vec2 getDrawRes(vec2 res){float drawWidth=min(FULLSCREEN_RESOLUTION, WAVEFRONT_UNIT*floor((res.x*SHRINK_RENDER)/WAVEFRONT_UNIT));return vec2(drawWidth, floor(res.y*(drawWidth/res.x)));}


// Scene Settings
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
#define MIN_DIST 0.0025
#define MAX_DIST 300.0
#define DATABLOCK_SIZE 100.0
#define ITERATION 150

vec3 gro = vec3(0);
vec3 grd = vec3(0);
float dBox( in vec3 ro, in float center){vec3 m = 1.2 / grd;vec3 t = -m * ro + abs(m) * (center*0.5+MIN_DIST);return min(min(t.x, t.y), t.z);}
float dBox2D( in vec2 ro, in float center){vec2 m = 1.2 / grd.xz;vec2 t = -m * ro + abs(m) * (center*0.5+MIN_DIST);return min(t.x, t.y);}

struct ObjData
{
    vec2 position;
    vec2 velocity;
    
    vec2 goal;
    float state;
    float timer;
};
#define STATE_IDLE 0.0
#define STATE_WALK 1.0
#define STATE_SIT 2.0
#define STATE_CHATTING 3.0
#define STATE_SLEEPING 4.0

#define TIMER_MAX_DUR 5.0

#define EMPTY 9876.0
#define TREE vec4(123.0, 123.0, 123.0, 123.0)
#define VOID vec4(-0.5, 0.5, 0.0, 0.0)
#define NO_TREE vec2(1234.0)

vec2 loopCoord(in vec2 coord)
{
	return mod(coord, DATABLOCK_SIZE);
}

ObjData fetchObjData(vec2 u, in sampler2D buffer)
{
    ObjData objData;
    vec4 packedObjData;
    packedObjData = texelFetch(buffer, ivec2(u),0);
    objData.position = packedObjData.xy;
    objData.velocity = packedObjData.zw;
    packedObjData = texelFetch(buffer, ivec2(u.x+DATABLOCK_SIZE, u.y),0);
    objData.goal = packedObjData.xy;
    objData.state = packedObjData.z;
    objData.timer = packedObjData.w;
    return objData;
}

bool isEmpty(ObjData obj){return (obj.position==vec2(EMPTY) && obj.velocity==vec2(EMPTY) && obj.goal==vec2(EMPTY) && obj.state==EMPTY && obj.timer==EMPTY);}
bool isTree(ObjData obj) {return (obj.position.xy == TREE.xy);}
// bool isMan(ObjData obj) {return (obj.position.x != EMPTY && obj.position.xy!=TREE.xy);}
bool isMan(ObjData obj) {return !isEmpty(obj)&&!isTree(obj);}


// Fork of "PICNIC_MAN_animation_walk" by iY0Yi. https://shadertoy.com/view/XtdcR2
// 2018-10-15 11:01:19

//https://www.shadertoy.com/view/4tt3Wn
//https://www.shadertoy.com/view/4dGyDm
#define _1 49
#define _2 50
#define _3 51
#define _4 52
#define _5 53
bool readKey( int key, bool toggle ){float keyVal = texture( iChannel0, vec2( (float(key)+.5)/256.0, toggle?.75:.25 ) ).x;return (keyVal>.5)?true:false;}

#define MAT_VOID -1.0
#define MAT_TERRAIN 100000.0
#define MAT_GREEN 10000.0
#define MAT_TRUNK 1000.0
#define MAT_MAN_STRIPE 100.0
#define MAT_MAN_WHITE 0.8
#define MAT_WATER 0.0

#define BAND_MUL 0.7
#define rm(a) mat2(cos(a + PI*0.5*vec4(0,1,3,0)))    
vec3 r3( in vec3 p, in vec3 r ) {
    p.xz *= rm(r.y);
    p.yz *= rm(r.x);
    p.xz *= rm(r.z);
    return p;
}

vec3 gcp_torso;
vec2 mapMan(vec3 p)
{
    p.x+=sin(p.y*3.0+cTime)*0.125;
    p.z+=cos(p.y*3.0+cTime)*0.125;
        
    // p.xz=mod(p.xz, 2.0)-1.0;
    //p+=0.55;
    float d = MAX_DIST;
    
#if 1
    vec2 tres = vec2(MAX_DIST, MAT_VOID);
    vec2 bres = vec2(MAX_DIST, MAT_VOID);
    
    float state=mod(cTime*0.025, 4.0);
	vec4 m=iMouse*1.0/800.0;
    
    #define m(i) (float(i)/800.0)
    
    #if 1
    vec2 ids = m.xy;
    float bTime=cTime*0.5;
    #else
    vec2 ids = a_obj.ids.xy;
    #endif
    float idx=hash11(ids.x)*1.23;
    float idy=hash11(ids.y)*4.56;
    float T=mod(bTime+idx+idy,PI)*10.0;
	T+=sineInOut(T/HALF_PI)*0.25;

    vec3 cp_torso = p+vec3( 0.00000,-1.34620, 0.02069);
    
    vec3 cp_chest=cp_torso+vec3(0,cos((T+HALF_PI)*2.0)*0.05,0);
    cp_chest.xz*=rm(-cos(T)*0.4);
    
    vec3 cp_butt=cp_torso+vec3(0,cos((T-HALF_PI)*2.0)*0.05,0);
    cp_butt.xz*=rm(cos(T-PI)*0.15);
    cp_butt.xy*=rm(cos(T)*0.15);
    gcp_torso=vec3(0,cos((T-HALF_PI)*2.0)*0.05,0);
    vec3 cp_head = cp_chest+vec3( 0.00000,-1.16336, 0.00000);
	cp_head.yz*=rm(sin(T)*(0.35+idx*0.125));
    
    vec3 cp_shoulderL = cp_chest+vec3(-0.30000,-0.94579, -0.00000);
    cp_shoulderL.yz*=rm(sin(T)*0.5);
    cp_shoulderL.xy*=rm(-0.15);
    
    vec3 cp_elbowL = cp_shoulderL-vec3(-0.52479, 0.00047,-0.00290).zxy;
    cp_elbowL.yz*=rm(cos(T)*0.5-0.5);

    vec3 cp_groinL = cp_torso+vec3(-0.20026,-0.03269, 0.10731);
    cp_groinL.yz*=rm(sin(T-PI)*(0.25+idx*0.125));
    vec3 cp_kneeL  = cp_groinL+vec3( 0.00000, 0.62153, 0.00000);
    cp_kneeL.yz*=rm(sin(T-PI)*0.3+0.35);
    vec3 cp_ankleL = cp_kneeL+vec3( 0.00000, 0.68572,-0.00366);
    cp_ankleL.yz*=rm(cos(T)*0.2);
    vec3 cp_toeL   = cp_ankleL+vec3( 0.00003, 0.05016, 0.09153);
    cp_toeL.yz*=rm(cos(T-PI)*0.4-0.2);

    vec3 cp_shoulderR = cp_chest+vec3( 0.30000,-0.94579, 0.00000);
    cp_shoulderR.yz*=rm(sin(T-PI)*0.5);
    cp_shoulderR.xy*=rm(0.15);
    
    vec3 cp_elbowR = cp_shoulderR+vec3( 0.52479, 0.00047,-0.00290).zxy;
    cp_elbowR.yz*=rm(cos(T-PI)*0.5-0.5);

    vec3 cp_groinR = cp_torso+vec3( 0.20026,-0.03269, 0.10731);
    cp_groinR.yz*=rm(sin(T)*(0.25+idx*0.125));
    vec3 cp_kneeR  = cp_groinR+vec3( 0.00000, 0.62153, 0.00000);
    cp_kneeR.yz*=rm(sin(T)*0.3+0.35);
    vec3 cp_ankleR = cp_kneeR+vec3( 0.00000, 0.68572,-0.00366);
    cp_ankleR.yz*=rm(cos(T-PI)*0.2);
    vec3 cp_toeR   = cp_ankleR+vec3( 0.00003, 0.05015, 0.09158);
    cp_toeR.yz*=rm(cos(T)*0.4-0.2);
    
    float c=1.0;
    float band=0.0;
    float offsetY_torso=0.5;
    float offsetY=0.25;
    float bwidth=100.0;
    band=smoothstep(0.0,1.0,abs(mod(cp_chest.y*bwidth+offsetY_torso,c)-c*0.5));
    float border=band*BAND_MUL+MAT_MAN_WHITE-BAND_MUL;
    
    vec3 tp=vec3(0);

    vec3 BB;
    float bd;
    // torso
    BB = vec3(0.7,0.9,0.95);
	bd = udBox(cp_chest-vec3(0,0.65,0), BB);
    //if (false)
    {
        //if (bd < 0.2)
        {
            tp=cp_torso+vec3(-0.00000, -0.42881, 0.02082);
            tp.yz*=rm(-0.03862);
            d = opU(sdEllipsoid(tp, vec3(0.30724, 0.59165, 0.20865)), d);
            tp=cp_chest+vec3(-0.00000, -0.19441, -0.00000);
            tp.yz*=rm(-0.07554);
            d = opSS(sdPlane(tp), d, 0.03066);
            tp=cp_chest+vec3(-0.00000, -0.81557, 0.02124);
            tp.yz*=rm(-0.12160);
            d = opSU(sdEllipsoid(tp, vec3(0.35721, 0.31644, 0.19771)), d, 0.05788);
            tp=cp_chest+vec3(-0.00000, 0.0825, -0.1537);
            tp.yz*=rm(1.47);
            d = opSS(sdPlane(tp), d, 0.18);
            tp=cp_chest+vec3(-0.00000, -1.11196, -0.00166);
            tp.yz*=rm(0.13239);
            d = opSU(sdTorus(tp, vec2(0.07368, 0.01627)), d, 0.01984);
            tp=cp_chest+vec3(-0.02067, -1.07469, -0.00662);
            tp.yz*=rm(0.15081);
            tp.xy*=rm(-0.49783);
            d = opSU(sdTorus(tp, vec2(0.07052, 0.01557)), d, 0.01984);
            tp=cp_chest+vec3(0.00003, -1.15282, 0.00378);
            tp.yz*=rm(0.09133);
            d = opSU(sdTorus(tp, vec2(0.06372, 0.01216)), d, 0.01232);
            tres = opSU(vec2(d,border), tres, 0.02832);
        }//else{tres=opU(vec2(bd,MAT_VOID),tres);}
    }
    
    // arm
    BB = vec3(0.5,1.25,1.75);
    bd = udBox(cp_shoulderL-vec3(0,-0.5,-0.5), BB);
    //if (false)
    {
        // if (bd < 0.2)
        {
            d = MAX_DIST;
            band=smoothstep(0.0,1.0,abs(mod(cp_shoulderL.y*bwidth+offsetY,c)-c*0.5));
            border=band*BAND_MUL+MAT_MAN_WHITE-BAND_MUL;
            tres = opSU(vec2(sdEllipsoid((cp_shoulderL+vec3(-0.00000, 0.28279, -0.00000)), vec3(0.09412, 0.30027, 0.10527)),border), tres, 0.25*sin(bTime)+0.26);
            
            band=smoothstep(0.0,1.0,abs(mod(cp_elbowL.y*bwidth+offsetY,c)-c*0.5));
            border=band*BAND_MUL+MAT_MAN_WHITE-BAND_MUL;
            d = opSU(sdEllipsoid((cp_elbowL+vec3(-0.00000, 0.22539, -0.00000)), vec3(0.08887, 0.26141, 0.08887)), d, 0.01832);
            // d = opSU(sdTorus((cp_elbowL+vec3(-0.00000, 0.49466, -0.00000)), vec2(0.04836, 0.00471)), d, 0.02368);
            d = opSU(sdCappedCylinder((cp_elbowL+vec3(-0.00000, 0.43264, -0.00000)), vec2(0.04109, 0.06522)), d, 0.03200);
            tres=opSU(vec2(d,border),tres, 0.2);
        }//else{tres=opU(vec2(bd,MAT_VOID),tres);}
    }
    BB = vec3(0.5,1.25,1.75);
    bd = udBox(cp_shoulderR-vec3(0,-0.5,-0.5), BB);
    //if (false)
    {
        // if (bd < 0.2)
        {
            d = MAX_DIST;
            band=smoothstep(0.0,1.0,abs(mod(cp_shoulderR.y*bwidth+offsetY,c)-c*0.5));
            border=band*BAND_MUL+MAT_MAN_WHITE-BAND_MUL;
            tres = opSU(vec2(sdEllipsoid((cp_shoulderR+vec3(-0.00000, 0.28279, -0.00000)), vec3(0.09412, 0.30027, 0.10527)),border), tres, 0.125);

            band=smoothstep(0.0,1.0,abs(mod(cp_elbowR.y*bwidth+offsetY,c)-c*0.5));
            border=band*BAND_MUL+MAT_MAN_WHITE-BAND_MUL;
            d = opSU(sdEllipsoid((cp_elbowR+vec3(-0.00000, 0.22539, -0.00000)), vec3(0.08887, 0.26141, 0.08887)), d, 0.0832);
            // d = opSU(sdTorus((cp_elbowR+vec3(-0.00000, 0.49466, -0.00000)), vec2(0.04836, 0.00591)), d, 0.02368);
            d = opSU(sdCappedCylinder((cp_elbowR+vec3(-0.00000, 0.43264, -0.00000)), vec2(0.04109, 0.06522)), d, 0.03200);
            tres=opSU(vec2(d,border),tres,0.2);
        }//else{tres=opU(vec2(bd,MAT_VOID),tres);}
    }
    
    // leg
    BB = vec3(0.4,1.5,1.8);
    bd = udBox(cp_groinL-vec3(0,-0.4,0.25), BB);
    //if (false)
    {
        // if (bd < 0.2)
        {
            d = MAX_DIST;
            d = opSU(sdEllipsoid((cp_kneeL+vec3(-0.00000, 0.23600, -0.00000)), vec3(0.11554, 0.29908, 0.11554)), d, 0.00658);
            d = opSU(sdEllipsoid((cp_groinL+vec3(-0.00000, 0.25660, -0.00000)), vec3(0.14814, 0.40112, 0.15947)), d, 0.07344);
            d = opSU(sdCappedCylinder((cp_kneeL+vec3(-0.00000, 0.39710, -0.00000)), vec2(0.05821, 0.13053)), d, 0.00962);
            bres = opSU(vec2(d,MAT_MAN_WHITE), bres, 0.2832);
        }//else{bres=opU(vec2(bd,MAT_VOID),bres);}
    }
    bd = udBox(cp_groinR-vec3(0,-0.4,0.25), BB);
    //if (false)
    {
        // if (bd < 0.2)
        {
            d = MAX_DIST;
            d = opSU(sdEllipsoid((cp_kneeR+vec3(-0.00000, 0.23600, -0.00000)), vec3(0.11554, 0.29908, 0.11554)), d, 0.00658);
            d = opSU(sdEllipsoid((cp_groinR+vec3(-0.00000, 0.25660, -0.00000)), vec3(0.14814, 0.40112, 0.15947)), d, 0.07344);
            d = opSU(sdCappedCylinder((cp_kneeR+vec3(-0.00000, 0.39710, -0.00000)), vec2(0.05821, 0.13053)), d, 0.00962);    
            bres = opSU(vec2(d,MAT_MAN_WHITE), bres, 0.2832);
        }//else{bres=opU(vec2(bd,MAT_VOID),bres);}
    }
    d = MAX_DIST;
    // butt
    tp=cp_butt+vec3(0.00023, -0.025979, 0.01034);
    tp.xy*=rm(1.57080);
    d = opSU(sdCapsule(tp, 0.10256, 0.19623), d, 0.410480);
    
    
    // crotch
    tp=cp_torso+vec3(-0.00000, -0.10164, 0.08840);
    tp.yz*=rm(-0.02004);
    d = opSU(sdEllipsoid(tp, vec3(0.12460, 0.16398, 0.09065)), d, 0.29394);
    d = opSS(sdEllipsoid(tp+vec3(0,0.15,-0.65), vec3(0.01, 0.2, 0.03)), d, 0.4);
	bres = opSU(vec2(d,MAT_MAN_WHITE), bres, 0.1);

    d = MAX_DIST;
    // head
    d = sdSphere(cp_head+vec3(-0.00000, -0.12666, -0.00000), 0.09547);

    // hand
    d = opU(sdSphere(cp_elbowL+vec3(-0.00000, 0.59976, -0.00000), 0.07043), d);
    d = opU(sdSphere(cp_elbowR+vec3(-0.00000, 0.59976, 0.00000), 0.07043), d);
    tres = opU(vec2(d,MAT_MAN_STRIPE), tres);
    
	// foot
    BB = vec3(0.25,0.25,0.45);
    bd = udBox(cp_ankleL-vec3(0,0,-0.1), BB);
    //if (false)
    {
        if (bd < 0.2)
        {
            d = MAX_DIST;
            tp=cp_toeL+vec3(0.00038, -0.01739, 0.06235);
            tp.yz*=rm(0.43263);
            tp.xy*=rm(-0.14210);
            d = opSU(sdEllipsoid(tp, vec3(0.09964, 0.05089, 0.11483)), d, 0.14882);
            tp=cp_ankleL+vec3(0.0, -0.04710, 0.01851);
            tp.yz*=rm(-0.66345);
            tp.xy*=rm(0.12901);
            d = opSU(sdEllipsoid(tp, vec3(0.05411, 0.06251, 0.07096)), d, 0.14546);
            bres = opU(vec2(d,MAT_MAN_WHITE), bres);
        }else{bres=opU(vec2(bd,MAT_VOID),bres);}
    }
    bd = udBox(cp_ankleR-vec3(0,0,-0.1), BB);
    //if (false)
    {
        if (bd < 0.2)
        {
            d = MAX_DIST;
            tp=cp_toeR+vec3(0.00195, -0.01777, 0.06192);
            tp.yz*=rm(0.43263);
            tp.xy*=rm(-0.14210);
            d = opSU(sdEllipsoid(tp, vec3(0.09964, 0.05089, 0.11483)), d, 0.07202);
            tp=cp_ankleR+vec3(0.0, -0.04724, 0.01822);
            tp.yz*=rm(-0.66345);
            tp.xy*=rm(0.12901);
            d = opSU(sdEllipsoid(tp, vec3(0.05411, 0.06251, 0.07096)), d, 0.15026);
            bres = opU(vec2(d,MAT_MAN_WHITE), bres);
        }else{bres=opU(vec2(bd,MAT_VOID),bres);}
    }
    
    vec2 res = vec2(MAX_DIST, MAT_VOID);
    res=opU(tres,bres);
    res.x+=hash13(p)*0.00005;
    
    // res=opU(vec2(sdPlane(p),1.0),res);
#else
    //res=opU(vec2(sdPlane(p),1.0),res);
    res=opU(vec2(sdSphere(p,0.5),MAT_MAN),res);
#endif
    return res;
}

#define map(p) mapMan(p)

vec2 march( in vec3 ro, in vec3 rd)
{
	float t = 0.0;
    float STEP = 1.0/float(ITERATION);
    float dith = rnd(seed);
	// for (int i = 0; i < ITERATION; i++)
    float i = 0.0;
	for (i = 0.0; i < 1.0; i+=STEP)
	{
		vec3 p = ro + t * rd;
		if (length(p) > MAX_DIST) break;
		vec2 res = map(p);
		// if (abs(res.x) < MIN_DIST) return vec2(t, res.y*(1.0-i));
		if (abs(res.x) < MIN_DIST) return vec2(t, res.y);//*(1.0-i)*0.75+0.25*rnd(seed));
        // if (abs(res.x) < MIN_DIST) return vec2(t, res.y*smoothstep(0.3,0.6,(1.0-i))*0.75+0.25*rnd(seed));//res.y);
		if (res.x >= MAX_DIST) break;
		t += res.x;
	}
	return vec2(-1.0);
}


vec3 LIGHT_POS = vec3(0);
vec3 LIGHT_DIR = vec3(0);

vec3 calcNormal(vec3 p)
{
	float c=map(p).x;
	float e=MIN_DIST;
	return normalize(vec3(map(p+vec3(e,0,0)).x-c,
						  map(p+vec3(0,e,0)).x-c,
						  map(p+vec3(0,0,e)).x-c));
}

/*
float calcShadow(vec3 p, vec3 n)
{
    p+=n+vec3(rnd(seed),rnd(seed),rnd(seed))*0.05;
	vec2 res = march(p, LIGHT_DIR);
	return (res.x < MIN_DIST*1.0) ? 1.0 : 0.0;
}

float calcShadow( in vec3 ro, in vec3 rd)
{
    float t=0.25;
    for(int i=0; i<100; i++)
    {
        float precis=MIN_DIST*t;
        float h=map(ro+rd*t).x;
        if(h<precis)return 0.0;
        t+=h;
        if(t>30.0)return 1.0;
    }
    return 1.0;
}
//*/
float calcShadow( in vec3 ro, vec3 n)
{
    float mint=MIN_DIST;
    float maxt=MAX_DIST;
    float k = 8.0;
    float res = 1.0;
    for( float t=mint; t < maxt; )
    {
        float h = map(ro + LIGHT_DIR*t).x;
        if(h<MIN_DIST)
            return 0.0;
        res = min( res, k*h/t );
        t += h*1.0;
    }
    return res;
}




vec3 ddx_ro, ddx_rd, ddy_ro, ddy_rd;
float render( in vec3 ro, in vec3 rd)
{
    vec3 p = vec3(0), n = vec3(0);
    float col = 1.0, mat = 1.0;

    vec2 res = march(ro, rd);

	const float baseSky = 0.8;
	float sun = clamp(pow(max(0.0,dot(LIGHT_DIR, rd)),30.0)*10.5, 0.0,50.0);
    float sky = baseSky;
    sky*=clamp(smoothstep(0.2,0.65, rd.y+0.5),0.0,1.0);
    sky+=sun;
    sky=0.0015;
    
    if (res.y==-1.0)
    {
        return sky;
    }
    else
    {
        p = ro + res.x * rd;
        n = calcNormal(p);
        
        LIGHT_POS=vec3(-6.0*sin(cTime*0.85)-1.0,-10.0+8.0,5.0);
        vec3 LIGHT_TARG=vec3(0.5,4.5,-0.5);
        LIGHT_DIR=normalize(LIGHT_TARG-LIGHT_POS);
        
        
        vec3 pOffset = n * MIN_DIST*5.0;
        float shadow = calcShadow(p+pOffset, LIGHT_DIR);
        float light1 = pow(clamp(dot(n+pOffset, LIGHT_DIR), 0.0, 1.0), 3.0);
        float light2 = pow(clamp(dot(n+pOffset, -LIGHT_DIR), 0.0, 1.0), 3.0);
		
        float falloff=max(0.0, dot(normalize(p-LIGHT_POS),LIGHT_DIR));
        light1*=pow(smoothstep(0.8,1.0,falloff),6.5);
        float shade = 0.0;
        shade += 0.8 * smoothstep(0.0, 1.0, min(1.0, light1*0.8));// *0.975+0.025);
        shade *=shadow; //min(shade,(shadow));
        
        // shade+=light2*0.00025;
        shade=shade*1.25;//+0.015;
        //shade=smoothstep(0.01, 0.95,shade);
        float cosr = max(dot(rd, reflect(LIGHT_DIR, n+pOffset)), 0.0);
        
        float phong = 0.9 * pow(cosr, 3.1);
        float phong2 = smoothstep(0.1,2.6,1.9 * pow(cosr, 40.0));
        float phong0 = 0.9 * pow(cosr, 1.1);
        phong0*=shadow*light1;
        phong*=shadow*light1;
        phong2*=shadow*light1;
        phong2*=2.0;
        //shade += min(1.0,pow(max(0.0,dot(n, LIGHT_DIR)),55.0));
        
        if(res.y>1.0)
        {
            //p.y-=terrainHeight(p.xz);
            // computer ray differentials
            float dt = dot( normalize(vec2(1.0,0.0)), normalize(n.yz) );
  			float angle = acos(dt);// * 180.0 / PI;
            
            p.y+=gcp_torso.y;
            //p.yz*=rm(angle);
            vec3 ddx_pos = ddx_ro - ddx_rd*dot(ddx_ro-p,n)/dot(ddx_rd,n);
            vec3 ddy_pos = ddy_ro - ddy_rd*dot(ddy_ro-p,n)/dot(ddy_rd,n);
			
            // calc texture sampling footprint		
            vec2 uv = p.yz;
            vec2 ddx_uv = ddx_pos.yz-uv;//texCoords( ddx_pos, mid ) - uv;
            vec2 ddy_uv = ddy_pos.yz-uv;//texCoords( ddy_pos, mid ) - uv;

            mat =0.0;//sin(p.y*40.0);//terrainTexture( uv, ddx_uv, ddy_uv );
            float coefAngle=1.0-smoothstep(0.25, 0.75, pow(abs(dot(rd, n)), 1.0/1.5));
            float coefDist=smoothstep(0.25, 0.85,pow( distance(ro, p) / MAX_DIST, 2.0));
            //mat=mix(mat, 0.5, coefAngle); 
            mat=1.0;//mix(mat, 0.5, coefDist);
            col = mat*shade;//*ao;
            col+=phong2+phong*0.125;
        }
        else
        {
            // float ns = smoothstep(0.1,0.14,fbm(p.xy*5.0));
            mat=smoothstep(0.3,0.3125,res.y)*0.05;
            // mat=0.07;
            float coefAngle=1.0-smoothstep(0.25, 0.85, pow(abs(dot(rd, n)), 1.0/0.5));
            float coefDist=smoothstep(0.25, 0.85,pow( distance(ro, p) / MAX_DIST, 2.0));
            mat=mix(mat, 0.00125, coefAngle);
            col = mat*shade;//*ao;
            col+=phong2+phong*0.05;//+phong0*0.125;
            
            // mat*=1.0-coefAngle*0.3;
        }
        
        
        //col=ao;
        //col = mat;
        
        //if(res.y < 0.5)
          //  col *=(0.7+f*0.25)*0.2, pow(distance(ro, p) * 1.0 / MAX_DIST, 0.25);
        //col = mix(col, sky, pow(distance(ro, p) * 1.0 / MAX_DIST, 3.5));
        
        // cheep outline
        float coefAngle=1.0-smoothstep(0.3, 0.5, pow(abs(dot(rd, n)), 1.0/1.15));
        // col=mix(col, 0.0, coefAngle); 
    }
    return col;
}

vec3 rd = vec3(0);
#ifdef BLENDER
    void main()
#else
    void calcRayForPixel( in vec2 pix, out vec3 resRo, out vec3 resRd)
    {
        vec2 uv = pix.xy / iResolution.xy;
        vec2 p = -1.0 + 2.0 * uv;
        p.x *= iResolution.x / iResolution.y;

        cTime=iTime;
        float camDist = 1.0+sin(cTime*0.4)*0.35;
        
        float T = iTime*0.5;
        
        //if(readKey(_1, true))
        {
            T=PI*0.5;
        }

        //if(readKey(_2, true))
        {
            T=sin(cTime*0.3)*PI;
        }

        //if(readKey(_3, true))
        {
            //T=PI*1.5;
        }

        //if(readKey(_4, true))
        {
            //T=PI*2.0;
        }
        
        float Y = PI*1.6;
		resRo = vec3(sin(T) * PI * 2.0, Y, cos(T) * PI * 2.0) * camDist;
        
        
        //if(readKey(_5, true))
        {
            //resRo = vec3(0.001, Y*2.0, 0.001) * camDist;
        }

        
        

        vec3 look = vec3(0.0, 2.0, 0.0);
        vec3 up = vec3(0.0, 1.0, 0.0);
        vec3 w = normalize(look - resRo);
        vec3 u = normalize(cross(w, up));
        vec3 v = normalize(cross(u, w));
        resRd = normalize(p.x * u + p.y * v + (10.0) * w);
    }
	void mainImage(out vec4 fragColor, in vec2 fragCoord)
#endif
{
    // TIME = iTime;
    // LIGHT_DIR = normalize(vec3(6.0, 8.5, -8.0));
    
    seed.x = 0.0;//hash11(fragCoord.x + iTime);
	seed.y = 0.0;//hash11(fragCoord.y + mod(iTime, float(iTime / 60.0)));
	seed.z = 0.0;//hash11(seed.x + seed.y + iTime);
	seed.w = 0.0;//hash11(dot(seed.xyz, vec3(1.0)));

#ifdef BLENDER
    vec3 ro = eye;
    float ml = min(iResolution.x, iResolution.y)/max(iResolution.x, iResolution.y)*0.96;
    vec2 p = (fragCoord.xy * 2.0 - iResolution) / min(iResolution.x, iResolution.y)*ml;
    rd = normalize(vec3(sin(fov) * p.x, sin(fov) * p.y, -cos(fov)));
    vec2 m = 0.0;
    mat3 camMat = calcLookAtMatrix(ro, lookat, 0.0);
    rd = normalize(camMat * rd);
#else
    vec3 ro = vec3(1);
    
    //calcRayForPixel(fragCoord, ro, rd);
    calcRayForPixel(fragCoord, gro, grd);
    calcRayForPixel( fragCoord + vec2(1.0,0.0), ddx_ro, ddx_rd );
	calcRayForPixel( fragCoord + vec2(0.0,1.0), ddy_ro, ddy_rd );
#endif
    float col = 0.0;
	col = render(gro, grd);
    // col = smoothstep(0.001,0.85,col);
    
    vec3 c = vec3(col);
	c.r = smoothstep(0.0005, .6, c.r-0.2);
	// c.g = smoothstep(0.0008, 1.0, c.g - 0.1);
	c.b = smoothstep(0.025, 0.5, c.b);
    c = pow(c,vec3(1.0/2.2));
    // c+=0.025;
    fragColor = vec4(c, 1.0);
}
 
 