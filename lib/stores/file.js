const pathlib = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const trash = require('trash');
const EmptyStore = require('./empty');



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
class FileStore extends EmptyStore {
    
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
     *  fileStore.list - async method
     *  ----------------------------------------------------------------------------
     *  Retruns the list of the entry names of a given directory.
     *
     *  ```js
     *  entries = await fileStore.list("/path/to/dir/");
     *  ```
     *  
     *  - If `/path/to/dir` contains the items `doc1.olo`, `doc2.olo` and 
     *    `dir/`, then `entries` will be `['doc1', 'doc2', 'dir/']`.
     *  - The files with an extension different that `.olo` are ignored.
     *  - A files named `.olo` will result in the entry name `""`
     *  - When the given directory doesn't exist, `entries` is `[]`
     */
    async list (path) {
        const fullPath = pathlib.join(this.rootPath, pathlib.normalize(`/${path}`));
        
        const children = [];
        if (fs.existsSync(fullPath)) {
            const dir = await readDir(fullPath);
            for (let dirent of dir) {
                if (dirent.isDirectory()) {
                    children.push(dirent.name+"/");
                } else if (dirent.isFile() && dirent.name.slice(-4) === ".olo") {
                    children.push(dirent.name.slice(0,-4));
                }
            }
        }
        return children;        
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
     *  ------------------------------------------------------------------------
     *  Moves a `.olo` file to the trash bin, given its absolute path.
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

        return await trash(fullPath);
    }
}


module.exports = FileStore;



// Asynchronous version of fs.readdir
function readDir (path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, {withFileTypes:true}, (err, files) => {
            if (err) reject(err);
            else resolve(files);
        }); 
    });
}
