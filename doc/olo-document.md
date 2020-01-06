# olo-document

An olodocument is a template containing [swan](./swan.md) expressions enclosed
betweet `<%` and `%>`.

Once the template is rendered, the swan expressions are evaluated and their
resulting value replaces the `<% ... %>` text.

The output of the rendering process is therefore a text, but not only a text.
Assignment expressions will associate a value to a name, populating a document
namespace that will also be available as output of the rendering process.

For example, the following template

```
<% x = 2 %><% y = 10 %>x * y = <% x*y %>
```

will render to the folowing text (notice that assignment expression render to
an empty string)

```
x * y = 20
```

but it will also render to the following namespace:

```
x: 2
y: 10
```

In javascript code, this is done as follows:

```js
const document = require("olojs/lib/document");
const render = document.parse("<% x = 2 %><% y = 10 %>x * y = <% x*y %>");
const context = document.createContext();
const content = await render(context);

String(content);        // returns "x * y = 20"
content.get('x');       // returns 2
content.get('y');       // returns 10
content.size;           // gives 2: the number of names in the namespace
Array.from(content);    // returns ['x', 'y']
```

In the above example, we crated an empty context, but we could have predefined
some names (values or functions), to be made available to the swan expressions.

```js
const context = document.createContext({pi:3.14, sin: x => Math.sin(x)});
```

In order to use olo-documents, all you need to know now is the [swan language](./swan.md)
