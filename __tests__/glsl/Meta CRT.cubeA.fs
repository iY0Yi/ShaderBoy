// Shadertoy URL: https://www.shadertoy.com/view/4dlyWX

//    _    _ _____  _____     _____      _                                
//   | |  | |  __ \|  __ \   / ____|    | |                               
//   | |__| | |  | | |__) | | |    _   _| |__   ___ _ __ ___   __ _ _ __  
//   |  __  | |  | |  _  /  | |   | | | | '_ \ / _ \ '_ ` _ \ / _` | '_ \ 
//   | |  | | |__| | | \ \  | |___| |_| | |_) |  __/ | | | | | (_| | |_) |
//   |_|  |_|_____/|_|  \_\  \_____\__,_|_.__/ \___|_| |_| |_|\__,_| .__/ 
//                                                                 | |    
//                                                                 |_|    

// Convert a shadertoy LDR cubemap to HDR
// This at least gives us linear HDR filtering and mipmaps

void mainCubemap( out vec4 fragColor, in vec2 fragCoord, in vec3 rayOri, in vec3 rayDir )
{
    if ( iFrame > 120 )
        discard;
    fragColor = textureLod( iChannel0, rayDir, 0.0 );
    fragColor = fragColor * fragColor;
    float kEnvmapExposure = 0.999;
    fragColor = -log2(1.0 - fragColor * kEnvmapExposure);    
    return;
}