//   _____       _                                         
//  (_   _)     ( )                   _                    
//    | |   _   | |/')    __    ___  (_) ____    __   _ __ 
//    | | /'_`\ | , <   /'__`\/' _ `\| |(_  ,) /'__`\( '__)
//    | |( (_) )| |\`\ (  ___/| ( ) || | /'/_ (  ___/| |   
//    (_)`\___/'(_) (_)`\____)(_) (_)(_)(____)`\____)(_)   

import Keyword from './keyword'
import Builtins from './builtins'

const Tokenizer = {
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    removePrecisions(str)
    {
        const gl_Precisions = ("lowp mediump highp").split(" ")
        for (const prec of gl_Precisions)
        {
            str = str.replace(new RegExp(prec, 'g'), ' ')
        }
        return str
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    removePreProcessor(str)
    {
        const gl_PreProcessor = ("#undef #ifdef #ifndef #else #elif #endif #if").split(" ")
        for (const prec of gl_PreProcessor)
        {
            str = this.removeAllBetween(str, new RegExp(prec, 'g'), /\\n/g, prec, '\n')
        }
        return str
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getBetweenStr(str, start, end)
    {
        const startPos = str.indexOf(start)
        const endPos = str.indexOf(end, startPos)
        return str.substr(startPos, endPos - startPos + end.length)
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    removeStr(str, removeStr)
    {
        return str.replace(removeStr, '')
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    removeAllBetween(str, startRx, endRx, start, end)
    {
        let res = str + ''
        if (!(res.match(startRx) && res.match(endRx)))
        {
            return str
        }

        while (res.match(startRx) && res.match(endRx))
        {
            const strComment = this.getBetweenStr(res, start, end)
            console.log(strComment)
            res = res.replace(strComment, '')
        }
        return res
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    removeAllNested(str, regexp, start, end)
    {
        let res = str + ''
        let deepestStart = str.lastIndexOf(start)
        let deepestEnd = str.indexOf(end, deepestStart)
        if (!res.match(regexp))
        {
            return str
        }

        while (res.match(regexp))
        {
            res = res.replace(res.substr(deepestStart, deepestEnd - deepestStart + 1), '')
            deepestStart = res.lastIndexOf(start)
            deepestEnd = res.indexOf(end, deepestStart)
        }
        return res
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    removeInlineComment(str)
    {
        return this.removeAllBetween(str, /\/\//g, /\\n/g, '//', '\n')
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    removeBlockComment(str)
    {
        return this.removeAllBetween(str, /\/\*/g, /\*\//g, '/*', '*/')
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    sanitizeLinesForStructs(str)
    {
        let res = ''
        res = str.replace(/(?=[ ]+)\,/g, ',')

        let tmp = res + ''
        res = ''

        tmp.split(/\r\n|\r|\n/g).forEach(element =>
        {
            element = element.split(/\/\//g)[0].trim()
            if (element !== '')
            {
                res += element
            }
        })
        return res
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    parseStructs(str)
    {
        let result = []
        str = this.sanitizeLinesForStructs(str)
        const isContainStruct = str.match(/struct/g)

        if (!isContainStruct)
        {
            return []
        }

        let strStructs = []
        while (str.match(/struct/g))
        {
            strStructs.push(this.getBetweenStr(str, 'struct', '}'))
            let strFull = strStructs[strStructs.length - 1]
            str = this.removeStr(str, strFull)

            let strMembers = this.getBetweenStr(strFull, '{', '}')
            strFull = this.removeStr(strFull, strMembers)
            strMembers = this.removeStr(strMembers, /\{|\}/g)
            strMembers = strMembers.replace(/; |;| ;/g, ';')
            strMembers = strMembers.replace(/[ ]+/g, ' ')

            const arrMembers = strMembers.split(';')
            let members = []
            for (let i = 0; i < arrMembers.length; i++)
            {
                let typeName = arrMembers[i].split(' ')
                if (typeName[0] && typeName[1])
                {
                    members.push(new Keyword({
                        type: typeName[0],
                        name: typeName[1],
                        render: `<span class="autocomp-name">${typeName[1]}</span><div class="icon-code-usr-vr"></div><span class="autocomp-type">${typeName[0]}</span>`
                    }))
                }
            }

            const typeName = strFull.split(' ')
            const name = typeName[1]
            let snippet = name
            snippet += ' var_name = '
            snippet += name
            snippet += '('
            for (let i = 0; i < members.length; i++)
            {
                snippet += members[i].name
                snippet += '@'
                snippet += members[i].type
                snippet += (i < members.length - 1) ? ', ' : ''
            }
            snippet += ');'

            result.push(new Keyword({
                type: typeName[0],
                name: name,
                members: members,
                render: `<span class="autocomp-name">${name}</span><div class="icon-code-usr-st"></div><span class="autocomp-type">${typeName[0]}</span>`,
                snippet: snippet
            }))
        }

        return result
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    sanitizeLinesForMacroFunctionsVariables(str)
    {
        let res = ''
        str = this.removeAllBetween(str, /struct/g, /\}/g, 'struct', '}')
        str.split(/\r\n|\r|\n/g).forEach(element =>
        {
            element = element.replace(/\{/g, '{;')
            element = this.removeStr(element, /\}/g)
            element = this.removeStr(element, /(?<=[.])([xyz]+)/g)
            element = element.replace(/[ ]+/g, ' ')
            element = element.trim()
            if (element.match(/\/\//g))
            {
                element = ''
            }
            if (element.match(/precision/g))
            {
                element = ''
            }
            if (element.match(/#define/g))
            {
                element += ';'
            }
            if (element !== '')
            {
                res += element
            }
        })
        return res
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    parseMacroLine(str)
    {
        let result = []
        str = this.removeAllBetween(str, /\(/g, /\)/g, '(', ')').trim()
        const typeName = str.split(' ')
        result.push(new Keyword({
            type: typeName[0],
            name: typeName[1],
            render: `<span class="autocomp-name">${typeName[1]}</span><div class="icon-code-usr-m"></div><span class="autocomp-type">${typeName[0]}</span>`
        }))
        return result
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    parseFunctionLine(str)
    {
        let result = []

        str = str.replace(/\s/g, ' ')
        str = str.replace(/[ ]+/g, ' ')
        str = str.trim()

        // args
        let args = []
        let strArgs = this.getBetweenStr(str, '(', ')')

        strArgs = this.removeStr(strArgs, /[()]/g)

        // strArgs = 'inout int pepe, int in pepein , out int pepein ' // rncd

        strArgs = strArgs.trim()
        strArgs = strArgs.replace(/\s+/g, ' ')
        strArgs = strArgs.replace(/	',/g, ' ')

        strArgs = strArgs.replace(/^inout\s/g, ' ')
        strArgs = strArgs.replace(/\sinout\s/g, ' ')
        strArgs = strArgs.replace(/\,inout\s/g, ' ')

        strArgs = strArgs.replace(/^const\s/g, ' ')
        strArgs = strArgs.replace(/\sconst\s/g, ' ')
        strArgs = strArgs.replace(/\,const\s/g, ' ')

        strArgs = strArgs.replace(/^out\s/g, ' ')
        strArgs = strArgs.replace(/\sout\s/g, ' ')
        strArgs = strArgs.replace(/\,out\s/g, ' ')

        strArgs = strArgs.replace(/^in\s/g, ' ')
        strArgs = strArgs.replace(/\sin\s/g, ' ')
        strArgs = strArgs.replace(/\,in\s/g, ' ')

        strArgs = strArgs.replace(/[ ]+/g, ' ')
        strArgs = strArgs.trim()

        // console.log(strArgs) // rncd

        strArgs = strArgs.split(',')
        for (let i = 0; i < strArgs.length; i++)
        {
            let arg = strArgs[i].trim().split(/ /g)
            if (arg[0] && arg[1])
            {
                args.push(new Keyword({
                    type: arg[0],
                    name: arg[1],
                    render: `<span class="autocomp-name">${arg[1]}</span><div class="icon-code-usr-vr"></div><span class="autocomp-type">${arg[0]}</span>`
                }))
            }
        }

        const typeName = str.split(/[ (]/g)
        const name = typeName[1]
        let snippet = name + '('
        for (let i = 0; i < args.length; i++)
        {
            snippet += args[i].name
            snippet += '@'
            snippet += args[i].type
            snippet += (i < args.length - 1) ? ', ' : ''
        }
        snippet += ')'

        // type/name
        result.push(new Keyword({
            type: typeName[0],
            name: typeName[1],
            args: args,
            render: `<span class="autocomp-name">${typeName[1]}</span><div class="icon-code-usr-fx"></div><span class="autocomp-type">${typeName[0]}</span>`,
            snippet: snippet
        }))
        return result
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    parseVariables(str)
    {
        let result = []
        //#1: remove brackets
        str = this.removeAllNested(str, /\(|\)/g, '(', ')')

        //#2: remove initializing 
        let eqPos = str.indexOf('=')
        let cmPos = str.indexOf(/,/g)
        cmPos = (cmPos === -1) ? str.length : cmPos

        if (str.match('='))
        {
            while (str.match('='))
            {
                str = str.replace(str.substr(eqPos, cmPos - eqPos + 1), '')
                eqPos = str.indexOf('=')
                cmPos = str.indexOf(/,/g)
                cmPos = (cmPos === -1) ? str.length : cmPos
            }
        }

        str = str.replace(/ ,|, |,/g, ',')

        const typeNames = str.split(/[ ,]/g)
        const type = typeNames[0]
        for (let j = 1; j < typeNames.length; j++)
        {
            if (typeNames[j] !== '')
            {
                result.push(new Keyword({
                    type: type,
                    name: typeNames[j],
                    render: `<span class="autocomp-name">${typeNames[j]}</span><div class="icon-code-usr"></div><span class="autocomp-type">${type}</span>`
                }))
            }
        }
        return result
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getLinesArray(str)
    {
        let array = []
        str.split(';').forEach(element =>
        {
            if (!element.match(/if|else|switch|for|return/g))
            {
                array.push(element)
            }
        })
        return array
    },

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    parseMacrosFunctionsVariables(str, structTypes = [])
    {
        const isStructType = (str, list) =>
        {
            for (const type of list)
            {
                if (str === type) return true
            }
            return false
        }

        str = this.sanitizeLinesForStructs(str)

        let result = []

        const array = this.getLinesArray(str)

        for (let i = 0; i < array.length; i++)
        {
            const lineStr = array[i].trim()
            const isMacro = lineStr.match(/#define/g)
            const isFunction = lineStr.match(/{/g)
            const isDefinition = Builtins.isType(lineStr.split(' ')[0]) || isStructType(lineStr.split(' ')[0], structTypes)

            if (!isDefinition) continue

            if (isMacro)
            {
                result.push(this.parseMacroLine(lineStr))
            }
            else if (isFunction)
            {
                result.push(this.parseFunctionLine(lineStr))
            }
            else
            {
                result.push(this.parseVariables(lineStr))
            }
        }
        // console.log('parseMacrosFunctionsVariables:result: ', result)
        return result
    }
}

export default Tokenizer