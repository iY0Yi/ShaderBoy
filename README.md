<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/dest/Images/a2703b54-8b2b-c931-f36b-796f041b198d.webPlatform.png"></br>
Hi. I'm iY0Yi.  
I love writing shaders.  
And I also love Shadertoy.  
I want to write it everytime, everywhere.  
So, I made this one.  
  
<strong>ShaderBoy</strong> is a tiny shader editor for mobile devices.</br>
This is intended to use [physical keyboards](https://www.google.co.jp/search?q=smartphone+bluetooth+keyboard&source=lnms&tbm=isch&sa=X&ved=0ahUKEwi-kZzK_4fdAhXRdd4KHSp3BOcQ_AUICigB&biw=1440&bih=781) to write shaders in small screen.</br>
It has compatible uniforms with <a href="https://www.shadertoy.com/"><em>Shadertoy</em></a>.</br>
  
No GUI. Works with shortcuts.
Enjoy writing your shaders in everywhere.</br>
Bed, Toilet, Train, Camping, Fishing...
Your power to go.</br>

*This is "NOT" Shadertoy official.  
*Multipass and Sound shader are not supported, yet.  
*Official assets are not supported, yet.  
  
# App
You can install ShaderBoy app(as PWA) from [here](https://shaderboy.net/app/).  
  
# Screenshots
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/screenshots0.png">  
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/screenshots1.png">  
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/screenshots2.png">  
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/screenshots3.png">  
<img src="https://github.com/iY0Yi/ShaderBoy/blob/master/asset/screenshots/screenshots4.png">  

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
  
### Upload
And upload files in "dest" directory to your server.  
That's all!

# Shortcuts
These are default shortcuts.
If you want to change, edit "editor.js", and build it.
  
| Key | Func |
|:---|:---|
| Alt-Space | Compile |
| Alt-Up | Play/Pause |
| Alt-Down | Reset time to 0 |
| Alt-Right | Show Common tab |
| Alt-Left | Show Image tab |
| Ctrl-F | Search |
| Ctrl-Shift-F | Replace |
| Alt-H | Hide/Show editor |
| Ctrl-Alt-L | Load last save point |
| Ctrl-Alt-N | New Shader |
| Ctrl-1-4 | Set Resolution |
| Ctrl-Alt-F | Format selected lines |
| Ctrl-Space | Auto complete |
| Ctrl-J | Fold single gutter |
| Alt-J | Unfold single gutter |
| Ctrl-K | Fold all gutters |
| Alt-K | Unfold all gutters |
