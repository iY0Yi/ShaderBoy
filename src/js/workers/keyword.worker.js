//   _   _                                           _ 
//  ( ) ( )                                         ( )
//  | |/'/'   __   _   _  _   _   _    _    _ __   _| |
//  | , <   /'__`\( ) ( )( ) ( ) ( ) /'_`\ ( '__)/'_` |
//  | |\`\ (  ___/| (_) || \_/ \_/ |( (_) )| |  ( (_| |
//  (_) (_)`\____)`\__, |`\___x___/'`\___/'(_)  `\__,_)
//                ( )_| |                              
//                `\___/'                              
//   _       _               _                         
//  ( )  _  ( )             ( )                        
//  | | ( ) | |   _    _ __ | |/')    __   _ __        
//  | | | | | | /'_`\ ( '__)| , <   /'__`\( '__)       
//  | (_/ \_) |( (_) )| |   | |\`\ (  ___/| |          
//  `\___x___/'`\___/'(_)   (_) (_)`\____)(_)          
//                                                     

import KeywordDictionary from './keyword_dictionary'
import Keyword from './keyword'
import Tokenizer from './tokenizer'
import Builtins from './builtins'


let strPrevStructCode = ''
let arrPrevStructs = []

// Dictionaries
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
let keywordDict = {}
keywordDict['Builtins'] = new KeywordDictionary('Builtins')
keywordDict['BufferA'] = new KeywordDictionary('BufferA')
keywordDict['BufferB'] = new KeywordDictionary('BufferB')
keywordDict['BufferC'] = new KeywordDictionary('BufferC')
keywordDict['BufferD'] = new KeywordDictionary('BufferD')
keywordDict['Image'] = new KeywordDictionary('Image')
keywordDict['Sound'] = new KeywordDictionary('Sound')
keywordDict['Common'] = new KeywordDictionary('Common')

let strPrevCodeFull = ''
let linesprevCodeWords = ['']

let initBltinDict = function ()
{
    Builtins.init()
    keywordDict['Builtins'] = Builtins.dictionary
}

let filterDictByWord = function (dictName, curWord)
{
    console.log('started: KeywordWorker.filterDictByWord...')

    let filteredBuiltinsList = keywordDict['Builtins'].filter(curWord)
    let filteredUserList = keywordDict[dictName].filter(curWord)
    console.log('filteredUserList: ', filteredUserList)

    let filteredDict = filteredBuiltinsList.concat(filteredUserList)
    console.log('filteredDict: ', filteredDict)
    if (filteredDict.length >= 1 || (filteredDict[0] !== undefined && filteredDict[0].text !== undefined && filteredDict.length === 1 && filteredDict[0].text.toUpperCase() !== curWord.toUpperCase()))
    {
        filteredDict.sort(function (a, b)
        {
            // Use toUpperCase() to ignore character casing
            const textA = a.name.toUpperCase()
            const textB = b.name.toUpperCase()

            let comparison = 0
            if (textA > textB)
            {
                comparison = 1
            } else if (textA < textB)
            {
                comparison = -1
            }
            return comparison
        })

        postMessage(JSON.stringify({ name: 'filter_succeed', content: { list: filteredDict } }, null, "\t"))
    }
    postMessage(JSON.stringify({ name: 'filter_failed', content: null }, null, "\t"))
}

let filterStructByWord = function (dictName, curWord)
{
    console.log('started: KeywordWorker.filterStructByWord...')

    let filteredDict = keywordDict[dictName].filter(curWord)
    console.log('filteredDict: ', filteredDict)

    if (filteredDict.length === 1)//|| (filteredDict[0] !== undefined && filteredDict[0].text !== undefined && filteredDict.length === 1 && filteredDict[0].text.toUpperCase() !== curWord.toUpperCase()))
    {
        filteredDict = keywordDict[dictName].filter(filteredDict[0].type)
        if (filteredDict[0].members !== null)
        {
            console.log('filteredDict[0].members: ', filteredDict[0].members)
            postMessage(JSON.stringify({ name: 'filter_succeed', content: { list: filteredDict[0].members } }, null, "\t"))
        }
    }
    postMessage(JSON.stringify({ name: 'filter_failed', content: null }, null, "\t"))
}

