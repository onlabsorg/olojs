FileStore
============================================================================
This store handles read/write operations on the local file system.
```js
fileStore = new FileStore(rootPath)
```

- `rootPath` is the base path that will be prepended to the paths passed to
  the `get`, `set` and `delete` methods.
- `fileStore` is an object that exposes the standard olojs store API: `get`,
  `set` and `delete`.
  
fileStore.get - async method
----------------------------------------------------------------------------
Retrieves a `.olo` file given its absolute path.
```js
const source = await fileStore.get("/path/to/doc");
```

- When requesting `/path/to/doc`, the content of `/path/to/doc.olo` will
  be returned
- When requesting `/path/to/dir/`, the content of `/path/to/dir/.olo` will
  be returned
- When requesting a file that doesn't exist, and empty string will be returned
  
fileStore.set - async method
----------------------------------------------------------------------------
Modifies the content of a `.olo` file given its absolute path.
```js
await fileStore.set("/path/to/doc", source);
```

- If path is `/path/to/doc`, the content of `/path/to/doc.olo` will
  be modified with the passed source
- If path is `/path/to/dir/`, the content of `/path/to/dir/.olo` will
  be modified with the passed source
- When the file that doesn't exist, it will be created
  
fileStore.delete - async method
----------------------------------------------------------------------------
Deletes a `.olo` file given its absolute path.
```js
await fileStore.delete("/path/to/doc");
```

- If path is `/path/to/doc`, the file `/path/to/doc.olo` will be deleted
- If path is `/path/to/dir/`, the file `/path/to/dir/.olo` will be deleted
- When the file that doesn't exist, it will return silently
  

