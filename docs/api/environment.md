olojs.Environment
============================================================================
Creates a new olojs environment, which represents a colection of
interdependent documents.


```js
const environment = olojs.Environment({globals, protocols, routes})
```

- `globals` is on object containing a set of names that will be included in
  every document contexts
- `protocols` is an object mapping scheme strings to {get, set, delete}
  objects called protocol handlers. In this environment, an uri like
  `ppp:/path/to/doc` refers to a document that cna be retrieved via
  `protocols.ppp.get('/path/to/doc')` and modified via `protocols.ppp.ser`
  and `protocols.ppp.delete`. 
- `routes` is an object mapping paths to URIs, so that the path can be used
  as shortcut for the full URI. For example, the mapping `"/a/b": "ppp:/path/to/dir"`
  makes the uri `/a/b/x/doc` equivalent to `ppp:/path/to/dir/x/doc`.

Upon creation of the environment, the `globals` namespace will be augumented
with a `globals.import` function that can be used by document expressions to 
load and evaluate other documents of this environment.
  
environment.createDocument - function
--------------------------------------------------------------------
Creates a document object containing the document source and
methods to evaluate that source to a namespace.

```js
const doc = environment.createDocument(id, source)
```

- `id` is an uri identifying the document in this environment
- `source` is the un-parsed content of the document
- `presets` is an object containing predefined name to be added to
  the context
- `doc.id` contains the document id in normalized form
- `doc.source` contain the un-parsed content of the document
- `doc.createContext` is a function that takes a list of namespaces
  as input and returns a context that contains a) the environment
  global namespace, b) the passed namespaces and c) the presets
- `evaluate` is an asynchronous function that takes a context as
  input and returns the document namespace computed in that context
  
environment.readDocument - async function
--------------------------------------------------------------------
Returns the document mapped to a given uri in this environment.

```js
const doc = await environment.readDocument(id)
```

- `id` is an URI that identifies the required document inside this
  environment.
- `doc` is the document object returned by the `createDocument`
  method.
  
environment.writeDocument - async function
--------------------------------------------------------------------
Changes the content of the document mapped to the given uri in this
environment.
```js
await environment.writeDocument(id, source)
```

- `id` is an URI that identifies the targt document inside this
  environment.
- `source` is the new value to be assigned to the document source
  
environment.deleteDocument - async function
--------------------------------------------------------------------
Erases the document mapped to the given uri in this environment.
```js
await environment.deleteDocument(id)
```

- `id` is an URI that identifies the targt document inside this
  environment.
  
environment.render - async function
--------------------------------------------------------------------
This is just a stortcut to the `document.render` function.
  

