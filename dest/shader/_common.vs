#version 300 es
precision highp float;
in vec2 a_position;
uniform vec2 iResolution;

void main(void)
{
    vec2 uv = a_position;
    gl_Position = vec4(uv, 0.0, 1.0);
}
