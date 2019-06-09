//https://www.shadertoy.com/view/ltsGz4

//llamels by eiffie (Z joints)
//license: use at your own peril
#define time iTime
#define size iResolution

float tim;

/* for reference since the rest of the code is messy here are the joint solvers
vec3 jsolve( vec3 a, vec3 b, float l1, float l2, vec3 rt )//from iq
{//single joint
	vec3 p=b-a,q=p*(0.5+0.5*(l1*l1-l2*l2)/dot(p,p) );
	return a+q+sqrt(max(0.0,l1*l1-dot(q,q)))*normalize(cross(p,rt));
}
void djsolve( vec3 a, vec3 b, vec3 l, vec3 rt, out vec3 j1, out vec3 j2 )//mod of iq's
{//double joint
	float l2=(l.y+l.z)*sqrt(length(a-b)/(l.x+l.y+l.z));
	vec3 p=b-a,q=p*(0.5+0.5*(l.x*l.x-l2*l2)/dot(p,p));
	j1=a+q+sqrt(max(0.0,l.x*l.x-dot(q,q)))*normalize(cross(p,rt));
	p=b-j1;q=p*(0.5+0.5*(l.y*l.y-l.z*l.z)/dot(p,p));
	j2=j1+q+sqrt(max(0.0,l.y*l.y-dot(q,q)))*normalize(cross(p,rt));
}
void zjsolve( vec3 j0, vec3 j3, vec3 l, vec3 rt, out vec3 j1, out vec3 j2 )//mod of iq's
{//Z joint, faster version
	float lx2z=l.x/(l.x+l.z),l2=l.y*lx2z;//scale to ratio of l.x to l.z and solve first joint
	vec3 u=(j3-j0)*lx2z,q=u*(0.5+0.5*(l.x*l.x-l2*l2)/dot(u,u));
	q+=sqrt(max(0.0,l.x*l.x-dot(q,q)))*normalize(cross(u,rt));
	j1=j0+q;j2=j3-q*(1.0-lx2z)/lx2z;//for j2 flip q and rescale to the length of l.z

}*/

float smin(float a,float b,float k){float h=clamp(0.5+0.5*(b-a)/k,0.0,1.0);return b+h*(a-b-k+k*h);}//from iq

float leg(vec3 p, vec3 j0, vec3 j3, vec3 l, vec4 r, vec3 rt){//z joint with tapered legs
	float lx2z=l.x/(l.x+l.z),h=l.y*lx2z;
	vec3 u=(j3-j0)*lx2z,q=u*(0.5+0.5*(l.x*l.x-h*h)/dot(u,u));
	q+=sqrt(max(0.0,l.x*l.x-dot(q,q)))*normalize(cross(u,rt));
	vec3 j1=j0+q,j2=j3-q*(1.0-lx2z)/lx2z;
	u=p-j0;q=j1-j0;
	h=clamp(dot(u,q)/dot(q,q),0.0,1.0);
	float d=length(u-q*h)-r.x-(r.y-r.x)*h;
	u=p-j1;q=j2-j1;
	h=clamp(dot(u,q)/dot(q,q),0.0,1.0);
	d=min(d,length(u-q*h)-r.y-(r.z-r.y)*h);
	u=p-j2;q=j3-j2;
	h=clamp(dot(u,q)/dot(q,q),0.0,1.0);
	return min(d,length(u-q*h)-r.z-(r.w-r.z)*h);
}

float DE(in vec3 p){//this is discontinous and inaccurate :)
	const vec3 rt=vec3(0.0,0.0,1.0);	
	p.y-=sin(p.x*1.3+sin(p.z*0.7))*0.125+sin(p.x*0.2+sin(p.z*0.3));//big cheat
	p.x-=tim*0.07;
	float dG=p.y+0.25;
	vec2 c=floor(p.xz);
	float sa=sin(c.x*2.0+c.y*4.5+tim*0.05)*0.15;
	p.xz=fract(p.xz)-vec2(0.5);
	float b=0.83-abs(p.z);
	p.xz+=vec2(0.125+sa,sa);
	float a=c.x+117.0*c.y+sign(p.x)*1.57+sign(p.z)*1.57+tim,ca=cos(a);
	vec3 j0=vec3(sign(p.x)*0.125,ca*0.01,sign(p.z)*0.05),j3=vec3(j0.x+sin(a)*0.1,max(-0.25+ca*0.1,-0.25),j0.z);
	float dL=leg(p,j0,j3,vec3(0.08,0.075,0.12),vec4(0.03,0.02,0.015,0.01),rt*sign(p.x));
	p.y-=0.03;
	float dB=(length(p.xyz*vec3(1.0,1.75,1.75))-0.14)*0.75;
	a=c.x+117.0*c.y+tim;ca=cos(a);sa*=0.4;
	j0=vec3(0.125,0.03+abs(ca)*0.03,ca*0.01),j3=vec3(0.3,0.07+ca*sa,sa);
	float dH=leg(p,j0,j3,vec3(0.075,0.075,0.06),vec4(0.03,0.035,0.03,0.01),rt);
	dB=smin(min(dL,dH),dB,clamp(0.04+p.y,0.0,1.0));
	a=max(abs(p.z),p.y)+0.05;
	return min(min(dB,min(a,b)),dG);
}

