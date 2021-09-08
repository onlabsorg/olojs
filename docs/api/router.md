Router
============================================================================
This store is a container for other stores and routes the `read`, `list`,
`write`, `delete` and `deleteAll` requests to the store best matching the 
path.

```js
routes = {
    "/path/to/store_1/": store_1,
    "/path/to/store_2/": store_2,
    ...
};

router = new Router(routes);
```

Every time a `read`, `list`, `write`, `delete` or `deleteAll` method is
called on a `path`, the router delegates to the corresponding method of
the store matching the path. For example, with reference to the router 
declaration above:

- `router.read('/path/to/store_1/path/to/doc')` will result in a call to
  `store_1.read('/path/to/doc')`
- `router.read('/path/to/store_2/path/to/doc')` will result in a call to
  `store_2.read('/path/to/doc')`

If no match is found, it will behave as empty store, which is: `read` will
return an empty string, `list` will return an empty array, `write`,
`delete` and `deleteAll` will throw a `WriteOperationNotAllowed` error.

The constructor will ignore the properties of the `routes` object which are 
not valid stores, that is objects that do not have any of the methods 
`read`, `list`, `write`, `delete`, `deleteAll`, `createContext`.
The easiest way to create a valid store is by extending the 
[Store](./store.md) class.
  
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
  `await store_i.read('/sub/path/to/doc')`.
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

If no mounted store matches the given path, then an empty array is
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
Deletes all the documents matching the given path.

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
  
router.createContext - method
------------------------------------------------------------------------
Return the matching sub-store context bound to the current router.

```js
router = new Router({
    "/path/to/store_1/": store_1,
    "/path/to/store_2/": store_2,
    ...
})

await router.createContext("/path/to/store_i/sub/path/to/doc");
```

- When `/path/to/store_i/sub/path/to/doc` is passed, it calls
  `await store_i.createContext('/path/to/store_i/sub/path/to/doc')`.
- When no store is mounted on `/path/to/store_i/`, it falls back to the 
  `Store` context.
  

