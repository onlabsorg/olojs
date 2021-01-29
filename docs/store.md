# olojs stores
A store is an object implementing the [Store] interface, which
can be summarized as follows:

* `store.read(path)` returns the source of the document mapped to the given
  path
* `store.list(path)` returns the list of the child items of the given path
* `store.write(path, source)` modifies the document source mapped to the
  given path
* `store.delete(path)` removes the document mapped to the given path
* `store.deleteAll(path)` removes all the document matching the given path
* `store.createContext(id)` creates a document context specific to a particular
  stored document
* `store.load(id)` reads, evaluates and renders a document

olojs comes with the following pre-defined stores:

* [MemoryStore](./api/memory-store.md) which holds document stored in memory
* [FileStore](./api/file-store.md) which holds document stored as files
* [HTTPStore](./api/http-store.md) which interfaces with a remote store served
  via HTTP (see also [HTTPServer])
* [Router](./api/router.md) which bounds together multiple stores while
  behaving like a single store

More stores can be created by extending the [Store] class.


[Store]: ./api/store.md
[HTTPServer]: ./api/http-server.md
