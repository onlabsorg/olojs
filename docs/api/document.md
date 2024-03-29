olojs.document
============================================================================
This module contains functions to parse, evaluate and render olojs
documents.
```js
source = "Twice x is <% 2*x %>!";
evaluate = olojs.document.parse(source);
context = olojs.document.createContext({x:10});
docns = await evaluate(context);    
    // docns.x: :10
    // docns.__str__: "Twice x is 20"
```
  

olojs.document.parse - function
----------------------------------------------------------------------------
Compiles a document source to an `evaluate` function that takes as input
a document context object and returns the document namespace object.
```js
evaluate = olojs.document.parse(source);
docns = await evaluate(context);
```
- `source` is a string containing the source of the olojs document to be
  evaluated
- `evaluate` is an asynchronous function that evaluates the document and
  returns its namespace
- `docns` is an object containing all the names defined by the inline
  expressions of the document (the document namespace).
- `docns.__str__` is a string obtained by replacing every inline expression
  with its strigified value. 
  

olojs.document.createContext - function
----------------------------------------------------------------------------
Creates a custom document evaluation context, by adding to the basic
context all the names defined in the passed namespaces.
```js
context = olojs.document.createContext(...namespaces)
```
- `namespaces`: list of objects; each of them, from left to right, will be
  mixed-in to the basic document context
- `context`: an object containing all the named values and functions that
  will be visible to the document inline expressions.
  


