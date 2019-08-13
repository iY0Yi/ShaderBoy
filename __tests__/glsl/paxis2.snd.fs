//https://www.shadertoy.com/view/XlSGDc
#define bps 8.0
float nofs(float n){//the song's "random" ring
    n=mod(n,8.0);
    if(n<1.0)return 0.0;
    if(n<2.0)return 1.0;
    if(n<3.0)return 2.0;
    if(n<4.0)return 3.0;
    if(n<5.0)return 5.0;
    if(n<6.0)return 4.0;
    if(n<7.0)return 3.0;
    return 0.0;
}

float scale(float note){//throws out dissonant tones
	float n2=mod(note,12.0);
	//if((n2==1.0)||(n2==3.0)||(n2==6.0)||(n2==8.0)||(n2==10.0))note=-100.0;//major
	if((n2==1.0)||(n2==4.0)||(n2==6.0)||(n2==9.0)||(n2==11.0))note=-100.0;//minor
	//if((n2==1.0)||(n2==4.0)||(n2==5.0)||(n2==9.0)||(n2==10.0))note=-100.0;//hungarian minor
	//if(note>96)note=96.0+n2;
	return note;
}
float ntof(float note){//note frequencies from wikipedia
	if(note<12.0)return 0.0;
	float octave=floor((note+0.5)/12.0)-5.0;
	note=mod(note,12.0);
	float nt=493.88;//b
    	if(note<0.5)nt=261.63;//c
	else if(note<1.5)nt=277.18;//c#
	else if(note<2.5)nt=293.66;//d
    	else if(note<3.5)nt=311.13;//d#
    	else if(note<4.5)nt=329.63;//e
    	else if(note<5.5)nt=349.23;//f
    	else if(note<6.5)nt=369.99;//f#
    	else if(note<7.5)nt=392.0;//g
    	else if(note<8.5)nt=415.30;//g#
    	else if(note<9.5)nt=440.0;//a
    	else if(note<10.5)nt=466.16;//a#
	return nt*pow(2.0,octave);
}

#define TAU 6.283185
#define wav cosine
// note number to frequency  from https://www.shadertoy.com/view/ldfSW2
//float ntof(float n){return (n>0.0)?440.0 * pow(2.0, (n - 67.0) / 12.0):0.0;}
vec2 cosine(vec2 t){return cos(TAU*t);}
vec2 sine(vec2 t){return sin(TAU*t);}
vec2 saw(vec2 t){return 2.0*(fract(t)-0.5);}
vec2 ssaw(vec2 t){return 4.0*(abs(fract(t)-0.5)-0.25);}
vec2 squar(vec2 t){return sign(fract(t)-0.5);}

float I(float tf, float c, float s){// taken from jnorberg https://www.shadertoy.com/view/lt2GRy
	float wf=c*24.0;//the number of harmonics to simulate
	vec2 w=vec2(0.125,1.125)+vec2(floor(wf));w*=2.0;
	float p=fract(tf),sw=1.0-2.0*p,ip=1.0-p;
	vec2 sinc=-wav(w*p)/(1.0+s*p)+wav(w*ip)/(1.0+s*ip);
	return (sw+mix(sinc.x,sinc.y,fract(wf)))*0.5;
}
vec2 inst(float n,float t,float bt,float pan,int i){
	float f=ntof(scale(n)),c=1.0,s=0.9,fo=3.0;
	if(f<12.0)return vec2(0.0);
	if(i==0)c=bt*0.2;
	else if(i==1){c=0.2-bt*0.2;fo=0.5;}
	else if(i==2){c=bt*0.1;s=0.3;fo=1.0;}
	else if(i==3){c=bt*2.0;fo=4.0;}
	else if(i==4){c=0.01;s=0.01;fo=0.125;}
	else {c=20.0-bt*20.0;fo=6.0;}
	float a=I(f*t,c,s);
	a*=exp(-bt*fo)*60.0/n;
	return vec2(a*(1.0-pan),a*pan);
}
vec2 inst2(float nn,float no,float of,float t,float bt,float pan,int i){
	return inst(nn+of,t,bt,pan,i)+inst(no+of,t,bt+1.0,pan,i);//plays new note and tail of last note
}

vec2 mainSound(float time)
{
	float tim=time*bps;
	float b=floor(tim);
	float t0=fract(tim),t1=mod(tim,2.0)*0.5,t2=mod(tim,4.0)*0.25;
	float n2=nofs(b*0.0625)+nofs(b*0.125)+nofs(b*0.25);
	float n1=n2+nofs(b*0.5),n0=n1+nofs(b);
	b-=1.0;//go back in time to finish old notes - clunky
	float n5=nofs(b*0.0625)+nofs(b*0.125)+nofs(b*0.25);
	float n4=n5+nofs(b*0.5),n3=n4+nofs(b);
	b-=1.0;
	n5=nofs(b*0.0625)+nofs(b*0.125)+nofs(b*0.25);
	n4=n5+nofs(b*0.5);
	b-=2.0;
	n5=nofs(b*0.0625)+nofs(b*0.125)+nofs(b*0.25);
	vec2 a0=inst2(n0,n3,72.0,time,t0,0.5,0);
	vec2 a1=inst2(n1,n4,60.0,time,t1,0.8,1);
	vec2 a2=inst2(n2,n5,48.0,time,t2,0.2,2);
	vec2 a1h=inst2(n1,n4,21.0,time,t1,0.6,3);
	vec2 a2h=inst2(n2,n5,43.0,time,t2,0.4,4);
	vec2 a1hb=inst(n1+4.0,time,t1,0.1,5);
	vec2 v=0.33*(a0+a1+a2+0.5*a1h+a2h+0.1*a1hb);
	return clamp(v,-1.0,1.0);
}
