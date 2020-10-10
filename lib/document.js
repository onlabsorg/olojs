/**
 *  olojs.document
 *  ============================================================================
 *  This module contains functions to parse, evaluate and render any string of
 *  text formatted as olo-document.
 *    
 *  ```js
 *  const source = "Twice x is <% 2*x %>!";
 *  const context = olojs.document.createContext({x:10});
 *  const evaluate = olojs.document.parse(source);
 *  const namespace = await evaluate(context);
 *  const rendering = await olojs.document.render(namespace);
 *  // rendering is "Twice x is 20!"
 *  ```
 */



//  olojs.document.expression
//  ----------------------------------------------------------------------------
//  This object is used to parse and evaluate the expression fields of the
//  olo-document. It points by default to the swan expression module, but it 
//  could be replaced by any expression module implementing the followin 
//  methods:
//  - expression.parse
//  - expression.createContext
//  - expression.stringify
//  - expression.apply
exports.expression = require("./expression");



/**
 *  olojs.document.parse - function
 *  ----------------------------------------------------------------------------
 *  Compiles a document source into an `evaluate` function that takes as input
 *  a document context object and returns the document namespace object.
 *    
 *  ```js
 *  const evaluate = olojs.document.parse(source);
 *  const namespace = await evaluate(context);
 *  ```
 *
 *  - `source`: a string containing olo-document markup
 *  - `evaluate`: an asynchronous function that evaluates the document and 
 *    returns its namespace
 *  - `namespace`: an object containing all the names defined by the inline 
 *    expression of the document
 */ 
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




/**
 *  olojs.document.createContext - function
 *  ----------------------------------------------------------------------------
 *  Creates a custom document evaluation context, by adding to the basic 
 *  context all the names defined in the passed namespace.
 *    
 *  ```js
 *  const context = olojs.document.createContext(...namespaces)
 *  ```
 *  - `namespaces`: list of objects; each of them, from left to right, will be 
 *    mixed-in to the basic document context
 *  - `context`: an object containing all the named values and function that
 *    will be visible to the document inline expressions.
 */
exports.createContext = function (...namespaces) {
    return this.expression.createContext(documentGlobals, ...namespaces);
}

const documentGlobals = {

    $renderError (error) {
        return `[!${error.message}]`;
    },        
};



/**
 *  olojs.document.render - async function
 *  ----------------------------------------------------------------------------
 *  This function exposes to javascript the serialization algorithm used in
 *  to convert the inline expression result values to text.
 *    
 *  ```js
 *  const text = await olojs.render(value)
 *  ```
 *  
 *  - `value`: any javascript value
 *  - `text`: textual representation of the passed value, obtained according to
 *    the same rules applied to the inline expressions
 *  
 *  If it exists, this function applies the `context.__render__` decorator to 
 *  the stringified value.
 */
 exports.render = async function (value) {
    var text = this.expression.stringify(value);
    if (value && value.__render__) {
        text = await this.expression.apply(value.__render__, text);
        text = await this.expression.stringify(text);            
    }
    return text;
}
