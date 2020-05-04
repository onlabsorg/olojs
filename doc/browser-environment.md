# BrowserEnvironment class
This class extends the [Environment](./environment.md) class in order to
create and olojs environment suitable for browsers.
  
### new BrowserEnvironment(origin, headers)
This environment creates three stores:
- `/`: backed by the http store under `origin`
- `http://`: generic http reader
- `https://`: generic https reader
The root http reader `/` adds the passed headers to every request

The environment globals contain a `require` function that loads the
[olojs standard library](./stdlib.md) modules.
  
### BrowserEnvironment.stringifyDocumentExpression(value)
This method stringifies and sanitizes an expression value.
  
### BrowserEnvironment.parseURI(uri)
Given an uri in the form `path?var1=val1&var2=val2&...`, returns
a the path and the parameters namespace as a pair [docPath, argns]
  

