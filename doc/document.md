# document module
This module contains functions to load, parse and evaluate olo-documents.
  
### document.parse(source)
The parse function takes a document source text as input and returns 
an `evaluate` function as output.
The `evaluate` function takes an expression context as input and
returns the document namespace evaluated in that context.
The returned namespace can be then stringified by using the 
`document.render` function.
  
### document.createContext(namespace)
Create and expression context suitable for document rendering.
  
### document.render(x)
Stringifies swan objects contained in a namespace returned by the `evaluate`
function. In particular it can be used to render the document namespace
itself to the document text.
  
### document.load(environment, path)
Given an environment object and a path, return the document object
contained in that environment at that path.
##### Environment object
As far as this function is concerned, and environment object is just a
javascript object containing 
- a `readDocument` method that takes a path as input and returns an olo-document source as output
- a `globals` object defining the context variables shared by all the documents in the context
##### Document object
A document object contain the following attributes
- `doc.source`: the loaded document source
- `doc.evaluate(presets)`: a function that evaluates the source in a context
  built with the environment globals and with the given presets as locals
  Besides that, the evaluate function add a `__path__` name to the document
  namespace, containing the document path and an `import` function that 
  allows to load other document in the local namespace.
  

