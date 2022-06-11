<!--<% __render__ = require 'markdown' %>-->
Router
============================================================================
This store is a container for other stores and routes the `read`, `write`
and `delete` requests to the store best matching the path.
```js
routes = {
    "/path/to/store_1/": store_1,
    "/path/to/store_2/": store_2,
    ...
};
router = new Router(routes);
```
Every time a `read`, `write` or `delete` method is called on a `path`, the 
router delegates to the corresponding method of the store matching the path. 
For example, with reference to the router declaration above:
- `router.read('/path/to/store_1/path/to/doc')` will result in a call to
  `store_1.read('/path/to/doc')`
- `router.read('/path/to/store_2/path/to/doc')` will result in a call to
  `store_2.read('/path/to/doc')`

If no match is found, it will behave as empty store, which is: `read` will
return an empty string, `write` and `delete` will throw a 
`WriteOperationNotAllowed` error.

The constructor will ignore the properties of the `routes` object which are
not valid stores (i.e. objects that do not have any of the methods
`read`, `write` or `delete`).
The easiest way to create a valid store is by extending the
[Store](./store.md) class.

URI-like paths `xxx:/path/to/doc` are treated as shortcuts to the
path `/.schemes/xxx/path/to/doc`.

> Router inherits from the [Store](./store.md) class and overrides the
> methods described below.
  
async router.read: String path -> String source
------------------------------------------------------------------------
Retrieves an olo-document from the matching sub-store.
```js
router = new Router({
    "/path/to/store_1/": store_1,
    "/path/to/store_2/": store_2,
    ...
})
source = await router.read("/path/to/store_i/sub/path/to/doc");
```
- When requesting `/path/to/store_i/sub/path/to/doc`, it returns
  `await store_i.read('/sub/path/to/doc')`.
- When no store is mounted on `/path/to/store_i/`, it returns an empty
  string
  
async router.write: (String path, String source) -> undefined
------------------------------------------------------------------------
Modifies an olo-document contained in the matching sub-store.
```js
router = new Router({
    "/path/to/store_1/": store_1,
    "/path/to/store_2/": store_2,
    ...
})
await router.write("/path/to/store_i/sub/path/to/doc", source);
```
- When `/path/to/store_i/sub/path/to/doc` is passed, it calls
  `await store_i.write('/sub/path/to/doc', source)`.
- When no store is mounted on `/path/to/store_i`, it throws a
  `Router.WriteOperationNotAllowedError`.
  
async router.delete: String path -> undefined
------------------------------------------------------------------------
Deletes an olo-document contained in the matching sub-store.
```js
router = new Router({
    "/path/to/store_1/": store_1,
    "/path/to/store_2/": store_2,
    ...
})
await router.delete("/path/to/store_i/sub/path/to/doc");
```
- When `/path/to/store_i/sub/path/to/doc` is passed, it calls
  `await store_i.delete('/sub/path/to/doc')`.
- When no store is mounted on `/path/to/store_i/`, it throws a
  `Router.WriteOperationNotAllowedError`.
  

