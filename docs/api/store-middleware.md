StoreMiddleware
============================================================================
Creates an express middleware that exposes a RESTFul API to interact with an
olojs environment via HTTP.

```js
middleware = olojs.servers.http.Middleware(environment)
expressApp.use(mountPath, middleware);
```
- On `GET /env/paht/to/doc` requsts accepting `text/*`, it will respond with 
  the source of the document loaded via `environment.readDocument("/path/to/doc")`.
- On `GET /env/paht/to/doc` requsts accepting `application/json`, it will 
  respond with the JSON-serialized array returned by 
  `environment.listEntries("/path/to/doc")`.
- On `GET /env/paht/to/doc` requsts accepting neither `text/*` nor
  `application/json`, it will respond with a `415` error code.
- On `PUT /env/paht/to/doc` requsts it will execute the 
  `environment.writeDocument("/path/to/doc", body)` method.
- On `DELETE /env/paht/to/doc` requsts it will execute the 
  `environment.deleteDocument("/path/to/doc", body)` method.
  

