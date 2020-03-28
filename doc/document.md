# document module
This module contains functions to load, parse and evaluate olo-documents.
  
### document.expression
This points to the expression module, but it could be any object implementing
the following methods:
- expression.parse
- expression.createContext
- expression.stringify
- expression.apply
  
### document.parse(source)
The parse function takes a document source text as input and returns 
an `evaluate` function as output.
The `evaluate` function takes an expression context as input and
returns the document namespace evaluated in that context.
The returned namespace can be then stringified by using the 
`document.expression.stringify` function.
  
### document.createContext(namespace)
Create and expression context suitable for document rendering.
  

