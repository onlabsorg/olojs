/**
 *  olojs.document
 *  ============================================================================
 *  This module contains functions to parse, evaluate and render olojs
 *  documents.
 *
 *  ```js
 *  source = "Twice x is <% 2*x %>!";
 *  evaluate = olojs.document.parse(source);
 *  context = olojs.document.createContext({x:10});
 *  {data, text} = await evaluate(context);    
 *      // data: {x:10}
 *      // text: "Twice x is 20"
 *  ```
 */

const swan = require('./expression');





/**
 *  olojs.document.parse - function
 *  ----------------------------------------------------------------------------
 *  Compiles a document source into an `evaluate` function that takes as input
 *  a document context object and returns the document namespace object and its
 *  rendered text.
 *
 *  ```js
 *  evaluate = olojs.document.parse(source);
 *  {data, text} = await evaluate(context);
 *  ```
 *
 *  - `source` is a string containing the source of the olojs document to be
 *    evaluated
 *  - `evaluate` is an asynchronous function that evaluates the document and
 *    returns its namespace and its rendered text
 *  - `data` is an object containing all the names defined by the inline
 *    expressions of the document (the document namespace).
 *  - `text` is a string obtained by replacing every inline expression with its 
 *    strigified value. 
 *  
 *  > Notice that in a swan expression context, `str(data)` will return `text`,
 *  > therefore `await context.str(data)` is a way to obtain `text` given `data`
 *  > in JavaScript.
 */
exports.parse = function (source) {
    var source = String(source);

    // // Parse fragments
    // source = source.replace(/<\s*def:([a-z_A-Z]+[a-z_A-Z0-9]*)\s+(.*)>(.*)<\s*\/def:\1\s*>/g, (match, identifier, attributes, content) => {
    //     return "";
    // });    

    // Find all the swan expressions in the source, store them in an array and
    // replace them with a placeholder.
    const parsedExpressions = [];
    source = source.replace(/<%([\s\S]+?)%>/g, (match, expressionSource) => {
        let i = parsedExpressions.length;
        let parsedExpression = swan.parse(expressionSource);
        parsedExpression.source = expressionSource;
        parsedExpressions.push( parsedExpression );
        return `<%%>`;
    });
    const textChunks = source.split('<%%>');

    // The returned `evaluate` function
    return async (context) => {
        const doc = {};
        
        // Create a copy ot the context
        context = Object.assign(Object.create(Object.getPrototypeOf(context)), context);
        
        // Evaluate each expression in the given context and replace the
        // expression source with the stringified expression value
        doc.text = textChunks[0] || "";
        for (let i=0; i<parsedExpressions.length; i++) {
            let evaluateExpression = parsedExpressions[i];
            try {
                var value = await evaluateExpression(context);
            } catch (error) {
                // in case of error returns an Undefined failure value
                var value = await context.undefined('failure', error);
            }
            doc.text += await context.str(value) + textChunks[i+1];
        }
        
        // Decorate the rendered text with the `__render__` function, if present
        if (typeof context.__render__ === 'function') {
            const decoratedText = await context.__render__(doc.text);
            doc.text = await context.str(decoratedText);
        } else if (context.__render__ && typeof context.__render__.__apply__ === 'function') {
            const decoratedText = await context.__render__.__apply__(doc.text);
            doc.text = await context.str(decoratedText);
        }
        
        // Extract the document namespace,
        // discarding the global context variables.
        doc.data = Object.assign({}, context);
        
        // Return both rendered text and data
        return doc
    };
}




/**
 *  olojs.document.createContext - function
 *  ----------------------------------------------------------------------------
 *  Creates a custom document evaluation context, by adding to the basic
 *  context all the names defined in the passed namespaces.
 *
 *  ```js
 *  context = olojs.document.createContext(...namespaces)
 *  ```
 *  - `namespaces`: list of objects; each of them, from left to right, will be
 *    mixed-in to the basic document context
 *  - `context`: an object containing all the named values and functions that
 *    will be visible to the document inline expressions.
 */
exports.createContext = function (...namespaces) {
    return swan.createContext(documentGlobals, ...namespaces);
}

const documentGlobals = {};


