URIStore
============================================================================
This store is a store container which maps URI schemes to stores. The `read`
method maps URIs to document source by delegating to the proper store `read`
method.
```js
uriStore = new URIStore({
    aaa: store1,
    bbb: store2
})
```
The example store above will behave as follows:
* `uriStore.read("aaa://path/to/doc")` will return `store1.read("/path/to/doc")`
* `uriStore.read("bbb://path/to/doc")` will return `store2.read("/path/to/doc")`
URI's without a scheme (simple paths) will take by default the `home` scheme;
for example, the URI '/path/to/doc' normalizes to `home://path/to/doc`. Therefore
it is convenient to pass a `home` store to the URIStore constructor.
> URIStore inherits from the [Store](./store.md) class and overrides the
> methods described below.
  

async uriStore.read: String uri -> String source
------------------------------------------------------------------------
Retrieves an olo-document from the sub-store mapped to the scheme of
the passed URI.
If the passed URI doesn't match any registered scheme, the `read` method
returns an empy string.
  

uriStore.normalizePath: String -> String
------------------------------------------------------------------------
This method takes an uri string as argument and returns its normalized
version, by:
- resolving '.', '..' and '//' and by adding a leading '/' to the path
- lower-casing the scheme
- adding the 'home:' scheme if no scheme is provided
  

uriStore.resolvePath: (String baseURI, String subPath) -> String absURI
------------------------------------------------------------------------
This method takes a base-uri string and a sub-path string as arguments
and returns a normalized absolute uri string, obtained considering
the sub-path as relative to the base-uri-path.
If sub-path is an absolute path (starting by '/'), it replaces the
base URI path.
If sub-path is an URI, it will return its normalized version.
  


