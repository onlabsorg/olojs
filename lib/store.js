const pathlib = require('path');
const resolvePath = (...paths) => pathlib.normalize(`/` + pathlib.join(...paths));
const getDirPath = path => path.slice(-1) === '/' ? resolvePath(path) : resolvePath(path, '..', '/');
const getDocName = path => path.slice(-1) === '/' ? "" : pathlib.basename(path);

const document = require('./document');


/**
 *  <!--<% __render__ = require 'markdown' %>-->
 *
 *  Store
 *  ============================================================================
 *  This is the base class to be used to create olojs document stores.
 *  When instantiatete directly it behaves like a read-only empty store.
 *
 *  ```js
 *  // A read-only empty store
 *  store = new Store();
 *  
 *  // A store implementation
 *  class ChildStore extends Store {
 *      async read (path) { ... }
 *      async write (path, source) { ... }
 *      async delete (path) { ... }
 *  }
 *  ```
 */
class Store {

    /**
     *  async store.read: String path -> String source
     *  ------------------------------------------------------------------------
     *  Returns the source of the document mapped in this store to the given
     *  path.
     *
     *  ```js
     *  source = await store.read("/path/to/doc");
     *  ```
     *
     *  Every implmenentation of this method should behave according to the
     *  following standard:
     *
     *  - It should return a string
     *  - It should throw `Store.ReadPermissionDeniedError` if the store
     *    instance has no read permission on the given path.
     *   
     *  When instantiated directly, the base store `read` method returns always
     *  an empty string.
     */
    async read (path) {
        return "";
    }


    /**
     *  async store.write: (String path, String source) -> undefined
     *  ------------------------------------------------------------------------
     *  Changes the source of the document at the given path.
     *
     *  ```js
     *  await store.write("/path/to/doc", "This is the doc content.");
     *  ```
     *
     *  Every implmenentation of this method should behave according to the
     *  following standard:
     *
     *  - After calling this method on `path`, `store.read(path)` should
     *    return the new source.
     *  - It should throw `Store.WritePermissionDeniedError` if the store
     *    instance has no write permission on the given path.
     *  - It should throw `Store.WriteOperationNotAllowedError` if the store
     *    is read-only.
     *     
     *  When instantiated directly, the base store `write` method always throws
     *  `Store.WriteOperationNotAllowedError`.
     */
    async write (path, source) {
        throw new this.constructor.WriteOperationNotAllowedError(this.normalizePath(path));
    }


    /**
     *  async store.delete: String path -> undefined
     *  ------------------------------------------------------------------------
     *  Removes a document from the store.
     *
     *  ```js
     *  await store.delete("/path/to/doc");
     *  ```
     *
     *  Every implmenentation of this method should behave according to the
     *  following standard:
     *
     *  - After calling this method on `path`, `store.read(path)` should
     *    return an empty string.
     *  - It should throw `Store.WritePermissionDeniedError` if the store
     *    instance has no write permission on the given path.
     *  - It should throw `Store.WriteOperationNotAllowedError` if the store
     *    is read-only.
     *   
     *  When instantiated directly, the base store `delete` method always throws
     *  `Store.WriteOperationNotAllowedError`.
     */
    async delete (path) {
        throw new this.constructor.WriteOperationNotAllowedError(this.normalizePath(path));
    }
    
    
    /**
     *  store.createDocument: (String path, String source) -> Document doc
     *  ------------------------------------------------------------------------
     *  Creates a Document object representing a document stored at the given
     *  path and having the given source.
     *  
     *  See below for the documentation of Document objects.
     */
    createDocument (path, source="") {
        return new Document(this, path, source);        
    }


    /**
     *  store.loadDocument: String path -> Document doc
     *  ------------------------------------------------------------------------
     *  Creates a Document object representing a document stored at the given
     *  path and source fetched via `read(path)`.
     *  
     *  See below for the documentation of Document objects.
     */
    async loadDocument (path) {
        const source = await this.read(path);
        return this.createDocument(path, source);
    }


