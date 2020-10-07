# envionment module
This module exports the `Environment` class. An Environment is a set of
olo-documents sharing a common global namespace and able to import each
other's content.


### environment = new Environment(options)
Create an Environment instance.

##### environment
An environment instance allows to:
* create a new document, 
* load a document from local and/or remote locations,
* render document namespaces.

##### options.globals
An object with all the properties and functions that will be added to 
each document context.

##### options.protocols
An object with all the protocols available to the `environment.loadDocument`
method.

Example:

```js
const env = olojs.Environment({
    protocols: {
        file: olojs.protocols.file
    }
});
const doc = env.loadDocument("file:/home/username/path/to/doc");
```

##### options.routes 
An object mapping protocol-less paths to locations. The protocols-less paths
will be seen as shortcuts by the `environment.loadDocument` method.

Example,

```js
const env = olojs.Environment({
    protocols: {
        file: olojs.protocols.file
    },
    routes: {
        '/': "file:/home/username/"
    }
});
const doc = env.loadDocument("/path/to/doc");   // equivalent to env.loadDocument("file:/home/username/path/to/doc")
```

### doc = environment.loadDocument(doc_URI)
Retrieves the document source mapped to the given path in the environment store.
If the `config.nocache` option is false or omitted, it will cache the
source, loading it only once.

##### doc_URI
The uri of the document to be retrieved.

##### doc.URI
The uri of the retrieved document.

##### doc.source
The document source mapped to the given uri

##### doc.createContext(...namespaces)
Create a document context containing:
- all the names in the environment `globals` parameter
- all the names in `namespaces[0]`, `namespaces[1]`, `...`
- the `import` function which, given a document path (relative to 
  `doc.URI`, returns the mapped document namespace
  
##### doc.evaluate(context)
Evaluates the document source in the given context.
  
### value_rendering = environment.render(value)
This just an alias for `document.render(value)`.
