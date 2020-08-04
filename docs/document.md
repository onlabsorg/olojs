# olo-document markup

### The basics
An olo-document is a text template like [Mustache](https://mustache.github.io/),
[EJS](https://ejs.co/), [Handlebars](https://handlebarsjs.com/), etc. A document
source template is just plain text containing [swan](./swan.md) expressions
enclosed between `<%` and `%>` which gets replaced with the expression result
value once the document is rendered.  

For example, the following template

```
The sum of 1 and 2 is <% 1+2 %>.
```

will render to

```
The sum of 1 and 2 is 3.
```

A particular type of expression is the assignment `<% name = value %>` which
renders to an empty string but maps a name to a value (a number, a string, a 
function, etc.). Once defined, names can be reused within the same document.

For example, the following template

```
<% x=2 %>The sum of 1 and <% x %> is <% 1+x %>.
```

will render to

```
The sum of 1 and 2 is 3.
```

This is almost all you need to know about the olo-documents markup. It's pretty
straight forward, but yet powerful due to the fact that [swan] is
a touring-complete expression language which can produce any kind of output you
can imagine.


### Fragments
Besides inline [swan] expressions, the olo-document markup has only one other 
type of variable content: _framgments_. A fragment is a parametric sub-document,
defined as shown in the following example:

```
<def:myFragment>
    <% name %> is <% age %> years old.
</def>
```

This syntax will not render to anything (just like assignment expressons), but
it will create a `myFragment` function that you can re-use multiple times
within the document. 

For example, the following template

```
<% myFragment({name="Mario", age=35}) %>
<% myFragment({name="Lucia", age=20}) %>
```

will render to

```
Mario is 35 years old.
Lucia is 20 years old.
```

Fragments are rendered before any [swan] expression, therefore you can use
them before they are even defined.

> Notice that the fragment syntax is not strictly necessary, since the same
> result can be obtained also with plain [swan] expressions, but it makes the
> document more readable.


### Rendering documents
An olo-document source template can be rendered using the `document` module as 
shown in the following example:

```js
const document = require("@onlabsorg/olojs/document");

const source = "<% y=2 %>x*y = <% x*y %>";
const evaluate_doc = document.parse(source);

const context = document.createContext({x:10});
const doc_namespace = await evaluate_doc(context);          // {x:10, y:2}

const doc_rendering = await document.render(doc_namespace); // "x*y = 20"
```

For more details you can read the [document API](./api/document.md).

Notice that the source gets evaluated in a context, which is an object with
pre-defined names mapped to any javascript property.


### Documents environment
What tells `olojs` apart from other template systems, is that its documents can
live within shared environments and re-use each other's content. Therefore 
`olojs`, rather than a template system, can be better described as a 
template-based content management system.

An [environment](./api/environment.md) is an object with the following
functionalities:

- It is bound to a CRUD document store, allowing to read, write and delete
  documents. An environment store can be any object with a `read`, a `write` and 
  a `delete` method; this means that it can be any possible type of store, local
  or remote.
- It defines a common context for all the documents contained in the store.
- It defines a `context.import` function that allows any document to load and
  re-use the content of other documents of the same environment.
  




[swan]: ./swan.md
