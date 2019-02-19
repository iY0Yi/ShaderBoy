<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/_index/img/sb_logo_1240x600.png"></br>
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/_index/img/sb_example.png"></br>
##### *UPDATE: Multipass Shader, GoogleDrive integration, Recording HD video and so on!*  
<strong>ShaderBoy</strong> is a tiny shader editor for mobile devices.</br>
It is intended to use [physical keyboards](https://www.google.co.jp/search?q=smartphone+bluetooth+keyboard&source=lnms&tbm=isch&sa=X&ved=0ahUKEwi-kZzK_4fdAhXRdd4KHSp3BOcQ_AUICigB&biw=1440&bih=781) to write shaders on a small screen.</br>
It has compatible uniforms with <a href="https://www.shadertoy.com/"><em>Shadertoy</em></a>.</br>
And you need Google account, because ShaderBoy works with GoogleDrive to save your shaders.

Enjoy writing your shaders in everywhere.</br>
in Bed, Toilet, Train, Camping, Fishing...
Your power to go.</br>
  
###### *This is "NOT" Shadertoy official!* 

</br>
</br>
</br>
  
# App
ShaderBoy is a *PWA(Progressive Web Apps).*  
You can install ShaderBoy app from [here](https://shaderboy.net/).  
  
### Supported Uniforms  
- [X] uniform vec3      **iResolution;**           *// viewport resolution (in pixels)*
- [X] uniform float     **iTime;**                 *// shader playback time (in seconds)*
- [X] uniform float     **iTimeDelta;**            *// render time (in seconds)*
- [X] uniform int       **iFrame;**                *// shader playback frame*
- [X] uniform float     **iFrameRate;**            *// number of frames rendered per second*
- [X] uniform vec4      **iDate;**                 *// (year, month, day, time in seconds)*
- [X] uniform vec4      **iMouse;**                *// mouse pixel coords. xy: current (if MLB down), zw: click*
- [ ] uniform float     **iChannelTime[4];**       *// channel playback time (in seconds)*
- [ ] uniform vec3      **iChannelResolution[4];** *// channel resolution (in pixels)*
- [X] uniform samplerXX **iChannel0..3;**          *// input channel. XX = 2D/Cube*
- [ ] uniform float     **iSampleRate;**           *// sound sample rate (i.e., 44100)*
</br>
</br>
</br>
  
# Screenshots
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/screenshots3.png">  
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/screenshots4.png">  
</br>
</br>
</br>
  

# Shortcuts
ShaderBoy has no GUI. Works with shortcuts.  
These are default shortcuts.  
If you want to change, edit "editor.js", and build it.  
  
|   | Smartphone | Windows | Mac |
|:---|:---|:---|:---|
| **Compile** | ⌥+ENTER(SPACE) | ⌥+ENTER | ⌥+ENTER |
| **Save** | ctrl+S | ctrl +S | ⌘+S |
| **Play/Pause** | ⌥+UP | ⌥+UP | ⌥+UP |
| **Reset time** | ⌥+DOWN | ⌥+DOWN | ⌥+DOWN |
| **Move shader tab** | ⌥+LEFT/RIGHT | ⌥+LEFT/RIGHT | ⌥+LEFT/RIGHT |
| **Search** | ctrl+F | ctrl+F | ⌘+F |
| **Replace** | ctrl+H | ctrl+H | ⌘+H |
| **Fold/Unfold single** | ⌥+K | ⌥+K | ⌥+K |
| **Fold/Unfold all** | ctrl+K | ctrl+K | ⌘+K |
| **Resolution** | ctrl+1-4 | ctrl+1-4 | ctrl+1-4 |
| **Format lines** | ctrl+⇧+⌥+F | ctrl+⇧+⌥+F| ⌘+⇧+⌥+F |
| **Hide/Show** | ⌥+H | ctrl+⇧+⌥+H | ⌘+⇧+⌥+H |
| **Font size** | ctrl+⇧+ Up/Down | ctrl +⇧+⌥+ +/-  | ⌘+⇧+⌥+ +/- |
| **Load** | ctrl+⇧+L | ctrl+⇧+⌥+L | ⌘+⇧+⌥+L |
| **New** | ctrl+⇧+N | ctrl+⇧+⌥+N | ⌘+⇧+⌥+N |
  
*And many of Sublime Text bindings by Codemirror.
</br>
</br>
</br>
  
# Future Plan
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/design/_output/shaderboy_pc.png">  
  
### Compatibility
- [X] Multipass shader(2018.12.21)
- [ ] Sound shader
- [ ] Official assets(textures)
  
### Manipulations
- [X] x24 uniforms with GUI(knob style) for tweaking
- [ ] GUI for Shader list
- [ ] GUI for iChannels
- [ ] Multiple editor pane
  
### Other
- [X] GoogleDrive integration(2018.12.21)
- [X] Recording in any resolution as PNG sequence(2018.12.21)
- [ ] Shadertoy API integration
- [ ] More rich splash screen
- [ ] Themes for editor pane
</br>
</br>
</br>

# Build Your ShaderBoy
### Install dependencies
If you want have your own ShaderBoy,  
Clone this repo and install dependencies.  
```
$ npm install
```
  
### Build
ShaderBoy uses gulp and webpack. so,  
```
$ gulp
```
  
### upload
And upload files in "dest" directory to your server.  
That's it! Good luck!  
</br>
</br>
</br>
  
I love writing shaders.  
And I also love Shadertoy.  
I want to write it everytime, everywhere.  
So, I made this one for me.  
If anybody happy with this, it's my pleasure.  
  
[iY0Yi](https://twitter.com/iY0Yi/)
</br>
</br>
</br>
