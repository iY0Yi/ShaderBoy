//   _   _                                           _         
//  ( ) ( )                                         ( )        
//  | |/'/'   __   _   _  _   _   _    _    _ __   _| |        
//  | , <   /'__`\( ) ( )( ) ( ) ( ) /'_`\ ( '__)/'_` |        
//  | |\`\ (  ___/| (_) || \_/ \_/ |( (_) )| |  ( (_| |        
//  (_) (_)`\____)`\__, |`\___x___/'`\___/'(_)  `\__,_)        
//                ( )_| |                                      
//                `\___/'                                      
//   ___              _                                        
//  (  _`\  _        ( )_  _                                   
//  | | ) |(_)   ___ | ,_)(_)   _     ___     _ _  _ __  _   _ 
//  | | | )| | /'___)| |  | | /'_`\ /' _ `\ /'_` )( '__)( ) ( )
//  | |_) || |( (___ | |_ | |( (_) )| ( ) |( (_| || |   | (_) |
//  (____/'(_)`\____)`\__)(_)`\___/'(_) (_)`\__,_)(_)   `\__, |
//                                                      ( )_| |
//                                                      `\___/'

import Builtins from './builtins'

export default class KeywordDictionary
{
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    constructor(name)
    {
        this.name = name
        this.renderWords = {}
        this.structTypes = []
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    search(renderWord)
    {
        const searchWord = `${renderWord.type}@${renderWord.name}`
        return this.renderWords.hasOwnProperty(searchWord);// return in Boolean
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    filter(word, forStruct = false)
    {
        const filteredKeys = Object.keys(this.renderWords).filter((item) =>
        {
            if (item !== undefined && word !== undefined)
            {
                const serachPos = item.indexOf('@') + 1
                const isIncluded = (item.toUpperCase().indexOf(word.toUpperCase(), serachPos) === serachPos ? true : false)
                return isIncluded && (item.toUpperCase() !== word.toUpperCase() || forStruct)
            }
        })

        let filteredRenders = []

        filteredKeys.forEach(element =>
        {
            const name = element.substring(element.indexOf("@") + 1)
            if ((word !== name || forStruct) && !Builtins.isExclusionWord(name))
            {
                filteredRenders.push(this.renderWords[element].getData())
            }
        })

        return filteredRenders
    }

    // Check if the word is a type.
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    isStructType(str)
    {
        for (const type of this.structTypes)
        {
            if (str === type) return true
        }
        return false
    }


    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    add(renderWord)
    {
        const key = `${renderWord.type}@${renderWord.name}`

        this.renderWords[key] = renderWord

        if (renderWord.type === 'struct')
        {
            this.structTypes.push(renderWord.name)
        }
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    remove(renderWord)
    {
        if (renderWord.type === undefined || renderWord.name === undefined) return

        const key = `${renderWord.type}@${renderWord.name}`
        delete this.renderWords[key]

        if (renderWord.type === 'struct')
        {
            this.structTypes = this.structTypes.filter(type =>
            {
                return type !== renderWord.name
            })
        }
    }
}
