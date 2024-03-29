const pathlib = require('path');


/**
 *  Store
 *  ============================================================================
 *  The Store class is meant to be used as base class for creating custom
 *  stores, but when instantiatete directly it behaves like a read-only empty
 *  store.
 *
 *  ```js
 *  // A store implementation
 *  class MyStore extends Store {
 *      async read (path) { ... }
 *      async write (path, source) { ... }
 *      async delete (path) { ... }
 *  }
 *  // A read-only empty store
 *  store = new Store();
 *  ```
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
     *  async store.write: (String path, String source) -> undefined
     *  ------------------------------------------------------------------------
     *  Modifies the source of the document mapped in `store` to the given path.
     *
     *  ```js
     *  await store.write("/path/to/doc", source);
     *  ```
     *
     *  Every implmenentation of this method should behave according to the
     *  following standard:
     *
     *  - It should modify the source mapped to the given path, so that a
     *    subsequent call to read on that path returns the new source.
     *  - It should throw `Store.WritePermissionDeniedError` if the store
     *    instance has no write permission on the given path.
     *  - It should throw `Store.WriteOperationNotAllowedError` if the store
     *    instance does not support the write operation.
     *
     *
     *  When instantiated directly, the base store `write` method always throws
     *  `Store.WriteOperationNotAllowedError`.
     */
    async write (path, source) {
        throw new this.constructor.WriteOperationNotAllowedError(path);
    }


    /**
     *  async store.delete: String path -> undefined
     *  ------------------------------------------------------------------------
     *  Remove a document from the `store`.
     *
     *  ```js
     *  await store.delete("/path/to/doc");
     *  ```
     *
     *  Every implmenentation of this method should behave according to the
     *  following standard:
     *
     *  - It should remove the document mapped to the given path, so that a
     *    subsequent call to read on that path returns an empty string.
     *  - It should throw `Store.WritePermissionDeniedError` if the store
     *    instance has no write permission on the given path.
     *  - It should throw `Store.WriteOperationNotAllowedError` if the store
     *    instance does not support the write operation.
     *
     *  When instantiated directly, the base store `delete` method always throws
     *  `Store.WriteOperationNotAllowedError`.
     */
    async delete (path) {
        throw new this.constructor.WriteOperationNotAllowedError(path);
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
 *  Error thrown when the store doesn't implement a read operation.
 */
Store.ReadOperationNotAllowedError = class extends Store.OperationNotAllowedError {

    constructor (path) {
        super("READ", path);
    }
}


/**
 *  Store.WriteOperationNotAllowedError - class
 *  ----------------------------------------------------------------------------
 *  Error thrown when the store doesn't implement a write or delete operation.
 */
Store.WriteOperationNotAllowedError = class extends Store.OperationNotAllowedError {

    constructor (path) {
        super("WRITE", path);
    }
}


// Exports
module.exports = Store;
