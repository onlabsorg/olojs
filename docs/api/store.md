<!--<% __render__ = require 'markdown' %>-->
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
    async write (path, source) { ... }
    async delete (path) { ... }
}
```
  
async store.read: String path -> String source
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
  
async store.write: (String path, String source) -> undefined
------------------------------------------------------------------------
Changes the source of the document at the given path.
```js
await store.write("/path/to/doc", "This is the doc content.");
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
  
store.parse: String source -> Function evalutate
------------------------------------------------------------------------
Compiles a document source into an `evaluate` function that takes as input
a document context object and returns the document namespace object and its
rendered text.
```js
evaluate = store.parse(source);
{data, text} = await evaluate(context);
```
- `evaluate` is an asynchronous function that evaluates the document and
  returns its namespace and its rendered text
- `context` is a valid document context created either with
  `store.createContext` or with `document.createContext`.
- `data` is an object containing all the names defined by the inline
  expressions of the document (the document namespace).
- `text` is a string obtained by replacing every inline expression with its
  strigified value.
  
store.createContext: (String path, ...Object namespace) -> Object context
------------------------------------------------------------------------
Create a document context bound to this store.

```
context = store.createContext(docPath, ns1, ns2, ...)
```

The `context` object is a document context that contains the following
properties:

- A `__path__` string equal to `docPath`
- A `__dirpath__` string equal to the directory path of `docPath`
- All the names contained in the passed namespaces
- An `import` function that given a document path, loads it from the
  current store, evaluates it and returns its namespace. The import
  document path is parsed as relative to `docPath`.
  
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
  

