//
//
//   ___    _                 _               ___                 
//  (  _`\ ( )               ( )             (  _`\               
//  | (_(_)| |__     _ _    _| |   __   _ __ | (_) )   _    _   _ 
//  `\__ \ |  _ `\ /'_` ) /'_` | /'__`\( '__)|  _ <' /'_`\ ( ) ( )
//  ( )_) || | | |( (_| |( (_| |(  ___/| |   | (_) )( (_) )| (_) |
//  `\____)(_) (_)`\__,_)`\__,_)`\____)(_)   (____/'`\___/'`\__, |
//                                                         ( )_| |
//                                                         `\___/'
//

const ShaderBoy = {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    editor: null,
    isPlaying: false,
    isEditorHide: false,
    isConcentrating: false,
    needRecompile: false,
    needStatusInfo: false,
    forceFrame: false,
    forceDraw: false,
    editingBuffer: '',
    vsSource: null,
    screenShader: null,
    oldBufferIds: [],
    activeBufferIds: [],
    config: null,
    workspace: {
        timeline: false,
        ichannels: false,
        dev_knobs: false
    },
    activeShaderName: undefined,

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    style: {

    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    buffers: {

    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    uniforms: {
        iResolution: [0, 0, 1],
        iTime: 0,
        iTimeDelta: 60 / 1000,
        iFrame: 0,
        iDate: 0,
        iFrameRate: 0,
        // iChannelTime:[0, 0, 0, 0],
        // iChannelResolution:[0, 0, 0, 0],
        iMouse: [0, 0, 0, 0],

    }
}
export default ShaderBoy
