const pathlib = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const trash = require('trash');
const Store = require('./store');

const isObject = obj => obj && typeof obj === "object" && !Array.isArray(obj);


/**
 *  <!--<% __render__ = require 'markdown' %>-->
 *
 *  FileStore
 *  ============================================================================
 *  This store handles read/write operations on the local file system.
 *
 *  ```js
 *  fileStore = new FileStore(rootPath, options)
 *  ```
 *
 *  - `rootPath` is the base path that will be prepended to the paths passed to
 *    the `read`, `write`, and `delete` methods.
 *  - `options.extension`: defines the extension of the document files (defaults
 *    to `.olo`)
 *  - `fileStore` is a [olo.Store](./store.md) object.
 *  
 *  > FileStore inherits from the [Store](./store.md) class and overrides the
 *  > methods described below.
 */
class FileStore extends Store {

    constructor (rootPath, options={}) {
        super();
        this.rootPath = pathlib.normalize(`/${rootPath}`);

        // Parse options
        if (!isObject(options)) options = {};
        this.extension = (typeof options.extension === "string") ?
                normalizeExtension(options.extension) :
                this.constructor.defaultExtension;
    }

    resolveSubPath (path) {
        return pathlib.join(this.rootPath, pathlib.normalize(`/${path}${this.extension}`));
    }


    /**
     *  async fileStore.read: String path -> String source
     *  ----------------------------------------------------------------------------
     *  Retrieves a `.olo` file given its absolute path.
     *
     *  ```js
     *  const source = await fileStore.read("/path/to/doc");
     *  ```
     *
     *  - When requesting `/path/to/doc`, the content of `<rootPath>/path/to/doc.olo`
     *    will be returned
     *  - When requesting `/path/to/dir/`, the content of `<rootPath>/path/to/dir/.olo`
     *    will be returned
     *  - When requesting a file that doesn't exist, and empty string will be returned
     *  
     *  The `.olo` default extension can be changed by passing a `options.extension`
     *  string to the store constructor.
     */
    async read (path) {
        const fullPath = this.resolveSubPath(path);

        if (!fs.existsSync(fullPath)) return "";

        return new Promise((resolve, reject) => {
            fs.readFile(fullPath, {encoding:'utf8'}, (err, content) => {
                if (err) reject(err);
                else resolve(content);
            });
        });
    }


    /**
     *  async fileStore.list: String path -> Array items
     *  ------------------------------------------------------------------------
     *  Returns the lists of document names and directory names contained
     *  under the given directory path. The directory names end with a forward
     *  slash, while the document names don't.
     *
     *  ```js
     *  const items = await file.list("/path/to/dir");
     *  ```
     *
     *  - When requesting `path/to/x/../dir`, the content of `/path/to/dir/`
     *    will be returned
     *  - When requesting an entry that doesn't exist, empty arrays will be
     *    returned
     */
    async list (path) {
        const items = [];
        const dirPath = this.normalizePath(`${this.rootPath}/${path}/`);
        
        if (fs.existsSync(dirPath)) {
            for (let item of await readDir(dirPath)) {
                if (item.isDirectory()) {
                    items.push(item.name+'/');
                } else if (item.isFile()) {
                    const ext = normalizeExtension(pathlib.extname(item.name));
                    if (ext === this.extension || item.name.toLowerCase() === this.extension) {
                        items.push(item.name.slice(0, -this.extension.length));
                    }
                }
            }
        }
        
        return items;
    }


    /**
     *  async fileStore.write: (String path, String source) -> undefined
     *  ----------------------------------------------------------------------------
     *  Modifies the content of a `.olo` file given its absolute path.
     *
     *  ```js
     *  await fileStore.write("/path/to/doc", source);
     *  ```
     *
     *  - If path is `/path/to/doc`, the content of `<rootPath>/path/to/doc.olo`
     *    will be modified with the passed source
     *  - If path is `/path/to/dir/`, the content of `<rootPath>/path/to/dir/.olo`
     *    will be modified with the passed source
     *  - When the file that doesn't exist, it will be created
     *   
     *  The `.olo` default extension can be changed by passing a `options.extension`
     *  string to the store constructor.
     */
    async write (path, source) {
        const fullPath = this.resolveSubPath(path);

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
     *  async fileStore.delete: String path -> undefined
     *  ------------------------------------------------------------------------
     *  Moves a `.olo` file to the trash bin, given its absolute path.
     *
     *  ```js
     *  await fileStore.delete("/path/to/doc");
     *  ```
     *
     *  - If path is `/path/to/doc`, the file `<rootPath>/path/to/doc.olo` will
     *    be deleted
     *  - If path is `/path/to/dir/`, the file `<rootPath>/path/to/dir/.olo`
     *    will be deleted
     *  - When the file doesn't exist, the method will return silently
     *   
     *  The `.olo` default extension can be changed by passing a `options.extension`
     *  string to the store constructor.
     */
    async delete (path) {
        const fullPath = this.resolveSubPath(path);
        if (!fs.existsSync(fullPath)) return;
        return await trash(fullPath);
    }


    static get defaultExtension () {
        return ".olo";
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

function normalizeExtension (ext) {
    while (ext[0] === ".") ext = ext.slice(1);
    return ext === "" ? ext : `.${ext}`;
}
