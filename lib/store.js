const pathlib = require('path');
const isDirectory = path => path.slice(-1) === '/';
const document = require('./document');

const isValidName = require('@onlabsorg/swan-js').T.isName;


/**
 *  Store
 *  ============================================================================
 *  This is the base class to be used to create olojs document stores.
 *  When instantiatete directly it behaves like a read-only empty store.
 *  
 *  ```js
 *  store = new Store();    // a read-only empty store
 *  
 *  // A store implementation
 *  class ChildStore extends Store {
 *      async read (path) { ... }
 *      async list (path) { ... }
 *      async write (path, source) { ... }
 *      async delete (path) { ... }
 *  ```
 */
class Store {
    
    constructor () {
        this.globals = Object.assign({}, this.constructor.globals);
    }
    
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
    async delete (path, source) {
        throw new this.constructor.WriteOperationNotAllowedError(this.normalizePath(path));
    }
    
    
    /**
     *  store.load - async method
     *  ------------------------------------------------------------------------
     *  Read a document source and returns a parsed document object.
     *
     *  ```js
     *  doc = await store.load(docId);
     *  context = doc.createContext(...namespaces);
     *  namespace = await doc.evaluate(context);
     *  ```
     *
     *  - `docId` is a combination of a path and a query string (e.g.
     *    `/path/to/doc?x=10;y=20;z=30`)
     *  - `doc.path` contains the path portion of the passed id
     *  - `doc.source` contained the document source returned by `store.read`
     *  - `doc.createContext` creates a document context specific to `doc`
     *  - `context.__path__` contains `doc.path`
     *  - `context.argns` contains the namespace passed as query string with
     *    `docId`
     *  - `context.import` is a function that returns a store document namespace
     *    given its path (which can be relative to `doc.path`)
     *  - `doc.evaluate` is the function returned by `olojs.document.parse(doc.source)`
     *  
     *  This method is not meant to be overridden. 
     */
    async load (docId) {
        const store = this;
        const Store = this.constructor;
        const cache = new Map();
        
        const loadDocument = async docId => {            
            const {path, argns} = Store.parseId(docId);
            if (!cache.has(path)) {
                const source = await store.read(path);
                const evaluate = document.parse(source);
                cache.set(path, {source, evaluate});
            }
            return createDocument(path, argns);
        }
        
        const createDocument = (path, argns) => ({
            
            get path () {
                return path;
            },
            
            get source () {
                return cache.get(this.path).source;
            },
            
            createContext (...namespaces) {
                if (namespaces.length === 0) namespaces = [{}];
                const context = document.createContext(
                    store.globals, 
                    {__load__: loadDocument}, 
                    ...namespaces);
                context.__path__ = this.path;
                context.argns = argns;
                return context;
            },
            
            get evaluate () {
                return cache.get(this.path).evaluate;
            }        
        });   
        
        return await loadDocument(docId);     
    }


    normalizePath (path) {
        return pathlib.normalize(`/${path}`);
    }    
}


// The properties and functions contained in this object are in the scope of
// every document and therefore accessible to its inline expressions.
Store.globals = {
    
    async import (id) {
        const targetId = pathlib.resolve(this.__path__, "..", id);
        const targetDoc = await this.__load__(targetId);
        const targetDocContext = targetDoc.createContext();
        return await targetDoc.evaluate(targetDocContext);
    }
};


// Parses the given id string into its a store name (uri scheme), a path 
// (uri authority + uri path) and a query (uri query)
Store.parseId = id => {
    const queryIndex = id.indexOf('?');
    const path = queryIndex === -1 ? id : id.slice(0, queryIndex);
    const query = queryIndex === -1 ? "" : id.slice(queryIndex+1);
    return {
        path: pathlib.normalize(`/${path}`),
        argns: parseParameters(...iterQuery(query))
    }
}


// Given a list of argument ['par1=val1', 'par2=val2', 'par3=val3', ...], 
// converts it to an object ontaining the ke-value pair contained in the list
function parseParameters (...keyValuePairs) {
    const argns = {};
    for (let keyValuePair of keyValuePairs) {
        const separatorIndex = keyValuePair.indexOf("=");
        if (separatorIndex === -1) {
            let name = keyValuePair.trim();
            if (isValidName(name)) argns[name] = true;
        } else {
            let name = keyValuePair.slice(0, separatorIndex).trim();
            if (isValidName(name)) {
                let string = keyValuePair.slice(separatorIndex+1).trim();
                let number = Number(string);
                argns[name] = isNaN(number) ? string : number;
            }
        }
    }
    return argns;
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



// Base class for Store.ReadPermissionDeniedError and 
// Store.WritePermissionDeniedError.
class PermissionDeniedError extends Error {
    
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
Store.ReadPermissionDeniedError = class extends PermissionDeniedError {
    
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
Store.WritePermissionDeniedError = class extends PermissionDeniedError {
    
    constructor (path) {
        super("WRITE", path);
    }
}



// Base class for Store.ReadOperationNotAllowedError and 
// Store.WriteOperationNotAllowedError.
class OperationNotAllowedError extends Error {
    
    constructor (operation, path) {
        super(`Operation not allowed: ${operation} ${path}`);
    }
}

/**
 *  Store.ReadOperationNotAllowedError - class
 *  ----------------------------------------------------------------------------
 *  Error thrown when a read operation is not defined on the store.
 *  
 *  ```js
 *  throw new Store.ReadOperationNotAllowedError('/path/to/doc');
 *  ```
 */
Store.ReadOperationNotAllowedError = class extends OperationNotAllowedError {
    
    constructor (path) {
        super("READ", path);
    }
}

/**
 *  Store.WriteOperationNotAllowedError - class
 *  ----------------------------------------------------------------------------
 *  Error thrown when a write operation is not defined on the store.
 *  
 *  ```js
 *  throw new Store.WriteOperationNotAllowedError('/path/to/doc');
 *  ```
 */
Store.WriteOperationNotAllowedError = class extends OperationNotAllowedError {
    
    constructor (path) {
        super("WRITE", path);
    }
}



module.exports = Store;