const Store = require('../lib/store');
const localForage = require('localforage');


/**
 *  <!--<% __render__ = require 'markdown' %>-->
 *
 *  BrowserStore
 *  ============================================================================
 *  This is a [Store](./store.md) object backed by the browser permanent storage
 *  ([IndexDB] or [localStorage]).
 *
 *  ```js
 *  fileStore = new BrowserStore(storeId)
 *  ```
 *
 *  - `storeId` is a name that uniquely identifies your store in the browser
 *    storage.
 *  
 *  > BrowserStore inherits from the [Store](./store.md) class and overrides the
 *  > methods described below.
 */
class BrowserStore extends Store {

    constructor (storeId) {
        super();
        this.id = storeId;
        this._backend = localForage.createInstance({
            name: storeId,
            version: 0.1
        });
    }


    /**
     *  async browserStore.read: String path -> String source
     *  ----------------------------------------------------------------------------
     *  Retrieves a document from the browser storage.
     *
     *  ```js
     *  source = await browserStore.read("/path/to/doc");
     *  ```
     *
     *  The document path gets normalized, therefore `path/to/doc`,
     *  `/path/to/./doc`, `/path/to/doc`, etc. refer to the same document.
     *  
     *  If the passed path doesn't exist, it returns an empty string.
     */
    async read (path) {
        const key = this.normalizePath(path);
        const value = await this._backend.getItem(key);
        return value === null ? "" : String(value);
    }




    /**
     *  async browserStore.write: (String path, String source) -> undefined
     *  ------------------------------------------------------------------------
     *  Maps a document path to a source, in the browser storage.
     *
     *  ```js
     *  await browserStore.write("/path/to/doc", source);
     *  ```
     *
     *  The document path gets normalized, therefore `path/to/doc`,
     *  `/path/to/./doc`, `/path/to/doc`, etc. refer to the same document.
     *  
     *  If the passed path doesn't exist, it will be created.
     */
    async write (path, source) {
        const key = this.normalizePath(path);
        const value = String(source);
        await this._backend.setItem(key, value);
    }


    /**
     *  async browserStore.delete: String path -> undefined
     *  ------------------------------------------------------------------------
     *  Erases the doc source mapped in the browser storage to the given path.
     *
     *  ```js
     *  await browserStore.delete("/path/to/doc");
     *  ```
     *  
     *  The document path gets normalized, therefore `path/to/doc`,
     *  `/path/to/./doc`, `/path/to/doc`, etc. refer to the same document.
     *  
     *  If the passed path doesn't exist, the methods returns silently.
     */
    async delete (path) {
        const key = this.normalizePath(path);
        await this._backend.removeItem(key);
    }
}

module.exports = BrowserStore;


/**
 *  [IndexDB]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 *  [localStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 */
