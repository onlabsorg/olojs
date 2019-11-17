# olojs.Hub module
The `olojs.hub` module implements an interface for reading and writing
`olo` documents from several different stores.
- License: MIT
- Author: Marcello Del Buono <m.delbuono@onlabs.org>
  
## hub.Hub - class
  
### hub.Hub.constructor(scope)
The newly created hub contains a `.store` `Map` instance that shoul be
populated with stores:
```
hub = new Hub(Context)
hub.store.set("http://my-store", myStore)
```
A store is any object exposing the following methods:
- `store.read(path)`: async function that given a document path returns
  its source or throws an error
- `store.write(path, source)`: async function that given a document path 
  and a document source, updates the stored document or throws an error
- `store.delete(path)`: async function that given a document path 
  removes the corresponding document from the store
The `scope` parameter will be passed as scope to all the documents retrieved
from this hub. This ensures that each hub document can reference and use
the content of another document of the same hub.
  
### hub.Hub.prototype.read(url) - method

Given a url, identifies the store corresponding to the url host, retrieves
the document source at the url path and returns a `Hub.Document` instance
from it.
It throws an error if no mounted store matches the url host.
  
### hub.Hub.prototype.write(url, doc) - method

Given a url and a `Hub.DOcument` instance, identifies the store corresponding 
to the url host, and writes the document source to that store at the
url path.
It throws an error if no mounted store matches the url host.
  
### hub.Hub.prototype.delete(url) - method
Given a url, identifies the store corresponding to the url host, and
removes the document stored at the url path.
It throws an error if no mounted store matches the url host.
  
## Hub.Document - class
This is the class of objects returned by `Hub.prototype.read`; it extends 
the `dom.Document` class by:
- Including a reference (doc.hub) to the `Hub` instance that generated it
- Including a reference (doc.url) to its url object
The document scope is obtained by extending the `hub.scope` with a
document-specific `import` function that allows node expressions to load 
and use the content of exteral document, identified by an URL relative to 
this document's URL.
  
## Hub.UnknownStoreError - class
Error raised by `hub.Hub` when trying to access a document from a
store that has not been mounted to the `hub.Hub` instance.
  
