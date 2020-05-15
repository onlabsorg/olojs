/**
 *  # document module
 *  This module contains functions to load, parse and evaluate olo-documents.
 */



/**
 *  ### document.expression
 *  This points to the expression module, but it could be any object implementing
 *  the following methods:
 *
 *  - expression.parse
 *  - expression.createContext
 *  - expression.stringify
 *  - expression.apply
 */
exports.expression = require("./expression");



/**
 *  ### document.parse(source)
 *  The parse function takes a document source text as input and returns 
 *  an `evaluate` function as output.
 *
 *  The `evaluate` function takes an expression context as input and
 *  returns the document namespace evaluated in that context.
 *
 *  The returned namespace can be then stringified by using the 
 *  `document.expression.stringify` function.
 *
 *  Each document can containe sub-documents called `fragments` and enclosed
 *  between tags the `<def:fragment_name>` and `</def:fragment_name>`.
 */
exports.parse = function (source) {
    var parsedSource = String(source);
    
    // Find all the fragments
    const fragments = {};
    parsedSource = parsedSource.replace(/<\s*def\:([a-z_A-Z]+[a-z_A-Z0-9])\s*>([\s\S]+?)<\s*\/def\:\1\s*>/g, (match, name, content) => {
        fragments[name] = {
            source: content,
            evaluate: this.parse(content)
        };
        return "";
    });
    
    // Find all the swan expressions in the source, store them in an array and
    // replace them with a placeholder.
    const parsedExpressions = [];
    parsedSource = parsedSource.replace(/<%([\s\S]+?)%>/g, (match, expressionSource) => {  
        let i = parsedExpressions.length;
        parsedExpressions.push( this.expression.parse(expressionSource) );
        return `<%${i}%>`;
    }); 
    
    // The returned `evaluate` function
    return async (context) => {
        const doc = {};
        
        // Add the fragment functions to the context
        for (let name in fragments) {
            context[name] = (argns={}) => fragments[name].evaluate(context.$extend(argns));
        }
        
        // Evaluate each expression in the given context and replace the
        // placeholder with the stringified expression value
        var text = parsedSource;
        for (let i=0; i<parsedExpressions.length; i++) {
            let evaluateExpression = parsedExpressions[i];
            try {
                var value = await evaluateExpression(context);                                    
            } catch (error) {
                // Delegate error rendering to the custom `context.$renderError` function
                var value = context.$renderError(error);
            }
            text = text.replace(`<%${i}%>`, await this.expression.stringify(value));
        }
        
        // Transform the rendered text by passing it to the `context.__render__`
        // decorator, if it exists.
        if (context.__render__) {
            text = await this.expression.apply(context.__render__, text);
            text = await this.expression.stringify(text);            
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



/**
 *  ### document.createContext(namespace)
 *  Create and expression context suitable for document rendering.
 */
exports.createContext = function (namespace={}) {
    return this.expression.createContext(documentContext).$extend(namespace);
}

const documentContext = {

    $renderError (error) {
        return `[!${error.message}]`;
    },        
};
