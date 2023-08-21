<!--<% __render__ = require 'markdown' %>-->
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
straight forward and yet powerful, thanks to the flexibility of the [swan] language.



## Evaluating and rendering documents

An olojs document source template can be evaluated and rendered using the
`olo.document` module as shown in the following example:

```js
{document} = require("@onlabsorg/olojs");

source = "<% name %> is <% age %> years old. <% id = name + str(age) %>";
evaluate = document.parse(source);

context = document.createContext({name:"Bob", age:27});
docns = await evaluate(context);        
        // dons.name: "Bob", 
        // docns.age: 27, 
        // docns.id: "Bob27"
        // dons.__str__: "Bob is 27 years old."
```

For a more in depth documentation of the `document` module, read the
[olo.document API](./api/document.md).



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
`bold` and `img` and the `__str__` string `"This document defines some helper 
functions that create html tags."`

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
    name: "Izad",
    kind: "persian",
    tags: {
        bold:   text => '<b>' + text + '</b>',
        italic: text => '<i>' + text + '</i>',
        __str__: "This document defines some helper functions that create html tags."
    }
    __str__: "I have a <b>persian</b> cat named <i>Izad</i>!"
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



Document markup
--------------------------------------------------------------------------------
olo-documents are markup agnostic: they are just text with the addition of 
rendered inline expressions; nevertheless, any markup language can be used.

The document namespace contains a `__str__` that contains the rendered text
and can be modified by the inline expressions. This varable can be used to 
render the text as markdown as follows:

```
# Title
Paragraph ...

<% render_markdown = require 'markdown' %>
<% __str__ = render_markdown __str__ %>
```

Another way to decorate the rendered document is defining a `__renderdoc__` function
that takes the rendered document text (i.e. the `__str__` string after complete rendering)
and returns another string. The returned string will be the new rendered document. For
example, rendering the document as markdown can be achieved with the following expression,
placed anywhere in the document.

```
<% __renderdoc__ = require 'markdown' %>
```

At the moment, the only markup available is `markdown`, but more markup languages 
may be added in the future.


Customize expression rendering
--------------------------------------------------------------------------------
The return value of each expression gets stringified using the `context.str`
function by default. This behavior can be modified by defining a `__renderexp__`
function that will take the expression value as input and will return its
string representation. For example, the following document ...

```
<% __renderexp__ = value -> `[ {% value %} ]`
2 x 5 = <% 2*5 %>
```

... will render to:

```
2 x 5 = [ 10 ] 
```


Learn more
--------------------------------------------------------------------------------
* Learn the [swan] language
* Learn the [olo.document API](./api/document.md)
* Learn more about [stores](./store.md)



[swan]: https://github.com/onlabsorg/swan-js/blob/main/docs/swan.md
[Store]: ./api/store.md
