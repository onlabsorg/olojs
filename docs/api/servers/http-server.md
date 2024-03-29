  

HTTPServer - module
============================================================================
The `HTTPServer` module contains functions for serving olojs documents over
HTTP.
  

  

HTTPServer.createServer: Store -> http.Server
----------------------------------------------------------------------------
Creates a HTTP Server that mounts a `store middleware` at `/`.
  

```js
server = HTTPServer.createServer(store);
server.listen(8010);
```
  

  

HTTPServer.createMiddleware: Store -> express.Router
----------------------------------------------------------------------------
Creates an express middleware that exposes a RESTFul API to interact with an
olojs store via HTTP.
  

```js
middleware = HTTPServer.createMiddleware(store);
expressApp.use(mountPath, middleware);
```
  

- On `GET /paht/to/doc` requests accepting `text/*`, it will respond with
  the source of the document loaded via `store.read("/path/to/doc")`.
- On `GET /paht/to/doc` requests accepting other than `text/*` it will
  respond with a `415` error code.
- The `GET` handler, on store's `ReadPermissionDeniedError` will
  respond with the status code 403.
- The `GET` handler, on store's `ReadOperationNotAllowedError` will
  respond with the status code 405.
- The `GET` handler, on any other error will respond with the status code 500.
  

- On `PUT /paht/to/doc` it will modify the document via `store.write("/path/to/doc", body)`.
- The `PUT` handler, on store's `WritePermissionDeniedError` will
  respond with the status code 403.
- The `PUT` handler, on store's `WriteOperationNotAllowedError` will
  respond with the status code 405.
- The `PUT` handler, on any other error will respond with the status code 500.
  

- On `DELETE /paht/to/doc` it will remove the document via `store.delete("/path/to/doc")`.
- The `DELETE` handler, on store's `WritePermissionDeniedError` will
  respond with the status code 403.
- The `DELETE` handler, on store's `WriteOperationNotAllowedError` will
  respond with the status code 405.
- The `DELETE` handler, on any other error will respond with the status code 500.
  


