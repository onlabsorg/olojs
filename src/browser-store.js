const Store = require('../lib/store');
const localForage = require('localforage');


/**
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
     *  browserStore.read - async method
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
     *  browserStore.list - method
     *  ------------------------------------------------------------------------
     *  Returns the list of the children of a path.
     *
     *  ```
     *  entries = await browserStore.list('/path/to/dir/');
     *  ```
     *  
     *  If the browser store contains the following paths ...
     *  
     *  - `/path/to/dir/doc1`
     *  - `/path/to/dir/doc2`
     *  - `/path/to/dir/subdir/doc3`
     *  - `/path/to/dir/subdir/doc4`
     *  - `/path/to/otherdir/doc5`
     *  
     *  ... then `entries` is `["doc1", "doc2", "subdir/"]`.
     *  
     *  The document path gets normalized, therefore `/path/to/dir/`, 
     *  `/path/to/./dir`, `path/to/dir`, etc. are equivalent.
     *  
     *  If the passed path doesn't exist, it returns `[]`.
     */
    async list (path) {
        const normPath = this.normalizePath(`${path}/`);
        const items = [];
        for (let i=0; i < await this._backend.length(); i++) {
            const key = await this._backend.key(i);
            if (key.indexOf(normPath) === 0) {
                const subPath = key.slice(normPath.length);
                const slashIndex = subPath.indexOf('/');
                const item = slashIndex === -1 ? subPath : subPath.slice(0, slashIndex+1);
                if (items.indexOf(item) === -1) items.push(item);
            }
        }
        return items;
    }
    

    /**
     *  browserStore.write - method
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
     *  browserStore.delete - method
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
    

    /**
     *  browserStore.deleteAll - method
     *  ------------------------------------------------------------------------
     *  Erases all the docs whose path starts with the given path.
     *  
     *  ```js
     *  await browserStore.deleteAll("/path/to/");
     *  ```
     *  
     *  The document path gets normalized, therefore `/path/to/dir/`, 
     *  `/path/to/./dir`, `path/to/dir`, etc. are equivalent.
     *  
     *  If the passed path doesn't exist, the methods returns silently.
     */
    async deleteAll (path) {
        const normPath = this.normalizePath(`${path}/`);
        const docPaths = [];
        for (let i=0; i < (await this._backend.length()); i++) {
            docPaths.push(await this._backend.key(i));
        }        
        for (let docPath of docPaths) {
            if (docPath.indexOf(normPath) === 0) {
                await this.delete(docPath);
            }
        }
    }
}

module.exports = BrowserStore;


/**
 *  [IndexDB]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 *  [localStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 */
