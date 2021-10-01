const pathlib = require('path');
const document = require('./document');


/**
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
 *      async list (path) { ... }
 *      async write (path, source) { ... }
 *      async delete (path) { ... }
 *      async deleteAll (path) { ... }
 *  }
 *  ```
 */
class Store {

    /**
     *  store.read - async method
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
     *  store.list - async method
     *  ------------------------------------------------------------------------
     *  Returns the names of the items contained under the given path.
     *
     *  ```js
     *  items = await store.list("/path/to");
     *  ```
     *
     *  Every implmenentation of this method should behave according to the
     *  following standard:
     *
     *  - It should returns an array of strings, each containing the name of a
     *    child item (a document or a container) of the given path; container
     *    names differ from document names in that they end with a `/`.
     *  - It should throw `Store.ReadPermissionDeniedError` if the store
     *    instance has no read permission on the given path.
     *  - It should throw `Store.ReadOperationNotAllowedError` if the store
     *    doesn't implement listing.
     *  
     *  For example, if `store` contains the following documents:
     *  
     *  - /path/to/doc1
     *  - /path/to/doc2
     *  - /path/to/dir/doc3
     *  
     *  then then `srotes.list('/path/to')` resolves `['doc1', 'doc2', 'dir/']`.
     *  
     *  When instantiated directly, the base store `list` method returns always
     *  an empty array.
     */
    async list (path) {
        return [];
    }


    /**
     *  store.write - async method
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
     *  - After calling this method on `path`, then `store.read(path)` should
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
     *  store.delete - async method
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
     *  - After calling this method on `path`, then `store.read(path)` should
     *    return an empty string and `store.list` should not return the name
     *    of the removed document.
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
     *  store.deleteAll - async method
     *  ------------------------------------------------------------------------
     *  Removes all the documents whose path starts with a given path.
     *
     *  ```
     *  await store.deleteAll("/path/to/");
     *  ```
     *
     *  Every implmenentation of this method should behave according to the
     *  following standard:
     *
     *  - After calling this method on `/path/to`, then `store.read("/path/to/any/doc")`
     *    should return an empty string and `store.list` should not return the name
     *    of any of the removed documents.
     *  - It should throw `Store.WritePermissionDeniedError` if the store
     *    instance has no write permission on the given path.
     *  - It should throw `Store.WriteOperationNotAllowedError` if the store
     *    is read-only.
     *  
     *  When instantiated directly, the base store `deleteAll` method always throws
     *  `Store.WriteOperationNotAllowedError`.
     */
    async deleteAll (path) {
        throw new this.constructor.WriteOperationNotAllowedError(this.normalizePath(path));
    }
    
    
    /**
     *  store.parseDocument - function
     *  ----------------------------------------------------------------------------
     *  Compiles a document source into an `evaluate` function that takes as input
     *  a document context object and returns the document namespace object and its
     *  rendered text.
     *
     *  ```js
     *  evaluate = store.parseDocument(source);
     *  {data, text} = await evaluate(context);
     *  ```
     *
     *  - `source` is a string containing the source of the olojs document to be
     *    evaluated
     *  - `evaluate` is an asynchronous function that evaluates the document and
     *    returns its namespace and its rendered text
     *  - `data` is an object containing all the names defined by the inline
     *    expressions of the document (the document namespace).
     *  - `text` is a string obtained by replacing every inline expression with its 
     *    strigified value. 
     */
    parseDocument (source) {
        return document.parse(source);
    }
    
    
    /**
     *  store.createContext - method
     *  ------------------------------------------------------------------------
     *  Create a document context bound to this store.
     *  
     *  ```
     *  context = store.createContext(path, presets)
     *  ```
     *  
     *  The `context` object is a document context that contains the following
     *  properties:
     *  
     *  - A `__path__` string equal to the passed document path
     *  - All the names contained in the `presets` object
     *  - An `import` function that given a document path, loads it from the
     *    current store, evaluates it and returns its namespace. The import
     *    parameter is a path that can optionally contain a `?query-string`, in 
     *    which case, the string will be parsed and its values added to the
     *    target document context under the `__query__` namespace.
     */
    createContext (path, presets={}) {
        const context = document.createContext(this.constructor.contextPrototype, {
            $store: this,
            $cache: new Map(),
            __path__: this.normalizePath(path),
        });
        Object.assign(context, presets);
        return context;
    }   
    
    
    /**
     *  store.createContextFromId - method
     *  ------------------------------------------------------------------------
     *  Create a document context given a document id.
     *  
     *  ```
     *  context = store.createContextFromId(docId)
     *  ```
     *  
     *  Where:
     *  
     *  - `docId` is a string in the form `/path/to/doc?query`, with query
     *    being a string like `name1=val1&name2=val2&...`
     *  - `context` is a Store context (see store.createContext) which contains
     *    a `__query__` namespace with all the name=value pairs contained in the
     *    docId query string
     */
    createContextFromId (docId) {
        const {path, query} = parseId(docId);
        return this.createContext(path, {__query__: query});
    }     


