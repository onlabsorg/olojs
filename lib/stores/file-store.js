
const pathlib = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const mkdirp = require('mkdirp');
const Store = require('./store');

const isObject = obj => obj && typeof obj === "object" && !Array.isArray(obj);

function normalizeExtension (ext) {
    while (ext[0] === ".") ext = ext.slice(1);
    return ext === "" ? ext : `.${ext}`;
}


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
 *    the `read`, `write` and `delete` methods.
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
        this.rootPath = pathlib.normalize(`/${rootPath}/.`);

        // Parse options
        if (!isObject(options)) options = {};
        this.extension = (typeof options.extension === "string") ?
                normalizeExtension(options.extension) :
                this.constructor.defaultExtension;
    }


    /**
     *  async fileStore.read: String path -> String source
     *  ----------------------------------------------------------------------------
     *  Retrieves a `.olo` file given its path relative to the store root path.
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
        const fullPath = this._filePath(path);

        if (!fs.existsSync(fullPath)) return "";

        return await fsp.readFile(fullPath, {encoding:'utf8'})
    }


    /**
     *  async fileStore.write: (String path, String source) -> undefined
     *  ----------------------------------------------------------------------------
     *  Modifies the content of a `.olo` file given its path relative to the store
     *  root path.
     *
     *  ```js
     *  await fileStore.write("/path/to/doc", source);
     *  ```
     *
     *  - If path is `/path/to/doc`, the content of `<rootPath>/path/to/doc.olo` will
     *    be modified with the passed source
     *  - If path is `/path/to/dir/`, the content of `<rootPath>/path/to/dir/.olo` will
     *    be modified with the passed source
     *  - When the file that doesn't exist, it will be created
     *
     *  The `.olo` default extension can be changed by passing a `options.extension`
     *  string to the store constructor.
     */
    async write (path, source) {
        const fullPath = this._filePath(path);

        const parentPath = pathlib.join(fullPath, "..", '/');
        if (!fs.existsSync(parentPath)) {
            mkdirp.sync(parentPath);
        }

        await fsp.writeFile(fullPath, source, {encoding:'utf8'});
    }


    /**
     *  async fileStore.delete: String path -> undefined
     *  ------------------------------------------------------------------------
     *  Moves a `.olo` file to the trash bin, given its path relative to the store
     *  root path.
     *
     *  ```js
     *  await fileStore.delete("/path/to/doc");
     *  ```
     *
     *  - If path is `/path/to/doc`, the file `<rootPath>/path/to/doc.olo` will be trashed
     *  - If path is `/path/to/dir/`, the file `<rootPath>/path/to/dir/.olo` will be trashed
     *  - When the file that doesn't exist, it will return silently
     *
     *  The `.olo` default extension can be changed by passing a `options.extension`
     *  string to the store constructor.
     */
    async delete (path) {
        const fullPath = this._filePath(path);

        if (!fs.existsSync(fullPath)) return;

        const trash = (await import('trash')).default;
        return await trash(fullPath);
    }



    // Returns the full file path
    _filePath (docPath) {
        return this.rootPath + this.normalizePath(`${docPath}${this.extension}`);
    }


    static get defaultExtension () {
        return ".olo";
    }
 }


module.exports = FileStore;



