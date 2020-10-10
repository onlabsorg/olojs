/**
 *  olojs.protocols.file
 *  ============================================================================
 *  This protocol handles read/write operations on the local file system.
 */

const pathlib = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

const resolvePath = path => pathlib.join("/", path) + ".olo";


/**
 *  olojs.protocols.file.get
 *  ----------------------------------------------------------------------------
 *  Retrieves a `.olo` file given its absolute path.
 *
 *  ```js
 *  const source = await olojs.protocols.file.get("/path/to/doc");
 *  ```
 *  
 *  - When requesting `/path/to/doc`, the content of `/path/to/doc.olo` will
 *    be returned
 *  - When requesting `/path/to/dir/`, the content of `/path/to/dir/.olo` will
 *    be returned
 *  - When requesting a file that doesn't exist, and empty string will be returned
 */
exports.get = function (path) {    
    const fullPath = resolvePath(path);
    
    if (!fs.existsSync(fullPath)) return "";

    return new Promise((resolve, reject) => {
        fs.readFile(fullPath, {encoding:'utf8'}, (err, content) => {
            if (err) reject(err);
            else resolve(content);
        });                        
    });                              
}



/**
 *  olojs.protocols.file.set
 *  ----------------------------------------------------------------------------
 *  Modifies the content of a `.olo` file given its absolute path.
 *
 *  ```js
 *  await olojs.protocols.file.set("/path/to/doc", source);
 *  ```
 *  
 *  - If path is `/path/to/doc`, the content of `/path/to/doc.olo` will
 *    be modified
 *  - If path is `/path/to/dir/`, the content of `/path/to/dir/.olo` will
 *    be modified
 *  - When the file that doesn't exist, it will be created
 */
exports.set = function (path, source) {
    const fullPath = resolvePath(path);

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
 *  olojs.protocols.file.delete
 *  ----------------------------------------------------------------------------
 *  Deletes a `.olo` file given its absolute path.
 *
 *  ```js
 *  await olojs.protocols.file.delete("/path/to/doc");
 *  ```
 *  
 *  - If path is `/path/to/doc`, the file `/path/to/doc.olo` will be deleted
 *  - If path is `/path/to/dir/`, the file `/path/to/dir/.olo` will be deleted
 *  - When the file that doesn't exist, it will return silently
 */
exports.delete = function (path) {
    const fullPath = resolvePath(path);
    
    if (!fs.existsSync(fullPath)) return;

    return new Promise((resolve, reject) => {
        fs.unlink(fullPath, (err) => {
            if (err) reject(err);
            else resolve();
        });            
    });                            
}
