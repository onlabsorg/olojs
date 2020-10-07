# olojs.protocols
Protocols are function that map a path to a document source. They are passed
as parameters to the [Environment](./environment.md) constructor to define
the environment ways of retrieving documents.

Four protocols are predefined in olojs: `file:`, `http:`, `https:`, `null:`. The
`file:` protocol is not available in the browser version of olojs.


### olojs.protocols.file
Returns a .olo document from the local filesystem.

For example,

```js
await olojs.protocols.file('/home/username/path/to/doc');
```

will return the text content of `/home/username/path/to/doc.olo`.

Consistently, a directory path like `/home/username/path/to/dir/` will return
the content of the document `/home/username/path/to/dir/.olo`.

If the requested file doesn't exist, it will return and empty string;


### olojs.protocols.https
Returns the response body of a HTTPS GET <uri> request.

For example,

```js
await olojs.protocols.http("/raw.githubusercontent.com/onlabsorg/olojs/master/docs/api/protocols.md")
```

will return the content of this document.

If the request resolves with a `404` code, and empty string will be returned.


### olojs.protocols.http
Returns the response body of a HTTP GET <uri> request, same as the `https` 
protocol for HTTPS GET requests.


### olojs.protocols.null
Maps an empty string to any path.
