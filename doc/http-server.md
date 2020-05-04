### new BackendEnvironment(config)
Besides the properties required by the `Environment` constructor, this
`config` object should also contain:
- `config.publicPath`: the path containing the `index.html` served to browsers on `GET /` requests
- `config.allow`: a function that takes an epress request object as input and returns 
  a boolean to allow (true) or deny (false) the request
  
### BackendEnvironment.prototype.serve(port)
Create an HTTP server that behaves as follows:
- on `GET *` requests accepting only `text/olo` media, sends the result of `this.readDocument(path)`
- on `PUT *` requests accepting only `text/olo` media, calls `this.writeDocument(path, body)`
- on `DELETE *` requests accepting only `text/olo` media, calls `this.deleteDocument(path)`
- on each operation accepting only `text/olo` media, sends 403 if `this.allow(req)` returns false
- on `GET /` requests sends the `index.html` file contained in `this.publicPath`
  

