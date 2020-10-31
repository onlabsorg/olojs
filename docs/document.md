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
An olo-document source template can be rendered using the `document` module as 
shown in the following example:

```js
document = require("@onlabsorg/olojs").document;

source = "<% y=2 %>x*y = <% x*y %>";
evaluate = document.parse(source);

context = document.createContext({x:10});
namespace = await evaluate(context);          // {x:10, y:2}

rendering = await document.render(namespace); // "x*y = 20"
```

For more details you can read the [document API](./api/document.md).

Notice that the source gets evaluated in a context, which is an object with
pre-defined names mapped to javascript values.



Documents environment
--------------------------------------------------------------------------------
What tells `olojs` apart from other template systems, is that its documents can
live within shared environments and re-use each other's content. Therefore 
`olojs`, rather than a template system, can be better described as a 
template-based content management system.

An [environment](./api/environment.md) is an object with the following
functionalities:

- It allows to r/w access to documents from local and/or remote repositories
- It defines a common context for all the documents contained in the environment.
- It defines a `context.import` function that allows any document to load and
  re-use the content of other documents of the same environment.
  
In order to clarify how the `import` function works, let's assume we have the
following two documents:

- `/path/doc1`: `<% x=10 %>`
- `/path/to/doc2`: `<% doc1 = import "../doc1" %>2 * x = <% 2 * doc1.x %>`

When evaluating doc2, the `import` function will load the doc1 namespace 
(`{x:10}`) and assign the name `doc1` to it. 

The following expression will access the value of `x` defined in doc1 via
`doc1.x`, double it and print the result.

The final rendering of doc2 will therefore be: `2 * x = 20`.



[swan]: https://github.com/onlabsorg/swan-js/blob/main/docs/swan.md
