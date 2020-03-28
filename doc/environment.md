# Envionment class
This class defines:
- a way to retrieve and modify documents from document stores
- a common evaluation context for all the loaded documents
  
### new Environment(config)
The config object should contain the followin properties:
- `config.paths`: an object mapping paths to path handlers
- `config.globals`: an object with all the properties and functions that will be added to the document contexts
Any other property of the config object is optional and, if present,
it will be added as it is to the environment instance.
##### config.paths
The `paths` property of the config object should map paths to path handlers:
```js
config.paths = {
    "/root/path1": pathHandler1,
    "/root_path2": pathHandler2,
    "/rp3": pathHandler3,
    ...
}
```
The `pathHandler` can be any object with one or more of the following methods:
- `read`: method (synchronous or asynchronous) that maps a sub-path to an 
  olo-document source text. 
- `write`: function that takes a sub-path and a source as arguments and
  modifies the document source mapped to the give path
- `delete`: function that takes a sub-path as argument and deletes the
  document mapped to the given path
- `load`: function that takes a path and an optional arguments namespace
  as input and returns the object mapped to the given path
Reading, updating, deleting document and loading data operations will be 
delegated to the proper pathHandler function by the environment instance. 
This makes an environment a stores hub that can be configured to 
retrieve and modify documents and data stored in virtually any source.
  
### Environment.prototype.readDocument(path)
This function takes a path, finds the first pathHandler matching the
path and returns `pathHandler.read(subPath)`.
Say you created an evironment `env` based on the followin config object ...
```js
config.paths = {
    "/root/path1": pathHandler1,
    "/root_path2": pathHandler2,
    "/rp3": pathHandler3,
    ...
}
```
... then
     * - `env.readDocument("/root/path1/path/to/docA")` will result in calling `pathHandler1.read("/path/to/docA")`
 and returning the returned string as document source
     * - `env.readDocument("/root_path2/path/to/docB")` will result in calling `pathHandler2.read("/path/to/docB")`
 and returning the returned string as document source
     * - `env.readDocument("/rp3/path/to/docC")` will result in calling `pathHandler3.read("/path/to/docC")`
  and returning the returned string as document source
     * ...
  
### Environment.prototype.writeDocument(path, source)
This function takes a path and an olo-document source, finds the first
pathHandler matching the path and calls `pathHandler.write(subPath, source)`.

If source is an empty string, it will instead call `env.delete(path)`.
  
### Environment.prototype.deleteDocument(path, source)
This function takes a path and an olo-document source, finds the first
pathHandler matching the path and calls `pathHandler.delete(subPath, source)`.
  
### Environment.prototype.load(path, argns={})
This function takes a path and an optional namespace, finds the first
pathHandler matching the path and returns `pathHandler.load(subPath, argns)`.
If the pathHandler doesn't contain a `load` method, this function
defaults to fetching a document source via `environment.read`,
evaluating it and returning its namespace.
  
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
  

