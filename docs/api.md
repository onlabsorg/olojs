<!--<% __render__ = require 'markdown' %>-->
# olojs API
In NodeJS you can load `olojs` as follows:

```js
const olo = require('@onlabsorg/olojs');
```

In the browser, the `olo` namespace can be imported as global object

```html
<script src="/path-to-olojs/browser/olo.js"></script>
```

or it can be loaded in a [webpack](https://webpack.js.org/) project as follows:

```js
const olo = require('@onlabsorg/olojs/browser');
```

### [olo.document](./api/document.md)
The `document` namespace contains a low-level API for documents manipulation:
it allows to parse a document source, create a document context and evaluate
the parsed document in that context. The documents handled by this API do not
have the concept of store, therefore they cannot import other documents (no
import function).

### [olo.expression](https://github.com/onlabsorg/swan-js/blob/main/docs/api.md)
The `expression` module contains low-level functions to manipulate
[swan](https://github.com/onlabsorg/swan-js) expressions. 

### [olo.Store](./api/store.md)
The `Store` class is the base class from which all the other stores inherit.
When instantiated directly, it behaves as a read-only empty store.

### [olo.MemoryStore](./api/memory-store.md)
The `MemoryStore` is a store backed by an in-memory object.

### [olo.FileStore](./api/file-store.md) [NodeJS only]
The `FileStore` is a store backed by a file-system directory which treats all
the files with `.olo` extension as olojs documents.

### [olo.HTTPStore](./api/http-store.md)
The `HTTPStore` is a store backed by a remote store served over HTTP.

### [olo.BrowserStore](./api/browser-store.md) [browser only]
The `BrowserStore` is a store backed by the browser permanent storage ([IndexDB]
or [localStorage]).

### [olo.Router](./api/router.md)
A `Router` is a Store that bundles together multiple stores making them appear
as a single store.

### [olo.HTTPServer](./api/http-server.md) [NodeJS only]
The `HTTPServer` module contains functions for creating HTTP servers exposing
a RESTful interface to a `Store` object. 


[IndexDB]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
[localStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
