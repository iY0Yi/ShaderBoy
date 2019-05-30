export default class KeywordDictionary
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
        if (renderWord.type === undefined || renderWord.name === undefined) return;
        let key = renderWord.type + '_' + renderWord.name;
        this.renderWords[key] = renderWord;
    }

    remove(renderWord)
    {
        if (renderWord.type === undefined || renderWord.name === undefined) return;
        let key = renderWord.type + '_' + renderWord.name;
        delete this.renderWords[key];
    }
};
