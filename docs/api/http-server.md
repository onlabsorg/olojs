olojs.servers.http
============================================================================
Functions that creates an http server exposing an olojs environment via HTTP.

```js
server = olojs.servers.http(environment, options)
server.listen(8010, callback);
```
- `environment` is a valid olojs environment.
- `options.publicPath` indicates the location of the public path, which is 
  useful if you want to create your own web UI for rendering the documents
- `server` is a nodejs http.Server instance
  
On `GET /env/paht/to/doc` requsts it will respond with the source of the 
document loaded via `environment.readDocument("/path/to/doc")`.
  
On `GET /` requsts it will respond with a single page application that 
loads and fetches the document mapped to the hash.

On `PUT /env/paht/to/doc` requsts it will execute the 
`environment.writeDocument("/path/to/doc", body)` method.

On `DELETE /env/paht/to/doc` requsts it will execute the 
`environment.deleteDocument("/path/to/doc", body)` method.
  
olojs.servers.http.Middleware
============================================================================
Creates an express middleware that exposes a RESTFul API to interact with an
olojs environment via HTTP.

```js
middleware = olojs.servers.http.Middleware(environment)
expressApp.use(mountPath, middleware);
```
- On `GET /env/paht/to/doc` requsts it will respond with the source of the 
  document loaded via `environment.readDocument("/path/to/doc")`.
- On `PUT /env/paht/to/doc` requsts it will execute the 
  `environment.writeDocument("/path/to/doc", body)` method.
- On `DELETE /env/paht/to/doc` requsts it will execute the 
  `environment.deleteDocument("/path/to/doc", body)` method.
  

