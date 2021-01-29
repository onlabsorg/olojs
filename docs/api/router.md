Router
============================================================================
This store is a container for other stores and routes the `read`, `list`,
`write` and `delete` requests to the store best matching the path.
```js
router = new Router({
    "/path/to/store_1/": store_1,
    "/path/to/store_2/": store_2,
    ...
})
```
- Each `"/path/to/store_i":store_i` parameter is a mount point. All the
  `read`, `list` `write` and `delete` calls to paths like
  `/path/to/store_i/sub/path/to/doc` will be redirected to `store_i` after
  reducing the path to `/sub/path/to/doc`.
- `router` is an [olojs.Store](./store.md) object
  
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
  

