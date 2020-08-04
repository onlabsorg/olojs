# HTTPServer
Create an HTTP server that exposes a RESTfull environment API:

```js
server = HTTPServer(environment, [options])
```

Once started, the server reacts as follows to the HTTP reqeusts: 
- on `HTTP GET` serves the result of `environment.readDocument(req.path)`,
  if the client accepts `text/olo`, otherwise serves the static files 
  contained in the public directory.
- on `HTTP PUT` runs `environment.deleteDocument(req.path, req.body)`, if
  the client accepts `text/olo` 
- on `HTTP DELETE` runs `environment.deleteDocument(path)`, if the client
  accepts `text/olo` 
  

The `options` object may contain one or more of the following properties:
- `options.before` express middleware, which gets to handle the request
  first (e.g. in order to implement authentication/authroization). 
- `options.after` expression middleware, which gest to handle the request
  as second to last, just before the static server middleware
- `options.public` path of a custom public directory

> The default public directory index contains a single page application
> which loads and renders in the browser the document at `#/path/to/doc`
  
