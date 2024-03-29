HTTPServer - module
============================================================================
The `HTTPServer` module contains functions for serving olojs documents over
HTTP.
  

HTTPServer.create: Store -> http.Server
----------------------------------------------------------------------------
Creates a HTTP Server that mounts a `store middleware` at `/`.
```js
server = HTTPServer.create(store);
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
  


