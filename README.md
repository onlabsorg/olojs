# olojs

`olojs` is a content management system based on a distributed network of
interdependent documents called `olo-documents` or `olo-docs`.

An olo-document contains both narrative content and data. The document source is 
a template with [swan] inline expressions that can be evaluated and rendered;

- once the document is evaluated, it returns the swan namespace, which is an 
  object containing all the variables defined by the inline expressions;
- once the document is rendered, it returns the text obtained by replacing the 
  inline expressions with their result values

The following example of olo-document may clarify the concept:

```
<% name = "Isaac Newton" %>

This is a document about <% name %>. 

<% date_of_birth = "04-01-1643" %>
<% date_of_death = "31-03-1727" %>
<% date_manager = import("/path/to/date-manager-document") %>

He was born on <% date_of_birth %> and he died on <% date_of_death %> at the 
age of <% date_manager.diff_years(date_of_death, date_of_birth) %>.

He formulated the laws of motion, laying the foundations of the classical
mechanics. About his work he stated: "If I have seen further it is by standing 
on the shoulders of giants", anticipating one of the principles of the free
software movement.

<% einstein = import("./albert-einstein") %>

Three centuries later <% einstein.name %> could freely use Newton's work and the
work of many other scientists like him to formulate his well known theory of
relativity.
```

### Getting started

Install olojs via npm

```sh
npm install @onlabsorg/olojs --save
```

Parse, evaluate and render an [olo-document](./docs/document.md):

```js
{document} = require('@onlabsorg/olojs');

source = "<% y=2 %>x*y = <% x*y %>";
evaluate = document.parse(source);

context = document.createContext({x:10});
namespace = await evaluate(context);              // {x:10, y:2}

rendering = await document.render(namespace);     // "x*y = 20"
```

Create a shared [environment](./docs/api/environment.md) for your documents:

```js
const {Environment, stores} = require('@onlabsorg/olojs');
const environment = new Environment({
    store: new olojs.stores.FileStore('/home/username'),   // where the documents are stored
    globals: {
        // global names shared by all the documents in this environment
    }
});
```

Retrieve and render a document from your environment:

```js
const doc1 = await environment.readDocument("/path/to/doc1");    // document at /home/username/path/to/doc1
const doc1_context = doc1.createContext({x:10});
const doc1_namespace = await doc1.evaluate(doc1_context);
const doc1_rendering = await environment.render(doc1);
```

Let's say that we have the following two documents in `environment`:

* `/path/to/doc1`: `<% y=2 %>`
* `/path/to/doc2`: `<% doc1 = import './doc1'%>x*y = <% x * doc1.y %>`

Once evaluated, doc2 will return the following namespace

```js
{
    x: 10, 
    doc1: {y:2}
}
```

and it will render to the following text:

```
x*y = 20
```

Last but not least, you can serve your environment via HTTP and render documents 
in the browser at URLs like `http://localhost:8010/#/path/to/doc`.

```js
const {servers} = require("@onlabsorg/olojs");
const server = servers.http(environment);
server.listen(8010);
```

### Learn more
* Learn more about [olojs environments](./docs/environment.md)
* Learn more about [olojs documents](./docs/document.md)
* Learn the [standard swan library](./docs/stdlib.md) swan API
* Learn the [expression](./docs/api/expression.md) module API
* Learn the [document](./docs/api/document.md) module API
* Learn the [environment](./docs/api/environment.md) module API
* Learn the [file store](./docs/api/file-store.md) module API
* Learn the [http store](./docs/api/http-store.md) module API
* Learn the [memory store](./docs/api/memory-store.md) module API
* Learn the [router store](./docs/api/router-store.md) module API
* Learn the [http server](./docs/api/http-server.md) module API


### Test 
* Test olojs in nodejs: `npm test`  
* Test olojs in the browser: `npm run browser-tests`  
* Test the browser rendering app: `npm run client-test`

### License
[MIT](https://opensource.org/licenses/MIT)

### Related projects
* [olojs-cli] is a command line interface for managing olojs repositories. It 
  allows creating a new local repo, mounting external (local or remote) repos 
  and serving the repo via internet. 


[olojs-cli]: https://github.com/onlabsorg/olojs-cli
[swan]: https://github.com/onlabsorg/swan-js/blob/main/docs/swan.md
