  

Store
============================================================================
The Store class is meant to be used as base class for creating custom
stores, but when instantiatete directly it behaves like a read-only empty
store.
  

```js
// A store implementation
class MyStore extends Store {
    async read (path) { ... }
    async write (path, source) { ... }
    async delete (path) { ... }
}
// A read-only empty store
store = new Store();
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
  

  

async store.write: (String path, String source) -> undefined
------------------------------------------------------------------------
Modifies the source of the document mapped in `store` to the given path.
  

```js
await store.write("/path/to/doc", source);
```
  

Every implmenentation of this method should behave according to the
following standard:
  

- It should modify the source mapped to the given path, so that a
  subsequent call to read on that path returns the new source.
- It should throw `Store.WritePermissionDeniedError` if the store
  instance has no write permission on the given path.
- It should throw `Store.WriteOperationNotAllowedError` if the store
  instance does not support the write operation.
  

  

When instantiated directly, the base store `write` method always throws
`Store.WriteOperationNotAllowedError`.
  

  

async store.delete: String path -> undefined
------------------------------------------------------------------------
Remove a document from the `store`.
  

```js
await store.delete("/path/to/doc");
```
  

Every implmenentation of this method should behave according to the
following standard:
  

- It should remove the document mapped to the given path, so that a
  subsequent call to read on that path returns an empty string.
- It should throw `Store.WritePermissionDeniedError` if the store
  instance has no write permission on the given path.
- It should throw `Store.WriteOperationNotAllowedError` if the store
  instance does not support the write operation.
  

When instantiated directly, the base store `delete` method always throws
`Store.WriteOperationNotAllowedError`.
  

  

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
  

  

Store.ReadPermissionDeniedError - class
----------------------------------------------------------------------------
Error thrown when attempting a read operation for which the store instance
has no read access.
  

  

Store.WritePermissionDeniedError - class
----------------------------------------------------------------------------
Error thrown when attempting a write operation for which the store instance
has no write access.
  

  

Store.ReadOperationNotAllowedError - class
----------------------------------------------------------------------------
Error thrown when the store doesn't implement a read operation.
  

  

Store.WriteOperationNotAllowedError - class
----------------------------------------------------------------------------
Error thrown when the store doesn't implement a write or delete operation.
  


