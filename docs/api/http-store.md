HTTPStore
============================================================================
This store handles read/write operations on remote olo-documents
via HTTP(S).
```js
httpStore = new HTTPStore(rootURL, options)
```
- `rootURL` is the base URL that will be prepended to the paths passed to
  the `read`, `list`, `write` and `delete` methods.
- `options.headers` are custom headers that will be added to every HTTP
  request.
- `httpStore` is a [olojs.Store](./store.md) object
  
httpStore.read - async method
------------------------------------------------------------------------
Retrieves a remote olo-document via HTTP GET (HTTPS GET).
```js
source = await httpStore.read("/path/to/doc")
```
- On 200 status code, returns the response body as string
- On 403 status code, throws a `HTTPStore.ReadPermissionDeniedError`
- On 404 status code, return an empty string
- On 405 status code, throws a `HTTPStore.ReadOperationNotAllowedError`
- On any other status code, throws a generic error
  
httpStore.list - async method
------------------------------------------------------------------------
Retrieves a remote directory content via an HTTP GET requests that
accepts only JSON as response.
```js
entries = await httpStore.list("/path/to/doc")
```
- On 200 status code, returns the response body as json array
- On 403 status code, throws a `HTTPStore.ReadPermissionDeniedError`
- On 404 status code, return an empty array
- On 405 status code, throws a `HTTPStore.ReadOperationNotAllowedError`
- On any other status code, throws a generic error
  
httpStore.write - async method
------------------------------------------------------------------------
Modifies a remote olo-document via HTTP PUT (HTTPS PUT).
```js
await httpStore.write("/path/to/doc", source)
```
- On 200 and 201 status code, returns
- On 403 status code, throws a `HTTPStore.WritePermissionDeniedError`
- On 405 status code, throws a `HTTPStore.WriteOperationNotAllowedError`
- On any other status code, throws a generic error
  
httpStore.delete - async method
------------------------------------------------------------------------
Modifies a remote olo-document via HTTP DELETE (HTTPS DELETE).
```js
await httpStore.delete("/path/to/doc")
```
- On 200 status code, returns
- On 403 status code, throws a `HTTPStore.WritePermissionDeniedError`
- On 405 status code, throws a `HTTPStore.WriteOperationNotAllowedError`
- On any other status code, throws a generic error
  
httpStore.deleteAll - async method
------------------------------------------------------------------------
Modifies a remote `text/direcotry` resource via HTTP DELETE (HTTPS DELETE).
```js
await httpStore.deleteAll("/path/to/dir")
```
- On 200 status code, returns
- On 403 status code, throws a `HTTPStore.WritePermissionDeniedError`
- On 405 status code, throws a `HTTPStore.WriteOperationNotAllowedError`
- On any other status code, throws a generic error
  

