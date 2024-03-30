<!--<% __render__ = require 'markdown' %>-->
# olojs stores
A store is an olojs document container. It implements the [Store] interface,
which can be summarized as follows:

* `store.read(path)` returns the source of the document mapped to the given
  path
* `store.write(path, source)` modifies the source of the document mapped to 
  the given path
* `store.delete(path)` removes the document mapped to the given path

olojs comes with the following pre-defined stores:

* [MemoryStore](./api/stores/memory-store.md) which holds documents stored in memory
* [FileStore](./api/stores/file-store.md) which holds documents stored as files (NodeJS only)
* [BrowserStore](./api/stores/browser-store.md) which holds documents stored in the browser storage (Browser only)
* [HTTPStore](./api/stores/http-store.md) which interfaces with a remote store served
  via HTTP (see also [HTTPServer])
* [Router](./api/stores/router.md) which bounds together multiple stores while
  behaving like a single store
* [HyperStore](./api/stores/hyper-store.md) which bounds together multiple stores, each
  mapped to a different URI scheme
* [SubStore](./api/stores/sub-store.md) which is to a store what a sub-directory is to
  a root directory

More stores can be created by extending the [Store] class.

[Store]: ./api/stores/store.md
[HTTPServer]: ./api/servers/http-server.md
