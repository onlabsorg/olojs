# olojs API
In NodeJS you can load `olojs` as follows:

```js
const olojs = require('@onlabsorg/olojs');
```

In the browser, the `olojs` namespace can be imported as global object

```html
<script src="/path-to-olojs/public/olo.js"></script>
```

or it can be loaded in a webpack project as follows:

```js
const olojs = require('@onlabsorg/olojs/browser');
```

### [olojs.document](./api/document.md)
The `document` namespace contains a low-level API for documents manipulation:
it allows to parse a document source, create a document context and evaluate
the parsed document in that context. The documents handled by this API do not
have the concept of store, therefore they cannot import other documents (no
import function).

### [olojs.expression](https://github.com/onlabsorg/swan-js/blob/main/docs/api.md)
The `expression` module contains low-level functions to manipulate
[swan](https://github.com/onlabsorg/swan-js) expressions. In addition to the
swan standard library, olojs adds the following modules:
- [markdown](./stdlib/markdown.md): functions to render markdown text to HTML

### [olojs.Store](./api/store.md)
The `Store` class is the base class from which all the other stores inherit.
When instantiated directly, it behaves as a read-only empty store.

### [olojs.MemoryStore](./api/memory-store.md)
The `MemoryStore` is a store backed by an in-memory object.

### [olojs.FileStore](./api/file-store.md) [NodeJS only]
The `FileStore` is a store backed by a file-system directory which treats all
the files with `.olo` extension as olojs documents.

### [olojs.HTTPStore](./api/http-store.md)
The `HTTPStore` is a store backed by a remote store served over HTTP.

### [olojs.Router](./api/router.md)
A `Router` is an object bundles together multiple stores while exposing the
`Store` interface itself.

### [olojs.HTTPServer](./api/http-server.md) [NodeJS only]
The `HTTPServer` module contains functions for creating HTTP servers exposing
a RESTful interface to a `Store` object.

### [olojs.createViewer](./api/create-viewer.md) [browser only]
In a browser environment, this function creates a widget that renders the
document mapped to the `src` attribute in a given store.
