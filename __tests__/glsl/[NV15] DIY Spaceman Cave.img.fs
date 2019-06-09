//https://www.shadertoy.com/view/Xlj3Rh

// DIY Spaceman Cave by eiffie
// Stole a bit from kali on this one.
#define PI 3.1416
#define SUN vec3(0.73,0.1,0.689)

float tym,ftym,ud1,ud2,ud3=0.0;
int iStop;
void Setup(float t){
	tym=t*0.2;
	iStop=int(floor(tym));
	if(tym<3.4){
		float ft=fract(tym);
		ftym=clamp(ft*5.0,0.0,1.0);
		if(ft<0.2){ud1=0.66;ud2=ftym*0.33;}
		else if(ft<0.4){ft=(ft-0.2)*5.0;ud1=mix(0.66,1.0,ft);ud2=mix(0.33,0.0,ft);}
		else if(ft<0.6){ft=(ft-0.4)*5.0;ud1=1.0;ud2=ft;}
		else if(ft<0.8){ft=(ft-0.6)*5.0;ud1=1.0-ft;ud2=1.0-ft;}
		else {ft=(ft-0.8)*5.0;ud1=mix(0.0,0.66,ft);ud2=0.0;}
	}else{
		if(tym<12.0 || mod(tym,6.0)>3.0){
			ud1=1.0;
			ud2=0.0;
			ftym=min(1.0+tym-3.4,2.0);
			ud3=clamp(tym*0.2-1.0,0.0,0.4);
		}else{ud1=1.0;ud2=1.0;ftym=2.0;}
	}
}

vec2 rotate(vec2 v, float angle) {return cos(angle)*v+sin(angle)*vec2(v.y,-v.x);}

float Oct(in vec3 p, float r1){p=abs(p);return 0.577*(p.x+p.y+p.z-r1);}
vec2 TubeFrame(in vec3 p){
	p=abs(p);
	p.x-=1.0;
	vec3 b=vec3(-1.0,ud1,ud2);
	float t=clamp(dot(p,b)/dot(b,b),0.0,1.0);
	return vec2(length(p-b*t)-0.03+clamp((abs(fract(t*4.0)-0.5)-0.25)*0.1,0.0,0.01),t);
}
void Srp(inout vec4 p, inout int iCnt){
	p = abs(p)*2.0;
	if (p.x<p.y){p.xy = p.yx;iCnt++;}
	if (p.x<p.z)p.xz = p.zx;
	if (p.y<p.z)p.yz = p.zy;
	p.x-=1.0;
}

float DE(in vec3 p0){
	vec4 p=vec4(p0,1.0);
	int iCnt=0;
	for (int n = 0; n < 3; n++) {
		if(n==iStop)break;
		if(n==2 && ud3>0.0)p.yz=rotate(p.yz,ud3);
		Srp(p,iCnt);
	}
	vec4 pL=p;
	float d=100.0;
	if(ftym>1.0 && iCnt>1){
		pL.x+=ftym-2.0;
		d=Oct(pL.xyz,ftym-1.0)/pL.w;
	}
	Srp(p,iCnt);
	if(ftym<1.0)p=mix(pL,p,ftym);
	d=min(d,TubeFrame(p.xyz).x/p.w);
	return d;
}
vec4 mcol;
#define fld vec3(1.,5.,2.)
float AlienTechLikeThingy(in vec3 p,float x){//from kali
	p=abs(0.5-fract(p*0.4+tym+x))*1.25;
	float l=0.0, expsmo=0.0,ot=1000.0;
	for (int i = 0; i < 2; i++) { 
		p=clamp(p,-fld,fld)*2.0-p;
		p*= -1.5/min(dot(p, p)+0.005, 1.);
		p+= fld;
		float pl = l;
		l = length(p);
		expsmo+= exp(-1. / abs(l - pl));
		ot=min(ot,l);
		p=clamp(p,-fld,fld)*2.0-p;
		p/= min(dot(p, p)+0.01, 1.);
		p = p* -1.5 + fld;
	}
	mcol+=ud3*vec4(p.xyz,max(0., 2. - ot) )*0.5;
	return ud3*expsmo;
}
float CE(in vec3 p0){
	float x=p0.x;
	vec4 p=vec4(p0,1.0);//+sin(p0.yzx*10.0)*0.03*ud3
	int iCnt=0;
	for (int n = 0; n < 3; n++) {
		if(n==iStop)break;
		if(n==2 && ud3>0.0)p.yz=rotate(p.yz,ud3);
		Srp(p,iCnt);
	}
	vec4 pL=p;
	float d=100.0;
	if(ftym>1.0 && iCnt>1){
		pL.x+=ftym-2.0;
		d=Oct(pL.xyz,ftym-1.0)/pL.w;
	}
	Srp(p,iCnt);
	if(ftym<1.0)p=mix(pL,p,ftym);
	vec2 d2=TubeFrame(p.xyz);
	d2.x/=p.w;
	if(d2.x<d){
		mcol+=vec4(vec3(4.0*(1.0-abs(fract(d2.y*4.0)-0.5))),-3.0+d2.y);//abs(sin(d2.y*10.0))),-3.0+d2.y);
		d=d2.x;
	}else{
		if(ud3>0.0)d-=AlienTechLikeThingy(pL.xyz*3.0,x)*0.0325;
	}
	return d;
}

