const pathlib = require('path');
const NullStore = require('./null');



/**
 *  MemoryStore
 *  ============================================================================
 *  This store handles read/write operations on an in-memory map object.
 *
 *  ```js
 *  memStore = new MemoryStore()
 *  ```
 */
class MemoryStore extends Map {
    
    constructor () {
        super();
    }
    
    normalizePath (path) {
        return pathlib.normalize(`/${path}`);
    }
    
    /**
     *  memStore.get - method
     *  ----------------------------------------------------------------------------
     *  Retrieves the in-memory document source mapped to the given path.
     *
     *  ```js
     *  const source = await memStore.get("/path/to/doc");
     *  ```
     *  
     *  - When requesting `path/to/x/../doc`, the content of `/path/to/doc` will
     *    be returned
     *  - When requesting an entry that doesn't exist, and empty string will be returned
     */
    get (path) {
        const normPath = this.normalizePath(path);
        return super.get(normPath) || "";
    }


    /**
     *  memStore.set - method
     *  ----------------------------------------------------------------------------
     *  Maps a document path to a source, in memory.
     *
     *  ```js
     *  await memStore.set("/path/to/doc", source);
     *  ```
     *  
     *  - If path is `path/to/x/../doc`, the content of `/path/to/doc` will
     *    be modified with the passed source
     *  - `source` will be always converted to string
     */
    set (path, source) {
        const normPath = this.normalizePath(path);
        return super.set(normPath, String(source));
    }
    

    /**
     *  memStore.delete - method
     *  ----------------------------------------------------------------------------
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
        return super.delete(normPath);
    }
}

module.exports = MemoryStore;
