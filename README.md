# olojs

`olojs` is a distributed content management framework whose unit of content is
called an `olo-document`.

An olo-document is a template with [swan](./doc/swan.md) inline expressions: it 
renders to the text obtained by replacing the inline expressions with their
values.

At the same time it is also a namespace containing all the data exported by the
inline expressions. Those data can be imported and re-used by other olo-documents. 

The following example of olo-document may clarify the concept:

```
<% name = "Marcello" %>

This is a document about <% name %>. 

<% date_of_birth = "26-02-1977" %>
<% date_manager = import("/path/to/date-manager-olo-document") %>

He was born on <% date_of_birth %>, therefore he is <% date_manager.calculte_age(date_of_birth) %>
years old.

<% friends = import("./my-friends") %>

He has <% friends.count %> friends, but his best friend is <% friends.best %>.
```


## Getting started

#### Install olojs via npm

```
npm install -g @onlabsorg/olojs
``` 

Once you have it installed, the `olojs` command line interface (CLI) will be
available in your system. The CLI commands available are:

* `olojs init` initializes a local environment by creating an `olojs-config.js` 
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

This command will create a default `olojs-config.js` configuration file in
your project folder. The default environment allows you to load and import 
olo-documents from within the `my-olojs-project` folder but you can customize
it to allow loading documents from any source you want (local or remote).

The configuration file is just a NodeJS script that returns an 
[environment configuration object](./doc/config.md). You can customize your
environment configuration by editing the configuration file.


#### Add a document to your project and render it

In your preferred text editor, create the following file and save it as `doc1.olo`.

```
Hello! This is my first olo-document.
It defines two variables:
- x = <% x:10 %> and
- y = <% y:20 %>
Their sum is: <% x+y %>
```

Now, if you render this document by typing `olojs render ./doc1` you will get
the following console output (which of course you can redirect to a file).

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
document and returns its local namespace (i.e. a namespace with all the names defined
in the document). It relies on the environment loaders to fetch the external
documents. Find out how to [modify the environment configuration](./doc/config.md)
to add new loaders.

If the import path starts with `/bin/` (e.g. `/bin/markdown`), then a special
built-in type of loader is used: the binary loader. It doesn't load olo-documents
but javascript modules from the [olojs standard library](./doc/stdlib.md) and
returns whatever the module exports. 

If the import path starts with `http://` or with `https://` then another special
bult-in type of loader is used: the HTTP loader. If fetches the document from
the web.


#### Create a parametric document

Olo-documents are potentially parametric, meaning that your can render the same
document differently by passing parameters to the `olojs render` command.

Let's add a parametric document to our project and name it `doc3.olo`

```
This is a parametric document. You passed-in the following parameters:
- Parameter a: <% argv.a %>
- Parameter b: <% argv.b %>
```

Now if you render this document with the command `olojs render ./doc3 a=1 b=2`,
the result will be:

```
This is a parametric document. You passed-in the following parameters:
- Parameter a: 1
- Parameter b: 2
```


#### Serve your environment via HTTP

From your project folder you can start an HTTP server by typing `olojs serve 8010` 
that, in response to `HTTP GET PATH` requests, sends the olo-document located
at `PATH` within your environment.

Once you start serving your olojs environment, on your local host you can render 
the document `/path/to/doc1` in your browser by entering the URL
`http://localhost:8010/path/to/doc1`.

If you are requesting a parametric document, you can specify the parameters
in the query string (e.g. `http://localhost:8010/path/to/doc1?a=3&b=5`).

If you are planning to serve your evironment via HTTP, you may want your document
to be written in HTML because that's the markup format the browser expects. If you
prefer markdown, then just add `<% __render__ = import("/bin/markdown") %>`
somewhere in your document and it will be post-rendered from markdown to HTML
after the normal expression rendering process.


#### Share your documents

One way to share your environment with others is to publish it on the web and
serve it via `olojs serve [port]`.

Another way is to publish your environment as a npm package. Before doing so,
add and document a `load` function (for example in `index.js`) so that other
user can mount your environment in their environment and use the `load` function
as loader.

For example, let's say that you installed an olojs package via `npm install an-olojs-package`,
in your configuration file you could add the following line:

```js
const package = require("an-olojs-package");
exports.loaders["/pac"] = subPath => package.load(subPath);
```

Now, in your environment, every time you fetc/load/import a path like `/pac/path/to/doc1`,
the document `/path/to/doc1` will be loaded from the installed package.


## NodeJS API

In NodeJS you can create and manage an olojs environment as follows:

```js
const olojs = require("@onlabsorg/olojs");
const env = new olojs.Environment(config);      // create a new environment given a configuration object
const doc = await doc.load("/path/to/doc");     // load a document from the environment
const content = await doc.evaluate(args);       // evaluates the document
const ns = content.namespace;                   // returns the document namespace
const renderedDoc = await content.render();     // renders the document
```


## License

The olojs source code is licensed under the [MIT license](https://opensource.org/licenses/MIT)
