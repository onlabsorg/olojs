/**
 *  # Envionment class
 *  The environment class makes it easy to create and environment object.
 *  An environment object, like the one required by the `document.load`
 *  function, doesn't need to be an `Environment` instance though.
 */

const Path = require("./tools/path");
const is = require("./tools/is");
const document = require("./document");


class Environment {
    
    /**
     *  ### new Environment(config)
     *  The config object should contain the followin properties:
     *  - `config.stores`: an object having paths for keys and loader function or stores for values
     *  - `config.globals`: an object with all the properties and functions that will be added to the document contexts
     *  Any other property of the config object is optional and, if present,
     *  it will be added as it is to the environment instance.
     *
     *  ##### config.stores
     *  The `store` property of the config object should map paths to stores:
     *
     *  ```js
     *  config.stores = {
     *      "/root/path1": store1,
     *      "/root_path2": store2,
     *      "/rp3": store3,
     *      ...
     *  }
     *  ```
     *
     *  The `store` can be any object with a `read` method (synchronous or asynchronous) 
     *  that maps a path to an olo-document source text. If `store` is a function instead,
     *  that function will be used as `read` method. Optionally, the store can also
     *  contain a `write` and a `delete` method.
     *
     *  Reading, updating and deleteing document operations will be delegated
     *  to the proper store by the environment instance. 
     *
     *  This way, an environment is like a stores hub that can be configured to 
     *  retrieve and modify documents stored in virtually any source.
     */
    constructor (config={}) {
        
        this._stores = [];
        if (is.object(config.stores)) {
            for (let storePath in config.stores) {
                this._stores.push( new Store(storePath, config.stores[storePath]));
            }
            this._stores.sort(Store.compare).reverse();
        }
        
        this.globals = {};
        if (is.object(config.globals)) {
            for (let name in config.globals) {
                this.globals[name] = config.globals[name];
            }
        }

        this.cache = config.nocache ? null : new Map();
        
        for (let name in config) {
            if (this[name] === undefined) this[name] = config[name];
        }
    }
    
    _findStore (docPath) {
        docPath = Path.from(docPath);
        for (let store of this._stores) {
            let subPath = store.path.getSubPath(docPath);
            if (subPath !== "") return [store, subPath];
        }
        throw new Error(`Store not defined for path ${docPath}`);
    }
    
    /**
     *  ### Environment.prototype.readDocument(path)
     *  This function takes a path, finds the first store matching the
     *  path and returns `store.read(subPaht)`.
     *
     *  Say you created an evironment `env` based on the followin config object ...
     *  ```js
     *  config.stores = {
     *      "/root/path1": store1,
     *      "/root_path2": store2,
     *      "/rp3": store3,
     *      ...
     *  }
     *  ```
     *  ... then
     * - `env.readDocument("/root/path1/path/to/docA")` will result in calling `store1.read("/path/to/docA")`
     *   and using the returned string as document source
     * - `env.readDocument("/root_path2/path/to/docB")` will result in calling `store2.read("/path/to/docB")`
     *   and using the returned string as document source
     * - `env.readDocument("/rp3/path/to/docC")` will result in calling `store3.read("/path/to/docC")`
     *    and using the returned string as document source
     * ...
     */
    async readDocument (path) {

        const docPath = Path.from(path);
        const docPathStr = String(docPath);
        if (this.cache && this.cache.has(docPathStr)) {
            return this.cache.get(docPathStr);
        }
        
        let [store, docSubPath] = this._findStore(docPath);
        const doc = await store.read(String(docSubPath));
        
        if (this.cache) this.cache.set(docPathStr, doc);
        return doc;
    }
    
    /**
     *  ### Environment.prototype.writeDocument(path, source)
     *  This function takes a path and an olo-document source, finds the first
     *  store matching the path and calls `store.write(subPath, source)`;
     */
    async writeDocument (path, source) {
        source = String(source);
        if (source === "") return await this.deleteDocument(path);
        
        const docPath = Path.from(path);
        let [store, docSubPath] = this._findStore(docPath);
        await store.write(String(docSubPath), source);

        const docPathStr = String(docPath);
        if (this.cache && this.cache.has(docPathStr)) {
            this.cache.set(docPathStr, source);
        }
    }
    
    /**
     *  ### Environment.prototype.deleteDocument(path, source)
     *  This function takes a path and an olo-document source, finds the first
     *  store matching the path and calls `store.delete(subPath, source)`.
     */
    async deleteDocument (path) {
        const docPath = Path.from(path);
        let [store, docSubPath] = this._findStore(docPath);
        await store.delete(String(docSubPath));

        const docPathStr = String(docPath);
        if (this.cache && this.cache.has(docPathStr)) {
            this.cache.delete(docPathStr);
        }        
    }    
    
    /**
     *  ### Environment.prototype.createDocument(path, source)
     *  Create a document object bound to this environment.
     */
    createDocument (path, source) {
        return document.create(this, path, source);
    }
    
    /**
     *  ### Environment.prototype.createDocument(path, source)
     *  Similar to `readDocument`, but it returns a document object bound to
     *  this environment.
     */
    async loadDocument (path) {
        return await document.load(this, path);
    }
    
    /**
     *  ### Environment.prototype.renderNamespace(namespace)
     *  Shortcut for `document.render`
     */
    async renderNamespace (namespace) {
        return await document.render(namespace);
    }    
}


class Store {
    
    constructor (path, methods) {
        this.path = Path.from(path+"/");
        
        if (is.function(methods)) {
            this.read = methods;
        } else if (is.object(methods)) {
            if (is.function(methods.read)) {
                this.read = path => methods.read(path);
            }
            if (is.function(methods.write)) {
                this.write = (path, source) => methods.write(path, source);
            }
            if (is.function(methods.delete)) {
                this.delete = path => methods.delete(path);
            }
        }
    }
    
    read (path) {
        throw new Error(`Read operation not defined for paths ${this.path}*`);
    }

    write (path, source) {
        throw new Error(`Write operation not defined for paths ${this.path}*`);
    }
    
    delete (path) {
        throw new Error(`Delete operation not defined for paths ${this.path}*`);
    }
    
    static compare (store1, store2) {
        const path1 = String(store1.path);
        const path2 = String(store2.path);
        return path1.localeCompare(path2);
    }
}


module.exports = Environment;
