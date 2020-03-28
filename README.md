# olojs

`olojs` is a distributed content management framework whose unit of content is
called an `olo-document`.

An olo-document is a template with [swan](./doc/swan.md) inline expressions: it 
renders to the text obtained by replacing the inline expressions with their
values.

At the same time it is also a namespace containing all the names defined by the
inline expressions. Those data can be imported and re-used by other olo-documents. 

The following example of olo-document may clarify the concept:

```
<% name = "Isaac Newton" %>

This is a document about <% name %>. 

<% date_of_birth = "04-01-1643" %>
<% date_of_death = "31-03-1727" %>
<% date_manager = import("/path/to/date-manager-olo-document") %>

He was born on <% date_of_birth %> and he died on <% date_of_death %> at the 
age of <% date_manager.diff_years(date_of_death, date_of_birth) %>.

He formulated the laws of motion, laying the foundations of the classical
mechanics. About his work he stated: "If I have seen further it is by standing on the 
shoulders of giants", anticipating one of the principles of the free
software movement.

<% einstein = import("./albert-einstein") %>

Three centuries later <% einstein.name %> could freely use Newton's work and the
work of many other scientists like him to formulate his well known relativity theory.
```


## Getting started

#### Install olojs via npm

```
npm install -g @onlabsorg/olojs
``` 

Once you have it installed, the `olojs` command line interface (CLI) will be
available in your system. The CLI commands available are:

* `olojs init` initializes a local environment by creating an `olonv.js` 
  configuration file that you can eventually customize
* `olojs render <path-to-doc> [args ...]` renders the olo-document
  located at the given path, with the given (optional) parameters
* `olojs serve [port]` starts an HTTP server based on the local environment. It
  allows you to render your olo-documents in the browser or to publish them on
  the internet.

#### Create an olojs environment

In order to get started with a new project, you should create a new folder and
in it, initialize the `olojs environment` as follows:

```
$ mkdir my-olojs-project
$ cd my-olojs-project
$ olojs init
```

This command will create a default `olonv.js` configuration file in
your project folder. The default environment allows you to load and import 
olo-documents from within the `my-olojs-project/docs` folder but you can customize
it to allow loading documents from any source you want (local or remote).

The configuration file is just a NodeJS script that returns an 
[environment object](./doc/config.md). You can customize your
environment configuration by editing the `olonv.js` file.


#### Add a document to your project and render it

In your preferred text editor, create the following file and save it as `doc1.olo`
in the `/docs` directory.

```
Hello! This is my first olo-document.
It defines two variables:
- x = <% x:10 %> and
- y = <% y:20 %>
Their sum is: <% x+y %>
```

Now, if you render this document by typing `olojs render ./doc1` you will get
the following console output (which of course you could redirect to a file).

```
Hello! This is my first olo-document.
It defines two variables:
- x = 10 and
- y = 20
Their sum is: 30
```

The text between `<%` and `%>` is a [swan](./doc/swan.md) expression. Swan is
a language that features pure functions, immutable data types and more.


#### Import a document in another document

Now create a `doc2.olo` file with the following content:

```
Hello! This is another olo-document. It imports the one I created before and
uses its content.

<% doc1 = import("./doc1") %>
The x variable defined in doc1 is equal to <% doc1.x %>, while the y variable 
defined in doc2 is equal to <% doc1.y %>. Their product is <% doc1.x * doc1.y %>.

Here below I show you the rendered content of doc1:
------------------
<% doc1 %>
------------------
```

If you render this document by typing `olojs render ./doc2`, you will get
the following output:

```
Hello! This is another olo-document. It imports the one I created before and
uses its content.

The x variable defined in doc1 is equal to 10, while the y variable 
defined in doc2 is equal to 20. Their product is 200.

Here below I show you the rendered content of doc1:
------------------
Hello! This is my first olo-document.
It defines two variables:
- x = 10 and
- y = 20
Their sum is: 30
------------------
```

