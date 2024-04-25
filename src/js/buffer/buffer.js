//   ___             ___   ___
//  (  _`\         /'___)/'___)
//  | (_) ) _   _ | (__ | (__   __   _ __
//  |  _ <'( ) ( )| ,__)| ,__)/'__`\( '__)
//  | (_) )| (_) || |   | |  (  ___/| |
//  (____/'`\___/'(_)   (_)  `\____)(_)

export default class Buffer
{
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    constructor(isRenderable)
    {
        // true: BufferA-D, CubemapA, MainSound and Image
        // false: Config, Common and Setting
        this.isRenderable = isRenderable

        // Use or not this pass
        this.active = false

        // Frame buffer
        this.framebuffer = null

        // Render textures
        this.textures = []
        this.needSwap = false

        // Shader object
        this.shader = null

        // iChannel0-3
        this.iChannel = [null, null, null, null]
    }
}