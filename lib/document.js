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
 *  docns = await evaluate(context);    
 *      // docns.x: :10
 *      // docns.__str__: "Twice x is 20"
 *  ```
 */

const swan = require('./expression');





/**
 *  olojs.document.parse - function
 *  ----------------------------------------------------------------------------
 *  Compiles a document source to an `evaluate` function that takes as input
 *  a document context object and returns the document namespace object.
 *
 *  ```js
 *  evaluate = olojs.document.parse(source);
 *  docns = await evaluate(context);
 *  ```
 *
 *  - `source` is a string containing the source of the olojs document to be
 *    evaluated
 *  - `evaluate` is an asynchronous function that evaluates the document and
 *    returns its namespace
 *  - `docns` is an object containing all the names defined by the inline
 *    expressions of the document (the document namespace).
 *  - `docns.__str__` is a string obtained by replacing every inline expression
 *    with its strigified value. 
 */
function parse (source) {
    var source = String(source);

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
        
        // Create a copy ot the context
        context = Object.assign(Object.create(Object.getPrototypeOf(context)), context);

        // Define the expression rendering function
        const __renderexp__ = typeof context.__renderexp__ === "function" ?
              async value => await context.str(await context.__renderexp__(value)) :
              async value => await context.str(value);
        
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
            context.__str__ += await swan.types.unwrap(await __renderexp__(value)) + textChunks[i+1];
        }

        // Post-render the document text
        if (typeof context.__renderdoc__ === "function") {
            context.__str__ = await swan.types.unwrap(await context.str(await context.__renderdoc__(context.__str__)));
        }
        
        // Return both rendered text and data
        return Object.assign({}, context)
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
function createContext (...namespaces) {
    return swan.createContext(documentGlobals, ...namespaces);
}

const documentGlobals = {};





/**
*  class Document
*  ------------------------------------------------------------------------
*  Creates a document object representing a document contained in a given
*  store, at the given path and having a ginve source.
*
*  ```js
*  const doc = new Document(store, '/path/to/doc', "Lorem ipsum ...")
*  ```
*
*  If omitted, the source parameters defaults to an empty string.
*
*  ### doc.store: Store
*  The store in which the document is contained.
*
*  ### doc.path: String
*  The normalize path of the document, within its store.
*
*  ### doc.source: String
*  The source of the document.
*
*  ### doc.evaluate: Object context -> Object namespace
*  This is the source compiled to a function as returned by `document.parse`.
*
*/
class Document {

    constructor (store, path, source="") {
        this.store = store;
        this.$cache = new Map();
        this.path = this.store.normalizePath(path);
        this.source = String(source);
        this.evaluate = parse(this.source);
    }

    /**
     *  ### doc.createContext: (...Objects preset) -> Object context
     *
     *  Created a valid evaluation context that can be passed to the
     *  `doc.evaluate` function to evaluate this document. The returned
     *  context contains the following special names:
     *
     *  - `context.__path__`: the document path
     *  - `context.import`: a function that loads and evaluates a document and
     *    returns its namespace; if a relative path is passed as argument to
     *    this function, it will be resolved as relative to this document path
     *  - All the name contained in the passed preset objects
     */
    createContext (...presets) {
        const context = createContext(...presets);
        context.__path__ = this.path;
        context.import = async (targetPath, presets={}) => {
            const fullTargetPath = this.store.resolvePath(this.path, targetPath);
            let targetDoc = this.$cache.get(fullTargetPath)
            if (!targetDoc) {
                targetDoc = await this.constructor.load(this.store, fullTargetPath);
                targetDoc.$cache = this.$cache;
                this.$cache.set(fullTargetPath, targetDoc);
            }
            const targetContext = targetDoc.createContext(presets);
            return await targetDoc.evaluate(targetContext);
        }
        return context;
    }

    /**
     *  async Document.load: (Store store, String path) -> Document doc
     *  ---------------------------------------------------------------------
     *  Given a store and a document path, loads the source of the document
     *  located at path within that store and returns the Document instance
     *  with parameters `store`, `path` and `source`.
     */
    static async load (store, path) {
        const source = await store.read(path);
        return new this(store, path, source);
    }
}



module.exports = {parse, createContext, Document}
