
uniform float iBlockOffset;
uniform float iSampleRate;
void main()
{
    float t = iBlockOffset + ((gl_FragCoord.x-0.5) + (gl_FragCoord.y-0.5)*512.0)/iSampleRate;
    vec2 y = mainSound( t );
    vec2 v  = floor((0.5+0.5*y)*65536.0);
    vec2 vl =   mod(v,256.0)/255.0;
    vec2 vh = floor(v/256.0)/255.0;
    outColor = vec4(vl.x,vh.x,vl.y,vh.y);
}