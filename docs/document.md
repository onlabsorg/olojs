# olojs documents

An olojs document is just plain text with [swan] inline expressions enclosed
between `<%` and `%>`. Once you evaluate the document, all the swan expressions
are replaced with their value. For example, the following template

```
The sum of 1 and 2 is <% 1+2 %>.
```

will render to

```
The sum of 1 and 2 is 3.
```

A particular type of [swan] expression is the assignment `<% name = value %>` 
which renders to an empty string but creates a mapping between a name and a
value. Once defined, names can be used in other expressions. For example, 
the following template

```
<% x=20 %>The sum of 10 and <% x %> is <% 10+x %>.
```

will render to

```
The sum of 10 and 20 is 30.
```

This is almost all you need to know about the olojs documents markup. It's pretty
straight forward and yet powerful, due to the flexibility of the [swan] language.



## Evaluating and rendering documents

An olojs document source template can be evaluated and rendered using the 
`olojs.document` module as shown in the following example:

```js
document = require("@onlabsorg/olojs").document;

source = "<% name %> is <% age %> years old. <% id = name + str(age) %>";
evaluate = document.parse(source);

context = document.createContext({name:"Bob", age:27});
namespace = await evaluate(context);        // {name:"Bob", age:27, id:"Bob27"}

rendering = await context.str(namespace);   // "Bob is 27 years old."
```

For a more in depth documentation of the `document` module, read the 
[olojs.document API](./api/document.md).



## Documents custom markup

Olojs documents are markup-agnostic in that the rendered content is just the 
plain text obtained by replacing the inline expressions with their stringified 
value. Nonetheless any markup language can theoretically be used; let's see how.

At every point of the document, the `__str__` name is mapped to the text
which has been rendered so far. The same `__str__` string will be the return
value of the `context.str(namespace)` function call. This means that by
modifying the `__str__` value, you can alter the rendered text. For expample:

```
Hi there, this is a document content that will never be rendered, because the
following expression will alter the value mapped to the __str__ name.
<% __str__ = "Less is more!" %>
```

... will render to `Less is more!`. 

If you want to render the document as markdown, you can post-process the `__str__`
text with the `markdown` function.

```
# This is a markdown header
<% markdown = require 'markdown' # load the markdown module %>
<% __str__ = markdown(__str__) %>
```

At the moment of writing, `markdown` is the only markup parser available, but 
other parsers may be available in the future.



## Reusing documents content

An olojs store is a collection of documents, each identified by an unique path. 
Documents contained in the same store can import and re-use each other's content.

> Any type of storage can work as a olo-documents store, as long as it
> implements the [Store] interface. Stores can be local or remote, shared or
> private. [Read more about stores](./store.md).

For example, let's consider the following document stored at `/tools/tags`:

```
This document defines some helper functions that create html tags.
<% bold = text -> '<b>' + text + '</b>' %>
<% italic = text -> '<i>' + text + '</i>' %>
```

Once evaluated, this document returns a namespace containing two functions:
`bold` and `img` and renders to `"This document defines some helper functions 
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
name `tags` and uses the functions contained in it (namely `tags.bold` and 
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

and renders to:

```
I have a <b>persian</b> cat named <i>Izad</i>!
```

> The import function works also with relative paths. For example the import
> statement `import './doc2'` evaluated inside `/path/to/doc1` will return
> the namespace of `/path/to/doc2`.

If an imported document namespace gets stringified, it returns the rendered
text of the imported document. For example, the following document

```
The content of /path/to/mycat is "<% import '/path/to/mycat' %>"
```

renders to:

```
The content of /path/to/mycat is "I have a <b>persian</b> cat named <i>Izad</i>!"
```

Notice that the expression `import '/path/to/mycat'` returns the namespace of
the `/path/to/mycat` document, which then gets stringified and injected in the 
host document.



Learn more
--------------------------------------------------------------------------------
* Learn the [swan] language
* Learn the [olojs.document API](./api/document.md)
* Learn more about [stores](./store.md)



[swan]: https://github.com/onlabsorg/swan-js/blob/main/docs/swan.md
[Store]: ./api/store.md
