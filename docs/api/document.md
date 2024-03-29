  

document module
============================================================================
This module contains functions to parse, evaluate and render olo-documents.
  

```js
source = "Twice x is <% 2*x %>!";
evaluate = document.parse(source);
context = document.createContext({x:10});
docns = await evaluate(context);    
    // docns.x: :10
    // docns.__str__: "Twice x is 20"
```
  

  

document.parse - function
----------------------------------------------------------------------------
Compiles a document source to an `evaluate` function that takes as input
a document context object and returns the document namespace object.
  

```js
evaluate = document.parse(source);
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
  

  

document.createContext - function
----------------------------------------------------------------------------
Creates a custom document evaluation context, by adding to the basic
context all the names defined in the passed namespaces.
  

```js
context = document.createContext(...namespaces)
```
- `namespaces`: list of objects; each of them, from left to right, will be
  mixed-in to the basic document context
- `context`: an object containing all the named values and functions that
  will be visible to the document inline expressions.
  

  

class Document
------------------------------------------------------------------------
Creates a document object representing a document contained in a given
store, at the given path and having a ginve source.
  

```js
const doc = new Document(store, '/path/to/doc', "Lorem ipsum ...")
```
  

If omitted, the source parameters defaults to an empty string.
  

### doc.store: Store
The store in which the document is contained.
  

### doc.path: String
The normalize path of the document, within its store.
  

### doc.source: String
The source of the document.
  

### doc.evaluate: Object context -> Object namespace
This is the source compiled to a function as returned by `document.parse`.
  

  

### doc.createContext: (...Objects preset) -> Object context
  

Created a valid evaluation context that can be passed to the
`doc.evaluate` function to evaluate this document. The returned
context contains the following special names:
  

- `context.__path__`: the document path
- `context.import`: a function that loads and evaluates a document and
  returns its namespace; if a relative path is passed as argument to
  this function, it will be resolved as relative to this document path
- All the name contained in the passed preset objects
  

  

async load: (Store store, String path) -> Document doc
=====================================================================
Given a store and a document path, loads the source of the document
located at path within that store and returns the Document instance
with parameters `store`, `path` and `source`.
  


