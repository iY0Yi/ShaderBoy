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
		// Mapping
		const CMD = (ShaderBoy.OS === 'MacOS' || ShaderBoy.OS === 'iPadOS' || ShaderBoy.OS === 'iOS') ? 'Cmd' : 'Ctrl'

		this.keys = {
			'Alt-Right': commands.setPrevBuffer,
			'Alt-Left': commands.setNextBuffer,
			'Alt-Up': commands.pauseResumeTimeline,
			'Alt-Down': commands.resetTimeline,
			'Alt-Enter': commands.compileShader,

			'Ctrl-1': commands.setResolution1,
			'Ctrl-2': commands.setResolution2,
			'Ctrl-3': commands.setResolution3,
			'Ctrl-4': commands.setResolution4,

			[`${CMD}-Shift-Alt-N`]: commands.newShader,
			[`${CMD}-Shift-Alt-F`]: commands.forkShader,
			[`${CMD}-S`]: commands.saveShader,
			[`${CMD}-O`]: commands.openShader,

			[`${CMD}-Shift-Alt-+`]: commands.incTextSize,
			[`${CMD}-Shift-Alt-;`]: commands.incTextSize,
			[`${CMD}-Shift-Alt-=`]: commands.incTextSize,
			[`${CMD}-Shift-Alt--`]: commands.decTextSize,
			[`${CMD}-Shift-Alt-_`]: commands.decTextSize,

			[`${CMD}-I`]: commands.switchInfo,
			[`${CMD}-M`]: commands.mute,
			[`${CMD}-Shift-Alt-D`]: commands.showKnobsPanel,
			[`${CMD}-Shift-Alt-A`]: commands.showAssetsPanel,
			[`${CMD}-Shift-Alt-T`]: commands.showTimeline,
			[`${CMD}-Shift-Alt-R`]: commands.showRecordingHeader,
			[`${CMD}-Shift-Alt-H`]: commands.hideEditor,
			[`${CMD}-Shift-Alt-V`]: commands.hideCanvas,

			[`Alt-${CMD}-F`]: commands.formatCode
		}

		if(ShaderBoy.OS === 'iPadOS')
		{
			key('⌘+⇧+⌥+n', commands.newShader)
			key('⌘+⇧+⌥+f', commands.forkShader)

			key('⌘+⇧+⌥+d', ShaderBoy.commands.showKnobsPanel)
			key('⌘+⇧+⌥+a', ShaderBoy.commands.showAssetsPanel)
			key('⌘+⇧+⌥+t', commands.showTimeline)
			key('⌘+⇧+⌥+r', commands.showRecordingHeader)
			key('⌘+⇧+⌥+h', commands.hideEditor)
			key('⌘+⇧+⌥+v', commands.hideCanvas)

			key('⌘+⇧+⌥++', commands.incTextSize)
			key('⌘+⇧+⌥+;', commands.incTextSize)
			key('⌘+⇧+⌥+=', commands.incTextSize)
			key('⌘+⇧+⌥+-', commands.decTextSize)
			key('⌘+⇧+⌥+_', commands.decTextSize)
		}

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