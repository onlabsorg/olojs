# http-store module
This module exposed the HTTPStore class.

  
### store = new HTTPStore(host, options)

###### store
A client store that interfaces with a backend store via the following HTTP
methods:
- GET (store.read)
- PUT (store.write)
- DELETE (store.delete)

###### host
The url of the remote store. It will be prepended to each operation path 
parameter.

###### options.decorateHttpRequest
A function that accepts the request being sent and decorates it. If it exists,
it will be called before sanding any request to the server. This option can
be used, for example, to add required authorization headers to the request.


### HTTPStore.prototype.read(path)
Sends a HTTP `GET path` request to `this.host` and returns the response.
Incase of 403 response code, throws `HTTPStore.ReadAccessDeniedError`.
  

### HTTPStore.prototype.write(path, source)
Sends a HTTP `PUT path` request with `source` as body to `this.host` 
and resolves on 200 or 201 response code or rejects on error response code.
Incase of 403 response code, throws `HTTPStore.WriteAccessDeniedError`.

  
### HTTPStore.prototype.delete(path)
Sends a HTTP `DELETE path` request to `this.host` and resolves 
on 200 or 201 response code or rejects or error response code.
Incase of 403 response code, throws `HTTPStore.WriteAccessDeniedError`.

  
