const pathlib = require('path');
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
     *  async store.list: String path -> Array items
     *  ------------------------------------------------------------------------
     *  Returns the list of items contained in the given directory path.
     *
     *  ```js
     *  items = await store.list("/path/to/dir");
     *  ```
     *
     *  Every implmenentation of this method should behave according to the
     *  following standard:
     *
     *  - It should return the Array of names of all the documents and 
     *    diretory contained under the given path. Directory names should end
     *    with a forward slash, while document names should not.
     *  - It should throw `Store.ReadPermissionDeniedError` if the store
     *    instance has no read permission on the given path.
     *   
     *  When instantiated directly, the base store `list` method returns always
     *  an empty array.
     */
    async list (path) {
        return [];
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
     *  If a `.info` document is requested (e.g. document /path/to/.info), a 
     *  document containing the following data is returned:
     *
     *  - `items`: list of all the siblings of the .info document, as returned
     *     by the store.list method, applied to the .info parent folder.
     *  
     *  See below for the documentation of Document objects.
     */
    async loadDocument (path) {
        const source = this.getDocName(path) === '.info' ?
                await this._readInfo(path) :
                await this.read(path);
        return this.createDocument(path, source);
    }
    
    async _readInfo (path) {
        const dirPath = this.getDirPath(path);
        const items = await this.list(dirPath);
        return `<% items = [${items.sort().map(name => "'"+name+"'").join(', ')}] %>`;
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

    // Normalize a path, resolving `.`, `..` and adding `/` at the beginning
    normalizePath (path) {
        return pathlib.normalize(`/${path}`);
    }

    // Returns the directory path of a given document path
    getDirPath (path) {
        if (path.slice(-1) === '/') {
            return this.normalizePath(path);
        } else {
            return this.normalizePath(`${path}/../`);
        }
    }
    
    // Returns the document name of a give document path
    getDocName (path) {
        if (path.slice(-1) === '/') {
            return "";
        } else {
            return pathlib.basename(path);
        }
    }

    // Resolve a subPath relative to a basePath, ignoring the file name
    resolvePath (basePath, subPath) {
        if (subPath[0] === '/') {
            return this.normalizePath(subPath);
        } else {
            let dirPath = this.getDirPath(basePath);
            return this.normalizePath(`${dirPath}/${subPath}`);
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
    
    constructor (store, path, source) {


        /**
         *  ### doc.store: Store
         *  Points to the store containing the document.
         */
        this.store = store;
        
        // Cache of loaded documents
        this.cache = new Map();

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
        context.__dirpath__ = this.store.getDirPath(this.path);
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
        const fullPath = this.store.resolvePath(this.path, path);
        if (!this.cache.has(fullPath)) {
            const targetDoc = await this.store.loadDocument(fullPath);
            targetDoc.cache = this.cache;
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
