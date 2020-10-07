# olojs.servers
Environment servers are objects that serve the documents contained in a given 
environment over a certain transfer protocol.

By default only a `http` server is defined in `olojs`, but other servers can be
created by the community, as long as they expose the following API:

* The constructor is a function that accepts at least an `Environment` object
  as first parameter
* The server as a `.listen(port)` asynchronous method
* The server as a `.close()` asynchronous method


### olojs.servers.http
Create an HTTP server that exposes an environment content via HTTP GET:

```js
server = olojs.servers.http(environment, [options])
```

Once started, the server reacts as follows to the HTTP reqeusts: 
- on `HTTP GET /env/<path>` serves the source of `environment.loadDocument(path)`
- on `HTTP GET /*` serves static files from the public directory
  

The `options` object may contain one or more of the following properties:
- `options.publicPath` path of a custom public directory

> The default public directory index contains a single page application
> which loads and renders in the browser the document at `#/path/to/doc`
  
