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

import key from 'keymaster'
import commands from '../commands'
import ShaderBoy from '../shaderboy'

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

		key('ctrl+1', 'default', ()=>{commands.setResolution1(); return false})
		key('ctrl+2', 'default', ()=>{commands.setResolution2(); return false})
		key('ctrl+3', 'default', ()=>{commands.setResolution3(); return false})
		key('ctrl+4', 'default', ()=>{commands.setResolution4(); return false})

		key(`${CMD}+s`, 'default', ()=>{commands.saveShader(); return false})
		key(`${CMD}+o`, 'default', ()=>{commands.openShader(); return false})
		key(`${CMD}+i`, 'default', ()=>{commands.switchInfo(); return false})
		key(`${CMD}+m`, 'default', ()=>{commands.mute(); return false})

		key(`${CMD}++`, 'default', ()=>{commands.incTextSize(); return false})
		key(`${CMD}+;`, 'default', ()=>{commands.incTextSize(); return false})
		key(`${CMD}+=`, 'default', ()=>{commands.incTextSize(); return false})
		key(`${CMD}+-`, 'default', ()=>{commands.decTextSize(); return false})
		key(`${CMD}+_`, 'default', ()=>{commands.decTextSize(); return false})

		key(`${CMD}+⇧+⌥+n`, 'default', commands.newShader)
		key(`${CMD}+⇧+⌥+f`, 'default', commands.forkShader)

		key(`${CMD}+⇧+⌥+d`, 'default', commands.showKnobsPanel)
		key(`${CMD}+⇧+⌥+a`, 'default', commands.showAssetsPanel)
		key(`${CMD}+⇧+⌥+t`, 'default', commands.showTimeline)
		key(`${CMD}+⇧+⌥+r`, 'default', commands.showRecordingHeader)
		key(`${CMD}+⇧+⌥+r`, 'rec_shown', commands.hideRecordingHeader)
		key(`${CMD}+⇧+⌥+h`, 'default', commands.hideEditor)
		key(`${CMD}+⇧+⌥+h`, 'editor_hidden', commands.showEditor)
		key(`${CMD}+⇧+⌥+v`, 'default', commands.hideCanvas)

		// for Smartphone
		if (ShaderBoy.OS === 'iOS' || ShaderBoy.OS === 'Android')
		{
			this.keys['Alt-Space'] = commands.compileShader
			this.keys['Alt-H'] = commands.hideEditor
			this.keys[`${CMD}-Alt-+`] = commands.incTextSize
			this.keys[`${CMD}-Alt--`] = commands.decTextSize
		}

		key.setScope('default');
	}
}