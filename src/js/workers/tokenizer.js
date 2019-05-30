import Keyword from './keyword';
import Builtins from './builtins';

let Tokenizer = {
    getBetweenStr(str, start, end)
    {
        console.log('getBetweenStr...');
        let startPos = str.indexOf(start);
        let endPos = str.indexOf(end, startPos);
        let strComment = str.substr(startPos, endPos - startPos + end.length);
        return strComment;
    },

    removeStr(str, removeStr)
    {
        console.log('removeStr...');
        return str.replace(removeStr, '');
    },

    removeAllBetween(str, regexp, start, end)
    {
        console.log('removeAllBetween...');
        let res = str + '';
        while (res.match(regexp))
        {
            let strComment = this.getBetweenStr(res, start, end);
            res = res.replace(strComment, '');
        }
        return res;
    },

    removeAllNested(str, regexp, start, end)
    {
        console.log('removeAllNested...');
        let res = str + '';
        let deepestStart = str.lastIndexOf(start);
        let deepestEnd = str.indexOf(end, deepestStart);
        while (res.match(regexp))
        {
            res = res.replace(res.substr(deepestStart, deepestEnd - deepestStart + 1), '');
            deepestStart = res.lastIndexOf(start);
            deepestEnd = res.indexOf(end, deepestStart);
        }
        return res;
    },

    removeBlockComment(str)
    {
        console.log('removeBlockComment...');
        let res = str + '';
        res = this.removeAllBetween(res, /\/\*/g, '/*', '*/');
        return res;
    },

    sanitizeLinesForStructs(str)
    {
        console.log('sanitizeLinesForStructs...');
        let res = '';
        res = this.removeBlockComment(str);
        res = str.replace(/(?=[ ]+)\,/g, ',');
        // res = res.replace(/\t/g, '');

        let tmp = res + '';
        res = '';

        tmp.split(/\r\n|\r|\n/g).forEach(element =>
        {
            element = element.split(/\/\//g)[0].trim();
            element = element.replace(/ const |\(const |\,const /g, ',');
            element = element.trim();
            if (element !== '')
            {
                res += element;
            }
        });
        return res;
    },

    analizeStructs(str, dict)
    {
        console.log('analizeStructs...');
        let result = [];
        str = this.sanitizeLinesForStructs(str);
        let isContainStruct = str.match(/struct/g);
        if (!isContainStruct)
        {
            return [];
        }
        else
        {
            let strStructs = [];
            while (str.match(/struct/g))
            {
                strStructs.push(this.getBetweenStr(str, 'struct', '}'));
                let strFull = strStructs[strStructs.length - 1];
                str = this.removeStr(str, strFull);

                let strMembers = this.getBetweenStr(strFull, '{', '}');
                strFull = this.removeStr(strFull, strMembers);
                strMembers = this.removeStr(strMembers, /\{|\}/g);
                strMembers = strMembers.replace(/; |;| ;/g, ';');
                strMembers = strMembers.replace(/[ ]+/g, ' ');

                let arrMembers = strMembers.split(';');
                let members = [];
                for (let i = 0; i < arrMembers.length; i++)
                {
                    if (arrMembers[i] !== '')
                    {
                        let typeName = arrMembers[i].split(' ');
                        members.push(new Keyword({ type: typeName[0], name: typeName[1] }));
                    }
                }

                let typeName = strFull.split(' ');
                result.push(new Keyword({ type: typeName[0], name: typeName[1], members: members }));
            }
        }
        return result;
    },

    sanitizeLinesForMacroFunctionsVariables(str)
    {
        console.log('sanitizeLinesForMacroFunctionsVariables...');
        let res = '';
        str = this.removeAllBetween(str, /struct/g, 'struct', '}');

        str.split(/\r\n|\r|\n/g).forEach(element =>
        {
            element = element.replace(/\{/g, '{;');
            element = this.removeStr(element, /\}/g);
            element = this.removeStr(element, /(?<=[.])([xyz]+)/g);
            element = element.replace(/[ ]+/g, ' ');
            element = element.trim();
            if (element.match(/\/\//g))
            {
                element = '';
            }
            if (element.match(/#define/g))
            {
                element += ';';
            }
            if (element !== '')
            {
                res += element;
            }
        });
        return res;
    },

    analizeMacroLine(str, dict)
    {
        console.log('analizeMacroLine...');
        let result = [];
        str = this.removeAllBetween(str, /\(/g, '(', ')').trim();
        let typeName = str.split(' ');
        result.push(new Keyword({ type: typeName[0], name: typeName[1] }));
        return result;
    },

    analizeFunctionLine(str, dict)
    {
        console.log('analizeFunctionLine...');
        let result = [];
        // args
        let args = [];
        let strArgs = this.getBetweenStr(str, '(', ')');
        strArgs = strArgs.replace(/ ,|, |,/g, ',');
        strArgs = this.removeStr(strArgs, / in |\(in |\,in /g);
        strArgs = this.removeStr(strArgs, / out |\(out |\,out /g);
        strArgs = this.removeStr(strArgs, / inout |\(inout |\,inout /g);
        strArgs = strArgs.replace(/[ ]+/g, ' ');
        strArgs = this.removeStr(strArgs, /[()]/g);
        strArgs = strArgs.split(',');
        for (let i = 0; i < strArgs.length; i++)
        {
            let arg = strArgs[i].split(/ /g);
            args.push(new Keyword({ type: arg[0], name: arg[1] }));
        }

        // type/name
        let typeName = str.split(/[ (]/g);
        result.push(new Keyword({ type: typeName[0], name: typeName[1], args: args }));
        return result;
    },

    analizeVariables(str, dict)
    {
        console.log('analizeVariables...');
        let result = [];
        //#1: remove brackets
        str = this.removeAllNested(str, /\(|\)/g, '(', ')');

        //#2: remove initializing 
        let eqPos = str.indexOf('=');
        let cmPos = str.indexOf(/,/g);
        cmPos = (cmPos === -1) ? str.length : cmPos;
        while (str.match('='))
        {
            str = str.replace(str.substr(eqPos, cmPos - eqPos + 1), '');
            eqPos = str.indexOf('=');
            cmPos = str.indexOf(/,/g);
            cmPos = (cmPos === -1) ? str.length : cmPos;
        }
        str = str.replace(/ ,|, |,/g, ',');

        let typeNames = str.split(/[ ,]/g);
        let type = typeNames[0];
        for (let j = 1; j < typeNames.length; j++)
        {
            if (typeNames[j] !== '')
            {
                result.push(new Keyword({ type: type, name: typeNames[j] }));
            }
        }
        return result;
    },

    getLinesArray(str)
    {
        console.log('getLinesArray...');
        let array = [];
        str.split(';').forEach(element =>
        {
            if (!element.match(/if|else|switch|for|return/g))
            {
                array.push(element);
            }
        });
        return array;
    },

    analyzeMacroFuctionsVariables(str, dict)
    {
        console.log('analyzeMacroFuctionsVariables...');
        let result = [];

        let array = this.getLinesArray(str);

        for (let i = 0; i < array.length; i++)
        {
            let lineStr = array[i].trim();
            let isMacro = lineStr.match(/#define/g);
            let isFunction = lineStr.match(/{/g);
            let isDefinition = Builtins.isType(lineStr.split(' ')[0]);

            if (!isDefinition) continue;

            if (isMacro)
            {
                result.push(this.analizeMacroLine(lineStr, dict));
            }
            else
                if (isFunction)
                {
                    result.push(this.analizeFunctionLine(lineStr, dict));
                }
                else
                {
                    result.push(this.analizeVariables(lineStr, dict));
                }
        }
        return result;
    }
};

export default Tokenizer;