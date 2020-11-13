RouterStore
============================================================================
This store is a container for other stores and routes the `get`, `list`, 
`set` and `delete` requests to the store matching the path.
```js
router = new RouterStore({
    "/path/to/store_1/": store_1, 
    "/path/to/store_2/": store_2, 
    ...
})
```

- Each `"/path/to/store_i":store_i` parameter is a mount point. All the 
  `get`, `set` `list` and `delete` calls to paths like 
  `/path/to/store_i/sub/path/to/doc` will be rerouted to `store_i` after 
  reducing the path to `/sub/path/to/doc`.
- `router` is an object that exposes the standard olojs store API: `get`,
  `list`, `set` and `delete`.
  
router.get - async method
------------------------------------------------------------------------
Retrieves an olo-document from the matching sub-store.
```js
source = await router.get("/path/to/store_i/sub/path/to/doc");
```

- When requesting `/path/to/store_i/sub/path/to/doc`, it returns
  `await store_i.get('/sub/path/to/doc'). 
- When no store is mounted on `/path/to/store_i/`, it returns an empty 
  string
  
router.list - async method
------------------------------------------------------------------------
Returns the list of entry names under the passed path, considering all
the mount points.
The following expression ...

```js
entries = await router.list("/path/to/dir/");
```

... returns an array obtained by merging the following entries:

- `await store1.list('/path/to/dir/')` if `store1` is mounted at `/`
- `await store2.list('/to/dir/')` if `store2` is mounted at `/path/`
- `await store3.list('/dir/')` if `store3` is mounted at `/path/to/`
- `await store4.list('/')` if `store4` is mounted at `/path/to/dir/`
- a `"dir_i/"` entry for each mount point like `/path/to/dir/dir_i/sub/path/`
  
router.set - async method
------------------------------------------------------------------------
Modifies an olo-document contained in the matching sub-store.
```js
await router.set("/path/to/store_i/sub/path/to/doc", source);
```

- When `/path/to/store_i/sub/path/to/doc` is passed, it calls
  `await store_i.set('/sub/path/to/doc', source). 
- When no store is mounted on `/path/to/store_i`, it throws an 
  `OperationNotAllowed` error.
  
router.delete - async method
------------------------------------------------------------------------
Deletes an olo-document contained in the matching sub-store.
```js
await router.delete("/path/to/store_i/sub/path/to/doc");
```

- When `/path/to/store_i/sub/path/to/doc` is passed, it calls
  `await store_i.delete('/sub/path/to/doc'). 
- When no store is mounted on `/path/to/store_i/`, it throws an 
  `OperationNotAllowed` error.
  

