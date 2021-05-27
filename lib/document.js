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
 *  namespace = await evaluate(context);    // {x:10}
 *  text = await context.str(namespace);    // "Twice x is 20"
 *  ```
 */

const swan = require('./expression');



/**
 *  olojs.document.parse - function
 *  ----------------------------------------------------------------------------
 *  Compiles a document source into an `evaluate` function that takes as input
 *  a document context object and returns the document namespace object.
 *
 *  ```js
 *  evaluate = olojs.document.parse(source);
 *  namespace = await evaluate(context);
 *  ```
 *
 *  - `source` is a string containing the source of an olojs document
 *  - `evaluate` is an asynchronous function that evaluates the document and
 *    returns its namespace
 *  - `namespace` is an object containing all the names defined by the inline
 *    expressions of the document.
 *
 *  The document namespace stringifies to a text obtained by replacing every
 *  inline expression with its value, therefore in javascript
 *  `await context.str(namespace)` will return the rendered document.
 */
const parseDocument = exports.parse = function (source) {
    source = String(source);

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
    const $text = Symbol("Rendered document");

    // The returned `evaluate` function
    return async (context) => {
        // Create a copy ot the context
        context = Object.assign(Object.create(Object.getPrototypeOf(context)), context);
        
        // Evaluate each expression in the given context and replace the
        // expression source with the stringified expression value
        context.__str__ = textChunks[0] || "";
        for (let i=0; i<parsedExpressions.length; i++) {
            let evaluateExpression = parsedExpressions[i];
            try {
                var value = await evaluateExpression(context);
            } catch (error) {
                // in case of error returns an Undefined failure value
                var value = await context.undefined('failure', error);
            }
            context.__str__ += await context.str(value) + textChunks[i+1];
        }
        
        // Extract the document namespace,
        // discarding the global context variables.
        return Object.assign({}, context);
    };
}




/**
 *  olojs.document.createContext - function
 *  ----------------------------------------------------------------------------
 *  Creates a custom document evaluation context, by adding to the basic
 *  context all the names defined in the passed namespace.
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
