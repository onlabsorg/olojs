store module
============================================================================
This module defines an olodocs store, which is any container that maps
paths to olo-documents.
`Store` is the base class to be used to create olojs document stores; when
instantiatete directly it generates a read-only empty store.
```js
// A store implementation
class MyStore extends Store {
    async read (path) { ... }
}
// A read-only empty store
store = new Store();
```
  

  

store = Store()
--------------------------------------------------------------------------
The Store class is meant to be used as base class for creating custom
stores, but when instantiatete directly it behaves like a read-only empty
store.
  

  

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
  

  

store.normalizePath: String -> String
------------------------------------------------------------------------
This method takes a path string as argument and returns its normalized
version, by resolving '.', '..' and '//' and by adding a leading '/'.
  

  

store.resolvePath: (String basePath, String subPath) -> String absPath
------------------------------------------------------------------------
This method takes a base-path string and a sub-path string as arguments
and returns a normalized absolute path string, obtained considering
the sub-path as relative to the base-path.
If sub-path is an absolute path (starting by '/'), it returns the
normalized version of sub-path instead.
  

store.loadDocument: String path -> Document doc
------------------------------------------------------------------------
Creates a document object representing a document stored at the given
path and containing the following properties.
### doc.path: String
The normalize path of the document.
### doc.source: String
The source of the document.
### doc.evaluate: Object context -> Object namespace
This is the source compiled to a function as returned by
[document.parse](document.md).
### doc.createContext: (...Objects preset) -> Object context
Created a valid evaluation context that can be passed to the
`doc.evaluate` function to evaluate this document. The returned context
contains the following special names:
- `context.__doc__`: a refernce to this document
- `context.__store__`: a reference to this document store
- `context.import`: a function that loads and evaluates a document and
  returns its namespace; if a relative path is passed as argument to
  this function, it will be resolved as relative to this document path
- All the name contained in the passed preset objects
  

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
  

Store.ReadPermissionDeniedError - class
----------------------------------------------------------------------------
Error thrown when attempting a read operation for which the store instance
has no read access.
```js
throw new Store.ReadPermissionDeniedError('/path/to/doc');
```
  

Store.ReadOperationNotAllowedError - class
----------------------------------------------------------------------------
Error thrown when the read operation is not defined on the store.
```js
throw new Store.ReadOperationNotAllowedError('/path/to/doc');
```
  


