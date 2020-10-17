HTTPStore
============================================================================
This store handles read/write operations on remote olo-documents
via HTTP(S).
```js
httpStore = new HTTPStore(rootURL, options)
```

- `rootURL` is the base URL that will be prepended to the paths passed to
  the `get`, `set` and `delete` methods.
- `options.headers` are custom headers that will be added to every HTTP
  request.
- `httpStore` is an object that exposes the standard olojs store API: `get`,
  `set` and `delete`.
  
HTTPStore.prototype.get - async method
------------------------------------------------------------------------
Retrieves a remote olo-document via HTTP GET (HTTPS GET).

```js
const source = await httpStore.get("/path/to/doc")
```

- On 200 status code, returns the response body as string
- On 403 status code, throws a PermissionDenied error
- On 404 status code, return an empty string
- On 405 status code, throws an OperationNotAllowed error
- On any other status code, throws a generic error
  
HTTPStore.prototype.set - async method
------------------------------------------------------------------------
Modifies a remote olo-document via HTTP PUT (HTTPS PUT).

```js
await httpStore.set("/path/to/doc", source)
```

- On 200 and 201 status code, returns
- On 403 status code, throws a PermissionDenied error
- On 405 status code, throws an OperationNotAllowed error
- On any other status code, throws a generic error
  
HTTPStore.prototype.delete - async method
------------------------------------------------------------------------
Modifies a remote olo-document via HTTP DELETE (HTTPS DELETE).

```js
await httpStore.delete("/path/to/doc")
```

- On 200 status code, returns
- On 403 status code, throws a PermissionDenied error
- On 405 status code, throws an OperationNotAllowed error
- On any other status code, throws a generic error
  

