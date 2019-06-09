export default class Keyword
{
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    constructor(data)
    {
        this.type = (data.type) ? data.type : null
        this.name = (data.name) ? data.name : null
        this.render = (data.render) ? data.render : null
        this.args = (data.args) ? data.args : null
        this.members = (data.members) ? data.members : null
        this.snippet = (data.snippet) ? data.snippet : null
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    getData()
    {
        return {
            type: this.type,
            name: this.name,
            render: this.render,
            args: this.args,
            members: this.members,
            snippet: this.snippet
        }
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    isFunction()
    {
        return this.snippet !== null && this.args !== null
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    isStruct()
    {
        return this.snippet !== null && this.members !== null
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    isVariable()
    {
        return !this.isFunction() && !this.isStruct()
    }
};