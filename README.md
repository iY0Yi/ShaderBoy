<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/_index/img/sb_logo_1240x600.png"></br>
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/_index/img/sb_example.png"></br>
##### *UPDATE: Now, You can use ShaderBoy on Desktop browser also!*  
<strong>ShaderBoy</strong> is a tiny shader editor for mobile devices.</br>
It is intended to use [physical keyboards](https://www.google.co.jp/search?q=smartphone+bluetooth+keyboard&source=lnms&tbm=isch&sa=X&ved=0ahUKEwi-kZzK_4fdAhXRdd4KHSp3BOcQ_AUICigB&biw=1440&bih=781) to write shaders on a small screen.</br>
It has compatible uniforms with <a href="https://www.shadertoy.com/"><em>Shadertoy</em></a>.</br>

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
###### *TIPS: A Buffer for previous frame is available as 'iChannel0'.*  

  
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
- [ ] uniform samplerXX **iChannel0..3;**          *// input channel. XX = 2D/Cube*
- [ ] uniform float     **iSampleRate;**           *// sound sample rate (i.e., 44100)*
</br>
</br>
</br>
  
# Todo
Any pull requests welcome.( ༎ຶ‿༎ຶ )
  
### General
- [X] ~~Fit to window resizing~~(2018.9.1)
- [X] ~~Fix broken uniforms~~(2018.9.1)
- [X] ~~Inline error display~~(2018.8.30)
- [X] ~~Active line highlight~~(2018.8.29)
- [X] ~~Wordwrapping or scrolling~~(2018.8.29)
- [X] ~~Add WebGL "1.0" fallback~~(2018.8.28)
  
### Manipulations
- [ ] Auto complete
- [ ] GUI for some useful settings
- [X] ~~Shortcuts for text size~~(2018.8.29)
- [X] ~~Shortcuts for PC~~(2018.8.29)
  
### Compatibility
- [ ] Multipass shader
- [ ] Sound shader
- [ ] Official assets(textures)
- [X] ~~Raise Shadertoy compatibility(Some shader does not work properly.)~~  
(2018.8.28: singlepass and no asset shaders only.)
  
### Other
- [ ] Dropbox integration
- [ ] Shadertoy API integration
- [ ] Splash screen for iOS
- [ ] Some Themes

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
