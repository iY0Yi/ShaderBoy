<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/sb_v2_capture_pc00.jpg"></br>
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/sb_v2_capture_sp00.jpg"></br>
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/titlelogo.jpg"></br>
<strong>ShaderBoy</strong> is a simple text editor that lets you write <a href="https://www.shadertoy.com/"><em>Shadertoy</em></a> shaders more comfortably, anytime, anywhere. I like writing shaders for Shadertoy, or analyzing other people's esoteric shaders, and I created this especially because I wanted to do that on my smartphone. Whether you're traveling by train or plane, staying in the toilet, fishing or camping, you can write a shader anywhere and anytime.
Your power to go.</br>

There are PC version and smartphone version. Both allow you to write shaders with the same variable/function name as Shadertoy. On the PC version, you can fine-tune your shaders with a rich debugging GUI. It also has a recording mode so you can easily save your shader as a movie.
The smartphone version consists of a minimal GUI element that assumes the use of a [physical keyboards](https://www.google.co.jp/search?q=smartphone+bluetooth+keyboard&source=lnms&tbm=isch&sa=X&ved=0ahUKEwi-kZzK_4fdAhXRdd4KHSp3BOcQ_AUICigB&biw=1440&bih=781), with a small screen as much coding space as possible.

ShaderBoy uses Google Drive to store your shaders. From any device on which you log in with your Google account, you can continue coding the shader that you last edited.

Enjoy ShaderBoy!
##### *This is not an official Shadertoy application.* 
##### *Bug reports, feature requests, and [🍺](https://www.paypal.me/atsushihashimoto/5USD) are welcome.*
##### *iOS ver is WIP. There are many bugs yet. (especially Keymaps, CSS)

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
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/sb_v2_capture_pc07.jpg"></br>
</br>
</br> 
</br>
</br>
</br>
</br>
</br>

# Keymaps
  
|   | Smartphone | Windows | Mac |
|:---|:---|:---|:---|
| **Compile** | ⌥+ENTER(SPACE) | ⌥+ENTER | ⌥+ENTER |
| **Play/Pause** | ⌥+UP | ⌥+UP | ⌥+UP |
| **Reset time** | ⌥+DOWN | ⌥+DOWN | ⌥+DOWN |
| **Move to neighbor buffer** | ⌥+LEFT/RIGHT | ⌥+LEFT/RIGHT | ⌥+LEFT/RIGHT |
| **Search** | ctrl+F | ctrl+F | ⌘+F |
| **Replace** | ctrl+H | ctrl+H | ⌘+H |
| **Resolution** | ctrl+1-4 | ctrl+1-4 | ctrl+1-4 |
| **Go Fullscreen** | --- | ctrl+⇧+⌥+F | ⌘+⇧+⌥+F |
| **Hide/Show WebGL canvas** | ctrl+⇧+⌥+V | ctrl+⇧+⌥+V | ⌘+⇧+⌥+V |
| **Mute/Unmute sound** | ctrl+M | ctrl+⇧+⌥+M | ctrl+⇧+⌥+M |
| **Hide/Show Code & All GUIs** | ctrl+⇧+⌥+H | ctrl+⇧+⌥+H | ⌘+⇧+⌥+H |
| **Hide/Show Timeline** | --- | ctrl+⇧+⌥+T | ⌘+⇧+⌥+T |
| **Hide/Show Knobs GUI** | --- | ctrl+⇧+⌥+D | ⌘+⇧+⌥+D |
| **Hide/Show iChannel GUI** | ctrl+⇧+⌥+A | ctrl+⇧+⌥+A | ⌘+⇧+⌥+A |
| **Hide/Show Recording GUI** | --- | ctrl+⇧+⌥+R | ⌘+⇧+⌥+R |
| **Save shader files** | ctrl+S | ctrl +S | ⌘+S |
| **Create a new shader** | ctrl+⇧+⌥+N | ctrl+⇧+⌥+N | ctrl+⇧+⌥+N |
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
- [X] Sound shader
- [ ] Display number of chars
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
- [X] uniform float     **iSampleRate;**           *// sound sample rate (i.e., 44100)*
  
### GUI/other usefuls
- [X] Timeline GUI(frame based) :PC only
- [X] x32 uniforms with GUI(knob style) :PC only
- [X] supports MIDI controller :PC only
- [X] GUI for Shader list
- [X] GUI for iChannels
- [ ] Auto completion
- [ ] Inlined Khronos doc
- [ ] snippets for writing SDF(Signed Distance field)
- [ ] Multiple editor pane
- [ ] Insert value with inlined GUIs.(https://github.com/patriciogonzalezvivo/glslEditor)
- [ ] Break point.(https://github.com/patriciogonzalezvivo/glslEditor)
  
### Other
- [X] GoogleDrive integration
- [X] Capturing shader to movie file.(WebM/PNG/JPG/GIF)
- [X] Witout Google account(for testing)
- [X] Themes for editor pane
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
You then set up a local host for development.
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

# Dependencies
ShaderBoy depends on some awesome js libralies.</br>
[Codemirror](https://github.com/codemirror/CodeMirror)</br>
[CCapture.js](https://github.com/spite/ccapture.js)</br>
[keymaster](https://github.com/madrobby/keymaster)</br>
[css_browser_selector](https://github.com/rafaelp/css_browser_selector)</br>
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
</br>
</br>
</br>
</br>
</br>


# Contact
[iY0Yi](https://twitter.com/iY0Yi/)</br>
</br>
</br>
</br>
</br>
</br>

# Beer
[Paypal.me](https://www.paypal.me/atsushihashimoto/5USD)🍺</br>
</br>
</br>
</br>
</br>
</br>