float rand(vec2 co){//from Dave Hoskins
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
vec2 rand2(vec2 co){
    return fract(sin(vec2(dot(co.xy ,vec2(12.9898,78.233)),dot(co.yx,vec2(13.1898,73.231)))) * 43758.5453);
}

float stars(in vec2 p){
	float d=1.0;
	p=p*3.0;
	vec2 c=floor(p),f=fract(p),v=vec2(60.0,10.0);
	vec2 r=rand2(c)*0.8-f+0.1;
	r*=1.0+rand(c.yx);
	d=min(d,min(length(r*v),length(r*v.yx)));
	p=p*(10.0-abs(p.y)*2.0);
	c=floor(p);f=fract(p);
	r=rand2(c)*0.9-f+0.05;
	r*=1.0+rand(c.yx);
	d=min(d,10.0*length(r));
	return d;
}
vec3 Space(in vec3 rd){
	vec2 p=vec2(atan(rd.z,rd.x)*1.4,rd.y);
	float d=stars(p);
	vec3 col=vec3(1.0-d-abs(rd.y)*2.0)+rd*0.1;
	d=pow(max(0.0,dot(SUN,rd)),100.0);
	col+=mix(vec3(0.0,0.2,0.0),10.0*vec3(1.0,0.7,0.4),d);
	d=pow(max(0.0,dot(SUN.zyx,rd)),200.0);
	col=mix(col,vec3(0.0),d*0.2);
	return col;
}

float Waves(vec2 p, float tm){
	float h=0.0;
	mat2 m=mat2(0.78,1.21,-1.21,0.78);
	p+=3.0*sin(p.yx*0.1);
	for(float i=2.0;i<5.0;i+=1.0){
		h+=sin(p.x+sin(p.y+11.0*tm)+tm)/i;
		p=p*m;
	}
	return clamp(h*0.5+0.75,0.0,1.0);
}
float shad(in vec3 ro, in vec3 rd, float rnd){
	float t=abs(DE(ro))*rnd;
	for(int i=0;i<14;i++){
		t+=abs(DE(ro+rd*t));
	}
	return clamp(t,0.0,1.0);
}
vec3 scene(in vec3 ro, in vec3 rd, in vec2 uv){
	vec3 col=Space(rd),V=normalize(ro)+rd;
	float rnd=rand(uv),t=rnd*DE(ro),d,dm=0.25,g=0.0;
	for(int i=0;i<48;i++){
		t+=d=DE(ro+rd*t);
		dm=min(d,dm);
		g+=0.04+0.005*rnd;
		if(t>6.0 || d<0.002)break;
	}
	g*=g;
	if(d<0.01){	
		mcol=vec4(0.0);g*=0.5;
		vec2 v=vec2(0.005,0.0);
		ro+=rd*t;
		vec3 N=normalize(vec3(CE(ro+v.xyy)-CE(ro-v.xyy),CE(ro+v.yxy)-CE(ro-v.yxy),CE(ro+v.yyx)-CE(ro-v.yyx)));
		vec3 R=reflect(rd,N);
		mcol.rgb=abs(sin(mcol.rgb))*0.25+0.5;
		col=mcol.rgb*max(0.0,dot(-rd,N))*0.2+mcol.rgb*max(0.0,dot(N,SUN))*shad(ro+N*0.01,SUN,rnd);
		if(mcol.w>=0.0){
			col+=clamp(Space(R)*0.5,0.0,0.5);
			col+=pow(min(mcol.w,1.0), 4.0) * vec3(1.0,0.5,0.1) * (1.0 + sin(tym * 5.0 - ro.y * 10.0) );//stolen from kali
		}else{
			if(tym<6.0)col+=abs(vec3(sin(tym*6.0),1.0,cos(tym*6.0)))*clamp(mcol.w+10.0*sin(tym*20.0+ro.z+ro.y),0.0,1.0);
		}
	}else{
		V=normalize(V);
		uv=-vec2(atan(V.z,V.x),V.y);
		g*=mix(Waves(uv*20.0,tym*5.0),1.0,min(dm*4.0+(0.4-ud3)*2.5,1.0));
	}
	col+=vec3(0.3,0.6,1.0)*g;
	return col;
}
mat3 lookat(vec3 fw){
	fw=normalize(fw);vec3 rt=normalize(cross(fw,vec3(0.0,1.0,0.0)));return mat3(rt,cross(rt,fw),fw);
}
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	float tim=iTime;
	Setup(tim);
	vec2 uv=fragCoord.xy/iResolution.xy;
	tim*=0.5;
	vec3 ro=vec3(cos(tim),cos(tim*0.3)*0.5,cos(tim*0.7))*min(0.5+tim*0.1+cos(tim*0.4)*0.5,1.5);
	vec3 rd=lookat(-ro)*normalize(vec3((fragCoord.xy-0.5*iResolution.xy)/iResolution.y,1.0));
	vec3 color=scene(ro,rd,fragCoord.xy);
	color=clamp(color,0.0,min(tim,1.0));
	fragColor = vec4(color,1.0);
}
