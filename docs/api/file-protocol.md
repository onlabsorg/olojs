olojs.protocols.file
============================================================================
This protocol handles read/write operations on the local file system.
  
olojs.protocols.file.get
----------------------------------------------------------------------------
Retrieves a `.olo` file given its absolute path.
```js
const source = await olojs.protocols.file.get("/path/to/doc");
```

- When requesting `/path/to/doc`, the content of `/path/to/doc.olo` will
  be returned
- When requesting `/path/to/dir/`, the content of `/path/to/dir/.olo` will
  be returned
- When requesting a file that doesn't exist, and empty string will be returned
  
olojs.protocols.file.set
----------------------------------------------------------------------------
Modifies the content of a `.olo` file given its absolute path.
```js
await olojs.protocols.file.set("/path/to/doc", source);
```

- If path is `/path/to/doc`, the content of `/path/to/doc.olo` will
  be modified
- If path is `/path/to/dir/`, the content of `/path/to/dir/.olo` will
  be modified
- When the file that doesn't exist, it will be created
  
olojs.protocols.file.delete
----------------------------------------------------------------------------
Deletes a `.olo` file given its absolute path.
```js
await olojs.protocols.file.delete("/path/to/doc");
```

- If path is `/path/to/doc`, the file `/path/to/doc.olo` will be deleted
- If path is `/path/to/dir/`, the file `/path/to/dir/.olo` will be deleted
- When the file that doesn't exist, it will return silently
  

