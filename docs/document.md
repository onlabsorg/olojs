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
`olo.document` module as shown in the following example:

```js
{document} = require("@onlabsorg/olojs");

source = "<% name %> is <% age %> years old. <% id = name + str(age) %>";
evaluate = document.parse(source);

context = document.createContext({name:"Bob", age:27});
{data, text} = await evaluate(context);        
        // data: {name:"Bob", age:27, id:"Bob27"}
        // text: "Bob is 27 years old."
```

For a more in depth documentation of the `document` module, read the 
[olo.document API](./api/document.md).



## Documents custom markup

Olojs documents are markup-agnostic in that the rendered content is just the 
plain text obtained by replacing the inline expressions with their stringified 
value. Nonetheless any markup language can theoretically be used; let's see how.

The `evaluate` function returns a `text` string and a `data` namespace.

- the `data` object contains all the names defined in the [swan] expressions
- the `text` string obtained by replacing each [swan] expression with its 
  stringified value (plain text) and decorating it via 
  `returnedText = await data.__render__(plainText)`.
  
Therefore, if you want to render the document as markdown, you can decorate its 
plain text by defining a `__render__` function that takes a markdown text as 
input and returns HTML markup as output. Such a function is buit-in in the 
olojs expression library. For example, the following text will render as markdown:

```
<% __render__ = require 'markdown' %>

# This is a header

This is a paragraph.

- This
- is
- a
- list
```

> A the moment, the only built-in decorator is the `markdown` function shown in 
> the example above, but more may follow in the future.




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

Once evaluated, this document returns a `data` namespace containing two functions:
`bold` and `img` and the `text` string `"This document defines some helper functions 
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

Once evaluated, the `/path/to/mycat` document returns the following object:

```js
{
    data: {
        name: "Izad",
        kind: "persian",
        tags: {
            bold:   text => '<b>' + text + '</b>',
            italic: text => '<i>' + text + '</i>'
        }
    },
    
    text: "I have a <b>persian</b> cat named <i>Izad</i>!"
}
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
* Learn the [olo.document API](./api/document.md)
* Learn more about [stores](./store.md)



[swan]: https://github.com/onlabsorg/swan-js/blob/main/docs/swan.md
[Store]: ./api/store.md
