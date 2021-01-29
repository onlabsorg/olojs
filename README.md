# olojs

`olojs` is a content management system based on a distributed network of
documents having the following properties:

* Documents are templates containing inline [swan] expressions enclosed between
  `<%` and `%>`.
* Each document holds both data (the variables defined by the inline
  expressions) and narrative content (the text obtained by replacing each inline
  expression with its value)
* Documents are contained in stores and identified by a path within their store.
  A store can be any repository (local, remote or a combination of both)
  implementing the [Store] interface.
* Each document can import and use the narrative content and data held by
  any other document of the same store.

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
olojs = require('@onlabsorg/olojs');
store = new olojs.FileStore('/home/my-olodocs-store');
```

> In this example a file-system-based store is used, but a store can be any
> object implementing the [Store] interface. olojs comes with a number of
> pre-defined stores, namely [MemoryStore], [FileStore], [HTTPStore] and
> a multi-store [Router].

Load, evaluate and render a [document]:

```js
{text, namespace} = await store.load('/path/to/doc');
```

Serve the store via HTTP:

```js
server = olojs.HTTPServer.createServer(store);
server.listen(8010);
```

By serving your store via HTTP, you can:
- Render your documents in the browser at `localhost:8010/#/path/to/doc`
- Pblish your documents on the web
- Allow other users to programmatically access you documents via a
  [HTTPStore]


> olojs works also in the browser, although it has been tested only on Chrome.
> In order to use the olojs library in the browser, you should require
> the module `@onlabsorg/olojs/browser`. The only difference between the NodeJS
> version and the browser version is that the latter doesn't contain the
> [FileStore] class and the [HTTPServer] object.


### Learn more
* Learn more about [olojs documents](./docs/document.md)
* Learn more about [olojs stores](./docs/store.md)
* Learn the [olojs API](./docs/api.md)


### Test
After cloning `olojs`, you can test it in both NodeJS and in your browser via
the `npm test` command.


### License
[MIT](https://opensource.org/licenses/MIT)


### Related projects
* [olojs-cli] is a command-line interface written in NodeJS that allows you to
  create and mange local olojs document repositories.
* [olowiki] is a plug-in for [olojs-cli] that allows to render and edit your
  olojs documents in the browser


[swan]: https://github.com/onlabsorg/swan-js/blob/main/docs/swan.md
[document]: ./docs/document.md
[Store]: ./docs/api/store.md
[MemoryStore]: ./docs/api/memory-store.md
[FileStore]: ./docs/api/file-store.md
[HTTPStore]: ./docs/api/http-store.md
[HTTPServer]: ./docs/api/http-server.md
[Router]: ./docs/api/router.md
[olojs-cli]: https://github.com/onlabsorg/olojs-cli
[olowiki]: https://github.com/onlabsorg/olowiki
