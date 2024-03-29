const Store = require("./store");






/**
 *  SubStore
 *  ============================================================================
 *  This store creates a shortcut for a path. A store is to a directory, what
 *  a sub-store is to sub-directory.
 *
 *  ```js
 *  subStore = new MemoryStore(rootStore, rootPath);
 *  ```
 *
 *  Every `subStore.read`, `subStore.write` and `subStore.delete` calls with
 *  a path `subPath` will be redirected to the corresponding rootStore
 *  method, with path `rootPath+subPath`.
 */
class SubStore extends Store {

    constructor (store, path) {
        super();
        this.rootStore = store;
        this.rootPath = this.rootStore.normalizePath(path);
    }

    _fullPath (path) {
        const subPath = this.normalizePath(path);
        return this.rootStore.normalizePath(`${this.rootPath}${subPath}`)
    }


    /**
     *  async subStore.read: String subPath -> String source
     *  ------------------------------------------------------------------------
     *  Retrives the document at `rootPath + subPath` in the `rootStore`.
     */
    read (path) {
        const fullPath = this._fullPath(path);
        return this.rootStore.read(fullPath);
    }


    /**
     *  async subStore.write: (String subPath, String source) -> undefined
     *  ------------------------------------------------------------------------
     *  Modifies the document at `rootPath + subPath` in the `rootStore`.
     */
    write (path, source) {
        const fullPath = this._fullPath(path);
        return this.rootStore.write(fullPath, source);
    }


    /**
     *  async subStore.delete: String subPath -> undefined
     *  ------------------------------------------------------------------------
     *  Erases the document at `rootPath + subPath` from the `rootStore`.
     */
    delete (path) {
        const fullPath = this._fullPath(path);
        return this.rootStore.delete(fullPath);
    }
}


module.exports = SubStore;
