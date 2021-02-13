const pathlib = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const trash = require('trash');
const Store = require('./store');

const isObject = obj => obj && typeof obj === "object" && !Array.isArray(obj);


/**
 *  FileStore
 *  ============================================================================
 *  This store handles read/write operations on the local file system.
 *
 *  ```js
 *  fileStore = new FileStore(rootPath, options)
 *  ```
 *
 *  - `rootPath` is the base path that will be prepended to the paths passed to
 *    the `read`, `list`, `write` and `delete` methods.
 *  - `options.extension`: define the extension of the document files (defaults
 *    to `.olo`)
 *  - `fileStore` is a [olojs.Store](./store.md) object.
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

    resolvePath (path) {
        return pathlib.join(this.rootPath, pathlib.normalize(`/${path}${this.extension}`));
    }


    /**
     *  fileStore.read - async method
     *  ----------------------------------------------------------------------------
     *  Retrieves a `.olo` file given its absolute path.
     *
     *  ```js
     *  const source = await fileStore.read("/path/to/doc");
     *  ```
     *
     *  - When requesting `/path/to/doc`, the content of `/path/to/doc.olo` will
     *    be returned
     *  - When requesting `/path/to/dir/`, the content of `/path/to/dir/.olo` will
     *    be returned
     *  - When requesting a file that doesn't exist, and empty string will be returned
     *
     *  The `.olo` default extension can be changed by passing a `options.extension`
     *  string to the store constructor.
     */
    async read (path) {
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
     *  - Files named `.olo` will result in the entry name `""`
     *  - When the given directory doesn't exist, `entries` is `[]`
     *
     *  The `.olo` default extension can be changed by passing a `options.extension`
     *  string to the store constructor.
     */
    async list (path) {
        const fullPath = pathlib.join(this.rootPath, pathlib.normalize(`/${path}`));

        const children = [];
        if (fs.existsSync(fullPath)) {
            const dir = await readDir(fullPath);
            for (let dirent of dir) {
                if (dirent.isDirectory()) {
                    children.push(dirent.name+"/");
                } else if (dirent.isFile() && dirent.name.slice(-4) === this.extension) {
                    children.push(dirent.name.slice(0,-4));
                }
            }
        }
        return children;
    }


    /**
     *  fileStore.write - async method
     *  ----------------------------------------------------------------------------
     *  Modifies the content of a `.olo` file given its absolute path.
     *
     *  ```js
     *  await fileStore.write("/path/to/doc", source);
     *  ```
     *
     *  - If path is `/path/to/doc`, the content of `/path/to/doc.olo` will
     *    be modified with the passed source
     *  - If path is `/path/to/dir/`, the content of `/path/to/dir/.olo` will
     *    be modified with the passed source
     *  - When the file that doesn't exist, it will be created
     *
     *  The `.olo` default extension can be changed by passing a `options.extension`
     *  string to the store constructor.
     */
    async write (path, source) {
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
     *  - When the file doesn't exist, it will return silently
     *
     *  The `.olo` default extension can be changed by passing a `options.extension`
     *  string to the store constructor.
     */
    async delete (path) {
        const fullPath = this.resolvePath(path);
        if (!fs.existsSync(fullPath)) return;
        return await trash(fullPath);
    }


    /**
     *  fileStore.delete - async method
     *  ------------------------------------------------------------------------
     *  Moves a dirctory to the trash bin, given its absolute path.
     *
     *  ```js
     *  await fileStore.deleteAll("/path/to/dir");
     *  ```
     *
     *  When the dirctory doesn't exist, it will return silently
     */
    async deleteAll (path) {
        const fullPath = pathlib.join(this.rootPath, pathlib.normalize(`/${path}/`));
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
