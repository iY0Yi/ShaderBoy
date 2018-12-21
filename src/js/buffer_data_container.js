//
//   ___             ___   ___                ___           _          
//  (  _`\         /'___)/'___)              (  _`\        ( )_        
//  | (_) ) _   _ | (__ | (__   __   _ __    | | ) |   _ _ | ,_)   _ _ 
//  |  _ <'( ) ( )| ,__)| ,__)/'__`\( '__)   | | | ) /'_` )| |   /'_` )
//  | (_) )| (_) || |   | |  (  ___/| |      | |_) |( (_| || |_ ( (_| |
//  (____/'`\___/'(_)   (_)  `\____)(_)      (____/'`\__,_)`\__)`\__,_)
//   ___                  _                                            
//  (  _`\               ( )_         _                                
//  | ( (_)   _     ___  | ,_)   _ _ (_)  ___     __   _ __            
//  | |  _  /'_`\ /' _ `\| |   /'_` )| |/' _ `\ /'__`\( '__)           
//  | (_( )( (_) )| ( ) || |_ ( (_| || || ( ) |(  ___/| |              
//  (____/'`\___/'(_) (_)`\__)`\__,_)(_)(_) (_)`\____)(_)              
//                                                                     
//                                                                     

export default class BufferDataContainer {

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    constructor(isRenderable) {

        // true: BufferA-D, CubemapA, MainSound and MainImage
        // false: Config, Common
        this.isRenderable = isRenderable;

        // Use or not this pass
        this.active = false;

        // Frame buffer
        this.framebuffer = null;
        // Render textures
        this.textures = [];
        this.needSwap = false;

        // Shader object
        this.shader = null;

        // iChannel0-3
        this.iChannel = [null, null, null, null];
    }
}