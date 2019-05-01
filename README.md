<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/sb_v2_capture_pc00.jpg"></br>
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/sb_v2_capture_sp00.jpg"></br>
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/titlelogo.jpg"></br>
<strong>ShaderBoy</strong> is a tiny shader editor for mobile devices.</br>
It is intended to use [physical keyboards](https://www.google.co.jp/search?q=smartphone+bluetooth+keyboard&source=lnms&tbm=isch&sa=X&ved=0ahUKEwi-kZzK_4fdAhXRdd4KHSp3BOcQ_AUICigB&biw=1440&bih=781) to write shaders on a small screen.</br>
It has compatible uniforms with <a href="https://www.shadertoy.com/"><em>Shadertoy</em></a>.</br>
And you need Google account, because ShaderBoy works with GoogleDrive to save your shaders.

Enjoy writing your shaders in everywhere.</br>
in Bed, Toilet, Train, Camping, Fishing...
Your power to go.</br>
  
##### *This is "NOT" Shadertoy official!* 
##### *And now... ShaderBoy has updated. On PC, It has nice GUIs for writing shaders comfortably. See screenshots.*

</br>
</br>
</br>
</br>
</br>

# App
ShaderBoy is a *PWA(Progressive Web Apps).*  
You can install the app from [here](https://shaderboy.net/).
##### *[Howto: Install Progressive Web App (PWA) natively on Windows/macOS via Chrome Browser](https://medium.com/@dhormale/install-pwa-on-windows-desktop-via-google-chrome-browser-6907c01eebe4)

</br>
</br>
</br>
</br>
</br>

# Screenshots

<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/sb_v2_capture_pc00.jpg"></br>
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/sb_v2_capture_sp00.jpg"></br>
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/sb_v2_capture_pc01.jpg"></br>
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/sb_v2_capture_pc02.jpg"></br>
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/sb_v2_capture_pc03.jpg"></br>
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/sb_v2_capture_pc04.jpg"></br>
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/sb_v2_capture_pc05.jpg"></br>
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/sb_v2_capture_pc06.jpg"></br>
</br>
</br> 
</br>
</br>
</br>
</br>
</br>

# Hotkeys
  
|   | Smartphone | Windows | Mac |
|:---|:---|:---|:---|
| **Compile** | ⌥+ENTER(SPACE) | ⌥+ENTER | ⌥+ENTER |
| **Play/Pause** | ⌥+UP | ⌥+UP | ⌥+UP |
| **Reset time** | ⌥+DOWN | ⌥+DOWN | ⌥+DOWN |
| **Move to neighbor buffer** | ⌥+LEFT/RIGHT | ⌥+LEFT/RIGHT | ⌥+LEFT/RIGHT |
| **Search** | ctrl+F | ctrl+F | ⌘+F |
| **Replace** | ctrl+H | ctrl+H | ⌘+H |
| **Resolution** | ctrl+1-4 | ctrl+1-4 | ctrl+1-4 |
| **Go Fullscreen** | - | ctrl+⇧+⌥+F | ⌘+⇧+⌥+F |
| **Hide/Show WebGL canvas** | ⌥+V | ctrl+⇧+⌥+V | ⌘+⇧+⌥+V |
| **Hide/Show Code & All GUIs** | ⌥+H | ctrl+⇧+⌥+H | ⌘+⇧+⌥+H |
| **Hide/Show Timeline** | ctrl+⇧+T | ctrl+⇧+⌥+T | ⌘+⇧+⌥+T |
| **Hide/Show Knobs GUI** | ctrl+⇧+D | ctrl+⇧+⌥+D | ⌘+⇧+⌥+D |
| **Hide/Show iChannel GUI** | ctrl+⇧+A | ctrl+⇧+⌥+A | ⌘+⇧+⌥+A |
| **Hide/Show Recording GUI** | ctrl+⇧+R | ctrl+⇧+⌥+R | ⌘+⇧+⌥+R |
| **Save shader files** | ctrl+S | ctrl +S | ⌘+S |
| **Create a new shader** | ctrl+⇧+N | ctrl+⇧+⌥+N | ⌘+⇧+⌥+N |
| **Show shaders list** | ctrl+O | ctrl+O | ⌘+O |

##### *And some of Sublime Text bindings by Codemirror.
</br>
</br>
</br>
</br>
</br>

# Features
  
### Compatibility
- [X] Shadertoy uniform variables
- [X] Multipass shader
- [ ] Sound shader
- [ ] Official assets(textures)

### Supported Shadertoy Uniforms  
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
  
### GUI/other usefuls
- [X] Timeline GUI for PC(frame based)
- [X] x32 uniforms with GUI(knob style) for PC
- [X] GUI for Shader list
- [X] GUI for iChannels
- [ ] snippets for writing SDF(Signed Distance field)
- [ ] Multiple editor pane
  
### Other
- [X] GoogleDrive integration
- [X] Capturing shader to movie file.(WebM/PNG/JPG/GIF)
- [ ] Witout Google account(localStrage)
- [ ] Themes for editor pane
</br>
</br>
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
ShaderBoy uses webpack. so,  
```
$ npm start
```
or to build,
```
$ npm run build
```
  
### Upload
And upload files in "dest" directory to your server.  
That's it! Good luck!  
</br>
</br>
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
