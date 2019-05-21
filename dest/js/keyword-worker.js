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

// Builtin lists
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
let shadertoyTypes = ("float vec2 vec3 vec4 int ivec2 ivec3 ivec4 bool bvec2 bvec3 bvec4 mat2 mat3 mat4 void").split(" ");
let shadertoyTypes_and_define = shadertoyTypes.concat(); // For detecting "#define" as type.
shadertoyTypes_and_define.push('#define');
let allTypes = shadertoyTypes_and_define.concat();
let shadertoyUniforms = ("iResolution iTime iTimeDelta iFrame iFrameRate iDate iMouse iChannel0 iChannel1 iChannel2 iChannel3 iSampleRate").split(" ");
let shadertoyVariables = ("fragColor fragCoord").split(" ");
let shadertoyKeywords = ("break continue do for while if else true false lowp mediump highp precision discard return").split(" ");
let shadertoyTypesQualifiers = ("in out inout const").split(" ");
let shadertoyPreProcessor = ("#define #undef #if #ifdef #ifndef #else #elif #endif").split(" ");
let shadertoyBuiltins = ("sin cos tan asin acos atan atan radians degrees " +
    "pow exp log exp2 log2 sqrt inversesqrt abs ceil " +
    "clamp floor fract max min mix mod sign smoothstep " +
    "step ftransform cross distance dot faceforward " +
    "length normalize reflect refract dFdx dFdy fwidth " +
    "matrixCompMult all any equal greaterThan greaterThanEqual " +
    "lessThan lessThanEqual notEqual texelFetch texture textureLod").split(" ");

// Util functions
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Separate line in words with token. Keep token as a word.
let replaceAndSeparate = function (wordList, reg, str)
{
    let id = 0;
    let word = '';
    while (true)
    {
        word = wordList[id];
        if (word !== undefined && word.match(reg) && word.length > 1)
        {
            word = word.split(reg);
            wordList.splice(id, 1);

            let addcnt = 0;
            let cnt = 0;
            for (let i = 0; i < word.length; i++)
            {
                if (word[i] === '' && i < word.length - 1)
                {
                    wordList.splice(id + i + cnt, 0, str);
                    addcnt++;
                }
                else if (word[i] !== '')
                {
                    wordList.splice(id + i + cnt, 0, word[i]);
                    addcnt++;
                    if (word[i] !== '' && i < word.length - 1)
                    {
                        wordList.splice(id + i + cnt + 1, 0, str);
                        cnt++;
                        addcnt++;
                    }
                }
            }
            id += addcnt - 1;
        }
        id++;
        if (id >= wordList.length) break;
    }
    return wordList;
};

// Check if the word is a type.
let isType = function (str)
{
    for (let i = 0; i < allTypes.length; i++)
    {
        if (str === allTypes[i]) return true;
    }
    return false;
};

