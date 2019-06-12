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

class Struct
{
    constructor(data)
    {
      this.name = (data.name) ? data.name : null;
      this.members = (data.members) ? data.members : null;
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
let dict = new KeywordDictionary('Image');
let tmpDict = [];
let res;
console.log('----RAW CODE----------------------------------------------------------------------------------');
res=`
vec3 shadeOpaque( in vec3 ro, in vec3 rd, in float t, in float m, in vec4 matInfo )
{
        mateS = 1.5*vec3(1.0,0.65,0.6) * (1.0-tip);//*0.5;
}

`;
// console.log(res);
console.log('----PARSED CODE------------------------------------------------------------------------------');
let shadertoyTypes = ("float vec2 vec3 vec4 int ivec2 ivec3 ivec4 bool bvec2 bvec3 bvec4 mat2 mat3 mat4 void").split(" ");
let shadertoyTypes_and_define = shadertoyTypes.concat(); // For detecting "#define" as type.
shadertoyTypes_and_define.push('#define');
let allTypes = shadertoyTypes_and_define.concat();

// Check if the word is a type.
let isType=(str)=>{
    for (let i = 0; i < allTypes.length; i++)
    {
        if (str === allTypes[i]) return true;
    }
    return false;
};

let getBetweenStr =(str, start, end)=>{
  let startPos = str.indexOf(start);
  let endPos = str.indexOf(end, startPos);
  let strComment = str.substr(startPos, endPos-startPos+end.length);
  return strComment;
};
let removeStr =(str, removeStr)=>{
  return str.replace(removeStr, '');
};
let removeAllBetween=(str, regexp, start, end)=>{
  let res=str+'';
  while(res.match(regexp))
  {
    let strComment = getBetweenStr(res, start, end);
    res = res.replace(strComment, '');
  }
  return res;
};
let removeAllNested=(str, regexp, start, end)=>{
  let res = str+'';
  let deepestStart = str.lastIndexOf(start);
  let deepestEnd = str.indexOf(end, deepestStart);
  while(res.match(regexp))
  {
    res = res.replace(res.substr(deepestStart, deepestEnd-deepestStart+1), '');
    deepestStart = res.lastIndexOf(start);
    deepestEnd = res.indexOf(end, deepestStart);
  }
  return res;
};

let removeBlockComment =(str)=>{
  let res=str+'';
  res = removeAllBetween(res, /\/\*/g, '/*', '*/');
  return res;
};

let sanitizeLinesForStructs = (str)=>{
  let res = '';
  res = removeBlockComment(str);
  res = str.replace(/(?=[ ]+)\,/g, ',');
  res = res.replace(/\t/g, '');
  
  let tmp = res+'';
  res='';
  
  tmp.split(/\r\n|\r|\n/).forEach(element =>
      {
          element = element.split(/\/\//g)[0].trim();
          element = element.replace(/ const |\(const |\,const /g, ',');
          if (element !== '')
          {
              res += element;
          }
      });
  return res;
};
let analizeStructs = (str, dict)=>{
  str = sanitizeLinesForStructs(str);
  let isContainStruct = str.match(/struct/g);
  if(!isContainStruct)
  {
    return str;
  }
  else
  {
    let strStructs = [];
    while(str.match(/struct/g))
    {
      strStructs.push(getBetweenStr(str, 'struct', '}'));
      let strFull = strStructs[strStructs.length-1];
      str = removeStr(str, strFull);

      let strMembers = getBetweenStr(strFull, '{', '}');
      strFull = removeStr(strFull, strMembers);
      strMembers = removeStr(strMembers, /\{|\}/g);
      strMembers = strMembers.replace(/; |;| ;/g, ';');
      strMembers = strMembers.replace(/[ ]+/g, ' ');

      let arrMembers = strMembers.split(';');
      let members = [];
      for(let i=0; i<arrMembers.length; i++)
      {
        if(arrMembers[i]!=='')
        {
          let typeName = arrMembers[i].split(' ');
          members.push(new Keyword({type: typeName[0], name:typeName[1]}));
        }
      }
      
      let typeName = strFull.split(' ');
      dict.push(new Keyword({type:typeName[0], name:typeName[1], members:members}));
    }
    return str;
  }
};

let sanitizeLinesForMacroFunctionsVariables = (str)=>{
  let res = '';
  str = removeAllBetween(str, /struct/g, 'struct', '}');
  
  str.split(/\r\n|\r|\n/g).forEach(element =>
  {
      element = element.replace(/\{/g, '{;');
      element = element.replace(/\}/g, '');
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
};
let analizeMacroLine = (str, dict)=>{
    str = removeAllBetween(str, /\(/g, '(', ')').trim();
    let typeName = str.split(' ');
    dict.push(new Keyword({type:typeName[0], name:typeName[1]}));
};
let analizeFunctionLine = (str, dict)=>{
    // args
    let args = [];
    let strArgs = getBetweenStr(str, '(', ')');
    strArgs = strArgs.replace(/ ,|, |,/g, ',');
    strArgs = removeStr(strArgs, / in |\(in |\,in /g);
    strArgs = removeStr(strArgs, / out |\(out |\,out /g);
    strArgs = removeStr(strArgs, / inout |\(inout |\,inout /g);
    strArgs = strArgs.replace(/[ ]+/g, ' ');
    strArgs = removeStr(strArgs, /[()]/g);
    strArgs = strArgs.split(',');
    for(let i=0; i<strArgs.length; i++)
    {
        let arg = strArgs[i].split(/ /g);
        args.push(new Keyword({type:arg[0], name:arg[1]}));
    }

    // type/name
    let typeName = str.split(/[ (]/g);
    dict.push(new Keyword({type:typeName[0], name:typeName[1], args:args}));
};
let analizeVariables = (str, dict)=>{
    //#1: remove brackets
    str = removeAllNested(str, /\(|\)/g, '(', ')');
  
    //#2: remove initializing 
    let eqPos = str.indexOf('=');
    let cmPos = str.indexOf(/,/g);
    cmPos = (cmPos===-1)?str.length : cmPos;
    while(str.match('='))
    {
        str = str.replace(str.substr(eqPos, cmPos-eqPos+1), '');
        eqPos = str.indexOf('=');
        cmPos = str.indexOf(/,/g);
        cmPos = (cmPos===-1)?str.length:cmPos;
    }
    str = str.replace(/ ,|, |,/g, ',');
  
    let typeNames =str.split(/[ ,]/g);
    let type = typeNames[0];
    for(let j=1; j<typeNames.length; j++)
    {
      if(typeNames[j]!=='')
        {
          dict.push(new Keyword({type:type, name:typeNames[j]}));
        }
    }
};
let getLinesArray=(str)=>{
  let array=[];
  str.split(';').forEach(element =>{
     if(!element.match(/if|else|switch|for|return/g))
       {
         array.push(element);
       }
  });
  return array;
};
let analyzeMacroFuctionsVariables = (str, dict) =>{
  str = sanitizeLinesForMacroFunctionsVariables(str);
  let array = getLinesArray(str);
  
  for(let i=0; i<array.length; i++)
  {
    let lineStr = array[i].trim();
    let isMacro = lineStr.match(/#define/g);
    let isFunction = lineStr.match(/{/g);
    let isDefinition = isType(lineStr.split(' ')[0]);

    if(!isDefinition) continue;

    if(isMacro)
    {
      analizeMacroLine(lineStr, dict);
    }
    else
    if(isFunction)
    {
      analizeFunctionLine(lineStr, dict);
    }
    else
    {
      analizeVariables(lineStr, dict);
    }
  }
};

analizeStructs(res, tmpDict);
analyzeMacroFuctionsVariables(res, tmpDict);

tmpDict.forEach(el=>{
  console.log(el);
})
// for(let key in dict.renderWords){
//   console.log(dict.renderWords[key]);
// };