# olojs

`olojs` is a JavaScript library for managing olo-docs, which are text documents
characterized as follows:

* Documents are templates containing inline [swan] expressions enclosed between
  `<%` and `%>`.
* Each document holds both data (the variables defined by the inline
  expressions) and narrative content (the text obtained by replacing each inline
  expression with its value)
* Documents are contained in stores and identified by a path within their store.
  A store can be any repository (local, remote or a combination of both)
  implementing the [Store] interface.
* Each document can import and use the narrative content and data held by
  any other documents of the same store.

### Example

Let's assume that a store contains the following document at `/people/mary`:

```
<% name: "Mary" %> is <% age: 35 %> years old.
```

Once evaluated, this document renders to `Mary is 35 years old` and returns
the namespace `{name: "Mary", age: 35}`.

Let's now assume that the same store contains also the following document,
mapped to the path `/people/bob`:

```
<% wife = import "./mary" %>
<% name: "Bob" %> is <% age: 40 %> years old and he is married to <% wife.name %>,
who is <% wife.age %> years old. Therefore <% name %> is <% age - wife.age %>
years older than <% wife.name %>.
```

Notice that `/people/bob` imports `/people/mary` and uses its content. Once
evaluated it renders to:

```
Bob is 40 years old and he is married to Mary, who is 35 years old.
Therefore Bob is 5 years older than Mary.
```

The `/people/bob` document returns the following namespace:

```js
{
    name: "Bob",
    age: 40,
    wife: {
        name: "Mary",
        age: 35
    }
}
```

> The above example gives an idea of how documents work, but to really appreciate
> this library, you need to consider a) that [swan] is a powerful expression
> language which, for example, can define functions and therefore parametric
> chunks of text and b) that stores can be shared over the internet generating a
> distributed network of documents.


### Getting started

Install olojs via npm

```sh
npm install @onlabsorg/olojs --save
```

Import olojs and connect to a store:

```js
olo = require('@onlabsorg/olojs');
store = new olo.FileStore('/home/my-olodocs-store');
Document = olo.document.Document;
```

> In this example a file-system-based store is used, but a store can be any
> object implementing the [Store] interface. olojs comes with a number of
> predefined stores, namely [MemoryStore], [FileStore], [HTTPStore], a 
> multi-store [Router] and a URI-based [URIStore]. 

Load, evaluate and render a [document]:

```js
doc = await olo.document.load(store, '/path/to/doc'); // fetch the document
context = doc.createContext({pi:3.14});               // create an evaluation context
docns = await doc.evaluate(context);                  // evaluate the document
```

Serve the store via HTTP:

```js
server = olo.HTTPServer.create(store);
server.listen(8010);
```

Interface to your store via HTTP:

```js
remoteStore = new olo.HTTPStore('http://localhost:8010');
doc = await remoteStore.loadDocument('/path/to/doc');
```

> olojs works also in the browser, although it has been tested only on Chrome 
> and Brave. In order to use the olojs library in the browser, you should require
> the module `@onlabsorg/olojs/browser`. The only difference between the NodeJS
> version and the browser version is that the latter doesn't contain the
> [FileStore] class and the [HTTPServer] object and contains the [BrowserStore]
> instead.


### Learn more
* Learn more about [olojs documents](./docs/document.md)
* Learn more about [olojs stores](./docs/store.md)
* Learn the [olojs API](./docs/api.md)


### Test
- `npm run node-test` tests the library in NodeJS
- `npm run browser-test` tests the library in the browser


### License
[MIT](https://opensource.org/licenses/MIT)


### Related projects
* [stilo] is a command-line interface written in NodeJS that allows you to
  create and mange local olojs document repositories.


[swan]: https://github.com/onlabsorg/swan-js/blob/main/docs/swan.md
[document]: ./docs/document.md
[Store]: ./docs/api/stores/store.md
[MemoryStore]: ./docs/api/stores/memory-store.md
[FileStore]: ./docs/api/stores/file-store.md
[BrowserStore]: ./docs/api/stores/browser-store.md
[HTTPStore]: ./docs/api/stores/http-store.md
[HTTPServer]: ./docs/api/servers/http-server.md
[Router]: ./docs/api/stores/router.md
[HyperStore]: ./docs/api/stores/hyper-store.md
[stilo]: https://github.com/onlabsorg/stilo/blob/main/README.md
[brenda]: https://github.com/onlabsorg/olowiki/blob/main/README.md
