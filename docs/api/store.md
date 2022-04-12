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
    async list (path) { ... }
    async write (path, source) { ... }
    async delete (path) { ... }
    async deleteAll (path) { ... }
}
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
  
store.create - method
------------------------------------------------------------------------
Creates a Store.Document object representing a document with a given 
id and a given source
```js
doc = await store.create("/path/to/doc?key1=val1;key2=val2;...", source);
```

The returned doc object contains the following properties ...

- `doc.id`: the passed document id
- `doc.path`: the normalized path portion of the document id (before '?')
- `doc.query`: an object containing the properties defined in the query
  string following the '?' in the document id
- `doc.source`: the source of the document

... and the following two functions:

### doc.parse
Compiles a document source into an `evaluate` function that takes as input
a document context object and returns the document namespace object and its
rendered text.
```js
evaluate = doc.parse();
{data, text} = await evaluate(context);
```
- `evaluate` is an asynchronous function that evaluates the document and
  returns its namespace and its rendered text
- `context` is a valid document context created either with
  `doc.createContext` or with `document.createContext`.
- `data` is an object containing all the names defined by the inline
  expressions of the document (the document namespace).
- `text` is a string obtained by replacing every inline expression with its 
  strigified value. 

### doc.createContext
Create a document context bound to this store.

```
context = doc.createContext(ns1, ns2, ...)
```

The `context` object is a document context that contains the following
properties:

- A `__path__` string equal to `doc.path`
- A `__dirpath__` string equal to the directory path of `doc.path`
- A `__query__` namespace equal to `doc.query`
- All the names contained in the passed namespaces
- An `import` function that given a document path, loads it from the
  current store, evaluates it and returns its namespace. The import
  parameter is a path that can optionally contain a `?query-string`, in 
  which case, the string will be parsed and its values added to the
  target document context under the `__query__` namespace.
  
store.load - async method
------------------------------------------------------------------------
Given a document id, reads a document source and creates the 
corresponding Store.Document object.

```js
doc = await store.load("/path/to/doc?key1=val1;key2=val2;...");
```     
  
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
  

