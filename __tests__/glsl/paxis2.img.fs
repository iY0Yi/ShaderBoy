//https://www.shadertoy.com/view/XlSGDc

float rnd,sizer;
void randomize(in vec2 p){rnd=fract(sin(dot(p,vec2(13.3145,17.7391)))*317.7654321);}
vec3 fsign(vec3 p){return vec3(p.x<0.0?-1.0:1.0,p.y<0.0?-1.0:1.0,p.z<0.0?-1.0:1.0);}
vec3 paxis(vec3 p){//idea from dila originally at https://www.shadertoy.com/view/Xlj3DK
	vec3 a=abs(p);
	return fsign(p)*max(fsign(a-max(a.yzx,a.zxy)),0.0);
}
vec3 paxis2(vec3 p){
	vec3 a=abs(p);
	return fsign(p)*max(fsign(a-min(a.yzx,a.zxy)),0.0);
}

float DE(in vec3 p){
	float b=1.0;
	for(int i=0;i<3;i++){
		p-=paxis(p)*b*sizer;
		b*=0.5;
	}
	float d=length(p)-0.28;
	for(int i=0;i<4;i++){
		p-=paxis2(p)*b;
		b*=0.5;
	}
	p=abs(p);
	float d2=max(p.x,max(p.y,p.z))-b;
	return max(d2,-d);
}

vec4 mcol;
float CE(in vec3 p){
	float d=DE(p);
	if(p.y>-1.45){
		vec2 c=floor(p.xz)+p.xy*0.5;
		mcol+=vec4(vec3(cos(c.y)*sin(c.x),sin(c.y),cos(c.y)*cos(c.x))*0.33+0.66,0.2);
	}else mcol+=vec4(0.3,0.4,1.0,0.3);
	return d;
}

float ShadAO(in vec3 ro, in vec3 rd){
	float t=0.0,s=1.0,d,mn=0.01+0.04*rnd;
	for(int i=0;i<8;i++){
		d=max(DE(ro+rd*t)*1.5,mn);
		s=min(s,d/t+t*0.5);
		t+=d;
	}
	return s;
}
vec3 LightDir(in vec3 ro){
	float tim=iTime*0.1;
	vec3 LD=vec3(cos(tim),1.0,sin(tim))*0.707;
	return LD;
}
vec3 Backdrop(in vec3 rd){
	vec3 L=LightDir(rd);
	vec3 col=vec3(0.3,0.4,0.5)+rd*0.1+vec3(1.0,0.8,0.6)*(max(0.0,dot(rd,L))*0.2+pow(max(0.0,dot(rd,L)),40.0));
	col*=sqrt(0.5*(rd.y+1.0));
	return col;
}

vec3 scene(in vec3 ro, in vec3 rd){
	float d=DE(ro)*rnd*0.15,t=d,od=1.0,pxl=1.6/iResolution.y;
	vec4 dm=vec4(1000.0),tm=vec4(-1.0);
	for(int i=0;i<64;i++){
		d=DE(ro+rd*t);
		if(d<pxl*t && d<od && tm.w<0.0){dm=vec4(d,dm.xyz);tm=vec4(t,tm.xyz);}
		t+=min(d,0.1+t*t*0.04);
		od=d;
		if(t>20.0 || d<0.00001)break;
	}
	if(d<pxl*t && d<dm.x){dm.x=d;tm.x=t;}
	vec3 col=Backdrop(rd),fcol=col;
	for(int i=0;i<4;i++){
		if(tm.x<0.0)break;
		float px=pxl*tm.x;
		vec3 so=ro+rd*tm.x;
		mcol=vec4(0.0);
		vec3 ve=vec3(px,0.0,0.0);
		float d1=CE(so);
		vec3 dn=vec3(CE(so-ve.xyy),CE(so-ve.yxy),CE(so-ve.yyx));
		vec3 dp=vec3(CE(so+ve.xyy),CE(so+ve.yxy),CE(so+ve.yyx));
		vec3 N=(dp-dn)/(length(dp-vec3(d1))+length(vec3(d1)-dn));
		vec3 L=LightDir(so);
		vec3 scol=mcol.rgb*0.14;
		vec3 R=reflect(rd,N);
		float v=dot(-rd,N),l=dot(N,L);
		float shad=ShadAO(so+N*0.001,L);
		vec3 cc=vec3(0.6,0.8,1.0),lc=vec3(1.0,0.8,0.6);
		float cd=exp(-distance(ro,so));
		float spcl=pow(clamp(dot(R,L),0.0,1.0),10.0),spcc=pow(max(0.0,dot(R,-rd)),1.0+cd)*0.25;
		scol=scol*(cd*v*cc+shad*l*lc)+(cd*spcc*cc+shad*spcl*lc)*mcol.a;
		scol=clamp(scol,0.0,1.0);
		float fog=min(pow(tm.x,0.4)*0.3,1.0);
		scol=mix(scol,fcol,fog);
		col=mix(scol,col,clamp(dm.x/px,0.0,1.0));
		dm=dm.yzwx;tm=tm.yzwx;
	}
	if(col!=col)col=vec3(1.0,0.0,0.0);
	return clamp(col*2.0,0.0,1.0);
}
mat3 lookat(vec3 fw){
	fw=normalize(fw);vec3 rt=normalize(cross(fw,vec3(0.0,1.0,0.0)));return mat3(rt,cross(rt,fw),fw);
}
void mainImage(out vec4 fragColor, in vec2 fragCoord){
	randomize(fragCoord);
	vec3 rd=normalize(vec3((2.0*fragCoord-iResolution.xy)/iResolution.y,1.0));
	float tim=iTime;
	sizer=-0.05+abs(sin(tim*0.1));
	vec3 ro=vec3(cos(tim*0.6)*3.0,1.1+cos(tim*0.2),sin(tim*0.9));
	rd=lookat(-ro)*rd;
	//ro=eye;rd=normalize(dir);
	fragColor=vec4(scene(ro,rd),1.0);
}
