
const expression = require("./expression");


exports.parse = function (source) {
    source = String(source);
    const parsedExpressions = [];
    var parsedSource = source;
    parsedSource = parsedSource.replace(/<%([\s\S]+?)%>/g, (match, expressionSource) => {  
        let i = parsedExpressions.length;
        parsedExpressions.push( expression.parse(expressionSource) );
        return `<%${i}%>`;
    }); 
    
    return async (context) => {
        const doc = {};
        
        var text = parsedSource;
        for (let i=0; i<parsedExpressions.length; i++) {
            let evaluateExpression = parsedExpressions[i];
            let value = await evaluateExpression(context);                
            text = text.replace(`<%${i}%>`, expression.stringify(value));
        }
        
        const namespace = Object.assign({}, context);
        namespace.__str__ = text;

        return new this.Content(text, namespace);                                    
    };               
}


exports.render = async function (source, context) {
    return await this.parse(source)(context);        
}


exports.createContext = function (globals={}, presets={}) {
    const context = expression.createContext(globals);
    return Object.assign(context, presets);
}


const DocumentContent = exports.Content = class {
    
    constructor (text, namespace) {
        this._text = String(text);
        this._namespace = Object(namespace);
    }
    
    get (name) {
        return this._namespace[name];
    }
    
    get size () {
        return Object.keys(this._namespace).length;
    }
    
    *[Symbol.iterator] () {
        for (let name in this._namespace) yield name;
    }
    
    toString () {
        return this._text;
    }
    
    toNamespace () {
        return this._namespace;
    }
}
