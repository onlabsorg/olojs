# HTTPServer
Create an HTTP server that exposes a RESTfull environment API:

```js
server = HTTPServer(environment, [options])
```

Once started, the server reacts as follows to the HTTP reqeusts: 
- on `HTTP GET /olors/<path>` serves the result of `environment.readDocument(path)`
- on `HTTP PUT /olors/<path>` runs `environment.deleteDocument(path, req.body)`
- on `HTTP DELETE /olors/<path>` runs `environment.deleteDocument(path)`
- on `HTTP GET /*` serves static files from the public directory
  

The `options` object may contain one or more of the following properties:
- `options.before` express middleware, which gets to handle the request
  first (e.g. in order to implement authentication/authroization). 
- `options.after` expression middleware, which gest to handle the request
  as second to last, just before the static server middleware
- `options.publicPath` path of a custom public directory

> The default public directory index contains a single page application
> which loads and renders in the browser the document at `#/path/to/doc`
  
