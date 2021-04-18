HTTPServer - module
============================================================================
The `HTTPServer` module contains functions for creating HTTP servers exposing
a RESTful interface to a `Store` object. It also allows to serve the documents
as HTML pages.

```js
olojs = require('@onlabsorg/olojs');
HTTServer = olojs.HTTPServer;
```
  
HTTPServer.StoreMiddleware - function
----------------------------------------------------------------------------
Creates an express middleware that exposes a RESTFul API to interact with an
olojs store via HTTP.
```js
middleware = HTTPServer.StoreMiddleware(store)
expressApp.use(mountPath, middleware);
```
- On `GET /paht/to/doc` requests accepting `text/*`, it will respond with
  the source of the document loaded via `store.read("/path/to/doc")`.
- On `GET /paht/to/doc` requests accepting `application/json`, it will
  respond with the JSON-serialized array returned by
  `store.list("/path/to/doc")`.
- On `GET /paht/to/doc` requests accepting neither `text/*` nor
  `application/json`, it will respond with a `415` error code.
- On `PUT /paht/to/doc` requests it will execute the
  `store.write("/path/to/doc", body)` method.
- On `DELETE /paht/to/doc` requests it will execute the
  `store.delete("/path/to/doc")` method.
- On `DELETE /paht/to/doc` requests accepting a `text/directory` MimeType, 
  it will execute the `store.deleteAll("/path/to/doc")` method.
- The `GET` handler, on store's `ReadPermissionDeniedError` will
  respond with the status code 403
- The `GET` handler, on store's `ReadOperationNotAllowedError` will
  respond with the status code 405
- The `PUT` and `DLETE` handlers, on store's `WritePermissionDeniedError`
  will respond with the status code 403
- The `PUT` and `DELETE` handlers, on store's `WriteOperationNotAllowedError`
  will respond with the status code 405
  
HTTPServer.ViewerMiddleware - function
----------------------------------------------------------------------------
Creates an express middleware that serves an olojs document viewer app.

```js
middleware = HTTPServer.ViewerMiddleware(storeURL)
expressApp.use(mountPath, middleware);
```

- `storeURL` is the URL of an HTTP store from which the client will load the
  documents to be rendered. If `storeURL` is a relative URL, the store
  HTTP request will be sent to the same server that mounts the `ViewerMiddleware`
- `middleware` is the express middleware that servers the viewer app on
  `GET /` requests.

The viewer app, in the browsers, will load from `HTTPStore(storeURL)` the
document with id defined by the URL fragment (e.g. `/#/path/to/doc`),
evaluate it, render it, sanitize it and inject it in the DOM.
  
HTTPServer.createServer - function
----------------------------------------------------------------------------
This function takes an olojs Store as input and returns a HTTP server that 
mounts a `StoreMiddleware` on `/docs` and a `ViewerMiddleware` at `/`.

```js
server = HTTPServer.createServer(store, options)
```

- `store` is the olojs `Store` instance that will be served via the 
  `StoreMiddleware`
- `options.storePath` is the store mounting path (defaults to `/docs`)
- `server` is the HTTP server that serves the store on `/<options.storePath>/path/to/doc`
  requests and the viewer on `/#/path/to/doc` requests
  

