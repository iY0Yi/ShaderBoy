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


//
//
// Commmons
//
//
#define PI 3.14159265
#define HALF_PI 1.5707963267948966
#define TAU (2*PI)
#define PHI (sqrt(5)*0.5 + 0.5)
#define MIN_DIST 0.01
#define MAX_DIST 300.0
#define ITERATION 300
#define saturate(x) clamp(x, 0, 1)


float TIME = 0.0;
vec4 seed = vec4(0);
float rnd(inout vec4 n){
    const vec4 q=vec4(1225.0,1585.0,2457.0,2098.0);
    const vec4 r=vec4(1112.0,367.0,92.0,265.0);
    const vec4 a=vec4(3423.0,2646.0,1707.0,1999.0);
    const vec4 m=vec4(4194287.0,4194277.0,4194191.0,4194167.0);
    vec4 beta=floor(n/q);
    vec4 p=a*(n-beta*q)-beta*r;
    beta=(sign(-p)+vec4(1.0))*vec4(0.5)*m;
    n=(p+beta);
    return fract(dot(n/m,vec4(1.0,-1.0,1.0,-1.0)));
}

highp float hash(highp float seed){return fract(sin(seed)*43758.5453);}

const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

float hash( vec2 p )
{
    float h = dot(p,vec2(127.1,311.7));
    return -1.0 + 2.0*fract(sin(h)*43758.5453123);
}

float noise( in vec2 p )
{
    vec2 i = floor( p );
    vec2 f = fract( p );
    
    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( hash( i + vec2(0.0,0.0) ), 
                     hash( i + vec2(1.0,0.0) ), u.x),
                mix( hash( i + vec2(0.0,1.0) ), 
                     hash( i + vec2(1.0,1.0) ), u.x), u.y);
}

float fbm( vec2 p )
{
    float f = 0.0;
    f += 0.5000*noise( p ); p = m*p*2.02;
    f += 0.2500*noise( p ); p = m*p*2.03;
    f += 0.1250*noise( p ); p = m*p*2.01;
    f += 0.0625*noise( p );
    return f/0.9375;
}

vec2 fbm2( in vec2 p )
{
    return vec2( fbm(p.xy), fbm(p.yx) );
}

//
//
// "Hash without Sine" by Dave_Hoskins
// https://www.shadertoy.com/view/4djSRW
//
//
// #define HASHSCALE1 .1031 /*Use this for integer stepped ranges, ie Value-Noise/Perlin noise functions.*/
#define HASHSCALE1 443.8975 /*For smaller input rangers like audio tick or 0-1 UVs use these...*/
float hash11(float p){vec3 p3 = fract(vec3(p) * HASHSCALE1);p3 += dot(p3, p3.yzx + 19.19);return fract((p3.x + p3.y) * p3.z);}
float hash12(vec2 p){vec3 p3 = fract(vec3(p.xyx) * HASHSCALE1);p3 += dot(p3, p3.yzx + 19.19);return fract((p3.x + p3.y) * p3.z);}
float hash13(vec3 p3){p3 = fract(p3 * HASHSCALE1);p3 += dot(p3, p3.yzx + 19.19);return fract((p3.x + p3.y) * p3.z);}


//
// "glsl-easings":
// https://github.com/glslify/glsl-easings
//
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

vec3 rotx(vec3 p,float rx){float sinx=sin(rx);float cosx=cos(rx);return mat3(1.,0.,0.,0.,cosx,sinx,0.,-sinx,cosx)*p;}
vec3 roty(vec3 p,float ry){float sinx=sin(ry);float cosx=cos(ry);return mat3(cosx,0.,-sinx,0.,1.,0.,sinx,0.,cosx)*p;}
vec3 rotz(vec3 p,float rz){float sinx=sin(rz);float cosx=cos(rz);return mat3(cosx,sinx,0.,-sinx,cosx,0.,0.,0.,1.)*p;}
vec3 rot(vec3 p,vec3 r){return rotx(roty(rotz(p,r.z),r.y),r.x);}
float sgn(float x){return(x<0.0)?-1.0:1.0;}
vec2 sgn(vec2 v){return vec2((v.x<0.0)?-1.0:1.0,(v.y<0.0)?-1.0:1.0);}
float vmax(vec3 v){return max(max(v.x, v.y), v.z);}

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

vec3 grd = vec3(0);
float dBox( in vec3 ro, in float center){vec3 m = 1.2 / grd;vec3 t = -m * ro + abs(m) * (center*0.5+MIN_DIST);return min(min(t.x, t.y), t.z);}
float dBox2D( in vec2 ro, in float center){vec2 m = 1.2 / grd.xz;vec2 t = -m * ro + abs(m) * (center*0.5+MIN_DIST);return min(t.x, t.y);}


//Each shader
struct ObjData
{
	vec2 position;
	vec2 velocity;
    vec2 spawn;
	float state;
	float timer;
};
#define GRID_SIZE 256.0
#define EMPTY_OBJ_PARAM -2.0
#define EMPTY_SHELL_PARAM -3.0
vec2 bx_cos(vec2 a){return clamp(abs(mod(a,8.0)-4.0)-2.0,-1.0,1.0);}
vec2 bx_cossin(float a){return bx_cos(vec2(a,a-2.0));}
float bx_length(vec2 p){return max(abs(p.x),abs(p.y));}
bool exists(ObjData obj){return (obj.position.x>-1.5);}
#define WRITE_DATA(data) fragColor=data
#define OUT_OF_GRID vec4(0.5,0.5,0.0,0.0)

bool isInGrid(vec2 u){return (min(u.x,u.y)<0.5 || max(u.x,u.y)>GRID_SIZE*2.0-0.5);}

vec4 packObjData(in ObjData objData, in int mode)
{
	vec4 packedObjData;
    if(mode==0)
    {
    	packedObjData.xy = objData.position;
    	packedObjData.zw = objData.velocity;
    }
    else
    {
        packedObjData.xy = objData.spawn;
    	packedObjData.zw = vec2(objData.state, objData.timer);
    }
    return packedObjData;
}
ObjData fetchObjData(vec2 u, sampler2D buffer, vec2 res)
{
    ObjData objData;
	vec4 packedObjData = isInGrid(u)?OUT_OF_GRID:texture(buffer,u/res.xy);
    objData.position = packedObjData.xy;
	objData.velocity = packedObjData.zw;
    u.x+=GRID_SIZE;
    packedObjData = isInGrid(u)?OUT_OF_GRID:texture(buffer,u/res.xy);
    objData.spawn = packedObjData.xy;
	objData.state = packedObjData.z;
	objData.timer = packedObjData.w;
	return objData;
}