The `import` function is a global function that loads and evaluates another
document and returns its local namespace (i.e. a namespace with all the names 
defined in the document). It relies on the environment loaders to fetch the 
external documents. 
Find out how to [modify the environment configuration](./doc/config.md) to add 
new loaders.

If the import path starts with `http://` or with `https://` then another special
bult-in type of loader is used: the HTTP loader. If fetches the document from
the web.

If the import path starts with `/bin`, then it will return a javascript module contained 
in the [olojs standard library](./doc/stdlib.md). For example `md = import("/bin/markdown")`  
will load the markdown module and assign its exports to the `md` variable.


#### Create a parametric document

Olo-documents are potentially parametric, meaning that your can render the same
document differently by passing parameters to the `olojs render` command.

Let's add a parametric document to our project and name it `doc3.olo`

```
This is a parametric document. You passed-in the following parameters:
- Parameter a: <% argns.a %>
- Parameter b: <% argns.b %>
```

Now if you render this document with the command `olojs render ./doc3 a=1 b=2`,
the result will be:

```
This is a parametric document. You passed-in the following parameters:
- Parameter a: 1
- Parameter b: 2
```

In other words, all the names passed to the command line will be available in 
the document local scope under the `argns` namespace.


#### Serve your environment via HTTP

From your project folder you can start an HTTP server by typing `olojs serve 8010` 
that, in response to `HTTP GET PATH` requests, sends the olo-document located
at `PATH` within your environment.

Once you start serving your olojs environment, on your local host you can render 
the document `/path/to/doc1` in your browser by entering the URL
`http://localhost:8010#/path/to/doc1`.

If you are requesting a parametric document, you can specify the parameters
in the query string (e.g. `http://localhost:8010#/path/to/doc1?a=3&b=5`).

If you are planning to serve your evironment via HTTP, you may want your document
to be written in HTML because that's the markup format the browser expects. If you
prefer markdown, then just add `<% __render__ = require("markdown") %>`
somewhere in your document and it will be post-rendered from markdown to HTML
after the normal expression rendering process.


#### Share your documents

One way to share your environment with others is to publish it on the web and
serve it via `olojs serve [port]`.

Another way is to publish your environment as a npm package and expose a
package document loader in your API. This way other user can mount your environment 
in their environment by using the provided loader.

For example, let's say that you installed an olojs package via `npm install an-olojs-package`,
in your configuration file you could add the following line:

```js
// ...
const package = require("an-olojs-package");
// ...
module.exports = new Environment({
    paths: {
        // ...
        "/pac" : package.load,
        // ...
    },
    // ...
});
// ...
```

Now, in your environment, every time you load a path like `/pac/path/to/doc1`,
the document `/path/to/doc1` will be loaded from the installed package.


## NodeJS API

In NodeJS you can create and manage an olojs environment as follows:

```js
const OloJS = require("@onlabsorg/olojs");
const olojs = new OloJS(rootPath);              // create and environment manager at the give fs path
await olojs.init();                             // initialize the environment (used by the `olojs init` CLI command)
text = await olojs.render(docPath);             // renders a document (used by the `olojs render` CLI command)
server = await olojs.serve(port);               // starts an HTTP server (used by the `olojs serve` CLI command)
```

For a lower level API, see the following modules:

* [lib/expression](./doc/expression.md) - parse and evaluate swan expressions
* [lib/document](./doc/document.md) - load, parse and evaluate olo-documents
* [lib/environment/fs-store](./doc/fs-store.md) - CRUD operations on olo-document fs store
* [lib/environment/http-store](./doc/http-store.md) - CRUD operations on remote olo-document stores via http
* [lib/environment](./doc/environment.md) - environment base class
* [lib/environment/backend-environment](./doc/backend-environment.md) - the default local environment
* [src/environment/browser-environment](./doc/browser-environment.md) - the default browser environment


## Test 

To run the test on your machine, enter `npm test` at the command line.


## License

The olojs source code is licensed under the [MIT license](https://opensource.org/licenses/MIT)
