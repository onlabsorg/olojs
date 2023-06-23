FileStore
============================================================================
This store handles read/write operations on the local file system.
```js
fileStore = new FileStore(rootPath, options)
```
- `rootPath` is the base path that will be prepended to the paths passed to
  the `read` method.
- `options.extension`: defines the extension of the document files (defaults
  to `.olo`)
- `fileStore` is a [olo.Store](./store.md) object.

> FileStore inherits from the [Store](./store.md) class and overrides the
> methods described below.
  

async fileStore.read: String path -> String source
----------------------------------------------------------------------------
Retrieves a `.olo` file given its path relative to the store root path.
```js
const source = await fileStore.read("/path/to/doc");
```
- When requesting `/path/to/doc`, the content of `<rootPath>/path/to/doc.olo`
  will be returned
- When requesting `/path/to/dir/`, the content of `<rootPath>/path/to/dir/.olo`
  will be returned
- When requesting a file that doesn't exist, and empty string will be returned

The `.olo` default extension can be changed by passing a `options.extension`
string to the store constructor.
  


