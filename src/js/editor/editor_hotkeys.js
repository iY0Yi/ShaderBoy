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

export default ShaderBoy.editor_hotkeys = {
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	setup()
	{
		// Mapping
		const CMD = (ShaderBoy.OS === 'MacOS' || ShaderBoy.OS === 'iOS') ? 'Cmd' : 'Ctrl'

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

			[`Shift-${CMD}-Alt-N`]: commands.newShader,
			[`Shift-${CMD}-Alt-F`]: commands.forkShader,
			[`${CMD}-S`]: commands.saveShader,
			[`${CMD}-O`]: commands.openShader,

			[`Shift-${CMD}-Alt-+`]: commands.incTextSize,
			[`Shift-${CMD}-Alt-;`]: commands.incTextSize,
			[`Shift-${CMD}-Alt-=`]: commands.incTextSize,
			[`Shift-${CMD}-Alt--`]: commands.decTextSize,
			[`Shift-${CMD}-Alt-_`]: commands.decTextSize,

			[`${CMD}-I`]: commands.switchInfo,
			[`${CMD}-M`]: commands.mute,
			[`Shift-${CMD}-Alt-D`]: commands.showKnobsPanel,
			[`Shift-${CMD}-Alt-A`]: commands.showAssetsPanel,
			[`Shift-${CMD}-Alt-T`]: commands.showTimeline,
			[`Shift-${CMD}-Alt-R`]: commands.showRecordingHeader,
			[`Shift-${CMD}-Alt-H`]: commands.hideEditor,
			[`Shift-${CMD}-Alt-V`]: commands.hideCanvas,

			[`Alt-${CMD}-F`]: commands.formatCode
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