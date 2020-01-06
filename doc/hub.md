# olojs Hub

A Hub is a special type of Store. It allows access several stores from the same
interface: it identifies documents with URI, selects the proper store from the
URI root and delegates operations to it.

```js
const Hub = require("olojs/lib/hub");
const hub = new Hub();

hub.mount("scheme:/store1-host-name", store1);
hub.mount("scheme:/store2-host-name", store2);
```

In the previous example, calling `hub.read("scheme:/store1-host-name/path/to/doc")`
will result in calling `store1.read("/path/to/doc")`. Same goes for the `read`
and `load` methods.

One little, but important, difference about the `load` method is that it
returns a slightly improved version of the document object:

* document.id contains an URI object instead of a Path object
* context.id contains an URI namespace instead of a Path namespace
* context.import allows to load documents by absolute URIs and not only by 
  relative paths
