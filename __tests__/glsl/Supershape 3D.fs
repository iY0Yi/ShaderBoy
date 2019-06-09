//https://www.shadertoy.com/view/4llGWM
//SuperShape 3d by eiffie based on mickdermack's 2d formula

#define time iTime
#define size iResolution

vec4 S1,S2;//m,n1,n2,n3

//from mickdermack https://www.shadertoy.com/view/MdXXDB
float SuperFormula(float phi, float a, float b, float m, float n1, float n2, float n3){
	return pow((pow(abs(cos(m*phi/4.0)/a),n2) + pow(abs(sin(m*phi/4.0)/b), n3)), -(1.0/n1));
}
float SuperShape3D(in vec3 p){
	float d=length(p);//the distance to the center of the shape
	float sn=p.z/d;//the sine of rho (the angle between z and xy)
	float phi=atan(p.y,p.x),rho=asin(sn);//the angles to feed the formula
	float r1=SuperFormula(phi,0.75+0.25*sin(time),1.0,S1.x,S1.y,S1.z,S1.w);
	float r2=SuperFormula(rho,1.0,1.0,S2.x,S2.y,S2.z,S2.w);//the radii
	//vec3 np=r2*vec3(r1*cos(rho)*vec2(cos(phi),sin(phi)),sin(rho));//reconstituted point
	//d-=length(np);//the distance to this point
	d-=r2*sqrt(r1*r1*(1.0-sn*sn)+sn*sn);//same as above but optimized a bit
	return d;

}
float DDE(in vec3 p, in vec3 rd){
	float d=SuperShape3D(p),s=d*0.5;
	float dr=(d-SuperShape3D(p+rd*s))/s;
	return d/(1.0+max(dr,0.0));
}

float rnd(vec2 c){return fract(sin(dot(vec2(1.317,19.753),c))*413.7972);}
float rndStart(vec2 fragCoord){
	return 0.5+0.5*rnd(fragCoord.xy+vec2(time*217.0));
}
float shadao(vec3 ro, vec3 rd, float px,vec2 fragCoord){//pretty much IQ's SoftShadow
	float res=1.0,d,t=2.0*px*rndStart(fragCoord);
	for(int i=0;i<12;i++){
		d=max(px,DDE(ro+rd*t,rd)*1.5);
		t+=d;
		res=min(res,d/t+t*0.1);
	}
	return res;
}
vec3 Sky(vec3 rd){//what sky??
	return vec3(0.5+0.5*rd.y);
}
vec3 L;
#define SE SuperShape3D
vec3 Color(vec3 ro, vec3 rd, float t, float px, vec3 col, bool bFill, vec2 fragCoord){
	ro+=rd*t;
	float d=SE(ro);
	vec2 e=vec2(px*t,0.0);
	vec3 dn=vec3(SE(ro-e.xyy),SE(ro-e.yxy),SE(ro-e.yyx));
	vec3 dp=vec3(SE(ro+e.xyy),SE(ro+e.yxy),SE(ro+e.yyx));
	vec3 N=(dp-dn)/(length(dp-vec3(d))+length(vec3(d)-dn));
	vec3 R=reflect(rd,N);
	vec3 lc=vec3(1.0,0.9,0.8),sc=sqrt(abs(sin(ro))),rc=Sky(R);
	float sh=clamp(shadao(ro,L,px*t,fragCoord)+0.2,0.0,1.0);
	sh=sh*(0.5+0.5*dot(N,L))*exp(-t*0.125);
	vec3 scol=sh*lc*(sc+rc*pow(max(0.0,dot(R,L)),4.0));
	if(bFill)d*=0.02;
	col=mix(scol,col,clamp(d/(px*t),0.0,1.0));
	return col;
}
mat3 lookat(vec3 fw){
	fw=normalize(fw);vec3 rt=normalize(cross(fw,vec3(0.0,1.0,0.0)));return mat3(rt,cross(rt,fw),fw);
}

vec4 Setup(float t){
	t=mod(t,8.0);
	if(t<1.0)return vec4(6.75,3.0,4.0,17.0);
	if(t<2.0)return vec4(12.0,15.0,20.0,3.0);
	if(t<3.0)return vec4(5.0,2.0,6.0,6.0);
	if(t<4.0)return vec4(4.0,1.0,1.0,1.0);
	if(t<5.0)return vec4(8.0,1.0,1.0,8.0);
	if(t<6.0)return vec4(2.0,2.0,2.0,2.0);
	if(t<7.0)return vec4(5.0,1.0,1.0,1.0);
	return vec4(3.0,4.5,10.0,10.0);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
	float px=1.0/size.y;
	L=normalize(vec3(0.4,0.8,-0.6));
	float tim=time;
	
	vec3 ro=vec3(cos(tim),0.4,sin(tim))*5.0;
	vec3 rd=lookat(vec3(-0.1)-ro)*normalize(vec3((2.0*fragCoord.xy-size.xy)/size.y,3.0));
	
	tim*=0.7;
	S1=mix(Setup(tim-1.0),Setup(tim),smoothstep(0.0,1.0,fract(tim)*2.0));
	tim=tim*0.9+2.5;
	S2=mix(Setup(tim-1.0),Setup(tim),smoothstep(0.0,1.0,fract(tim)*2.0));

	float t=DDE(ro,rd)*rndStart(fragCoord),d=0.0,od=10.0;
	vec2 edge=vec2(-1.0);
	bool bGrab=false;
	vec3 col=Sky(rd);
	for(int i=0;i<64;i++){
		t+=d;
		d=DDE(ro+rd*t,rd);
		if(d>od){
			if(bGrab && od<px*t && edge.x<0.0){
				edge=vec2(edge.y,t-od);
				bGrab=false;
			}
		}else bGrab=true;
		od=d;
		if(t>1000.0 || d<0.00001)break;
	}
	bool bFill=false;
	d*=0.02;
	if(d<px*t && t<1000.0){
		if(edge.x>0.0)edge=edge.yx;
		edge=vec2(edge.y,t);
		bFill=true;
	}
	for(int i=0;i<2;i++){
		if(edge.y>0.0)col=Color(ro,rd,edge.y,px,col,bFill,fragCoord);
		edge=edge.yx;
		bFill=false;
	}
	fragColor = vec4(2.0*col,1.0);
}
