/**
 *  olojs.document
 *  ============================================================================
 *  This module contains functions to parse, evaluate and render any string of
 *  text formatted as olo-document.
 *
 *  ```js
 *  source = "Twice x is <% 2*x %>!";
 *  context = olojs.document.createContext({x:10});
 *  evaluate = olojs.document.parse(source);
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
 *  - `source` is a string containing olo-document markup
 *  - `evaluate` is an asynchronous function that evaluates the document and
 *    returns its namespace
 *  - `namespace` is an object containing all the names defined by the inline
 *    expressions of the document.
 *
 *  The document namespace stringifies to a text obtained by replacing every
 *  inline expression with its value, therefore in javascript
 *  `await context.str(namespace)` will return the rendered document.
 */
exports.parse = function (source) {
    source = String(source);

    // Find all the swan expressions in the source, store them in an array and
    // replace them with a placeholder.
    const parsedExpressions = [];
    source = source.replace(/<%([\s\S]+?)%>/g, (match, expressionSource) => {
        let i = parsedExpressions.length;
        let parsedExpression;
        try {
            parsedExpression = swan.parse(expressionSource);
        } catch (error) {
            parsedExpression = context => {throw error};
        }
        parsedExpression.source = expressionSource;
        parsedExpressions.push( parsedExpression );
        return `<%%>`;
    });
    const textChunks = source.split('<%%>');
    const $text = Symbol("Rendered document");

    // The returned `evaluate` function
    return async (context) => {
        context = Object.assign(Object.create(Object.getPrototypeOf(context)), context);
        var text = textChunks[0] || "";

        // Make the namespace sringify to the rendered text
        context.__str__ = async ns => ns.__render__ ? await swan.O.apply(ns.__render__, text) : text;

        // Evaluate each expression in the given context and replace the
        // expression source with the stringified expression value
        for (let i=0; i<parsedExpressions.length; i++) {
            let evaluateExpression = parsedExpressions[i];
            try {
                var value = await evaluateExpression(context);
            } catch (error) {
                // Delegate error rendering to the custom `context.$renderError` function
                var value = context.$renderError(error);
            }
            text += await context.str(value) + textChunks[i+1];
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
 *  - `context`: an object containing all the named values and function that
 *    will be visible to the document inline expressions.
 */
exports.createContext = function (...namespaces) {
    return swan.createContext(documentGlobals, ...namespaces);
}

const documentGlobals = {
    $renderError: error => `Error: ${error.message}\n\n${error.swanStack}`,
};