    // -------------------------------------------------------------------------
    //  Internal methods
    // -------------------------------------------------------------------------
    normalizePath (path) {
        return pathlib.normalize(`/${path}`);
    }    
}



// Properties shared by every Store context
Store.contextPrototype = {
    
    // $store
    
    async import (docId) {
        const {path, query} = parseId(docId);
        const targetPath = resolvePath(this.__path__, path);
        if (!this.$cache.has(targetPath)) {
            const source = await this.$store.read(targetPath);
            const evaluate = document.parse(source);
            this.$cache.set(targetPath, {source, evaluate});
        }
        const {source, evaluate} = this.$cache.get(targetPath);
        const context = this.$store.createContext(targetPath, {__query__:query});
        const {text, data} = await evaluate(context);
        data.__str__ = text;
        return data;
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



// Exports
module.exports = Store;





// -----------------------------------------------------------------------------
//  Utility functions
// -----------------------------------------------------------------------------

// Parses a /path/to/doc?query string and return a path and a query object
function parseId (docId) {
    const queryIndex = docId.indexOf('?');
    const path = queryIndex === -1 ? docId : docId.slice(0, queryIndex);
    const queryStr = queryIndex === -1 ? "" : docId.slice(queryIndex+1);
    const query = parseParameters(...iterQuery(queryStr));
    return {path, query};
}

// Given a list of argument ['par1=val1', 'par2=val2', 'par3=val3', ...],
// converts it to an object ontaining the ke-value pair contained in the list
function parseParameters (...keyValuePairs) {
    const query = {};
    for (let keyValuePair of keyValuePairs) {
        const separatorIndex = keyValuePair.indexOf("=");
        if (separatorIndex === -1) {
            let name = keyValuePair.trim();
            if (isValidName(name)) query[name] = true;
        } else {
            let name = keyValuePair.slice(0, separatorIndex).trim();
            if (isValidName(name)) {
                let string = keyValuePair.slice(separatorIndex+1).trim();
                let number = Number(string);
                query[name] = isNaN(number) ? string : number;
            }
        }
    }
    return query;
}

// Iterates over all the key-value pairs contained in the query, considering
// both `&` and `;` as separators.
function *iterQuery (query) {
    for (let ampParam of query.split('&')) {
        for (let param of ampParam.split(';')) {
            yield param;
        }
    }
}

// Resolve a subPath relative to a basePath, ignoring the file name
function resolvePath (basePath, subPath) {
    if (subPath[0] === '/') {
        return pathlib.normalize(subPath);
    } else {
        const baseDirPath = basePath.slice(-1) === '/' ? 
                basePath : pathlib.resolve(basePath, '..');
        return pathlib.join(baseDirPath, subPath);
    }    
}

// returns true if name is a valid swan identifier
function isValidName (name) {
    return typeof name === 'string' && /^[a-z_A-Z]+[a-z_A-Z0-9]*$/.test(name);
}