    /**
     *  store.evaluateDocument: String path -> Object docns
     *  ------------------------------------------------------------------------
     *  Loads and evaluates a Document, returning the document namespace.
     */
    async evaluateDocument (path, ...presets) {
        const doc = await this.loadDocument(path);
        const context = doc.createContext(...presets);
        return await doc.evaluate(context);
    }    


    /**
     *  store.subStore: String path -> Store subStore
     *  ------------------------------------------------------------------------
     *  Returns a new store rooted in a directory of this store.
     *  
     *  ```
     *  subStore = store.subStore(rootPath)
     *  ```
     *  
     *  where:
     *  
     *  - `rootPath` is a directory path of this store
     *  - `subStore.read` delegates to `store.read(rootPath+path)`
     *  - `subStore.write` delegates to `store.write(rootPath+path, source)`
     *  - `subStore.delete` delegates to `store.delete(rootPath+path)`
     *  - `subStore.subStore` delegates to `store.subStore(rootPath+path)`
     */
    SubStore (path) {
        return new SubStore(this, path);
    }


    // -------------------------------------------------------------------------
    //  Internal methods
    // -------------------------------------------------------------------------

    // Normalize a path, resolvin `.`, `..` and adding `/` at the beginning
    normalizePath (path) {
        return pathlib.normalize(`/${path}`);
    }

    // Resolve a subPath relative to a basePath, ignoring the file name
    resolvePath (basePath, subPath) {
        if (subPath[0] === '/') {
            return pathlib.normalize(subPath);
        } else {
            const baseDirPath = basePath.slice(-1) === '/' ?
                    basePath : pathlib.resolve(basePath, '..');
            return pathlib.join(baseDirPath, subPath);
        }
    }
}



/**
 *  Document object
 *  ------------------------------------------------------------------------
 *  The document object represnts a document stored at a given path of a 
 *  store and having a given source. A document object can be created using
 *  either the `createDocument` or the `loadDocument` methods of a store
 *  object.
 */
class Document {
    
    constructor (store, path, source, cache=null) {


        /**
         *  ### doc.store: Store
         *  Points to the store containing the document.
         */
        this.store = store;
        
        // Cache of loaded documents
        this.cache = cache || new Map();

        /**
         *  ### doc.path: String
         *  The path of this document in the store.
         */
        this.path = pathlib.normalize(`/${path}`);
        
        
        /**
         *  ### doc.source: String
         *  The source of this document.
         */
        this.source = String(source);
        
        /**
         *  ### doc.evaluate: Object context -> Object namespace
         *  This is the source compiled to a function as returned by document.parse.
         */        
        this.evaluate = document.parse(this.source);
    }
    
    get dirpath () {
        return getDirPath(this.path);
    }
    
    /**
     *  ### doc.createContext: (...Objects preset) -> Object context
     *  Created a valid evaluation context that can be passed to the 
     *  `doc.evaluate` function to evaluate this document. The returned context
     *  contains the following special names:
     *  
     *  - `context.__path__`: the path of this document
     *  - `context.__dirpath__`: the path of this document parent directory
     *  - `context.import`: a function that allows to import other documents; it 
     *    points to the doc.import function
     *  - All the name contained in the passed preset objects
     */        
    createContext (...presets) {
        const context = document.createContext(...presets);

        context.__path__ = this.path;
        context.__dirpath__ = this.dirpath;
        context.import = async targetPath => {
            const targetDoc = await this._loadDependency(targetPath);
            const targetContext = targetDoc.createContext();
            return await targetDoc.evaluate(targetContext);            
        }

        return context;        
    }
    
    // Loads a document, like the `store.loadDocument` function, but with the
    // following differences:
    // - Relative paths are resolved aginst the document path
    // - Documents are cached and never loaded twice
    async _loadDependency (path) {
        const fullPath = path[0] === '/' ? 
                resolvePath(path) :
                resolvePath('/', resolvePath(this.dirpath, path));
        if (!this.cache.has(fullPath)) {
            const targetSource = await this.store.read(fullPath);
            const targetDoc = new this.constructor(this.store, fullPath, targetSource, this.cache);
            this.cache.set(fullPath, targetDoc);
        }
        return this.cache.get(fullPath);
    }    
}




