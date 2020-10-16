const pathlib = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const NullStore = require('./null');



/**
 *  FileStore
 *  ============================================================================
 *  This store handles read/write operations on the local file system.
 *
 *  ```js
 *  fileStore = new FileStore(rootPath)
 *  ```
 *  
 *  - `rootPath` is the base path that will be prepended to the paths passed to
 *    the `get`, `set` and `delete` methods.
 *  - `fileStore` is an object that exposes the standard olojs store API: `get`,
 *    `set` and `delete`.
 */
class FileStore extends NullStore {
    
    constructor (rootPath) {
        super();
        this.rootPath = pathlib.normalize(`/${rootPath}`);
    }
    
    resolvePath (path) {
        return pathlib.join(this.rootPath, pathlib.normalize(`/${path}.olo`));
    }
    
    
    /**
     *  fileStore.get - async method
     *  ----------------------------------------------------------------------------
     *  Retrieves a `.olo` file given its absolute path.
     *
     *  ```js
     *  const source = await fileStore.get("/path/to/doc");
     *  ```
     *  
     *  - When requesting `/path/to/doc`, the content of `/path/to/doc.olo` will
     *    be returned
     *  - When requesting `/path/to/dir/`, the content of `/path/to/dir/.olo` will
     *    be returned
     *  - When requesting a file that doesn't exist, and empty string will be returned
     */
    async get (path) {    
        const fullPath = this.resolvePath(path);
        
        if (!fs.existsSync(fullPath)) return "";

        return new Promise((resolve, reject) => {
            fs.readFile(fullPath, {encoding:'utf8'}, (err, content) => {
                if (err) reject(err);
                else resolve(content);
            });                        
        });                              
    }    
    
    
    /**
     *  fileStore.set - async method
     *  ----------------------------------------------------------------------------
     *  Modifies the content of a `.olo` file given its absolute path.
     *
     *  ```js
     *  await fileStore.set("/path/to/doc", source);
     *  ```
     *  
     *  - If path is `/path/to/doc`, the content of `/path/to/doc.olo` will
     *    be modified with the passed source
     *  - If path is `/path/to/dir/`, the content of `/path/to/dir/.olo` will
     *    be modified with the passed source
     *  - When the file that doesn't exist, it will be created
     */
    async set (path, source) {
        const fullPath = this.resolvePath(path);

        const parentPath = pathlib.join(fullPath, "..", '/');
        if (!fs.existsSync(parentPath)) {
            mkdirp.sync(parentPath);
        }

        return new Promise((resolve, reject) => {
            fs.writeFile(fullPath, source, {encoding:'utf8'}, (err) => {
                if (err) reject(err);
                else resolve();
            });            
        });                
    }    


    /**
     *  fileStore.delete - async method
     *  ----------------------------------------------------------------------------
     *  Deletes a `.olo` file given its absolute path.
     *
     *  ```js
     *  await fileStore.delete("/path/to/doc");
     *  ```
     *  
     *  - If path is `/path/to/doc`, the file `/path/to/doc.olo` will be deleted
     *  - If path is `/path/to/dir/`, the file `/path/to/dir/.olo` will be deleted
     *  - When the file that doesn't exist, it will return silently
     */
    async delete (path) {
        const fullPath = this.resolvePath(path);
        
        if (!fs.existsSync(fullPath)) return;

        return new Promise((resolve, reject) => {
            fs.unlink(fullPath, (err) => {
                if (err) reject(err);
                else resolve();
            });            
        });                            
    }
}


module.exports = FileStore;
