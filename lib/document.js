
const Expression = require("./expression");


class Document {
        
    constructor (body) {        
        this.body = body;
    }
    
    parse () {
        var text = String(this.body);
        const expressions = [];
        
        text = text.replace(/<%([\s\S]+?)%>/g, (match, expressionSource) => {  
            let i = expressions.length;
            let expression = new Expression(expressionSource);
            expressions.push( expression.parse() );
            return `<%${i}%>`;
        });
        
        return new ParsedDocument(text, expressions);
    }
    
    createContext (globals={}) {
        return Expression.createContext(globals);
    }
    
    async evaluate (context) {
        const parsedDocument = this.parse();
        return await parsedDocument.evaluate(context);
    }
    
    toString () {
        return this.source;
    }        
}


class ParsedDocument {
    
    constructor (text, expressions) {
        this.text = text;
        this.expressions = expressions;
    }
    
    async evaluate (context) {
        var text = this.text;
        
        for (let i=0; i<this.expressions.length; i++) {
            try {
                var value = await this.expressions[i].evaluate(context);                
            } catch (error) {
                if (typeof context.Error === 'function') {
                    var value = await context.Error(error);
                } else {
                    var value = context.NOTHING;
                    throw new Error(error);
                }
            }
            let valueStr = await context.str(value);
            text = text.replace(`<%${i}%>`, valueStr);
        }
        
        const localNamespace = {};

        const localNames = Object.getOwnPropertyNames(context);
        for (let name of localNames) {
            localNamespace[name] = context[name];
        }

        if (typeof context.__render__ === "function") text = await context.$call(context.__render__, text);
        localNamespace.toString = localNamespace.__text__ = () => text;

        return localNamespace;    
    }
}


module.exports = Document;
