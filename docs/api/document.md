olojs.document
============================================================================
This module contains functions to parse, evaluate and render any string of
text formatted as olo-document.
```js
source = "Twice x is <% 2*x %>!";
context = olojs.document.createContext({x:10});
evaluate = olojs.document.parse(source);
namespace = await evaluate(context);    // {x:10}
text = await context.str(namespace);    // "Twice x is 20"
```
  
olojs.document.parse - function
----------------------------------------------------------------------------
Compiles a document source into an `evaluate` function that takes as input
a document context object and returns the document namespace object.
```js
evaluate = olojs.document.parse(source);
namespace = await evaluate(context);
```
- `source` is a string containing olo-document markup
- `evaluate` is an asynchronous function that evaluates the document and
  returns its namespace
- `namespace` is an object containing all the names defined by the inline
  expressions of the document.
The document namespace stringifies to a text obtained by replacing every
inline expression with its value, therefore in javascript
`await context.str(namespace)` will return the rendered document.
  
olojs.document.createContext - function
----------------------------------------------------------------------------
Creates a custom document evaluation context, by adding to the basic
context all the names defined in the passed namespace.
```js
context = olojs.document.createContext(...namespaces)
```
- `namespaces`: list of objects; each of them, from left to right, will be
  mixed-in to the basic document context
- `context`: an object containing all the named values and function that
  will be visible to the document inline expressions.
  

