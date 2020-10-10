olojs.protocols.http & olojs.protocols.https
============================================================================
This protocol handles read/write operations on remote olo-documents
via HTTP(S).
  
olojs.protocols.http.get & olojs.protocols.https.get
------------------------------------------------------------------------
Retrieves a remote olo-document via HTTP GET (HTTPS GET).

```js
const source = await olojs.protocols.http.get("//hostname/path/to/doc")
```

- On 200 status code, returns the response body as string
- On 403 status code, throws a PermissionDenied error
- On 404 status code, return an empty string
- On 405 status code, throws an OperationNotAllowed error
- On any other status code, throws a generic error
  
olojs.protocols.http.set & olojs.protocols.https.set
------------------------------------------------------------------------
Modifies a remote olo-document via HTTP PUT (HTTPS PUT).

```js
await olojs.protocols.http.set("//hostname/path/to/doc", source)
```

- On 200 and 201 status code, returns
- On 403 status code, throws a PermissionDenied error
- On 405 status code, throws an OperationNotAllowed error
- On any other status code, throws a generic error
  
olojs.protocols.http.delete & olojs.protocols.https.delete
------------------------------------------------------------------------
Modifies a remote olo-document via HTTP DELETE (HTTPS DELETE).

```js
await olojs.protocols.http.delete("//hostname/path/to/doc")
```

- On 200 status code, returns
- On 403 status code, throws a PermissionDenied error
- On 405 status code, throws an OperationNotAllowed error
- On any other status code, throws a generic error
  

