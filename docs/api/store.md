Store
============================================================================
This is the base class to be used to create olojs document stores.
When instantiatete directly it behaves like a read-only empty store.
```js
store = new Store();    // a read-only empty store
// A store implementation
class ChildStore extends Store {
    async read (path) { ... }
    async list (path) { ... }
    async write (path, source) { ... }
    async delete (path) { ... }
```
  
store.read - async method
------------------------------------------------------------------------
Returns the source of the document mapped in this store to the given
path.
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
  
store.list - async method
------------------------------------------------------------------------
Returns the names of the items contained under the given path.
```js
items = await store.list("/path/to");
```
Every implmenentation of this method should behave according to the
following standard:
- It should returns an array of strings, each containing the name of a
  child item (a document or a container) of the given path; container
  names differ from document names in that they end with a `/`.
- It should throw `Store.ReadPermissionDeniedError` if the store
  instance has no read permission on the given path.
- It should throw `Store.ReadOperationNotAllowedError` if the store
  doesn't implement listing.
For example, if `store` contains the following documents:
- /path/to/doc1
- /path/to/doc2
- /path/to/dir/doc3
then then `srotes.list('/path/to')` resolves `['doc1', 'doc2', 'dir/']`.
When instantiated directly, the base store `list` method returns always
an empty array.
  
store.write - async method
------------------------------------------------------------------------
Changes the source of the document at the given path.
```js
await store.write("/path/to/doc", "This is the doc content.");
```
Every implmenentation of this method should behave according to the
following standard:
- After calling this method on `path`, then `store.read(path)` should
  return the new source.
- It should throw `Store.WritePermissionDeniedError` if the store
  instance has no write permission on the given path.
- It should throw `Store.WriteOperationNotAllowedError` if the store
  is read-only.
When instantiated directly, the base store `write` method always throws
`Store.WriteOperationNotAllowedError`.
  
store.delete - async method
------------------------------------------------------------------------
Removes a document from the store.
```js
await store.delete("/path/to/doc");
```
Every implmenentation of this method should behave according to the
following standard:
- After calling this method on `path`, then `store.read(path)` should
  return an empty string and `store.list` should not return the name
  of the removed document.
- It should throw `Store.WritePermissionDeniedError` if the store
  instance has no write permission on the given path.
- It should throw `Store.WriteOperationNotAllowedError` if the store
  is read-only.
When instantiated directly, the base store `delete` method always throws
`Store.WriteOperationNotAllowedError`.
  
store.deleteAll - async methods
Removes all the document whose path starts with a given path.
```
await store.deleteAll("/path/to/");
```
Every implmenentation of this method should behave according to the
following standard:
- After calling this method on `/path/to`, then `store.read("/path/to/any/doc")`
  should return an empty string and `store.list` should not return the name
  of any of the removed documents.
- It should throw `Store.WritePermissionDeniedError` if the store
  instance has no write permission on the given path.
- It should throw `Store.WriteOperationNotAllowedError` if the store
  is read-only.
When instantiated directly, the base store `deleteAll` method always throws
`Store.WriteOperationNotAllowedError`.
  
store.createContext - method
------------------------------------------------------------------------
Create a document context specific to a given store document.
```js
context = store.createContext(docId);
```
- `docId` is a combination of a path and a query string (e.g.
  `/path/to/doc?x=10;y=20;z=30`)
- `context` is a valid document context
- `context.__path__` contains the path portion of `docId`
- `context.argns` contains the namespace passed as query string with
  `docId`. For example, if `docId = /path/to/doc?x=10;y=20;z=30`, then
  the argns object will be `{x:10, y:20, z:30}`.
- `context.import` is a function that returns a store document namespace
  given its id. If the path portion of the id is a relative path, it
  will be resolved agains `context.__path__`.
This method is not meant to be overridden.
  
store.load - async method
------------------------------------------------------------------------
Reads, evaluates and renders the document identified by the passed id.
```js
{source, context, namespace, text} = await store.load(docId);
```
- `docId` is a combination of a path and a query string (e.g.
  `/path/to/doc?x=10;y=20;z=30`)
- `source` is the document source returned by `store.read`
- `context` is the document context returned by `store.createContext`
- `namespace` is the document namespace evaluated in `context`
- `text` is the document rendered context
This method is not meant to be overridden.
  
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
Error thrown when a read operation is not defined on the store.
```js
throw new Store.ReadOperationNotAllowedError('/path/to/doc');
```
  
Store.WriteOperationNotAllowedError - class
----------------------------------------------------------------------------
Error thrown when a write operation is not defined on the store.
```js
throw new Store.WriteOperationNotAllowedError('/path/to/doc');
```
  

