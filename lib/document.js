
const expression = require("./expression");

class Document {
    
    constructor (source, locals={}, globals={}) {
        this.source = source;
        this.locals = Object(locals);
        this.globals = Object(globals);
    }
    
    get source () {
        return this._source;
    }
    
    set source (value) {
        const source = String(value);
        this._eval = this.constructor.parse(source);
        this._source = source;
    }
    
    async evaluate (params={}) {
        const context = expression.createContext(this.globals);
        Object.assign(context, this.locals, params);
        return await this._eval(context);
    }
    
    async render (presets={}) {
        const docNS = await this.evaluate(presets);
        return await expression.stringify(docNS);
    }
    
    static parse (source) {
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
            namespace.__str__ = await __render__(text, context);

            return namespace;                                    
        };               
    }
}

async function __render__ (text, context) {
    
    if (typeof context.__render__ === "function") {
        let renderedText = await context.__render__(text);
        return await expression.stringify(renderedText);
    }
    
    if (typeof context.__render__ === "object" && context.__render__ !== null && typeof context.__render__.__apply__ === "function") {
        let renderedText = await context.__render__.__apply__(text);
        return await expression.stringify(renderedText);
    }
        
    return text;
}

module.exports = Document;
