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
  
environment.createDocument - function
--------------------------------------------------------------------
Creates a document object containing the document source and
methods to evaluate that source to a namespace.

```js
const doc = environment.createDocument(source, presets)
```

- `source` is the un-parsed content of the document
- `presets` is an object containing predefined name to be added to
  the context
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
const doc = await environment.readDocument(uri)
```

- `uri` is an URI that identifies the required document inside this
  environment.
- `doc` is the document object returned by the `createDocument`
  method.

The documents loaded with this method and the documents created by 
the `createDocument` method differ in that their context contains a 
`import` method, which is able to load the namespace of other 
documents.
  
environment.updateDocument - async function
--------------------------------------------------------------------
Changes the content of the document mapped to the given uri in this
environment.
```js
await environment.updateDocument(uri, source)
```

- `uri` is an URI that identifies the targt document inside this
  environment.
- `source` is the new value to be assigned to the document source
  
environment.deleteDocument - async function
--------------------------------------------------------------------
Erases the document mapped to the given uri in this environment.
```js
await environment.deleteDocument(uri)
```

- `uri` is an URI that identifies the targt document inside this
  environment.
  
environment.render - async function
--------------------------------------------------------------------
This is just a stortcut to the `document.render` function.
  

