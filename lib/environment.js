/**
 *  # Envionment class
 *  This class defines:
 *  - a way to retrieve and modify documents from document stores
 *  - a common evaluation context for all the loaded documents
 */

const Path = require("./tools/path");
const document = require("./document");


class Environment {
    
    /**
     *  ### new Environment(config)
     *  The config object should contain the followin properties:
     *  - `config.store`: a Store interface for reading, writing, appending and deleting documents
     *  - `config.globals`: an object with all the properties and functions that will be added to the document contexts
     *  Any other property of the config object is optional and, if present,
     *  it will be added as it is to the environment instance.
     *
     *  ##### config.store
     *  The `store` property can be any object with one or more of the following methods:
     *  - `read`: method (synchronous or asynchronous) that maps a path to an 
     *    olo-document source text. 
     *  - `write`: function that takes a path and a source as arguments and
     *    modifies the document source mapped to the give path
     *  - `delete`: function that takes a path as argument and deletes the
     *    document mapped to the given path
     *  - `append`: function that takes a directory path and a source as argument 
     *    and adds a document to the directory with a timestamp as name
     */
    constructor (config={}) {
        
        if (isObject(config.store) && isFunction(config.store.read)) {
            this.store = config.store;
        } else {
            throw new Error("Invalid store");
        }
        
        this.globals = {};
        if (isObject(config.globals)) {
            for (let name in config.globals) {
                this.globals[name] = config.globals[name];
            }
        }

        this.cache = config.nocache ? null : new Map();
        
        for (let name in config) {
            if (this[name] === undefined) this[name] = config[name];
        }
    }
    

    /**
     *  ### Environment.prototype.readDocument(path)
     *  This will delegate to `env.store.read(path)`.
     */
    async readDocument (path) {
        const docPath = Path.from(path);
        const docPathStr = String(docPath);
        
        if (this.cache && this.cache.has(docPathStr)) {
            return this.cache.get(docPathStr);
        }
        
        const doc = await this.store.read(docPathStr);
        
        if (this.cache && docPathStr.slice(-1) !== "/") {
            this.cache.set(docPathStr, doc);
        }
        
        return doc;
    }
    
    
    /**
     *  ### Environment.prototype.writeDocument(path, source)
     *  This will delegate to `env.store.write(path, source)`.
     */
    async writeDocument (path, source) {
        source = String(source);
    
        if (source === "") {
            return await this.deleteDocument(path);
        }
    
        const docPath = Path.from(path);
        if (isFunction(this.store.write)) {
            await this.store.write(String(docPath), source);
        } else {
            throw new Error(`Write operation not defined`);
        }
    
        const docPathStr = String(docPath);
        if (this.cache && this.cache.has(docPathStr)) {
            this.cache.set(docPathStr, source);
        }
    }


    /**
     *  ### Environment.prototype.appendDocument(path, source)
     *  This function takes a path and an olo-document source, finds the first
     *  pathHandler matching the path and calls `pathHandler.append(subPath, source)`.
     */
    async appendDocument (path, source) {
        source = String(source);
    
        if (source === "") {
            return await this.deleteDocument(path);
        }
    
        const docPath = Path.from(path);
        if (isFunction(this.store.append)) {
            await this.store.append(String(docPath), source);
        } else {
            throw new Error(`Append operation not defined`);
        }
    
        const docPathStr = String(docPath);
        if (this.cache && this.cache.has(docPathStr)) {
            this.cache.set(docPathStr, source);
        }
    }
    
    /**
     *  ### Environment.prototype.deleteDocument(path, source)
     *  This function takes a path and an olo-document source, finds the first
     *  pathHandler matching the path and calls `pathHandler.delete(subPath, source)`.
     */
    async deleteDocument (path) {
        
        const docPath = Path.from(path);
        if (isFunction(this.store.delete)) {
            await this.store.delete(String(docPath));
        } else {
            throw new Error(`Delete operation not defined`);
        }
    
        const docPathStr = String(docPath);
        if (this.cache && this.cache.has(docPathStr)) {
            this.cache.delete(docPathStr);
        }        
    }    
    
    /**
     *  ### Environment.prototype.createContext(path, presets={})
     *  This function takes a document path and an optional namespace and 
     *  creates a namespace that can be used to evaluate a document source.
     *
     *  The environment context contains:
     *  - All the names contained in `environment.globals` (from the config parameter)
     *  - All the names contained in the `presets` object
     *  - A `__path__` string, meant to represent the document path
     *  - An `import` function that return `environment.loadDocument(fullPath)` after
     *    resolving the passed path as relative to `__path__`
     */    
    createContext (docPath, presets={}) {
        docPath = Path.from(docPath);
        return document.createContext(this.globals)
                .$assign({
                    "import": (subPath, argns) => this.loadDocument(docPath.resolve(subPath), {argns})
                })
                .$extend(presets)
                .$assign({
                    __path__: String(docPath)
                });
    }
    

    /**
     *  ### Environment.prototype.parseDocument(source) 
     *  This just calls `document.parse`. 
     */    
    parseDocument (source) {
        return document.parse(source);
    }
    

    /**
     *  ### Environment.prototype.stringifyDocumentExpression(value)
     *  This just calls `document.expression.stringify`.
     */    
    stringifyDocumentExpression (value) {
        return document.expression.stringify(value);
    }

    
    /**
     *  ### Environment.prototype.loadDocument(path, presets={})
     *  This function reads and evaluates an olo-document, ther returns its
     *  namespace.
     */
    async loadDocument (path, presets={}) {
        const docPath = Path.from(path);
        const source = await this.readDocument(docPath);
        const evaluate = this.parseDocument(source);
        const context = this.createContext(docPath, presets);
        return await evaluate(context);        
    }
    

    /**
     *  ### Environment.prototype.renderDocument(path, presets={})
     *  This function reads and evaluates an olo-document, ther returns its
     *  stringified namespace. 
     */ 
    async renderDocument (path, presets={}) {
        const docNS = await this.loadDocument(path, presets);
        return await this.stringifyDocumentExpression(docNS);
    }
}





//------
//  SERVICE FUNCTIONS
//------

const isObject = x => typeof x === "object" && x !== null & !Array.isArray(x);

const isString = x => typeof x === "string";

const isFunction = x => typeof x === "function";





module.exports = Environment;
