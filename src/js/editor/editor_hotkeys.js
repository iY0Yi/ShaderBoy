//   ___        _     _                
//  (  _`\     ( ) _ ( )_              
//  | (_(_)   _| |(_)| ,_)   _    _ __ 
//  |  _)_  /'_` || || |   /'_`\ ( '__)
//  | (_( )( (_| || || |_ ( (_) )| |   
//  (____/'`\__,_)(_)`\__)`\___/'(_)   
//   _   _         _    _                         
//  ( ) ( )       ( )_ ( )                        
//  | |_| |   _   | ,_)| |/')    __   _   _   ___ 
//  |  _  | /'_`\ | |  | , <   /'__`\( ) ( )/',__)
//  | | | |( (_) )| |_ | |\`\ (  ___/| (_) |\__, \
//  (_) (_)`\___/'`\__)(_) (_)`\____)`\__, |(____/
//                                   ( )_| |      
//                                   `\___/'      

import ShaderBoy from '../shaderboy'
import commands from '../commands'
import key from 'keymaster'

export default ShaderBoy.editor_hotkeys = {
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setup()
	{
		this.keys = {
		}

		key.filter = function(event){
			return true;
		}

		const CMD = (ShaderBoy.OS === 'MacOS' || ShaderBoy.OS === 'iPadOS' || ShaderBoy.OS === 'iOS') ? '⌘' : 'ctrl'

		key('⌥+right', commands.setPrevBuffer)
		key('⌥+left', commands.setNextBuffer)
		key('⌥+up', commands.pauseResumeTimeline)
		key('⌥+down', commands.resetTimeline)
		key('⌥+enter', commands.compileShader)

		key('ctrl+1', ()=>{commands.setResolution1(); return false})
		key('ctrl+2', ()=>{commands.setResolution2(); return false})
		key('ctrl+3', ()=>{commands.setResolution3(); return false})
		key('ctrl+4', ()=>{commands.setResolution4(); return false})

		key(`${CMD}+s`, ()=>{commands.saveShader(); return false})
		key(`${CMD}+o`, ()=>{commands.openShader(); return false})
		key(`${CMD}+i`, ()=>{commands.switchInfo(); return false})
		key(`${CMD}+m`, ()=>{commands.mute(); return false})

		key(`${CMD}++`, ()=>{commands.incTextSize(); return false})
		key(`${CMD}+;`, ()=>{commands.incTextSize(); return false})
		key(`${CMD}+=`, ()=>{commands.incTextSize(); return false})
		key(`${CMD}+-`, ()=>{commands.decTextSize(); return false})
		key(`${CMD}+_`, ()=>{commands.decTextSize(); return false})

		key(`${CMD}+⇧+⌥+n`, commands.newShader)
		key(`${CMD}+⇧+⌥+f`, commands.forkShader)

		key(`${CMD}+⇧+⌥+d`, ShaderBoy.commands.showKnobsPanel)
		key(`${CMD}+⇧+⌥+a`, ShaderBoy.commands.showAssetsPanel)
		key(`${CMD}+⇧+⌥+t`, commands.showTimeline)
		key(`${CMD}+⇧+⌥+r`, commands.showRecordingHeader)
		key(`${CMD}+⇧+⌥+h`, commands.hideEditor)
		key(`${CMD}+⇧+⌥+v`, commands.hideCanvas)

		// for Smartphone
		if (ShaderBoy.OS === 'iOS' || ShaderBoy.OS === 'Android')
		{
			this.keys['Alt-Space'] = commands.compileShader
			this.keys['Alt-H'] = commands.hideEditor
			this.keys[`${CMD}-Alt-+`] = commands.incTextSize
			this.keys[`${CMD}-Alt--`] = commands.decTextSize
		}
	}
}