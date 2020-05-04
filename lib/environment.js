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
     *  - `config.paths`: an object mapping paths to path handlers
     *  - `config.globals`: an object with all the properties and functions that will be added to the document contexts
     *  Any other property of the config object is optional and, if present,
     *  it will be added as it is to the environment instance.
     *
     *  ##### config.paths
     *  The `paths` property of the config object should map paths to path handlers:
     *
     *  ```js
     *  config.paths = {
     *      "/root/path1": pathHandler1,
     *      "/root_path2": pathHandler2,
     *      "/rp3": pathHandler3,
     *      ...
     *  }
     *  ```
     *
     *  The `pathHandler` can be any object with one or more of the following methods:
     *  - `read`: method (synchronous or asynchronous) that maps a sub-path to an 
     *    olo-document source text. 
     *  - `write`: function that takes a sub-path and a source as arguments and
     *    modifies the document source mapped to the give path
     *  - `delete`: function that takes a sub-path as argument and deletes the
     *    document mapped to the given path
     *
     *  Read, write and delete operations will be delegated to the proper 
     *  pathHandler function by the environment instance. 
     *
     *  This makes an environment a stores hub that can be configured to 
     *  retrieve and modify documents and data stored in virtually any source.
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
     *  This function takes a path, finds the first pathHandler matching the
     *  path and returns `pathHandler.read(subPath)`.
     *
     *  Say you created an evironment `env` based on the followin config object ...
     *  ```js
     *  config.paths = {
     *      "/root/path1": pathHandler1,
     *      "/root_path2": pathHandler2,
     *      "/rp3": pathHandler3,
     *      ...
     *  }
     *  ```
     *  ... then
     * - `env.readDocument("/root/path1/path/to/docA")` will result in calling `pathHandler1.read("/path/to/docA")`
     *   and returning the returned string as document source
     * - `env.readDocument("/root_path2/path/to/docB")` will result in calling `pathHandler2.read("/path/to/docB")`
     *   and returning the returned string as document source
     * - `env.readDocument("/rp3/path/to/docC")` will result in calling `pathHandler3.read("/path/to/docC")`
     *    and returning the returned string as document source
     * ...
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
     *  This function takes a path and an olo-document source, finds the first
     *  pathHandler matching the path and calls `pathHandler.write(subPath, source)`.
     *  
     *  If source is an empty string, it will instead call `env.delete(path)`.
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
     *  - An `import` function that return `environment.load(fullPath)` after
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
