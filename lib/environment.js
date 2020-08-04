//  This module exports the `Environment` class. An Environment is a set of
//  olo-documents sharing a common global namespace and able to import each
//  other's content.

const Path = require("./tools/path");
const document = require("./document");


class Environment {
    
    //  Create an environment instance based on the following configuration
    //  parameters:
    //
    //  - config.store: an object exposing a read, a write and delete method
    //  - config.globals: an object whose names will be added to document
    //    contexts
    //  - config.nocache: if true, the documents will not be cached
    constructor (config) {
        
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
    }
    

    //  Retrieves a document from the environment store
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
    
    
    //  Modifies a document in the environment store
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


    //  Removes a document from the environment store
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
    
    //  Create a document context. This context will contain an `import`
    //  function that allows documents to re-use other documents content.
    createContext (docPath, ...namespaces) {
        
        const context = document.createContext(
                environmentNamespace, this.globals, {}, ...namespaces);
        
        context.__path__ = String(docPath);

        const environment = this;
        context.import = function (subPath, ...namespaces) {
            let fullPath = Path.from(this.__path__).resolve(subPath);
            return environment.loadDocument(fullPath, ...namespaces);
        }
        
        return context;
    }
    

    //  This is just an alias for `document.parse(source)`. 
    parseDocument (source) {
        return document.parse(source);
    }
    

    //  This just an alias for `document.render(value)`.
    render (value) {
        return document.render(value);
    }

    
    //  This function reads and evaluates an olo-document, then returns its
    //  namespace.
    async loadDocument (path, ...namespaces) {
        const docPath = Path.from(path);
        const source = await this.readDocument(docPath);
        const evaluate = this.parseDocument(source);
        const context = this.createContext(docPath, ...namespaces);
        return await evaluate(context);        
    }


    //  This function reads and evaluates an olo-document, then returns its
    //  stringified namespace. 
    async renderDocument (path, ...namespaces) {
        const doc_namespace = await this.loadDocument(path, ...namespaces);
        return await this.render(doc_namespace);
    }
}



const environmentNamespace = {
    "require": require("./stdlib/loader")
}





//------
//  SERVICE FUNCTIONS
//------

const isObject = x => typeof x === "object" && x !== null & !Array.isArray(x);

const isString = x => typeof x === "string";

const isFunction = x => typeof x === "function";





module.exports = Environment;
