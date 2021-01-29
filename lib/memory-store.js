const pathlib = require('path');
const Store = require('./store');



/**
 *  MemoryStore
 *  ============================================================================
 *  This store handles read/write operations on an in-memory map object.
 *
 *  ```js
 *  memStore = new MemoryStore(documents)
 *  ```
 *
 *  Where `documents` is an optional object containing path-document pairs that
 *  will be added to the store upon creation.
 *
 *  The MemoryStore inherits the `load` method and the Error static properties
 *  from the parent `Store` class.
 */
class MemoryStore extends Store {

    constructor (documents={}) {
        super();
        this._content = new Map();
        for (let path in documents) {
            this._content.set(this.normalizePath(path), String(documents[path]));
        }
    }

    /**
     *  memStore.read - method
     *  ------------------------------------------------------------------------
     *  Retrieves the in-memory document source mapped to the given path.
     *
     *  ```js
     *  const source = await memStore.read("/path/to/doc");
     *  ```
     *
     *  - When requesting `path/to/x/../doc`, the content of `/path/to/doc` will
     *    be returned
     *  - When requesting an entry that doesn't exist, and empty string will be
     *    returned
     */
    read (path) {
        const normPath = this.normalizePath(path);
        return this._content.get(normPath) || "";
    }


    /**
     *  memStore.list - method
     *  ------------------------------------------------------------------------
     *  Returns the list of the children of a path.
     *
     *  ```
     *  entries = await memStore.list('/path/to/dir/');
     *  ```
     *
     *  If the meomry store contains the following paths ...
     *
     *  - `/path/to/dir/doc1`
     *  - `/path/to/dir/doc2`
     *  - `/path/to/dir/subdir/doc3`
     *  - `/path/to/dir/subdir/doc4`
     *  - `/path/to/otherdir/doc5`
     *
     *  ... then `entries` is `["doc1", "doc2", "subdir/"]`.
     *
     *  If the passed path doesn't exist, it returns `[]`.
     */
     list (path) {
         const normPath = this.normalizePath(`${path}/`);
         const items = [];
         for (let key of this._content.keys()) {
             if (key.indexOf(normPath) === 0 && key !== normPath) {
                 const subPath = key.slice(normPath.length);
                 const slashIndex = subPath.indexOf('/');
                 const item = slashIndex === -1 ? subPath : subPath.slice(0, slashIndex+1);
                 if (items.indexOf(item) === -1) items.push(item);
             }
         }
         return items;
     }


    /**
     *  memStore.write - method
     *  ------------------------------------------------------------------------
     *  Maps a document path to a source, in memory.
     *
     *  ```js
     *  await memStore.write("/path/to/doc", source);
     *  ```
     *
     *  - If path is `path/to/x/../doc`, the content of `/path/to/doc` will
     *    be modified with the passed source
     *  - `source` will be always converted to string
     */
    write (path, source) {
        const normPath = this.normalizePath(path);
        return this._content.set(normPath, String(source));
    }


    /**
     *  memStore.delete - method
     *  ------------------------------------------------------------------------
     *  Erases the doc source mapped in memory to the given path.
     *
     *  ```js
     *  await memStore.delete("/path/to/doc");
     *  ```
     *
     *  - If path is `path/to/x/../doc`, the entry `/path/to/doc` will be deleted
     */
    delete (path) {
        const normPath = this.normalizePath(path);
        return this._content.delete(normPath);
    }


    /**
     *  memStore.deleteAll - method
     *  ------------------------------------------------------------------------
     *  Erases all the docs whos path starts with the given path.
     *
     *  ```js
     *  await memStore.deleteAll("/path/to/");
     *  ```
     *
     *  - If path is `path/to/x/../dir`, the entry `/path/to/dir/` will be deleted
     */
    deleteAll (path) {
        const normPath = this.normalizePath(`${path}/`);
        for (let docPath of this._content.keys()) {
            if (docPath.indexOf(normPath) === 0) {
                this.delete(docPath);
            }
        }
    }
}

module.exports = MemoryStore;