// Base class for Store Errors
Store.Error = class extends Error {};


// Base class for Store.ReadPermissionDeniedError and
// Store.WritePermissionDeniedError.
Store.PermissionDeniedError = class extends Store.Error {

    constructor (operation, path) {
        super(`Permission denied: ${operation} ${path}`);
    }
}

/**
 *  Store.ReadPermissionDeniedError - class
 *  ----------------------------------------------------------------------------
 *  Error thrown when attempting a read operation for which the store instance
 *  has no read access.
 *
 *  ```js
 *  throw new Store.ReadPermissionDeniedError('/path/to/doc');
 *  ```
 */
Store.ReadPermissionDeniedError = class extends Store.PermissionDeniedError {

    constructor (path) {
        super("READ", path);
    }
}

/**
 *  Store.WritePermissionDeniedError - class
 *  ----------------------------------------------------------------------------
 *  Error thrown when attempting a write operation for which the store instance
 *  has no write access.
 *
 *  ```js
 *  throw new Store.WritePermissionDeniedError('/path/to/doc');
 *  ```
 */
Store.WritePermissionDeniedError = class extends Store.PermissionDeniedError {

    constructor (path) {
        super("WRITE", path);
    }
}


// Base class for Store.ReadOperationNotAllowedError and
// Store.WriteOperationNotAllowedError.
Store.OperationNotAllowedError = class extends Store.Error {

    constructor (operation, path) {
        super(`Operation not allowed: ${operation} ${path}`);
    }
}

/**
 *  Store.ReadOperationNotAllowedError - class
 *  ----------------------------------------------------------------------------
 *  Error thrown when the read operation is not defined on the store.
 *
 *  ```js
 *  throw new Store.ReadOperationNotAllowedError('/path/to/doc');
 *  ```
 */
Store.ReadOperationNotAllowedError = class extends Store.OperationNotAllowedError {

    constructor (path) {
        super("READ", path);
    }
}

/**
 *  Store.WriteOperationNotAllowedError - class
 *  ----------------------------------------------------------------------------
 *  Error thrown when the write operation is not defined on the store.
 *
 *  ```js
 *  throw new Store.WriteOperationNotAllowedError('/path/to/doc');
 *  ```
 */
Store.WriteOperationNotAllowedError = class extends Store.OperationNotAllowedError {

    constructor (path) {
        super("WRITE", path);
    }
}



function createContext (store, cache, docPath, ...namespaces) {
    const context = document.createContext(...namespaces);

    context.__path__ = store.normalizePath(docPath);
    context.__dirpath__ = pathlib.dirname(context.__path__);

    context.import = async subPath => {
        const targetPath = store.resolvePath(context.__path__, subPath);
        const {source, evaluate} = await cache.get(targetPath);
        const targetContext = createContext(store, cache, targetPath);
        const {text, data} = await evaluate(targetContext);
        data.__text__ = text;
        return data;
    }

    return context;
}

class Cache extends Map {

    constructor (store) {
        super();
        this.store = store;
    }

    async get (path) {
        const normPath = this.store.normalizePath(path);
        if (!this.has(normPath)) {
            const source = await this.store.read(normPath);
            const evaluate = this.store.parse(source);
            this.set(normPath, {source, evaluate});
        }
        return super.get(normPath);
    }
}

class SubStore extends Store {
    
    constructor (store, path) {
        super();
        this.rootStore = store;
        this.rootPath = this.rootStore.normalizePath(path);
    }
    
    read (path) {
        const fullPath = this._getFullPath(path);
        return this.rootStore.read(fullPath);
    }
    
    write (path, source) {
        const fullPath = this._getFullPath(path);
        return this.rootStore.write(fullPath, source);        
    }
    
    delete (path) {
        const fullPath = this._getFullPath(path);
        return this.rootStore.delete(fullPath);
    }
    
    SubStore (path) {
        const fullPath = this._getFullPath(path);
        return this.rootStore.SubStore(fullPath);
    }
    
    _getFullPath (path) {
        return pathlib.join(this.rootPath, path);
    }
}



// Exports
module.exports = Store;
