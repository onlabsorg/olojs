# repository module
This module exports the `Repository` class, which is used internally by the
[cli](../cli.md) to manage olojs repositories. You may need to know the
`Repository` class API if:

- You want to programmatically create a repository
- You want to extend it in order to create a repository template to be used
  with `npx olojs init [template] [options...]`
  
  
### repository = new Repository(path)
Create a repository object, bound to a file-system path.


### rootPath = repository.rootPath
Returns the root path of the repository passed to the constructor.


### repository.init(options)
Initializes the repository. 

By default, this creates the `olonv.js` file and the `documents` directory in
the `repository.rootPath`.

The `options` object can be useful for Repository extensions, while for the
default Repository class, it is ignored.

When you type `npx olojs init`, this method will be called.  

When you type `npx olojs init my-repo-template opt1=val1 opt2=val2 ...`, the
repository returned by `require(my-repo-template)` will be called with the
options passed via the command line.


### environment = repository.getEnvironment()
Returns the olojs environment bound to the repository. 

By default, this is the object exported by the `olonv.js` module contained in
the `repository.rootPath`.

This environment is used by `npx olojs render <path>` to render the document
at `documents/<path>`.


### environment = repository.getHttpServer()
Returns the http server to be used by `npx init serve [port]` to serve the
repository environment via HTTP.

By default the server is an [HTTPServer](./http-server.md) instance, created 
with the parameters defined in `repository.getEnvironment().httpOptions`. 
