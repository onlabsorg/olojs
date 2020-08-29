// =============================================================================
//  This module contains functions to parse, evaluate and render olo-documents.
// =============================================================================



//  This points to the expression module, but it could be any object 
//  implementing the following methods:
//  - expression.parse
//  - expression.createContext
//  - expression.stringify
//  - expression.apply
exports.expression = require("./expression");



//  Given a document source, returns an evaluation async function which takes a
//  document context as input and resolves the document namespace.
exports.parse = function (source) {
    var parsedSource = String(source);
    
    // Find all the swan expressions in the source, store them in an array and
    // replace them with a placeholder.
    const parsedExpressions = [];
    parsedSource = parsedSource.replace(/<%([\s\S]+?)%>/g, (match, expressionSource) => {  
        let i = parsedExpressions.length;
        let parsedExpression;
        try {
            parsedExpression = this.expression.parse(expressionSource);
        } catch (error) {
            parsedExpression = context => {throw error};
        }
        parsedExpression.source = expressionSource;            
        parsedExpressions.push( parsedExpression );
        return `<%${i}%>`;
    }); 
    
    // The returned `evaluate` function
    return async (context) => {
        const doc = {};
        
        // Evaluate each expression in the given context and replace the
        // placeholder with the stringified expression value
        var text = parsedSource;
        for (let i=0; i<parsedExpressions.length; i++) {
            let evaluateExpression = parsedExpressions[i];
            try {
                var value = await evaluateExpression(context);                                    
            } catch (error) {
                // Delegate error rendering to the custom `context.$renderError` function
                var value = context.$renderError({
                    message: error.message,
                    source: evaluateExpression.source
                });
            }
            text = text.replace(`<%${i}%>`, await this.render(value));
        }
        
        // Extract the document namespace, discarding the global context
        // variables.  
        const namespace = Object.assign({}, context);
        
        // Define the `__str__` name as the rendered text in order to make the 
        // namespace stringify to the rendered text.
        namespace.__str__ = text;

        // Return the document namespace
        return namespace;
    };               
}



//  Create an expression context suitable for document evaluation
exports.createContext = function (...namespaces) {
    return this.expression.createContext(documentGlobals, ...namespaces);
}

const documentGlobals = {

    $renderError (error) {
        return `[!${error.message}]`;
    },        
};




//  Renders a document namespace to a string as follows:
//  - Stringifies the `doc_namespace` using `expression.stringify`
//  - If it exists, applies the `doc_namespace.__render__` decorator to the
//    previously stringified value
exports.render = async function (value) {
    var text = this.expression.stringify(value);
    if (value && value.__render__) {
        text = await this.expression.apply(value.__render__, text);
        text = await this.expression.stringify(text);            
    }
    return text;
}
