//Find the Restroom by eiffie based on Basic Maze Generator by stb https://www.shadertoy.com/view/XdKGWK
//Just playing with different maze styles.

const vec2 MazeSize = 4. * vec2(16., 9.);

#define rotateTo(p, a) mat2(a.y, a.x, -a.x, a.y) * p
vec2 tx_cos(vec2 a){return abs(mod(a,4.0)-2.0)-1.0;}
vec2 tx_cossin(float a){return tx_cos(vec2(a,a-1.0));}

float drawWall(in vec2 p, vec2 dr) {
    p = fract(rotateTo(p, dr)) - .5;
    p.y = max(0., -p.y);
    return length(p)-0.1;
}

#define t2D(o) textureLod(iChannel0, (o)/iResolution.xy, 0.0)
//clamp(o,vec2(.5), MazeSize-.5)/iResolution.xy)
float dot2(vec2 a){return dot(a,a);}
#define eq2(a,b) (dot2(a-(b))<0.01)
float RoundedIntersection(float a, float b, float r) {//modified from Mercury SDF http://mercury.sexy/hg_sdf/
	return max(max(a,b),length(max(vec2(0.0),vec2(r+a,r+b)))-r);
}
float Round(float a, float b, float r){return max(min(a,b),r)-length(max(vec2(0.0),vec2(r-a,r-b)));}
// From IQ's original 3D noise function. Ripped from Desert Canyon
float noise3D(in vec3 p){
	const vec3 s = vec3(7, 157, 113);
	vec3 ip = floor(p);p -= ip;p = p*p*(3. - 2.*p);
	vec4 h = vec4(0., s.yz, s.y + s.z) + dot(ip, s);
	h = mix(fract(sin(h)*4375.5453), fract(sin(h + s.x)*4375.5453), p.x);
	h.xy = mix(h.xz, h.yw, p.y);return mix(h.x, h.y, p.z); // Range: [0, 1].
}
vec2 rotate(vec2 v, float angle) {return cos(angle)*v+sin(angle)*vec2(v.y,-v.x);}
float ecyl(vec3 z, vec4 r){
	float f=length(z.xz*r.xy);
	return length(max(vec2(abs(z.y)-r.w,f*(f-r.z)/length(z.xz*r.xy*r.xy)),0.0));
}
float smin(float a,float b,float k){float h=clamp(0.5+0.5*(b-a)/k,0.0,1.0);return b+h*(a-b-k+k*h);}

