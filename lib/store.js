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
     *  store.parse: String source -> Function evalutate
     *  ------------------------------------------------------------------------
     *  Compiles a document source into an `evaluate` function that takes as input
     *  a document context object and returns the document namespace object and its
     *  rendered text.
     *
     *  ```js
     *  evaluate = store.parse(source);
     *  {data, text} = await evaluate(context);
     *  ```
     *
     *  - `evaluate` is an asynchronous function that evaluates the document and
     *    returns its namespace and its rendered text
     *  - `context` is a valid document context created either with
     *    `store.createContext` or with `document.createContext`.
     *  - `data` is an object containing all the names defined by the inline
     *    expressions of the document (the document namespace).
     *  - `text` is a string obtained by replacing every inline expression with its
     *    strigified value.
     */
    parse (source) {
        return document.parse(source);
    }

    /**
     *  store.createContext: (String path, ...Object namespace) -> Object context
     *  ------------------------------------------------------------------------
     *  Create a document context bound to this store.
     *  
     *  ```
     *  context = store.createContext(docPath, ns1, ns2, ...)
     *  ```
     *  
     *  The `context` object is a document context that contains the following
     *  properties:
     *  
     *  - A `__path__` string equal to `docPath`
     *  - A `__dirpath__` string equal to the directory path of `docPath`
     *  - All the names contained in the passed namespaces
     *  - An `import` function that given a document path, loads it from the
     *    current store, evaluates it and returns its namespace. The import
     *    document path is parsed as relative to `docPath`.
     */
    createContext (path, ...namespaces) {
        const cache = new Cache(this);
        return createContext(this, cache, path, ...namespaces);
    }
    
    /**
     *  store.load: (String path, ...Object namespace) -> {String source, Object context, Function evaluate, Object data, String text}
     *  ------------------------------------------------------------------------
     *  Read, parse and evaluate a document.
     *  
     *  ```
     *  {source, context, evaluate, data, text} = store.load(docPath, ns1, ns2, ...)
     *  ```
     *  
     *  where:
     *  
     *  - `source` is the document source mapped to docPath
     *  - `context` is the document context including the preset namespaces ns1, ns2, ...
     *  - `evaluate` is the source compiled into a function
     *  - `data` is the document namespace as returned by `evaluate`
     *  - `text` is the document rendered text as returned by `evaluate`
     */
    async load (path, ...namespaces) {
        const source = await this.read(path);
        const context = this.createContext(path, ...namespaces);
        const evaluate = this.parse(source);
        const {data, text} = await evaluate(context);
        return {source, context, evaluate, data, text};
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
    subStore (path) {
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
    
    subStore (path) {
        const fullPath = this._getFullPath(path);
        return this.rootStore.subStore(fullPath);
    }
    
    _getFullPath (path) {
        return pathlib.join(this.rootPath, path);
    }
}



// Exports
module.exports = Store;
