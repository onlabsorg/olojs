<!--<% __render__ = require 'markdown' %>-->
HTTPStore
============================================================================
This store handles read/write operations on remote olo-documents
via HTTP(S).
```js
httpStore = new HTTPStore(rootURL, options)
```
- `rootURL` is the base URL that will be prepended to the paths passed to
  the `read`, `write` and `delete` methods.
- `options.headers` are custom headers that will be added to every HTTP
  request.
- `options.extension` is a custom file extension to be appended to the path
  of each `read`, `write` and `delete` request.
- `httpStore` is a [olojs.Store](./store.md) object

> HTTPStore inherits from the [Store](./store.md) class and overrides the
> methods described below.
  
async httpStore.read: String path -> String source
------------------------------------------------------------------------
Retrieves a remote olo-document via HTTP GET (HTTPS GET).
```js
source = await httpStore.read("/path/to/doc")
```
- On 200 status code, returns the response body as string
- On 403 status code, throws a `HTTPStore.ReadPermissionDeniedError`
- On 404 status code, return an empty string
- On 405 or 501 status code, throws a `HTTPStore.ReadOperationNotAllowedError`
- On any other status code, throws a generic error
  
async httpStore.write: (String path, String source) -> undefined
------------------------------------------------------------------------
Modifies a remote olo-document via HTTP PUT (HTTPS PUT).
```js
await httpStore.write("/path/to/doc", source)
```
- On 200 and 201 status code, returns
- On 403 status code, throws a `HTTPStore.WritePermissionDeniedError`
- On 405 or 501 status code, throws a `HTTPStore.WriteOperationNotAllowedError`
- On any other status code, throws a generic error
  
async httpStore.delete: String path -> undefined
------------------------------------------------------------------------
Removes a remote olo-document via HTTP DELETE (HTTPS DELETE).
```js
await httpStore.delete("/path/to/doc")
```
- On 200 status code, returns
- On 403 status code, throws a `HTTPStore.WritePermissionDeniedError`
- On 405 or 501 status code, throws a `HTTPStore.WriteOperationNotAllowedError`
- On any other status code, throws a generic error
  

