# envionment module
This module exports the `Environment` class. An Environment is a set of
olo-documents sharing a common global namespace and able to import each
other's content.

  
### environment = new Environment(store, globals)
Create an Environment instance.

###### environment
An environment instance allows to read, write and delete documents from
a store and provides them with a common global namespace and with the
ability to import each other's content.

###### config.store
Any object exposing the following API:
- a `store.read` method (synchronous or asynchronous) that maps a path 
  to an olo-document source text. 
- a `store.write` method that takes a path and a source as arguments and
  modifies the document source mapped to the give path
- a `store.delete` method that takes a path as argument and deletes the
  document mapped to the given path
  
###### config.globals
An object with all the properties and functions that will be added to 
the document contexts.

###### config.nocache
If true, the documents will not be cached. False by default.
  

### doc_source = environment.readDocument(doc_path)
Retrieves the document source mapped to the given path in the environment store.
If the `config.nocache` option is false or omitted, it will cache the
source, loading it only once.

###### doc_path
The store path of the document to be retrieved.

###### doc_source
The document source mapped to the given path

  
### environment.writeDocument(doc_path, doc_source)
Modifies the document source mapped to the given path.

###### doc_path
The path of the document to be modified.

###### doc_source
The new source of the document.

  
### environment.deleteDocument(doc_path)
Removes a document from the environment store.

###### doc_path
The path of the document to be removed.

  
### context = environment.createContext(doc_path, ...namespaces)
Creates the evaluation context for a specific document. 

###### doc_path
The path of the document the context applies to.

###### namespace
A list of object whose key:value pairs will be added to the context.

###### context
Evaluation context for the document mapped to `doc_path`, containing:
- all the names in `config.globals`
- all the names in `namespace[0]`, `namespace[1]`, `...`
- the `__path__` string, equal to `doc_path` 
- the `import` function which, given a document path (relative to 
  `__path___`, returns the mapped document namespace

  
### evaluate_doc = environment.parseDocument(source) 
This is just an alias for `document.parse(source)`. 

  
### value_rendering = environment.render(value)
This just an alias for `document.render(value)`.

  
### doc_namespace = environment.loadDocument(path, ...namespaces)
This function is a shortcut for the followin sequence of operations:
- Retrieve the document source mapped to `path`
- Parse the retrieved document
- Create a document context using the given `namespaces`
- Evaluate the document in the given context and return the resulting namespace

  
### doc_rendering = environment.renderDocument(doc_path, ...namespace)
This function is a shortcut for the followin sequence of operations:
- Retrieve the document source mapped to `path`
- Parse the retrieved document
- Create a document context using the given `namespaces`
- Evaluate the document in the given context
- Render the evaluated namespace and return the result
