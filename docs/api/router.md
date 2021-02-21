Router
============================================================================
This store is a container for other stores and routes the `read`, `list`,
`write` and `delete` requests to the store best matching the path.
```js
routes = {
    "/path/to/store_1/": store_1,
    "/path/to/store_2/": store_2,
    ...
};
protocols = {
    "ppp1": protocol_store_1,
    "ppp2": protocol_store_2,
    ...
};
router = new Router(routes, protocols);
```
Every time a `read`, `list`, `write`, `delete` or `deleteAll` method is
called on a `path`, the store delegates to the corresponding method of
the store matching the path or its uri scheme. For example, with reference
to the router declaration above:
- `router.read('/path/to/store_1/path/to/doc')` will result in a call to
  `store_1.read('/path/to/doc')`
- `router.read('/path/to/store_2/path/to/dir')` will result in a call to
  `store_2.read('/path/to/doc')`
- `router.read('ppp1:/path/to/doc')` will result in a call to
  `protocol_store_1.read('/path/to/doc')`
- `router.read('ppp2:/path/to/doc')` will result in a call to
  `protocol_store_2.read('/path/to/doc')`
If no match is found, it will behave as empty store.

The constructor will ignore the following routes/protocols:
- The properties of the `routes` object which are not instance of Store
- The properties of the `protocols` object which are not instance of Store
- The properties of the `protocols` object whose key is not a valid URI scheme
  
router.read - async method
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
  `await store_i.read('/sub/path/to/doc').
- When no store is mounted on `/path/to/store_i/`, it returns an empty
  string
  
router.list - async method
------------------------------------------------------------------------
Returns the list of entry names under the passed path, considering all
the mount points.
```js
router = new Router({
    "/path/to/": store0,
    "/path/to/a/s1": store1,
    "/path/to/b/s2": store2,
    "/path/to/s3": store3
});
entries = await router.list("/path/to");
```
In the given example, the array `entries` will contain `["a/", "b/",
"s2"]`, plus all the items returned by `await store0.list("/")`.
If no mounted stores matches the given path, then an empty array is
returned.
  
router.write - async method
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
  
router.delete - async method
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
  
router.deleteAll - async method
------------------------------------------------------------------------
Deletes an olo-document contained in the matching sub-store.
```js
router = new Router({
    "/path/to/store_1/": store_1,
    "/path/to/store_2/": store_2,
    ...
})
await router.deleteAll("/path/to/store_i/sub/path/to/doc");
```
- When `/path/to/store_i/sub/path/to/doc` is passed, it calls
  `await store_i.deleteAll('/sub/path/to/doc')`.
- When no store is mounted on `/path/to/store_i/`, it throws a
  `Router.WriteOperationNotAllowedError`.
  

