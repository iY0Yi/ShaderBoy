//https://www.shadertoy.com/view/Xlj3Rh

//chords to Space Oddity intro used without permission

#define PI 3.1416
float rnd(float t){return 2.0*(fract(sin(t+sin(t))*33113.31541)-.5);}//from Dave Hoskins
float noyz(float t){return mix(rnd(floor(t)),rnd(floor(t)+1.0),fract(t));}

#define SPEEDOFSOUND 10.0
#define DAMPING 1.0
float snd(float time){
	float a1=noyz(700.0*time)*clamp(time*0.04-1.0,0.0,2.0);
	if(time<17.0)a1+=rnd(1764.6*time)*clamp(0.15-fract(time),0.0,1.0);
	if(time>17.0 && time<30.0)a1+=sin(time*2764.6*2.0)*clamp(sin(time*4.0)-0.5,0.0,1.0);
	return a1;
}
float phys(float time, float dist){
	float tim=time-dist/SPEEDOFSOUND;
	return snd(tim)*exp(-dist*DAMPING);
}
vec3 herert(vec3 fw,vec3 up){
	fw=normalize(fw);return normalize(cross(fw,normalize(up)));
}


#define bps 3.0

#define C1 261.63
#define D1 293.66
#define E1 329.63
#define F1 349.23
#define G1 392.0
#define A1 440.0
#define B1 493.88

float amp(float t, float b){
	t-=b;
	return clamp(t*10.0,0.0,1.0)*exp(-t);
}
float att(float t){
	t=mod(t,32.0);
	float a=0.0;
	a+=amp(t,0.0);
	a+=amp(t,3.0);
	a+=amp(t,4.0);
	a+=amp(t,7.0);
	a+=amp(t,9.0);
	a+=amp(t,10.0);
	a+=amp(t,13.0);
	a+=amp(t,14.0);
	return a;
}
vec2 mainSound(float time)
{
	float tim=time*bps,T=time*PI;
	float EMinor=sin(T*E1)+sin(T*G1)+sin(T*B1)+sin(T*2.0*D1)+sin(T*2.0*E1);
	float FMajor=sin(T*F1)+sin(T*A1)+sin(T*2.0*C1)+sin(T*2.0*F1);
	EMinor*=att(tim);
	FMajor*=att(tim+16.0);
		
	tim=time*0.5;
	vec3 ro=vec3(cos(tim),cos(tim*0.3)*0.5,cos(tim*0.7))*min(0.5+tim*0.1+cos(tim*0.4)*0.5,1.5);
	vec3 rd=-ro;

	vec3 rt=0.1*herert(rd,vec3(0.0,1.0,0.0));
	float d1=length(ro-rt),d2=length(ro+rt);
	float a1=phys(time,d1),a2=phys(time,d2);

	return vec2(EMinor,FMajor)*0.2+vec2(a1,a2);
}
