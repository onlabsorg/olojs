
const Store = require("../lib/stores/store.js");
const localforage = require('localforage');


/**
 *  BrowserStore
 *  ============================================================================
 *  This store maps file-like paths to olo-document sources stored in the
 *  browser storage.
 *
 *  ```js
 *  browserStore = new BrowserStore(storeId);
 *  ```
 *
 *  > BrowserStore inherits from the [Store](./store.md) class and overrides the
 *  > methods described below.
 */
class BrowserStore extends Store {

    constructor (storeId) {
        super();
        this._backend = localforage.createInstance({name: storeId});
    }


    /**
     *  async browserStore.read: String path -> String source
     *  ------------------------------------------------------------------------
     *  Retrieves the in-browser document source mapped to the given path.
     *
     *  ```js
     *  const source = await browserStore.read("/path/to/doc");
     *  ```
     *
     *  - When requesting `path/to/x/../doc`, the content of `/path/to/doc` will
     *    be returned
     *  - When requesting an entry that doesn't exist, an empty string will be
     *    returned
     */
    async read (path) {
        const normPath = this.normalizePath(path);
        return String(await this._backend.getItem(normPath) || "");
    }


    /**
     *  async browserStore.write: (String path, String source) -> undefined
     *  ------------------------------------------------------------------------
     *  Maps a document path to a source, in the browser storage.
     *
     *  ```js
     *  browserStore.write("/path/to/doc", source);
     *  ```
     *
     *  - If path is `path/to/x/../doc`, the content of `/path/to/doc` will
     *    be modified with the passed source
     *  - `source` will be always converted to string
     */
    async write (path, source) {
        const normPath = this.normalizePath(path);
        await this._backend.setItem(normPath, String(source));
    }


    /**
     *  async browserStore.delete: String path -> undefined
     *  ------------------------------------------------------------------------
     *  Erases the doc source mapped in the browser storage to the given path.
     *
     *  ```js
     *  browserStore.delete("/path/to/doc");
     *  ```
     *
     *  - If path is `path/to/x/../doc`, the entry `/path/to/doc` will be deleted
     */
    async delete (path) {
        const normPath = this.normalizePath(path);
        await this._backend.removeItem(normPath);
    }
}


module.exports = BrowserStore;
