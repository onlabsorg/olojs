# olojs

`olojs` is a distributed content management framework whose unit of content is
called an `olo-document`.

An olo-document is a template with [swan](./doc/swan) inline expressions: it 
renders to the text obtained by replacing the inline expressions with their
values.

At the same time it is also a namespace containing all the data exported by the
inline expressions. Those data can be imported and re-used by other olo-documents. 

The following example of olo-document may clarify the concept:

```
<% name = "Marcello" %>

This is a document about <% name %>. 

<% date_of_birth = "26-02/1977" %>
<% date_manager = import("http://an.olo-document.repo/tools/date-mnager") %>

He was born on <% date_of_birth %>, therefore he is <% date_manager.calculte_age(date_of_birth) %>
years old.

<% friends = import("./my-friends") %>

He has <% friends.count %> friends, but his best friend is <% friends.best %>.
```


## Getting started

Install olojs via npm:

```
npm install -g @onlabsorg/olojs
``` 

Once you have it installed, you can use it as a CLI to manage your olo-documents
or as a node module for full control.


The cli is not yet fully functional: at the moment you can only render a document
on your machine:

```
olojs render ~/path/to/olo/doc >> ~/path/to/rendered/doc.txt
```

As a module, you can parse and render templates passed as strings by you or
downloaded from a local or remote store. If you have r/w access to a store,
you can also modify and save the document content.

Let's start with the most simple case: rendering a template string.

```js
const template = "<% x=10 %>x + y = <% x+y %>";         // the document source
const render = olojs.document.parse(template);          // compile the template to a rendering function
const context = olojs.document.createContext({y:20});   // create the rendering context
const content = await render(context);                  // render the template in the given context

content.get('x');   // 10
String(content);    // "x + y = 30"
```

Documents can be retrieved from a Store. In that case they can import other
documents content from the same store. olojs comes with three predefined stores:
an in-memory store (MemoryStore), a file-system store (FSStore) and a remote
store accessible via HTTP (HTTPStoreClient and HTTPStoreServer). In the following
example we use a MemoryStore.

```js
// create an empty memory store
const MemoryStore = require("olojs/lib/stores/memory-store");
const store = new MemoryStore();    

// populate the memory store with some documents
await store.write("/path/to/doc1", "This is the content of document 1! <% name = 'DOC1' %>");
await store.write("/path/to/doc2", "This is the content of document 2! <% name = 'DOC2' %>");
await store.write("/path/to/doc3", "The document name of /path/to/doc1 is <% import('./doc1').name %>");

// load and render the document at /path/to/doc3
const doc3 = await store.load("/path/to/doc3");
const doc3_context = doc3.createContext();
const doc3_content = await doc3.render(doc3_context);
String(doc3_content);   // "The document name of /path/to/doc1 is DOC1"
```

A special type of store is the Hub. It allows to access the documents contained
in different stores from one virtual store. As a consequence, documents loaded
via a hub, can import documents from other stores.

```js
// create an empty hub
const Hub = require("olojs/lib/hub");
const hub = new Hub();

// map stores to URIs
hub.mount("http://remote-host/",  new HTTPStoreClient("http://store.host"));
hub.mount("file://local-folder/", new FSStore("~/my-local-store"));

// load documents from the mounted stores
const doc1 = await hub.load("http://remote-host/path/to/doc1");
const doc2 = await hub.load("file://local-folder/path/to/doc2");

// create a document that imports another document from its own store
await hub.write("file://local-folder/path/to/doc3", "<% import('./doc1') %> and do something with it");

// create a document that imports a document from another store
await hub.write("file://local-folder/path/to/doc4", "<% import('http://remote-host/path/to/doc1') %> and do something with it");
```

The main module `olojs` is actually a Hub instance, therefore after importing it,
you can start mounting stores and read/writing documents.


## Documentation

* [olo-document template](./doc/olo-document.md)
* [swan expression language](./doc/swan.md)
* [stores](./doc/store.md)
* [hub](./doc/hub.md)


## License

The olojs source code is licensed under the [MIT license](https://opensource.org/licenses/MIT)
