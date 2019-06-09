import Builtins from './builtins'

export default class KeywordDictionary
{
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    constructor(name)
    {
        this.name = name
        this.renderWords = {}
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    search(renderWord)
    {
        const searchWord = renderWord.type + '_' + renderWord.name
        return this.renderWords.hasOwnProperty(searchWord);// return in Boolean
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    filter(word)
    {
        const filteredKeys = Object.keys(this.renderWords).filter((item) =>
        {
            if (item !== undefined && word !== undefined)
            {
                const serachPos = item.indexOf('_') + 1
                const isIncluded = (item.toUpperCase().indexOf(word.toUpperCase(), serachPos) === serachPos ? true : false)
                return isIncluded && (item.toUpperCase() !== word.toUpperCase())
            }
        })

        let filteredRenders = []

        filteredKeys.forEach(element =>
        {
            const name = element.substring(element.indexOf("_") + 1)
            if (word !== name && !Builtins.isExclusionWord(name))
            {
                filteredRenders.push(this.renderWords[element].getData())
            }
        })

        return filteredRenders
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    add(renderWord)
    {
        // let val = renderWord
        // if (Array.isArray(val))
        // {
        //     for (let i = 0; i < val.length; i++)
        //     {
        //         const renderWord = val[i]

        //     }
        // }
        // if (renderWord.type === undefined || renderWord.name === undefined) return
        const key = renderWord.type + '_' + renderWord.name
        this.renderWords[key] = renderWord
        console.log(this.renderWords[key])
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    remove(renderWord)
    {
        if (renderWord.type === undefined || renderWord.name === undefined) return
        const key = renderWord.type + '_' + renderWord.name
        delete this.renderWords[key]
    }
}
