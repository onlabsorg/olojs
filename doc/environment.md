# Envionment class
This class defines:
- a way to retrieve and modify documents from document stores
- a common evaluation context for all the loaded documents
  
### new Environment(config)
The config object should contain the followin properties:
- `config.store`: a Store interface for reading, writing, appending and deleting documents
- `config.globals`: an object with all the properties and functions that will be added to the document contexts
Any other property of the config object is optional and, if present,
it will be added as it is to the environment instance.
##### config.store
The `store` property can be any object with one or more of the following methods:
- `read`: method (synchronous or asynchronous) that maps a path to an 
  olo-document source text. 
- `write`: function that takes a path and a source as arguments and
  modifies the document source mapped to the give path
- `delete`: function that takes a path as argument and deletes the
  document mapped to the given path
- `append`: function that takes a directory path and a source as argument 
  and adds a document to the directory with a timestamp as name
  
### Environment.prototype.readDocument(path)
This will delegate to `env.store.read(path)`.
  
### Environment.prototype.writeDocument(path, source)
This will delegate to `env.store.write(path, source)`.
  
### Environment.prototype.appendDocument(path, source)
This function takes a path and an olo-document source, finds the first
pathHandler matching the path and calls `pathHandler.append(subPath, source)`.
  
### Environment.prototype.deleteDocument(path, source)
This function takes a path and an olo-document source, finds the first
pathHandler matching the path and calls `pathHandler.delete(subPath, source)`.
  
### Environment.prototype.createContext(path, presets={})
This function takes a document path and an optional namespace and 
creates a namespace that can be used to evaluate a document source.
The environment context contains:
- All the names contained in `environment.globals` (from the config parameter)
- All the names contained in the `presets` object
- A `__path__` string, meant to represent the document path
- An `import` function that return `environment.load(fullPath)` after
  resolving the passed path as relative to `__path__`
  
### Environment.prototype.parseDocument(source) 
This just calls `document.parse`. 
  
### Environment.prototype.stringifyDocumentExpression(value)
This just calls `document.expression.stringify`.
  
### Environment.prototype.loadDocument(path, presets={})
This function reads and evaluates an olo-document, ther returns its
namespace.
  
### Environment.prototype.renderDocument(path, presets={})
This function reads and evaluates an olo-document, ther returns its
stringified namespace. 
  

