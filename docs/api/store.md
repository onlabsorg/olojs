Store
============================================================================
This is the base class to be used to create olojs document stores.
When instantiatete directly it behaves like a read-only empty store.
```js
// A read-only empty store
store = new Store();

// A store implementation
class ChildStore extends Store {
    async read (path) { ... }
    async list (path) { ... }
    async write (path, source) { ... }
    async delete (path) { ... }
}
```
  
async store.read: String path -> String source
------------------------------------------------------------------------
Returns the source of the document mapped in `store` to the given path.
```js
source = await store.read("/path/to/doc");
```
Every implmenentation of this method should behave according to the
following standard:
- It should return a string
- It should throw `Store.ReadPermissionDeniedError` if the store
  instance has no read permission on the given path.
 
When instantiated directly, the base store `read` method returns always
an empty string.
  
async store.list: String path -> Array items
------------------------------------------------------------------------
Returns the list of items contained in the given directory path.
```js
items = await store.list("/path/to/dir");
```
Every implmenentation of this method should behave according to the
following standard:
- It should return the Array of names of all the documents and 
  diretory contained under the given path. Directory names should end
  with a forward slash, while document names should not.
- It should throw `Store.ReadPermissionDeniedError` if the store
  instance has no read permission on the given path.
 
When instantiated directly, the base store `list` method returns always
an empty array.
  
async store.write: (String path, String source) -> undefined
------------------------------------------------------------------------
Changes the source of the document at the given path.
```js
await store.write("/path/to/doc", "This is the new doc content.");
```
Every implmenentation of this method should behave according to the
following standard:
- After calling this method on `path`, `store.read(path)` should
  return the new source.
- It should throw `Store.WritePermissionDeniedError` if the store
  instance has no write permission on the given path.
- It should throw `Store.WriteOperationNotAllowedError` if the store
  is read-only.
   
When instantiated directly, the base store `write` method always throws
`Store.WriteOperationNotAllowedError`.
  
async store.delete: String path -> undefined
------------------------------------------------------------------------
Removes a document from the store.
```js
await store.delete("/path/to/doc");
```
Every implmenentation of this method should behave according to the
following standard:
- After calling this method on `path`, `store.read(path)` should
  return an empty string.
- It should throw `Store.WritePermissionDeniedError` if the store
  instance has no write permission on the given path.
- It should throw `Store.WriteOperationNotAllowedError` if the store
  is read-only.
 
When instantiated directly, the base store `delete` method always throws
`Store.WriteOperationNotAllowedError`.
  
store.createDocument: (String path, String source) -> Document doc
------------------------------------------------------------------------
Creates a Document object representing a document stored at the given
path and having the given source.

See below for the documentation of Document objects.
  
store.loadDocument: String path -> Document doc
------------------------------------------------------------------------
Creates a Document object representing a document stored at the given
path and source fetched via `read(path)`.

If a `.info` document is requested (e.g. document /path/to/.info), a 
document containing the following data is returned:
- `items`: list of all the siblings of the .info document, as returned
   by the store.list method, applied to the .info parent folder.

See below for the documentation of Document objects.
  
store.evaluateDocument: String path -> Object docns
------------------------------------------------------------------------
Loads and evaluates a Document, returning the document namespace.
  
store.subStore: String path -> Store subStore
------------------------------------------------------------------------
Returns a new store rooted in a directory of this store.

```
subStore = store.SubStore(rootPath)
```

where:

- `rootPath` is a directory path of this store
- `subStore.read` delegates to `store.read(rootPath+path)`
- `subStore.list` delegates to `store.list(rootPath+path)`
- `subStore.write` delegates to `store.write(rootPath+path, source)`
- `subStore.delete` delegates to `store.delete(rootPath+path)`
- `subStore.SubStore` delegates to `store.SubStore(rootPath+path)`
  
Document object
------------------------------------------------------------------------
The document object represents a document stored at a given path of a 
store and having a given source. A document object can be created using
either the `createDocument` or the `loadDocument` methods of a store
object.
  
### doc.store: Store
Points to the store containing the document.
  
### doc.path: String
The path of this document in the store.
  
### doc.source: String
The source of this document.
  
### doc.evaluate: Object context -> Object namespace
This is the source compiled to a function as returned by 
[document.parse](document.md).
  
### doc.createContext: (...Objects preset) -> Object context
Created a valid evaluation context that can be passed to the 
`doc.evaluate` function to evaluate this document. The returned context
contains the following special names:

- `context.__path__`: the path of this document
- `context.__dirpath__`: the path of this document parent directory
- `context.import`: a function that loads and evaluates a document and
  returns its namespace; if a relative path is passed as argument to
  this function, it will be resolved as relative to this document path
- All the name contained in the passed preset objects
  
Store.ReadPermissionDeniedError - class
----------------------------------------------------------------------------
Error thrown when attempting a read operation for which the store instance
has no read access.
```js
throw new Store.ReadPermissionDeniedError('/path/to/doc');
```
  
Store.WritePermissionDeniedError - class
----------------------------------------------------------------------------
Error thrown when attempting a write operation for which the store instance
has no write access.
```js
throw new Store.WritePermissionDeniedError('/path/to/doc');
```
  
Store.ReadOperationNotAllowedError - class
----------------------------------------------------------------------------
Error thrown when the read operation is not defined on the store.
```js
throw new Store.ReadOperationNotAllowedError('/path/to/doc');
```
  
Store.WriteOperationNotAllowedError - class
----------------------------------------------------------------------------
Error thrown when the write operation is not defined on the store.
```js
throw new Store.WriteOperationNotAllowedError('/path/to/doc');
```
  

