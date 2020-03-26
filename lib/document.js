/**
 *  # document module
 *  This module contains functions to load, parse and evaluate olo-documents.
 */



// Dependencies
const expression = require("./expression");
const Path = require("./tools/path");
const is = require("./tools/is");



/**
 *  ### document.parse(source)
 *  The parse function takes a document source text as input and returns 
 *  an `evaluate` function as output.
 *
 *  The `evaluate` function takes an expression context as input and
 *  returns the document namespace evaluated in that context.
 *
 *  The returned namespace can be then stringified by using the 
 *  `document.render` function.
 */
exports.parse = function (source) {
    source = String(source);
    
    // Find all the swan expressions in the source, store them in an array and
    // replace them with a placeholder.
    const parsedExpressions = [];
    var parsedSource = source;
    parsedSource = parsedSource.replace(/<%([\s\S]+?)%>/g, (match, expressionSource) => {  
        let i = parsedExpressions.length;
        parsedExpressions.push( expression.parse(expressionSource) );
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
                var value = context.$renderError(error);
            }
            text = text.replace(`<%${i}%>`, await expression.stringify(value));
        }
        
        // Transform the rendered text by passing it to the `context.__render__`
        // decorator, if it exists.
        if (context.__render__) {
            text = await expression.apply(context.__render__, text);
            text = await expression.stringify(text);            
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
    return expression.createContext({
        $renderError: error => `[!${error.message}]`,        
    }).$extend(namespace);
}



/**
 *  ### document.render(x)
 *  Stringifies swan objects contained in a namespace returned by the `evaluate`
 *  function. In particular it can be used to render the document namespace
 *  itself to the document text.
 */
exports.render = async function (x) {
    return await expression.stringify(x);
}



/**
 *  ### document.load(environment, path)
 *  Given an environment object and a path, return the document object
 *  contained in that environment at that path.
 *
 *  ##### Environment object
 *  As far as this function is concerned, and environment object is just a
 *  javascript object containing 
 *  - a `readDocument` method that takes a path as input and returns an olo-document source as output
 *  - a `globals` object defining the context variables shared by all the documents in the context
 *
 *  ##### Document object
 *  A document object contain the following attributes
 *  - `doc.source`: the loaded document source
 *  - `doc.evaluate(presets)`: a function that evaluates the source in a context
 *    built with the environment globals and with the given presets as locals
 *    Besides that, the evaluate function add a `__path__` name to the document
 *    namespace, containing the document path and an `import` function that 
 *    allows to load other document in the local namespace.
 */
exports.load = async function (environment, path) {
    const source = await environment.readDocument(path);
    return this.create(environment, path, source);
}

exports.create = function (environment, path, source) {
    const self = this;
    const doc = {};
    
    doc.source = String(source);
    
    doc.path = Path.from(path);
    
    const baseContext = this.createContext(environment.globals).$extend({
        "import": async function (path, argv={}) {
            const docPath = Path.from(this.__path__).resolve(path);
            const doc = await self.load(environment, docPath);
            return await doc.evaluate({argv});
        }        
    });
    
    const standardPresets = {
        __path__: String(doc.path),
    }
    
    doc.evaluate = async (customPresets={}) => {
        const evaluate = self.parse(doc.source);
        const context = baseContext.$extend(standardPresets).$assign(customPresets);
        return await evaluate(context);
    }
    
    return doc;        
}
