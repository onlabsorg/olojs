olojs documents
================================================================================

An olo-document is a text template like [Mustache](https://mustache.github.io/),
[EJS](https://ejs.co/), [Handlebars](https://handlebarsjs.com/), etc. A document
source template is just plain text containing [swan] expressions
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

A particular type of [swan] expression is the assignment `<% name = value %>` 
which renders to an empty string but maps a name to a value (a number, a string, 
a function, etc.). Once defined, names can be reused within the same document.

For example, the following template

```
<% x=20 %>The sum of 10 and <% x %> is <% 10+x %>.
```

will render to

```
The sum of 10 and 20 is 30.
```

This is almost all you need to know about the olo-documents markup. It's pretty
straight forward and yet powerful, due to the flexibility of the [swan] language.



Rendering documents
--------------------------------------------------------------------------------
An olo-document source template can be rendered using the `olojs.document` 
module as shown in the following example:

```js
document = require("@onlabsorg/olojs").document;

source = "<% y=2 %>x*y = <% x*y %>";
evaluate = document.parse(source);

context = document.createContext({x:10});
namespace = await evaluate(context);    // {x:10, y:2}

text = await context.str(namespace);    // "x*y = 20"
```

For more details you can read the [olojs.document API](./api/document.md).

Notice that the source gets evaluated in a context, which is an object with
pre-defined names mapped to javascript values.



Documents custom markup
--------------------------------------------------------------------------------
Olo-documents are markup-agnostic: the rendered content returned by 
`await context.str(namespace)` is just the plain text obtained by replacing the 
inline expressions with their stringified value. 

In order to customize this behavior, you can define a swan callable named 
`__render__` which will decorate the rendered text. For example the following
document ...

```
<% __render__ = text -> text + '!' %>
Hello world
```

... will render to `Hello world!`. The trailing exclamation mark will be added
by the `__render__` function to the plain rendered text.

If you want to render the document as markdown, you can assign the swan markdown 
module to the `__render__` function:

```
<% __render__ = require 'markdown' %>
# This is a markdown header
```

At the moment of writing, `markdown` is the only markup parser available in
`swan`, but other parsers may be available in the future.


Reusing documents content
--------------------------------------------------------------------------------
Documents can be kept in stores and in that case they are identified by a path.
Any document contained in a store can import and re-use the namespace of other
documents contained in the same store, referencing them by their path.

> Any type of storage can work as a olo-documents store, as long as it
> implements the [Store] interface. Stores can be local or remote, shared or
> private. [Read more about stores](./store.md).

For example, let's consider the following document stored at `/tools/tags`:

```
This document contains some helper functions that create html tags.
<% bold = text -> '<b>' + text + '</b>' %>
<% italic = text -> '<i>' + text + '</i>' %>
```

Once evaluated, this document returns a namespaces containing two functions:
`bold` and `img` and renders to `"This document contains some helper functions 
that create html tags."`

Let's now assume that the same store contains also the following document mapped
to the path `/path/to/mycat`:

```
<% tags = import '/tools/tags' %>
<% name = "Izad" %>
<% kind = "persian" %>
I have a <% tags.bold(kind) %> cat named <% tags.italic(name) %>!
```

The `/path/to/mycat` document imports the namespace of `/tools/tags` under the
name `tags` and uses the functions it contains (namely `tags.bold` and 
`tags.italic`) to generate part of its own content.

Once evaluated, the `/path/to/mycat` document returns the following namespace:

```js
{
    name: "Izad",
    kind: "persian",
    tags: {
        bold:   text => '<b>' + text + '</b>',
        italic: text => '<i>' + text + '</i>'
    }
}
```

Once stringified, the `/path/to/mycat` namespace renders to:

```
I have a <b>persian</b> cat named <i>Izad</i>!
```

> The import function works also with relative paths. For example the import
> statement `import './doc2'` evaluated inside `/path/to/doc1` will return
> the namespace of `/path/to/doc2`.

If an imported document namespace gets stringified, it returns the rendered
text of the imported document. For example, lets consider the following
documents:

* **/chunks/lucy**: "This paragraph has been contributed by <% author:'Lucy' %>"
* **/chunks/ivan**: "This paragraph was written by <% author:'Ivan' %>"

Another document could just include the content of the documents above as
follows:

```
<p><% import '/chunks/lucy' %></p>
<p><% str(import '/chunks/ivan') %></p>
```

This document renders to:

```
<p>This paragraph has been contributed by Lucy</p>
<p>This paragraph was written by Ivan</p>
```



Learn more
--------------------------------------------------------------------------------
* Learn the [swan] language
* Learn the [olojs.document API](./api/document.md)
* Learn more about [stores](./store.md)



[swan]: https://github.com/onlabsorg/swan-js/blob/main/docs/swan.md
[Store]: ./api/store.md
