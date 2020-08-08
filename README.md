# olojs

`olojs` is a distributed content management framework whose unit of content is
called an `olo-document`.

An olo-document is a template with [swan](./docs/swan.md) inline expressions: it 
renders to the text obtained by replacing the inline expressions with their
values.

A particular type of expression is the assignment `<% name = value %>` which
renders to an empty string and maps a name to a value (a number, a string, 
a function, etc.). Names can be reused within the same document or imported and 
then used by other documents.

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
work of many other scientists like him to formulate his well known relativity theory.
```


### Getting started with the CLI interface

First of all create an npm package in a new directory and install olojs.

```sh
npm init
npm install --save @onlabsorg/olojs
```

Then you can decorate the npm package into an olo-docs repository:

```sh
npx olojs init
```

> Soon just `npx olojs init` will do. Meaning that it will automatically 
> initialize the npm package, intall olojs-cli and initialize the repository.

After initializing the olojs repository, you will find in your npm packages two
new directories: `docrs` and `olonv.js`. The first will contain your documents,
while the second is a javascript module that exports the repository
[environment](./docs/api/environment.md).

Now you can are ready to render some documents:

```sh
npx olojs render /index
```

The `npx olojs render <path>` command prints the rendered version of the 
document found at `./docrs/<path>`.

You can now add as many documents as you want and render them out to the console 
or redirect them to to a file. If you want instead to render your document in 
the browser, you can serve them via http.

```sh
npx olojs serve [port=8010]
```

After starting the http server, your documents become accessible via the URL 
`http://localhost:8010/#/path/to/document`.


### Getting started with the JavaScript API

Install olojs via npm

```sh
npm install @onlabsorg/olojs --save
```

Parse, evaluate and render an [olo-document](./docs/document.md):

```js
const document = require("@onlabsorg/olojs/document");

const source = "<% y=2 %>x*y = <% x*y %>";
const evaluate_doc = document.parse(source);

const context = document.createContext({x:10});
const doc_namespace = await evaluate_doc(context);          // {x:10, y:2}

const doc_rendering = await document.render(doc_namespace); // "x*y = 20"
```

Create a shared [environment](./docs/api/environment.md) for your documents:

```js
const Environment = require("@onlabsorg/olojs/environment");
const environment = new Environment({
    store: {    // any object with a read, write, delete API
        read (path) {...},
        write (path, source) {...},
        delete (path) {...}
    },
    globals: {  // names shared by every document context
        a: 1,
        b: "hi",
        // ...
    },
});
```

> A store is any object containing the `read`, `write` and `delete` methods 
> operating on an olo-docs archive. You can define your own store or you can use 
> one of the predefined stores: [fs-store](./docs/api/fs-store.md), 
> [http-store](./docs/api/http-store.md) or [router](./docs/api/router.md).

Store a document to your environment:

```js
    const doc1_source = "<% y=2 %>x*y = <% x*y %>";
    await environment.writeDocument("/path/to/doc1", doc1_source);
```

Retrieve and render a document from your environment:

```js
const doc1_source = await environment.readDocument("/path/to/doc1");
const evaluate_doc1 = environment.parseDocument(doc1_source);
const context = environment.createContext({x:10});
const doc1_namespace = await evaluate_doc1(context); // {x:10, y:2}
const doc1_rendering = await environment.render(doc1_namespace); // "x*y = 20
```

Or use directly the `loadDocument` shortcut method which retrieves, parses an 
evaluates a document:

```js
const doc1_namespace = await environment.loadDocument("/path/to/doc1", {x:10});
const doc1_rendering = await environment.render(doc1_namespace);
```

or, evan shorter:

```js
const doc1_rendering = await environment.renderDocument("/path/to/doc1", {x:10});
```

Reuse content across documents of the same environment:

```js
const doc1_source = "<% y=2 %>";
await environment.writeDocument("/path/to/doc1", doc1_source);

const doc2_source = "<% doc1 = import './doc1'%>x*y = <% x * doc1.y %>";
await environment.writeDocument("/path/to/doc2", doc2_source);

const doc2_namespace = await environment.loadDocument("/path/to/doc2", {x:10});
// doc2_namespace: {x:10, doc1:{y:2}}

const doc2_rendering = await environment.render(doc2_namespace);
// doc2_rendering: "x*y = 20"
```

Last but not least, you can serve your environment via HTTP and render documents 
in the browser at URLs like `http://localhost:8010/#/path/to/doc`.

```js
const HTTPServer = require("@onlabsorg/olojs/http-server");
const server = HTTPServer(environment);
server.listen(8010);
```

### Learn more
* Learn the [olo-documents syntax](./docs/document.md)
* Learn the [swan expression language](./docs/swan.md)
* Learn the [standard swan library](./docs/swan.md) API
* Learn the [expression](./docs/api/expression.md) module API
* Learn the [document](./docs/api/document.md) module API
* Learn the [environment](./docs/api/environment.md) module API
* Learn the [http-server](./docs/api/http-server.md) module API
* Learn the [fs-store](./docs/api/fs-store.md) module API
* Learn the [fs-store](./docs/api/http-store.md) module API
* Learn the [router](./docs/api/router.md) module API
* Learn the [repository](./docs/api/repository.md) module API
* Learn the [cli](./docs/cli.md) commands


### Test 
* To run the test on your machine, enter `npm test` at the command line.  
* To thest the browser client, enter `npm run test-server` and follow the
  instructions.


### License

[MIT](https://opensource.org/licenses/MIT)
