# Envionment class
The environment class makes it easy to create and environment object.
An environment object, like the one required by the `document.load`
function, doesn't need to be an `Environment` instance though.
  
### new Environment(config)
The config object should contain the followin properties:
- `config.stores`: an object having paths for keys and loader function or stores for values
- `config.globals`: an object with all the properties and functions that will be added to the document contexts
Any other property of the config object is optional and, if present,
it will be added as it is to the environment instance.
##### config.stores
The `store` property of the config object should map paths to stores:
```js
config.stores = {
    "/root/path1": store1,
    "/root_path2": store2,
    "/rp3": store3,
    ...
}
```
The `store` can be any object with a `read` method (synchronous or asynchronous) 
that maps a path to an olo-document source text. If `store` is a function instead,
that function will be used as `read` method. Optionally, the store can also
contain a `write` and a `delete` method.
Reading, updating and deleteing document operations will be delegated
to the proper store by the environment instance. 
This way, an environment is like a stores hub that can be configured to 
retrieve and modify documents stored in virtually any source.
  
### Environment.prototype.readDocument(path)
This function takes a path, finds the first store matching the
path and returns `store.read(subPaht)`.
Say you created an evironment `env` based on the followin config object ...
```js
config.stores = {
    "/root/path1": store1,
    "/root_path2": store2,
    "/rp3": store3,
    ...
}
```
... then
     * - `env.readDocument("/root/path1/path/to/docA")` will result in calling `store1.read("/path/to/docA")`
 and using the returned string as document source
     * - `env.readDocument("/root_path2/path/to/docB")` will result in calling `store2.read("/path/to/docB")`
 and using the returned string as document source
     * - `env.readDocument("/rp3/path/to/docC")` will result in calling `store3.read("/path/to/docC")`
  and using the returned string as document source
     * ...
  
### Environment.prototype.writeDocument(path, source)
This function takes a path and an olo-document source, finds the first
store matching the path and calls `store.write(subPath, source)`;
  
### Environment.prototype.deleteDocument(path, source)
This function takes a path and an olo-document source, finds the first
store matching the path and calls `store.delete(subPath, source)`.
  
### Environment.prototype.createDocument(path, source)
Create a document object bound to this environment.
  
### Environment.prototype.createDocument(path, source)
Similar to `readDocument`, but it returns a document object bound to
this environment.
  
### Environment.prototype.renderNamespace(namespace)
Shortcut for `document.render`
  

