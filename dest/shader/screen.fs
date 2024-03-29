////////////////////////////////////////
//
// Screen Shader:
// just draw color buffer to screen.
//
////////////////////////////////////////
uniform vec3 iResolution;// viewport resolution (in pixels)
uniform sampler2D frameTexture;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	fragColor = texture(frameTexture, fragCoord.xy/iResolution.xy);
}