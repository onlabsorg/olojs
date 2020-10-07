# document module
This module contains functions to parse, evaluate and render 
[olo-documents](../document.md).
  
### evaluate_doc = document.parse(doc_source)
The parse function takes an [olo-document source](../document.md) as input and 
returns a function as output.  

The returned `doc_evaluate` function takes a document context as input 
and returns the document namespace evaluated in that context.  
  
### document.createContext(...namespaces)
Create and expression context suitable for document evaluation. It is
just an expression context extended with document-specific global names and
with all the passed namespaces as follows:

```js
context = expression.createContext(document_globals, ...namespaces);
```
  
### document.render(doc_namespace)
Renders a document namespace to a string as follows:
- Stringifies the `doc_namespace` using `expression.stringify`
- If it exists, applies the `doc_namespace.__render__` decorator to the
  previously stringified value
