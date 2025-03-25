//   ___             ___   ___
//  (  _`\         /'___)/'___)
//  | (_) ) _   _ | (__ | (__   __   _ __
//  |  _ <'( ) ( )| ,__)| ,__)/'__`\( '__)
//  | (_) )| (_) || |   | |  (  ___/| |
//  (____/'`\___/'(_)   (_)  `\____)(_)

import ShaderBoy from "../shaderboy"
import ShaderLib from "../shader/shaderlib"

export default class Buffer
{
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    constructor(name, isRenderable)
    {
        this.name = name

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

    getValue() {
        console.log('getValue()', this.name)
        // エディタモデルがあれば、そこから値を取得
        if (ShaderBoy.editor.models && ShaderBoy.editor.models[this.name]) {
            return ShaderBoy.editor.models[this.name].getValue()
        }
        // なければ、初期シェーダーコードを返す
        return ShaderLib.shader[this.name]
    }

    setValue(value) {
        console.log('setValue()', this.name, value)
        // エディタモデルがあれば、値をセット
        if (ShaderBoy.editor.models && ShaderBoy.editor.models[this.name]) {
            ShaderBoy.editor.models[this.name].setValue(value)
        } else if (ShaderBoy.editor.setupBufferSystem) {
            // モデルがなければ作成
            ShaderBoy.editor.models[this.name] = monaco.editor.createModel(value, 'glsl')
        }
    }
}