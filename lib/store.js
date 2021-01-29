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
        const store = this;

        this.globals = {

            async import (docId) {
                const targetId = resolveId(this.__path__, docId);
                const targetContext = store.createContext(targetId);
                const targetPath = targetContext.__path__;
                if (!this.$cache.has(targetPath)) {
                    const source = await store.read(targetPath);
                    const evaluate = document.parse(source);
                    this.$cache.set(targetPath, [source, evaluate]);
                }
                const [targetSource, evaluateTarget] = this.$cache.get(targetPath);
                return await evaluateTarget(targetContext);
            }
        };
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
    async delete (path) {
        throw new this.constructor.WriteOperationNotAllowedError(this.normalizePath(path));
    }


    /**
     *  store.deleteAll - async methods
     *  Removes all the document whose path starts with a given path.
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
     *  store.createContext - method
     *  ------------------------------------------------------------------------
     *  Create a document context specific to a given store document.
     *
     *  ```js
     *  context = store.createContext(docId);
     *  ```
     *
     *  - `docId` is a combination of a path and a query string (e.g.
     *    `/path/to/doc?x=10;y=20;z=30`)
     *  - `context` is a valid document context
     *  - `context.__path__` contains the path portion of `docId`
     *  - `context.argns` contains the namespace passed as query string with
     *    `docId`. For example, if `docId = /path/to/doc?x=10;y=20;z=30`, then
     *    the argns object will be `{x:10, y:20, z:30}`.
     *  - `context.import` is a function that returns a store document namespace
     *    given its id. If the path portion of the id is a relative path, it
     *    will be resolved agains `context.__path__`.
     *
     *  This method is not meant to be overridden.
     */
    createContext (docId) {
        const {path, argns} = Store.parseId(docId);
        return document.createContext(
            this.globals,
            {$cache: new Map()},
            {__path__: path, argns: argns}
        );
    }


    /**
     *  store.load - async method
     *  ------------------------------------------------------------------------
     *  Reads, evaluates and renders the document identified by the passed id.
     *
     *  ```js
     *  {source, context, namespace, text} = await store.load(docId);
     *  ```
     *
     *  - `docId` is a combination of a path and a query string (e.g.
     *    `/path/to/doc?x=10;y=20;z=30`)
     *  - `source` is the document source returned by `store.read`
     *  - `context` is the document context returned by `store.createContext`
     *  - `namespace` is the document namespace evaluated in `context`
     *  - `text` is the document rendered context
     *
     *  This method is not meant to be overridden.
     */
    async load (docId) {
        const doc = {};
        doc.context = this.createContext(docId);
        doc.source = await this.read(doc.context.__path__);
        const evaluate = document.parse(doc.source);
        doc.namespace = await evaluate(doc.context);
        doc.text = await doc.context.str(doc.namespace);
        return doc;
    }


    normalizePath (path) {
        return pathlib.normalize(`/${path}`);
    }
}


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


function resolveId (basePath, relativeId) {
    const relativePath = relativeId.split('?')[0];
    const query = relativeId.slice(relativePath.length);
    const baseDirPath = basePath.slice(-1) === '/' ? basePath : pathlib.resolve(basePath, '..');
    return pathlib.resolve(baseDirPath, relativePath) + query;
}
