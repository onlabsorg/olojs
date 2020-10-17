olojs.Environment
============================================================================
Creates a new olojs environment, which represents a colection of
interdependent documents.


```js
const environment = olojs.Environment({globals, store})
```

- `globals` is on object containing a set of names that will be included in
  every document contexts; it defaults to {}
- `store` is an olojs store object that will provide read/write access to
  the documents repository; it defaults to olojs.stores.Memory.
  
environment.createDocument - function
--------------------------------------------------------------------
Creates a document object containing the document source and
methods to evaluate that source to a namespace.

```js
const doc = environment.createDocument(id, source)
```

- `id` is a path uri identifying the document in this environment; it
  can contain a path, an optional query and an optional frarment.
- `source` is the un-parsed content of the document
- `presets` is an object containing predefined name to be added to
  the documen context
- `doc.id` contains the document id with the path segment in normalized form
- `doc.source` contain the un-parsed content of the document
- `doc.createContext` is a function that takes a list of namespaces
  as input and returns a context that contains a) the environment
  global namespace, b) the passed namespaces and c) the presets
- `evaluate` is an asynchronous function that takes a context as
  input and returns the document namespace computed in that context
  
environment.readDocument - async function
--------------------------------------------------------------------
Returns the document mapped to a given id in this environment.

```js
const doc = await environment.readDocument(id)
```

- `id` is an URI that identifies the required document inside this
  environment; it can contain a path, an optional query and an optional 
  frarment.
- `doc` is the document object returned by the `createDocument`
  method.
  
environment.writeDocument - async function
--------------------------------------------------------------------
Changes the content of the document mapped to the given id in this
environment.
```js
await environment.writeDocument(id, source)
```

- `id` is an URI that identifies the required document inside this
  environment; it can contain a path, an optional query and an optional 
  frarment.
- `source` is the new value to be assigned to the document source
  
environment.deleteDocument - async function
--------------------------------------------------------------------
Erases the document mapped to the given uri in this environment.
```js
await environment.deleteDocument(id)
```

- `id` is an URI that identifies the required document inside this
  environment; it can contain a path, an optional query and an optional 
  frarment.
  
environment.render - async function
--------------------------------------------------------------------
This is just a stortcut to the `document.render` function.
  