let getRenewedLineNumbers = (str) =>
{
    let renewedLineNumbers = []
    let linesnewCodeWords = str.split(';')
    const maxLen = Math.max(linesprevCodeWords.length, linesnewCodeWords.length)
    for (let i = 0; i < maxLen; i++)
    {
        if (linesprevCodeWords[i] === undefined) linesprevCodeWords[i] = ''
        if (linesnewCodeWords[i] === undefined) linesnewCodeWords[i] = ''
        if (linesprevCodeWords[i] !== linesnewCodeWords[i])// || linesnewCodeWords[i].match(/{/))
        {
            renewedLineNumbers.push(i)
        }
    }
    linesprevCodeWords = linesnewCodeWords
    console.log('Renewed Lines: ', renewedLineNumbers.length)
    return renewedLineNumbers
}

let syncStructs = (dictName, str) =>
{
    const result = Tokenizer.parseStructs(str)
    if (result.length >= 1)
    {
        if (arrPrevStructs.length > 0)
        {
            for (let i = 0; i < arrPrevStructs.length; i++)
            {
                for (let j = 0; j < arrPrevStructs[i].length; j++)
                {
                    keywordDict[dictName].remove(result[i][j])
                }
            }
        }

        arrPrevStructs = result.concat()

        // Found structs...
        for (let i = 0; i < result.length; i++)
        {
            keywordDict[dictName].add(result[i])
        }
    }
}

let syncMacrosFuctionsVariables = (dictName, str) =>
{
    const strNewCodeFull = Tokenizer.sanitizeLinesForMacroFunctionsVariables(str)
    const renewedLineNumbers = getRenewedLineNumbers(strNewCodeFull)

    if (strPrevCodeFull !== '')
    {
        const prevL = strPrevCodeFull.split(/\;/)
        for (let i = 0; i < prevL.length; i++)
        {
            if (renewedLineNumbers.some(lineId => lineId === i))
            {
                const renderWords = Tokenizer.parseMacrosFuctionsVariables(prevL[i])
                for (let j = 0; j < renderWords.length; j++)
                {
                    for (let k = 0; k < renderWords[j].length; k++)
                    {
                        keywordDict[dictName].remove(renderWords[j][k])
                    }
                }
            }
        }
    }

    if (strNewCodeFull !== '')
    {
        const newL = strNewCodeFull.split(/\;/)
        for (let i = 0; i < newL.length; i++)
        {
            if (renewedLineNumbers.some(lineId => lineId === i))
            {
                const renderWords = Tokenizer.parseMacrosFuctionsVariables(newL[i])
                for (let j = 0; j < renderWords.length; j++)
                {
                    for (let k = 0; k < renderWords[j].length; k++)
                    {
                        keywordDict[dictName].add(renderWords[j][k])
                    }
                }
            }
        }
    }
    strPrevCodeFull = strNewCodeFull
}

let syncUserDict = function (dictName, str)
{
    console.log('started: KeywordWorker.syncUserDict...')
    str = Tokenizer.removePrecisions(str)
    syncStructs(dictName, str)
    syncMacrosFuctionsVariables(dictName, str)
    console.log('keywordDict[dictName].renderWords: ', keywordDict[dictName].renderWords)
}


// Message
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
onmessage = (msg) =>
{
    let data = JSON.parse(msg.data)
    switch (data.name)
    {
        case 'initBltinDict':
            initBltinDict()
            break

        case 'syncUserDict':
            syncUserDict(data.content.dictName, data.content.strCode)
            break

        case 'filterDictByWord':
            filterDictByWord(data.content.dictName, data.content.curWord)
            break

        case 'filterStructByWord':
            filterStructByWord(data.content.dictName, data.content.curWord)
            break

        default:
            break
    }
};