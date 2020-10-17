RouterStore
============================================================================
This store is a container for other stores and routes the `get`, `set` and
delete requests to the store matching the path.
```js
router = new RouterStore({name1:store1, name2:store2, ...})
```

- Each `name_i:store_i` parameter is a mount point. All the `get`, `set` and
  delete calls to paths like `/name_i/path/to/doc` will be rerouted to
  `store_i` after reducing the path to `/path/to/doc`.
- `router` is an object that exposes the standard olojs store API: `get`,
  `set` and `delete`.
  
router.get - async method
----------------------------------------------------------------------------
Retrieves an olo-document from the matching sub-store.
```js
const source = await router.get("/name_i/path/to/doc");
```

- When requesting `/store_i/path/to/doc`, the request will be forwarded
  to the store mounted on `/store_i`, with path `/path/to/doc`
- When no store is mounted on `/store_i`, it returns an empty string
- When requesting `/`, it returns a document whose namespace contains a 
  `children` list of the mounted store names, followed by a `/`.
  
router.set - async method
----------------------------------------------------------------------------
Modifies an olo-document contained in the matching sub-store.
```js
await router.set("/name_i/path/to/doc", source);
```

- When passing `/store_i/path/to/doc`, the request will be forwarded
  to the store mounted on `/store_i`, with path `/path/to/doc`
- When no store is mounted on `/store_i`, it throws an `OperationNotAllowed`
  error.
- When path is the root path `/`, it throws an `OperationNotAllowed`
  error.
  
router.delete - async method
----------------------------------------------------------------------------
Deletes an olo-document contained in the matching sub-store.
```js
await router.delete("/name_i/path/to/doc");
```

- When passing `/store_i/path/to/doc`, the request will be forwarded
  to the store mounted on `/store_i`, with path `/path/to/doc`
- When no store is mounted on `/store_i`, it throws an `OperationNotAllowed`
  error.
- When path is the root path `/`, it throws an `OperationNotAllowed`
  error.
  

