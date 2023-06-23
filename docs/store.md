<!--<% __render__ = require 'markdown' %>-->
# olojs stores
A store is an olojs document container. It implements the [Store] interface,
which can be summarized as follows:

* `store.read(path)` returns the source of the document mapped to the given
  path
* `store.loadDocument(path)` returns a document object after fetching its
  source using `store.read`
* `store.evaluateDocument(path, ...presets)` loads and evaluates a document
* `store.SubStore(path)` returns a sub-store, rooted in the given store path.

olojs comes with the following pre-defined stores:

* [MemoryStore](./api/memory-store.md) which holds documents stored in memory
* [FileStore](./api/file-store.md) which holds documents stored as files (NodeJS
  only)
* [HTTPStore](./api/http-store.md) which interfaces with a remote store served
  via HTTP (see also [HTTPServer])
* [Router](./api/router.md) which bounds together multiple stores while
  behaving like a single store
* [URIStore](./api/uri-store.md) which bounds together multiple stores, each
  mapped to a different URI scheme

More stores can be created by extending the [Store] class.

[Store]: ./api/store.md
[HTTPServer]: ./api/http-server.md
