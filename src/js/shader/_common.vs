#version 300 es
precision highp float;
in vec2 a_position;
uniform vec2 iResolution;

void main(void)
{
    // float ratio = iResolution.x/iResolution.y;
    vec2 uv = a_position;
    // uv.y*=ratio;
    gl_Position = vec4(uv, 0.0, 1.0);
}