float rnd(vec2 co){return fract(sin(dot(co,vec2(13.42,117.853)))*412.453);}
float noyz(vec2 p){
	vec2 c=floor(p),f=fract(p),v=vec2(1.0,0.0);
	return mix(mix(rnd(c),rnd(c+v.xy),f.x),mix(rnd(c+v.yx),rnd(c+v.xx),f.x),f.y);
}
vec3 mcol;
float CE(vec3 p){
	float d=DE(p);
	float h=sin(p.x*1.3+sin(p.z*0.7))*0.125+sin(p.x*0.2+sin(p.z*0.3));
	p.y-=h;
	float dG=p.y+0.25;
	vec3 col=vec3(0.0);
	vec2 v;
	if(dG<0.01){
		col=vec3(0.12,0.3,0.1)*(0.5+0.4*h);
		v=p.xz;
	}else{//llamel
		if(dG>0.03){
			col=vec3(0.9,0.4,0.3);
		}
		p.x-=tim*0.07;
		v=vec2(p.x,p.z);
	}
	float n=noyz(v*160.0);
	col+=vec3(0.3,0.3,0.0)*n;
	mcol+=col;
	return d-n*0.004;
}

float shadao(vec3 ro, vec3 rd, float px){//pretty much IQ's SoftShadow
	float res=1.0,d,t=px*10.0;
	for(int i=0;i<12;i++){
		d=max(0.0,DE(ro+rd*t)*1.5);
		t+=d;
		if(d<px*2.5)return 0.0;
		res=min(res,22.0*d/t);
	}
	return res;
}


mat3 lookat(vec3 fw){
	fw=normalize(fw);vec3 rt=normalize(cross(fw,vec3(0.0,1.0,0.0)));return mat3(rt,cross(rt,fw),fw);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
    tim = time*5.0;
	vec3 ro=vec3(17.0,1.3,-1.5);
	vec3 dr=vec3((2.0*fragCoord.xy-size.xy)/size.y,2.0);
	vec3 rd=normalize(dr);
	float px=2.5/(size.y*dot(rd,dr));
	rd=lookat(vec3(-0.25,-0.3,0.5))*rd;
	vec3 col=mix(vec3(1.0,0.7,0.3),vec3(0.3,0.7,1.0),0.5+rd.y);
	float t=DE(ro)*(0.5+0.5*rnd(fragCoord.xy)),d,dm=10.0,tm;
	for(int i=0;i<48;i++){
		t+=d=DE(ro+rd*t);
		if(d<dm){dm=d;tm=t;}
		if(t>100.0 || d<0.00001)break;
	}
	dm=max(0.0,dm);
	if(dm<px*tm){
		ro+=rd*tm;
		mcol=vec3(0.0);
		vec2 e=vec2(px*tm,0.0);
		float d0=CE(ro);
		vec3 dn=vec3(CE(ro-e.xyy),CE(ro-e.yxy),CE(ro-e.yyx));
		vec3 dp=vec3(CE(ro+e.xyy),CE(ro+e.yxy),CE(ro+e.yyx));
		mcol*=0.143;
		vec3 N=(dp-dn)/(length(dp-vec3(d0))+length(vec3(d0)-dn));
		vec3 L=normalize(vec3(-0.11,0.74,0.19)),H=normalize(L-rd);
		float h=max(0.001,dot(N,H)),l=max(0.001,dot(N,L)),v=max(0.001,dot(N,-rd));
		float shad=0.0;
		if(l>0.001)shad=shadao(ro,L,px*tm);
		shad=clamp(shad+0.1,0.0,1.0);
		vec3 scol=(mcol*vec3(0.4+0.2*h,0.5,0.6-0.2*h) + (1.5-v)*pow( h, 6.0))*shad*l;
		col=mix(clamp(scol,0.0,1.0),col,clamp(1.0-exp(-0.1*tm)+dm/(px*tm),0.0,1.0));
	}
	fragColor=vec4(col,1.0);
}