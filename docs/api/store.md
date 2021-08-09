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
    async deleteAll (path) { ... }
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
  
store.deleteAll - async method
------------------------------------------------------------------------
Removes all the documents whose path starts with a given path.
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
  

