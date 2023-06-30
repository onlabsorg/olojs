/**
 *  store module
 *  ============================================================================
 *  This module defines an olodocs store, which is any container that maps
 *  paths to olo-documents.
 *
 *  `Store` is the base class to be used to create olojs document stores; when
 *  instantiatete directly it generates a read-only empty store.
 *
 *  ```js
 *  // A store implementation
 *  class MyStore extends Store {
 *      async read (path) { ... }
 *  }
 *
 *  // A read-only empty store
 *  store = new Store();
 *  ```
 */


const pathlib = require('path');
const document = require('./document');





/**
 *  store = Store()
 *  --------------------------------------------------------------------------
 *  The Store class is meant to be used as base class for creating custom
 *  stores, but when instantiatete directly it behaves like a read-only empty
 *  store.
 */
class Store {

    /**
     *  async store.read: String path -> String source
     *  ------------------------------------------------------------------------
     *  Returns the source of the document mapped in `store` to the given path.
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
     *  store.normalizePath: String -> String
     *  ------------------------------------------------------------------------
     *  This method takes a path string as argument and returns its normalized
     *  version, by resolving '.', '..' and '//' and by adding a leading '/'.
     */
    normalizePath (path) {
        return pathlib.normalize(`/${path}`);
    }


    /**
     *  store.resolvePath: (String basePath, String subPath) -> String absPath
     *  ------------------------------------------------------------------------
     *  This method takes a base-path string and a sub-path string as arguments
     *  and returns a normalized absolute path string, obtained considering
     *  the sub-path as relative to the base-path.
     *
     *  If sub-path is an absolute path (starting by '/'), it returns the
     *  normalized version of sub-path instead.
     */
    resolvePath (basePath, subPath) {

        // subPath is an absolute path
        if (subPath[0] === '/') {
            return this.normalizePath(subPath);

        // subpath is a relative path and this document path ends by '/'
        } else if (basePath.slice(-1) === '/') {
            return this.normalizePath(`${basePath}/${subPath}`);

        // subpath is a relative path and this document path doesn't end by '/'
        } else {
            return this.normalizePath(`${basePath}/../${subPath}`)
        }
    }
    
    /**
     *  store.loadDocument: String path -> Document doc
     *  ------------------------------------------------------------------------
     *  Creates a document object representing a document stored at the given
     *  path and containing the following properties.
     *
     *
     *  ### doc.path: String
     *  The normalize path of the document.
     *
     *  ### doc.source: String
     *  The source of the document.
     *
     *  ### doc.evaluate: Object context -> Object namespace
     *  This is the source compiled to a function as returned by
     *  [document.parse](document.md).
     *
     *  ### doc.createContext: (...Objects preset) -> Object context
     *  Created a valid evaluation context that can be passed to the
     *  `doc.evaluate` function to evaluate this document. The returned context
     *  contains the following special names:
     *
     *  - `context.__doc__`: a refernce to this document
     *  - `context.__store__`: a reference to this document store
     *  - `context.import`: a function that loads and evaluates a document and
     *    returns its namespace; if a relative path is passed as argument to
     *    this function, it will be resolved as relative to this document path
     *  - All the name contained in the passed preset objects
     */
    async loadDocument (path, cache = new Map()) {

        // Return the cached version if already loaded
        const normPath = this.normalizePath(path);
        if (cache && cache.has(normPath)) return cache.get(normPath);


        // Create a document
        const doc = {};

        doc.path = normPath;

        doc.source = await this.read(doc.path);

        doc.evaluate = document.parse(doc.source);

        doc.resolvePath = subPath => this.resolvePath(doc.path, subPath);

        doc.createContext = (...presets) => {
            const context = document.createContext(...presets);
            context.__store__ = this;
            context.__doc__ = doc;
            context.import = async targetPath => {
                const fullTargetPath = doc.resolvePath(targetPath);
                const targetDoc = await this.loadDocument(fullTargetPath, cache);
                const targetContext = targetDoc.createContext();
                return await targetDoc.evaluate(targetContext);
            }
            return context;
        }


        // Cache and return the document
        if (cache) cache.set(normPath, doc);
        return doc;
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
     *  subStore = store.SubStore(rootPath)
     *  ```
     *  
     *  where:
     *  
     *  - `rootPath` is a directory path of this store
     *  - `subStore.read` delegates to `store.read(rootPath+path)`
     */
    createSubStore (path) {
        return new SubStore(this, path);
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


// SubStore class returned by store.createSubStore
class SubStore extends Store {
    
    constructor (store, path) {
        super();
        this.rootStore = store;
        this.rootPath = this.rootStore.normalizePath(path);
    }
    
    read (path) {
        const fullPath = this.rootStore.normalizePath(`${this.rootPath}/${path}`);
        return this.rootStore.read(fullPath);
    }

    createSubStore (path) {
        const fullPath = this.normalizePath(`${this.rootPath}/${path}`);
        return this.rootStore.createSubStore(fullPath);
    }
}


// Exports
module.exports = Store;
