
const pathlib = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

const FileStore = require('./file');
const errors = require('./store-errors');

const isDirectory = path => path.slice(-1) === '/';



/**
 *  FSStore
 *  ============================================================================
 *  This store handles read/write operations on the local file system. It
 *  differs from `FileStore` in that it returns a directory content in case of 
 *  get requests of paths ending with a `/`.
 *  
 *  ```js
 *  fsStore = new FSStore(rootPath)
 *  ```
 *  
 *  - `rootPath` is the base path that will be prepended to the paths passed to
 *    the `get`, `set` and `delete` methods.
 *  - `fileStore` is an object that exposes the standard olojs store API: `get`,
 *    `set` and `delete`. 
 */

class FSStore extends FileStore {
    
    /**
     *  FSStore.prototype.get - async method
     *  ----------------------------------------------------------------------------
     *  Retrieves a `.olo` file given its absolute path. If the path ends with a
     *  '/' returns a document containing info about the directory content.
     *
     *  ```js
     *  const source = await fsStore.get("/path/to/doc");
     *  ```
     *  
     *  - When requesting `/path/to/doc`, the content of `/path/to/doc.olo` will
     *    be returned
     *  - When requesting a file that doesn't exist, and empty string will be returned
     *  - When requesting `/path/to/dir/`, it returns a document whose namespace
     *    contains a `children` list of the contained .olo document names (without
     *    entension) and of the contained directory (with trailing `/`). 
     *  
     *  For example, if the directory `/path/to/dir/` contains the documents
     *  `doc1.olo` `file.txt` and `doc2.olo` and two directories `dir1` and `dir2`, 
     *  the returned document will contain the following swan expression:
     *  
     *  ```
     *  <% children = ["dir1/", "dir2/", "doc1", "doc2"] %>
     *  ```
     */
    async get (path) {    
        if (!isDirectory(path)) {
            return await super.get(path);
        }
        
        let fullPath = pathlib.join(this.rootPath, pathlib.normalize(`/${path}`));
        
        let children = [];
        if (fs.existsSync(fullPath)) {
            let dir = await readDir(fullPath);
            for (let dirent of dir) {
                if (dirent.isDirectory()) {
                    children.push(dirent.name+"/");
                } else if (dirent.isFile() && dirent.name.slice(-4) === ".olo") {
                    children.push(dirent.name.slice(0,-4));
                }
            }
        }
        return `<% children = ${JSON.stringify(children)} %>`; 
    }
    
    
    /**
     *  FsStore.prototype.set - async method
     *  ----------------------------------------------------------------------------
     *  Modifies the content of a `.olo` file given its absolute path. If the path
     *  ends with a `/` it throws an error.
     *
     *  ```js
     *  await fsStore.set("/path/to/doc", source);
     *  ```
     *  
     *  - If path is `/path/to/doc`, the content of `/path/to/doc.olo` will
     *    be modified
     *  - When the file that doesn't exist, it will be created
     *  - If path is `/path/to/dir/`, it throws an `OperationNotAllowed` error
     */
    async set (path, source) {
        if (isDirectory(path)) {
            throw new errors.OperationNotAllowed('SET', pathlib.normalize(`/${path}`));
        } else {
            await super.set(path, source);
        }
    }        


    /**
     *  FSStore.prototype.delete - async method
     *  ----------------------------------------------------------------------------
     *  Deletes a `.olo` file given its absolute path. If the path ends with a `/`,
     *  it throws an error.
     *
     *  ```js
     *  await fsStore.delete("/path/to/doc");
     *  ```
     *  
     *  - If path is `/path/to/doc`, the file `/path/to/doc.olo` will be deleted
     *  - When the file that doesn't exist, it will return silently
     *  - If path is `/path/to/dir/`, it trows an `OperationNotAllowed` error.
     */
    async delete (path) {
        if (isDirectory(path)) {
            throw new errors.OperationNotAllowed('DELETE', pathlib.normalize(`/${path}`))
        } else {
            await super.delete(path);
        }
    }
}


module.exports = FSStore;





// Asynchronous version of fs.readdir
function readDir (path) {
    return new Promise((resolve, reject) => {
        fs.readdir(path, {withFileTypes:true}, (err, files) => {
            if (err) reject(err);
            else resolve(files);
        }); 
    });
}
