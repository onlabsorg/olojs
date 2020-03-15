# Environment configuration script

An olojs environment created on you local computer via `olojs init` or via
`OloJS.prototype.init`, should contain a configuration script named `olonv.js`.

This script should return an environment object with a set of standard 
methods attached. The required methods are described below.

An easy way to create a valid environment configuration script is to
return and instance of [BackendEnvironment](./backend-environment.md).


### exports.readDocument(path)
This is any function that takes a path as input and returns an olo-document
source text.


### exports.writeDocument(path, source)
This is a function that takes a path and an olo-document source as input and
modifies the source paired to the given path.
This means that the next time `readDocument(path)` is called, it will return
the new source.


### exports.deleteDocument(path)
This is a function that takes a path as input and removed the paired document
from the environment;
This means that the next time `readDocument(path)` is called, it will return
an empty string.


### exports.serve(port)
This is any function that starts a server that behaves as folows:
- on `GET *` requests accepting only `text/olo` media, sends the result of `this.readDocument(path)`
- on `PUT *` requests accepting only `text/olo` media, calls `this.writeDocument(path, body)`
- on `DELETE *` requests accepting only `text/olo` media, calls `this.deleteDocument(path)`
- on `GET /` requests sends an `html` document that will handle the browser-server interaction
