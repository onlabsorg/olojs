# olojs Store

A store is a repository for [olo-documents](./olo-document.md). It is modelled
as an object with the following interface:

* **async store.read(path)**: returns the document template stored at the given 
  path, or an empty string if the document doesn't exist.
* **async store.write(path, source)**: updates the document template stored at 
  the given path. Setting the source to "" means deleting the document.
* **async load(path)**: is an advanced version of `read` that instead of
  returning just the document source, returns the following document object
  * **document.source**: setter/getter for the document source
  * **document.id**: object representation of the document path (id.path is a
    string containing the path, id.resolve(subPath) resolves relative paths,
    String(id) returns id.path)
  * **document.createContext(globals)**: creates a document context, adding the
    `import` function and an `id` namespace to it.
  * **async document.render(context)**: renders the document template to a
    Content object
  * **async document.save()**: shortcut for `store.write(document.id, document.source)`


## MemoryStore

The memory store is a predefined store that lives in memory.

```js
const MemoryStore = require("olojs/lib/stores/memory-store");
const store = new MemoryStore();
```


## FSStore

The fs store is a predefined store that lives in the file-system.

```js
const FSStore = require("olojs/lib/stores/fs-store");
const rootPath = "~/my-olojs-store";
const store = new FSStore(rootPath);
```


## HTTPStore

The HTTP store is an interface for remote store, accessible via HTTP.

On the server side:

```js
const HTTPStoreServer = require("olojs/lib/stores/http-store-server");
const backend = new FSStore(rootPath);      // or any other type of store
const authroizationFunction = req => true;  // returns true/false to authorize/reject the request
const store = new HTTPStoreServer(backend, authorizationFunction);

// then, in your express application
app.use("/store", store);
```

On the client side:

```js
const HTTPStoreClient = require("olojs/lib/stores/http-store-server");
const auth = ""; // this is the HTTP Authorization header to pass with each request
const store = new HTTPStoreClient(hostURL, {auth});
```


## Custom stores

Creating custom stores is relatively simple:

```js
const Store = require("olojs/lib/store");

class MyStore extends Store {
    
    constructor (...args) {
        super();
        // initialize your store
    }
    
    async read (path) {
        // return the document source or "" if it doesn't exist
    }

    async write (path, source) {
        // update the document source 
        // remember that source=="" means delete
    }
}
```