const mat2 rm1=mat2(0.5403,-0.8415,0.8415,0.5403);
vec2 rts=vec2(0.0);
vec3 st1;
float DEP(vec3 z0){
	z0-=st1;
	z0*=20.0;
	z0.xz=rotate(z0.xz,rts.x+z0.y*rts.y/(1.0+length(z0.xz)));
	vec3 z=z0;z.y-=0.05;z.x=abs(z.x)-z.y*0.08;
	float d=ecyl(z,vec4(0.57,1.0,0.21,1.34))-0.48;//torso
	float x=abs(z0.x);
	z=vec3(x-0.6,z0.y+3.41,z0.z+0.12);
	float dl=ecyl(z,vec4(1.0,1.0,0.325,1.75))-0.23;//legs
	z=vec3(x-0.52,z0.y+1.32,z0.z+0.33);z.y*=0.8;
	float de=length(z)-0.6;//buns
	z=vec3(x-1.34,z0.y-0.85,z0.z+0.27);
	z.xy=z.xy*rm1;
	float da=ecyl(z.yxz,vec4(1.2,1.0,0.1-z.x*0.04,0.9))-0.17;//shoulders
	z.x-=0.95;
	float df=length(max(vec2(abs(z.y-0.82)-0.7-sin(z.x*50.0)*(z.y*0.01),length(z.xz)-0.02-abs(z.y-0.8)*0.05),0.0))-0.21;//forearm
	float dg=length(max(abs(z.xyz+vec3(0.22,-1.8,-0.05))-vec3(0.05,0.35,0.05),0.0))-0.05;//guns
	z=vec3(z0.x,z0.y-2.3,z0.z+0.14);
	float dn=length(max(vec2(abs(z.y)-0.5,length(z.xz)-0.1),0.0))-0.24;//neck
	d=smin(min(min(d,df),dl),min(de,min(da,dn)),0.24-max(0.16-da-0.4*abs(z0.y-0.9),0.0));
	z.y+=-0.47;z.y*=0.79;
	d=min(min(d,dg),length(z)-0.57);//head
	return d*0.05;
}
float id=0.0;
float DE(vec3 p0){
	float dgnd=p0.y+1.0,dtop=0.25-p0.y;
	vec2 p=p0.xz,fp=floor(p)+vec2(0.5);
	float wall=drawWall(p, t2D(fp).rg);
	for(float i=0.0; i<4.0; i++){
		vec2 dr=tx_cossin(i),dr2=t2D(fp-dr).rg;
       	if eq2(dr, dr2) wall = min(wall, drawWall(p, -dr2));
	}
	dgnd=min(dgnd,Round(wall,dtop,0.4));//edIntersection
	id=wall;
	dtop=DEP(p0);
	if(dtop<dgnd){dgnd=dtop;id=-1.0;}
	return min(dgnd,0.44);
}
vec2 brownConradyDistortion(vec2 uv)
{//from meshula https://www.shadertoy.com/view/MlSXR3
    // positive values of K1 give barrel distortion, negative give pincushion
    //float barrelDistortion1 = 1.0; // K1 in text books
    //float barrelDistortion2 = 1.0; // K2 in text books
    float r2 = uv.x*uv.x + uv.y*uv.y;
    //uv *= 1.0 + barrelDistortion1 * r2 + barrelDistortion2 * r2 * r2;
    uv*=1.0+r2+r2*r2;
    // tangential distortion (due to off center lens elements)
    // is not modeled in this function, but if it was, the terms would go here
    return uv;
}
float rnd,GoldenAngle;
float rand(){return fract(rnd+=GoldenAngle);}
void randomize(vec3 t){
	GoldenAngle=2.0-0.5*(1.0+sqrt(5.0));rnd=fract(sin(dot(t,vec3(13.13,117.17,43.34)))*4132.231);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
	randomize(vec3(fragCoord,iTime));
	vec2 uv=brownConradyDistortion((fragCoord-0.5*iResolution.xy)/iResolution.y);
	st1=texture(iChannel0,vec2(0.5,100.5)/iResolution.xy).rgb;
	vec4 st2=texture(iChannel0,vec2(1.5,100.5)/iResolution.xy);
	rts=st2.xy;
	vec3 ro=vec3(0.125*sin(iTime*0.25),0.1,-0.15),rd=normalize(vec3(uv,0.5));
	rd.yz=rotate(rd.yz,-0.1);
	ro.xz=rotate(ro.xz,-st2.w);rd.xz=rotate(rd.xz,-st2.w);
	ro+=st1;st1.y+=abs(cos(rts.y))*0.025;rts.y=sin(rts.y)*0.25;
	float t=0.0,d,od=1.0;
	for(int i=0;i<64;i++){
		t+=d=DE(ro+rd*t);
		if(d<0.001 || t>20.0)break;
		od=d;
	}
	ro+=rd*t;
	t=min(t,10.0);
	t/=10.0;
	vec3 col=vec3(0.1)*t;
	if(d<0.2){
		float dif=1.0-clamp(d/od,0.0,1.0);
		vec3 scol=vec3(1.0);
		if(id==-1.0){
			scol=vec3(0.9,0.6,0.3);
			ro-=st1;
			ro*=20.0;
			ro.xz=rotate(ro.xz,rts.x+ro.y*rts.y/(1.0+length(ro.xz)));
			float f=abs(ro.x)+ro.y*0.3;
			float d2=min(max(abs(ro.y)-2.0,f-1.0),2.2-f);
			scol=mix(vec3(0.2),scol,smoothstep(0.0,0.05,d2));
			if(ro.y>2.175)scol*=noise3D(vec3(atan(ro.x,ro.z)*10.0,ro.y,0.0));
			scol*=dif;
		}else{
			dif*=(1.5+rd.y)*clamp(0.2+id*3.0+abs(ro.y+1.0)*10.0,0.0,1.0);
			scol=vec3(0.5);
			if(ro.y<-0.9){
				vec2 p=abs(fract((ro.xz+vec2(ro.z,-ro.x))*5.0)-0.5);
				dif*=2.0*(0.5+abs(min(p.x,p.y)-0.25)-0.01);
				scol.gb*=dif*vec2(1.2,1.4);
			}else if(ro.y<-0.185){
				vec3 p=abs(fract(ro*vec3(4.0,8.0,4.0))-0.5);
				dif*=1.0+clamp(3.0*min(p.x,min(p.y,p.z)),0.0,0.1);
				scol=vec3(0.5,0.45,0.4);
            }else if(ro.y>0.24){
                vec2 p=abs(fract(ro.xz)-0.5);
                scol+=clamp(1.0-8.0*max(p.x,p.y),0.0,1.0);
            }
			scol*=dif;
			scol+=col;
		}
		col=mix(scol,col,t);
	}
	fragColor=vec4(col*(0.9+rand()*0.1),1.0);

}