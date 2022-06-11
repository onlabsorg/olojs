<!--<% __render__ = require 'markdown' %>-->
FileStore
============================================================================
This store handles read/write operations on the local file system.
```js
fileStore = new FileStore(rootPath, options)
```
- `rootPath` is the base path that will be prepended to the paths passed to
  the `read`, `write`, and `delete` methods.
- `options.extension`: defines the extension of the document files (defaults
  to `.olo`)
- `fileStore` is a [olo.Store](./store.md) object.

> FileStore inherits from the [Store](./store.md) class and overrides the
> methods described below.
  
async fileStore.read: String path -> String source
----------------------------------------------------------------------------
Retrieves a `.olo` file given its absolute path.
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
  
async fileStore.write: (String path, String source) -> undefined
----------------------------------------------------------------------------
Modifies the content of a `.olo` file given its absolute path.
```js
await fileStore.write("/path/to/doc", source);
```
- If path is `/path/to/doc`, the content of `<rootPath>/path/to/doc.olo`
  will be modified with the passed source
- If path is `/path/to/dir/`, the content of `<rootPath>/path/to/dir/.olo`
  will be modified with the passed source
- When the file that doesn't exist, it will be created
 
The `.olo` default extension can be changed by passing a `options.extension`
string to the store constructor.
  
async fileStore.delete: String path -> undefined
------------------------------------------------------------------------
Moves a `.olo` file to the trash bin, given its absolute path.
```js
await fileStore.delete("/path/to/doc");
```
- If path is `/path/to/doc`, the file `<rootPath>/path/to/doc.olo` will
  be deleted
- If path is `/path/to/dir/`, the file `<rootPath>/path/to/dir/.olo`
  will be deleted
- When the file doesn't exist, the method will return silently
 
The `.olo` default extension can be changed by passing a `options.extension`
string to the store constructor.
  

