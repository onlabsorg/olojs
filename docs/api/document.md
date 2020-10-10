olojs.document
============================================================================
This module contains functions to parse, evaluate and render any string of
text formatted as olo-document.
  
```js
const source = "Twice x is <% 2*x %>!";
const context = olojs.document.createContext({x:10});
const evaluate = olojs.document.parse(source);
const namespace = await evaluate(context);
const rendering = await olojs.document.render(namespace);
// rendering is "Twice x is 20!"
```
  
olojs.document.parse - function
----------------------------------------------------------------------------
Compiles a document source into an `evaluate` function that takes as input
a document context object and returns the document namespace object.
  
```js
const evaluate = olojs.document.parse(source);
const namespace = await evaluate(context);
```
- `source`: a string containing olo-document markup
- `evaluate`: an asynchronous function that evaluates the document and 
  returns its namespace
- `namespace`: an object containing all the names defined by the inline 
  expression of the document
  
olojs.document.createContext - function
----------------------------------------------------------------------------
Creates a custom document evaluation context, by adding to the basic 
context all the names defined in the passed namespace.
  
```js
const context = olojs.document.createContext(...namespaces)
```
- `namespaces`: list of objects; each of them, from left to right, will be 
  mixed-in to the basic document context
- `context`: an object containing all the named values and function that
  will be visible to the document inline expressions.
  
olojs.document.render - async function
----------------------------------------------------------------------------
This function exposes to javascript the serialization algorithm used in
to convert the inline expression result values to text.
  
```js
const text = await olojs.render(value)
```

- `value`: any javascript value
- `text`: textual representation of the passed value, obtained according to
  the same rules applied to the inline expressions

If it exists, this function applies the `context.__render__` decorator to 
the stringified value.
  