let sanitize = function (lineStr)
{
    let res = '';
    if (lineStr.match(/#define/))
    {
        res =
            res = res.replace(/(?<=[.])([xyz]+)/g, '');
        res = res.replace(/[^ a-zA-Z0-9;]/g, ' ');
        res = res.replace(/(?<=[ ])([0-9]?)(?=[ ])/g, '');
        res = res.replace(/[ ]+/g, ' ');
        element = element.split('//')[0].trim();
        element = element.replace('{', '{;');
        element = element.replace('}', '');
    }
    else
    {
        if (lineStr.match(/{/))
        {

        }
        else
        {

        }
    }
}
// Core function for analyzing code.
// let analyzeLine = function (lineStr)
// {
//     let newWords = [];

//     let arrayed = lineStr.split(' ');
//     if (isType(arrayed[0]))
//     {
//         let isFuncDefLine = arrayed.some(item => item.match('{'));

//         if (arrayed[0] === '#define')
//         {
//             lineStr = arrayed[0] + " " + arrayed[1];
//         }

//         if (!isFuncDefLine)
//         {
//             // Remove brackets with inside...
//             let id = 0;
//             arrayed = replaceAndSeparate([lineStr], /\(/, '(');
//             lineStr = '';
//             for (let i = 0; i < arrayed.length; i++)
//             {
//                 if (arrayed[i].match(/\)/))
//                 {
//                     let arr = replaceAndSeparate([arrayed[i]], /\)/, ')');
//                     arrayed[i] = arr[arr.length - 1];
//                 }
//                 lineStr += arrayed[i];
//             }

//             // Sanitize for multiple definition. For each variavle words...
//             if (lineStr.match(/\,/))
//             {
//                 // Remove after "="...
//                 let arr = replaceAndSeparate([lineStr], /\,/, ',');
//                 lineStr = '';
//                 for (let i = 0; i < arr.length; i++)
//                 {
//                     lineStr += replaceAndSeparate([arr[i]], /\=/, '=')[0];
//                 }

//                 // Remove empties...
//                 arr = lineStr.split(' ');
//                 lineStr = arr[0] + ' '; // First is type keyword.
//                 for (let i = 1; i < arr.length; i++)
//                 {
//                     lineStr += arr[i];
//                 }
//             }

//             // Sanitize for single definition....
//             if (lineStr.match(/\=/))
//             {
//                 lineStr = replaceAndSeparate([lineStr], /\=/, '=')[0];
//             }

//             // Last sanitize:
//             // Remove fragment alphabets, (, ), ., symbols...
//             if (lineStr.match(/\(|\)/))
//             {
//                 let arr = lineStr.split(',');
//                 lineStr = arr[0];
//                 for (let i = 1; i < arr.length; i++)
//                 {
//                     if (!arr[i].match(/\(|\)|\.|\W/) && arr[i].match(/\D/))
//                     {
//                         lineStr += ',' + arr[i]
//                     }
//                 }
//             }
//         }

//         if (isFuncDefLine)
//         {
//             // Registration Functions...
//             let arr = lineStr.split('(');
//             const typename = arr[0].split(' ');
//             const type = typename[0];
//             const name = typename[1];

//             let fnargs = [];

//             // Argument as variables
//             let args = arr[0];
//             if (arr[1])
//             {
//                 args = arr[1].replace('){', '');
//                 args = args.split(',');
//             }
//             for (let i = 0; i < args.length; i++)
//             {
//                 const argTypeName = args[i].split(' ');
//                 for (let j = 0; j < argTypeName.length; j++)
//                 {
//                     if (isType(argTypeName[j]))
//                     {
//                         let vargs = new Keyword({
//                             type: argTypeName[j],
//                             name: argTypeName[j + 1],
//                             render: '<span class="autocomp-name">' + argTypeName[j + 1] + '</span><div class="icon-code-usr"></div><span class="autocomp-type">' + argTypeName[j] + '</span>'
//                         });
//                         newWords.push(vargs); // Register args as variables
//                         fnargs.push(vargs);
//                     }
//                 }
//             }
//             let fxName = name + '(';
//             for (let i = 0; i < fnargs.length; i++)
//             {
//                 fxName += fnargs[i].type;
//                 fxName += '_';
//                 fxName += fnargs[i].name;
//                 fxName += (i < fnargs.length - 1) ? ', ' : '';
//             }
//             fxName += ')';

//             newWords.push(new Keyword({
//                 type: type,
//                 name: fxName,
//                 args: fnargs,
//                 render: '<span class="autocomp-name">' + name + '</span><div class="icon-code-usr"></div><span class="autocomp-type">' + 'fx: ' + type + '</span>'
//             }));
//         }
//         else
//         {
//             // Registration Variables...
//             let arr = lineStr.split(' ');
//             let type = arr[0];
//             arr = arr[1].split(',');

//             for (let i = 0; i < arr.length; i++)
//             {
//                 newWords.push(new Keyword({
//                     type: type,
//                     name: arr[i],
//                     render: '<span class="autocomp-name">' + arr[i] + '</span><div class="icon-code-usr"></div><span class="autocomp-type">' + type + '</span>'
//                 }));
//             }
//         }
//     }

//     return newWords;
// };

let analizeStructs = (str) =>
{
    let result = [];
    let isContainStruct = str.match(/struct/g);
    if (!isContainStruct)
    {
        return { renderWords: undefined, strFiltered: str };
    }
    else
    {
        let strStructs = [];
        console.log('str: ', str);
        while (str.match(/struct/g))
        {
            let startPos = str.indexOf('struct');
            let endPos = str.indexOf('}');
            strStructs.push(str.substr(startPos, endPos - startPos + 1));
            let strFull = strStructs[strStructs.length - 1];
            str = str.replace(strFull, '');

            startPos = strFull.indexOf('{');
            endPos = strFull.indexOf('}');
            let strMembers = strFull.substr(startPos, endPos - startPos + 1);
            strFull = strFull.replace(strMembers, '');
            strMembers = strMembers.replace(/\{|\}/g, '');
            strMembers = strMembers.replace(/; |;| ;/g, ';');
            strMembers = strMembers.replace(/[ ]+/g, ' ');
            console.log('strMembers: ', strMembers);
            let arrMembers = strMembers.split(';');
            let members = [];
            for (let i = 0; i < arrMembers.length; i++)
            {
                if (arrMembers[i] !== '')
                {
                    let typeName = arrMembers[i].split(' ');
                    members.push(new Keyword({
                        type: typeName[0],
                        name: typeName[1],
                        render: '<span class="autocomp-name">' + typeName[1] + '</span><div class="icon-code-usr"></div><span class="autocomp-type">member: ' + typeName[0] + '</span>'
                    }));
                }
            }

            let typeName = strFull.split(' ');
            let name = typeName[1];
            let type = typeName[0];
            let fxName = name;
            fxName += ' var_name = ';
            fxName += name;
            fxName += '(';
            for (let i = 0; i < members.length; i++)
            {
                fxName += members[i].type;
                fxName += '_';
                fxName += members[i].name;
                fxName += (i < members.length - 1) ? ', ' : '';
            }
            fxName += ');';
            result.push(new Keyword({
                type: type,
                name: fxName,
                members: members,
                render: '<span class="autocomp-name">' + name + '</span><div class="icon-code-usr"></div><span class="autocomp-type">' + 'st: ' + type + '</span>'
            }));
        }
        return { renderWords: result, strFiltered: str };
    }
};

let analizeFunctionLine = (str) =>
{
    let result = [];
    let openBracket = str.indexOf('(');
    let closeBracket = str.indexOf(')', openBracket);

    // args
    let args = [];
    let strArgs = str.substr(openBracket, closeBracket - openBracket + 1);
    strArgs = strArgs.replace(/ ,|, |,/g, ',');
    strArgs = strArgs.replace(/[()]/g, '');
    strArgs = strArgs.split(',');
    for (let i = 0; i < strArgs.length; i++)
    {
        let arg = strArgs[i].split(/ /g);
        args.push(new Keyword({ type: arg[0], name: arg[1] }));
    }

    // type/name
    let typeName = str.split(/[ (]/g);
    let name = typeName[1];
    let type = typeName[0];
    let fxName = name + '(';
    for (let i = 0; i < args.length; i++)
    {
        fxName += args[i].type;
        fxName += '_';
        fxName += args[i].name;
        fxName += (i < args.length - 1) ? ', ' : '';
    }
    fxName += ')';


    result.push(new Keyword({
        type: typeName[0],
        name: fxName,
        args: args,
        render: '<span class="autocomp-name">' + typeName[1] + '</span><div class="icon-code-usr"></div><span class="autocomp-type">' + 'fx: ' + typeName[0] + '</span>'
    }));

    return result;
}

let analizeVariables = (str) =>
{
    let result = [];
    //#1: remove brackets
    let lastOpenBracket = str.lastIndexOf('(');
    let firstCloseBracket = str.indexOf(')', lastOpenBracket);
    while (str.match(/\(|\)/g))
    {
        str = str.replace(str.substr(lastOpenBracket, firstCloseBracket - lastOpenBracket + 1), '');
        lastOpenBracket = str.lastIndexOf('(');
        firstCloseBracket = str.indexOf(')', lastOpenBracket);
    }
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
            result.push(new Keyword({
                type: type,
                name: typeNames[j],
                render: '<span class="autocomp-name">' + typeNames[j] + '</span><div class="icon-code-usr"></div><span class="autocomp-type">' + type + '</span>'
            }));
        }
    }
    return result;
}

let analyzeLine = function (lineStr)
{
    let isMacro = lineStr.match(/#define/g);
    let isFunction = lineStr.match(/{/g);

    if (isMacro)
    {
        let typeName = lineStr.split(' ');
        return new Keyword({ type: typeName[0], name: typeName[1] });
    }
    else
        if (isFunction)
        {
            return analizeFunctionLine(lineStr);
        }
        else
        {
            return analizeVariables(lineStr);
        }
}


// Dictionaries
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class KeywordDictionary
{
    constructor(name)
    {
        this.name = name;
        this.renderWords = {};
    }

    search(renderWord)
    {
        let searchWord = renderWord.type + '_' + renderWord.name;
        return this.renderWords.hasOwnProperty(searchWord);// return in Boolean
    }

    filter(word)
    {
        let filteredKeys = Object.keys(this.renderWords).filter((item) =>
        {
            if (item !== undefined && word !== undefined)
            {
                let serachPos = item.indexOf('_') + 1;
                return (item.toUpperCase().indexOf(word.toUpperCase(), serachPos) === serachPos ? true : false) && (item.toUpperCase() !== word.toUpperCase());
            }
        });

        let filteredRenders = [];

        filteredKeys.forEach(element =>
        {
            filteredRenders.push(this.renderWords[element].getData());
        });

        return filteredRenders;
    }

    add(renderWord)
    {
        let key = renderWord.type + '_' + renderWord.name;
        this.renderWords[key] = renderWord;
    }

    remove(renderWord)
    {
        let key = renderWord.type + '_' + renderWord.name;
        delete this.renderWords[key];
    }
}

class Keyword
{
    constructor(data)
    {
        this.type = (data.type) ? data.type : null;
        this.name = (data.name) ? data.name : null;
        this.render = (data.render) ? data.render : null;
        this.args = (data.args) ? data.args : null;
        this.members = (data.members) ? data.members : null;
    }

    getData()
    {
        return {
            type: this.type,
            name: this.name,
            render: this.render,
            args: this.args,
            members: this.members,
        }
    }

    isFunction()
    {
        return this.args !== null;
    }

    isStruct()
    {
        return this.members !== null;
    }

    isVariable()
    {
        return !this.isFunction() && !this.isStruct();
    }
}

var keywordDict = {};
keywordDict['Builtins'] = new KeywordDictionary('Builtins');
keywordDict['BufferA'] = new KeywordDictionary('BufferA');
keywordDict['BufferB'] = new KeywordDictionary('BufferB');
keywordDict['BufferC'] = new KeywordDictionary('BufferC');
keywordDict['BufferD'] = new KeywordDictionary('BufferD');
keywordDict['Image'] = new KeywordDictionary('Image');
keywordDict['Sound'] = new KeywordDictionary('Sound');
keywordDict['Common'] = new KeywordDictionary('Common');

var strPrevCodeFull = '';
var strPrevCodeWords = '';
var linesprevCodeWords = [''];

var initBltinDict = function ()
{
    console.log('started: KeywordWorker.initBltinDict...');
    function registerBltins(list, type, categoryId)
    {
        for (let i = 0; i < list.length; i++)
        {
            keywordDict['Builtins'].add(
                new Keyword(
                    {
                        type: 'fixed',
                        name: list[i],
                        render: '<span class="autocomp-name">' + list[i] + '</span><div class="icon-code-' + categoryId + '"></div><span class="autocomp-type">' + type + '</span>'
                    }),
            );
        };
    }
    registerBltins(shadertoyTypes, 'types', 'gl');
    registerBltins(shadertoyKeywords, 'keywords', 'gl');
    registerBltins(shadertoyTypesQualifiers, 'type qualifier', 'gl');
    registerBltins(shadertoyPreProcessor, 'pre processor', 'gl');
    registerBltins(shadertoyBuiltins, 'builtin', 'gl');
    registerBltins(shadertoyUniforms, 'uniform', 'st');
    registerBltins(shadertoyVariables, 'variable', 'st');
};

var filterDictByWord = function (dictName, curWord)
{
    console.log('started: KeywordWorker.filterDictByWord...');

    let filteredBuiltinsList = keywordDict['Builtins'].filter(curWord);
    let filteredUserList = keywordDict[dictName].filter(curWord);
    console.log('filteredUserList: ', filteredUserList);

    let filteredDict = filteredBuiltinsList.concat(filteredUserList);
    console.log('filteredDict: ', filteredDict);
    if (filteredDict.length >= 1 || (filteredDict[0] !== undefined && filteredDict[0].text !== undefined && filteredDict.length === 1 && filteredDict[0].text.toUpperCase() !== curWord.toUpperCase()))
    {
        filteredDict.sort(function (a, b)
        {
            // Use toUpperCase() to ignore character casing
            const textA = a.name.toUpperCase();
            const textB = b.name.toUpperCase();

            let comparison = 0;
            if (textA > textB)
            {
                comparison = 1;
            } else if (textA < textB)
            {
                comparison = -1;
            }
            return comparison;
        });

        postMessage(JSON.stringify({ name: 'filter_succeed', content: { list: filteredDict } }, null, "\t"));
    }
    postMessage(JSON.stringify({ name: 'filter_failed', content: null }, null, "\t"));
};

var filterStructByWord = function (dictName, curWord)
{
    console.log('started: KeywordWorker.filterStructByWord...');

    let filteredDict = keywordDict[dictName].filter(curWord);
    console.log('filteredDict: ', filteredDict);

    if (filteredDict.length === 1)//|| (filteredDict[0] !== undefined && filteredDict[0].text !== undefined && filteredDict.length === 1 && filteredDict[0].text.toUpperCase() !== curWord.toUpperCase()))
    {
        filteredDict = keywordDict[dictName].filter(filteredDict[0].type);
        if (filteredDict[0].members !== null)
        {
            console.log('filteredDict[0].members: ', filteredDict[0].members);
            postMessage(JSON.stringify({ name: 'filter_succeed', content: { list: filteredDict[0].members } }, null, "\t"));
        }
        // filteredDict.sort(function (a, b)
        // {
        //     // Use toUpperCase() to ignore character casing
        //     const textA = a.name.toUpperCase();
        //     const textB = b.name.toUpperCase();

        //     let comparison = 0;
        //     if (textA > textB)
        //     {
        //         comparison = 1;
        //     } else if (textA < textB)
        //     {
        //         comparison = -1;
        //     }
        //     return comparison;
        // });


    }
    postMessage(JSON.stringify({ name: 'filter_failed', content: null }, null, "\t"));
};

var syncUserDict = function (dictName, newCodeStr)
{
    console.log('started: KeywordWorker.syncUserDict...');
    // keywordDict[dictName] = [];
    console.log('newCodeStr@start: ', newCodeStr);

    let strNewCodeFull = '';
    // Delete line-breaks and comment lines...
    newCodeStr.split(/\r\n|\r|\n/).forEach(element =>
    {
        element = element.split('//')[0].trim();
        if (element !== '')//&& !element.match(/mainImage|mainSound/))
        {
            strNewCodeFull += element;
        }
    });

    let result = analizeStructs(strNewCodeFull);
    if (result.renderWords !== undefined)
    {
        // Found structs...
        for (let i = 0; i < result.renderWords.length; i++)
        {
            keywordDict[dictName].add(result.renderWords[i]);
        }
    }

    newCodeStr = result.strFiltered;
    console.log('st: ', newCodeStr);
    strNewCodeFull = '';
    newCodeStr.split(/\r\n|\r|\n/).forEach(element =>
    {
        element = element.replace('{', '{;');
        element = element.replace('}', '');
        if (element.match('#define'))
        {
            element += ';';
        }
        if (element !== '')//&& !element.match(/mainImage|mainSound/))
        {
            strNewCodeFull += element;
        }
    });

    // strNewCodeFull = strNewCodeFull.replace('{', '{;');
    // strNewCodeFull = strNewCodeFull.replace('}', '');

    let strNewCodeWords = strNewCodeFull + '';
    strNewCodeWords = strNewCodeWords.replace(/(?<=[.])([xyz]+)/g, '');
    // strNewCodeWords = strNewCodeWords.replace(/[^ a-zA-Z0-9;]/g, ' ');
    // strNewCodeWords = strNewCodeWords.replace(/(?<=[ ])([0-9]?)(?=[ ])/g, '');
    strNewCodeWords = strNewCodeWords.replace(/[ ]+/g, ' ');
    let linesnewCodeWords = strNewCodeWords.split(';');
    console.log('linesnewCodeWords:', linesnewCodeWords);

    let maxLen = Math.max(linesprevCodeWords.length, linesnewCodeWords.length);
    let isNewLonger = (linesnewCodeWords.length > linesprevCodeWords.length);
    let linesNeedAnalyze = [];
    for (let i = 0; i < maxLen; i++)
    {
        if (linesprevCodeWords[i] === undefined) linesprevCodeWords[i] = ' ';
        if (linesnewCodeWords[i] === undefined) linesnewCodeWords[i] = ' ';
        if (linesprevCodeWords[i] !== linesnewCodeWords[i] || linesnewCodeWords[i].match(/{/))
        {
            linesNeedAnalyze.push(i);
        }
    }
    let prevL = strPrevCodeFull.split(/\;/);
    let newL = strNewCodeFull.split(/\;/);

    console.log(keywordDict[dictName]);
    console.log('linesNeedAnalyze: ', linesNeedAnalyze);
    // console.log('prevL: ', prevL);
    console.log('newL: ', newL);

    for (let i = 0; i < prevL.length; i++)
    {
        if (linesNeedAnalyze.some(lineId => lineId === i))
        {
            let renderWords = analyzeLine(prevL[i]);
            for (let j = 0; j < renderWords.length; j++)
            {
                keywordDict[dictName].remove(renderWords[j]);
            }
        }
    }

    for (let i = 0; i < newL.length; i++)
    {
        if (linesNeedAnalyze.some(lineId => lineId === i))
        {
            let renderWords = analyzeLine(newL[i]);
            for (let j = 0; j < renderWords.length; j++)
            {
                keywordDict[dictName].add(renderWords[j]);
            }
        }
    }

    // console.clear();
    for (const key in keywordDict[dictName].renderWords)
    {
        if (keywordDict[dictName].renderWords.hasOwnProperty(key))
        {
            let kw = keywordDict[dictName].renderWords[key];
            console.log('r: ', kw.type, kw.name, kw.isFunction());
        }
    }

    strPrevCodeFull = strNewCodeFull;
    strPrevCodeWords = strNewCodeWords;
    linesprevCodeWords = linesnewCodeWords;
};


// Message
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
onmessage = (msg) =>
{
    let data = JSON.parse(msg.data);
    switch (data.name)
    {
        case 'initBltinDict':
            initBltinDict();
            break;

        case 'syncUserDict':
            syncUserDict(data.content.dictName, data.content.strCode);
            break;

        case 'filterDictByWord':
            filterDictByWord(data.content.dictName, data.content.curWord);
            break;

        case 'filterStructByWord':
            filterStructByWord(data.content.dictName, data.content.curWord);
            break;

        default:
            break;
    }
};