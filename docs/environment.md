olojs environment
================================================================================
An olojs environment is an object exposing the following functionalities:

- It allows to load and store documents from/to local and/or remote repositories
- It defines a common context for all the documents
- It defines a `context.import` function that allows any document to load and
  re-use the content of other documents of the same environment.
  
In order to create an environment, you need to provide the following 
parameters:

- A global context to be shared by all the documents
- One or more protocols for accessing documents
- Optionally, one or more shortcut routes for document locations

Example:

```js
olojs = require("@onlabsorg/olojs");
environment = olojs.Environment({
    globals: {
        environmentName = "demo"
    },
    protocols: {
        file: olojs.protocols.file
    },
    routes: {
        '/': 'file:/home/user/env-demo-documents'
    }
});
```

Read, evaluate and render a document
--------------------------------------------------------------------------------
Given this environment, I can retrieve, evaluate and render a document as
follows:

```js
// get content of document file:/home/user/env-demo-documents/path/to/doc.olo
doc = await environment.readDocument("/path/to/doc");   

// evaluate the document
context = doc.createContext();
namespace = await doc.evaluate(context);

// render the document
text = await environment.render(namespace);
```

A document `doc` retrieved via `environment`, when evaluated, has access to an
`import` function that loads and returns external documents namespaces. See
the [document documentation](./document.md) for more details about the `import`
function.


Modify a document
--------------------------------------------------------------------------------
If the protocol allows it, you can modify a document content or delete it as
follows.

```js
await environment.updateDocument('/path/to/doc', "new doc source");
await environment.deleteDocument('file:/home/user/env-demo-documents/path/to/doc'");
```