# HTTPStore class
This class provides an interface to an HTTP file server.
The methods of an HTTPStore instance work out-of the box with a 
[BackendEnvironment](./backend-environment.md) server.
  
### new HTTPStore(host)
The parameter is the base URL that will be prepended to all 
HTTP requests.
  
### HTTPStore.prototype.read(path)
Sends a HTTP `GET path` request to `this.host` and returns the response.
Incase of 403 response code, throws `HTTPStore.ReadAccessDeniedError`.
  
### HTTPStore.prototype.write(path, source)
Sends a HTTP `PUT path` request with `source` as body to `this.host` 
and resolves on 200 or 201 response code or rejects on error response code.
Incase of 403 response code, throws `HTTPStore.WriteAccessDeniedError`.
  
### HTTPStore.prototype.write(path, source)
Sends a HTTP `POST path` request with `source` as body to `this.host` 
and resolves on 200 or 201 response code or rejects on error response code.
Incase of 403 response code, throws `HTTPStore.WriteAccessDeniedError`.
  
### HTTPStore.prototype.delete(path)
Sends a HTTP `DELETE path` request to `this.host` and resolves 
on 200 or 201 response code or rejects or error response code.
Incase of 403 response code, throws `HTTPStore.WriteAccessDeniedError`.
  
### FSStore.createReader(host)
Returns the `HTTPStore.prototype.read` function bound to the given `host`.
  

