Loader - function constructor
============================================================================
Creates a function that loads a document object.
```
loadDocument = Loader(stores)
doc = await loadDocument(id)
```

The `stores` object containins all the stores accessible by the loader
in the form of `name:store` pairs.
The `id` string is a document identifier of the type 
`sname:/path/to/doc?query, where 
- `sname` is the name of the store that contains the target document,
- `/path/to/doc` is the path of the target document 
- `query` is a list of `key=value` pairs (separated by `;` and/or `&`), 
  defining the evaluation input arguments.
The `doc` object contains the following properties:
- `doc.id` is a sub-string of the document identifiers containing only
  the store name and the path (no query string)
- `doc.source` is a string containing the document source returned by the
  store.get method
- `doc.evaluate` is an asynchronous function that takes a context as input 
  and returns its namespace after source evaluation
- `doc.context` is a function that creates a valid evaluation context,
  given a list of namespaces
- `doc.context.__id__` exposes `doc.id` to the document 
- `doc.import` is a function that, given another document id, returns
  its evaluated namespace. The target document id can be absolute or
  relative to `doc.id`
  

