olojs.protocols.fs
============================================================================
This protocol handles read/write operations on the local file system. It
differs from the `file` protocol in that it returns a directory content
in case of get requests of paths ending with a `/`.
  
olojs.protocols.fs.get
----------------------------------------------------------------------------
Retrieves a `.olo` file given its absolute path. If the path ends with a
'/' returns a document containing info about the directory content.
```js
const source = await olojs.protocols.fs.get("/path/to/doc");
```

- When requesting `/path/to/doc`, the content of `/path/to/doc.olo` will
  be returned
- When requesting a file that doesn't exist, and empty string will be returned
- When requesting `/path/to/dir/`, it returns a document whose namespace
  contains a `children` list of the contained .olo document names (without
  entension) and of the contained directory (with trailing `/`). 

For example, if the directory `/path/to/dir/` contains the documents
`doc1.olo` `file.txt` and `doc2.olo` and two directories `dir1` and `dir2`, 
the returned document will contain the following swan expression:

```
<% children = ["dir1/", "dir2/", "doc1", "doc2"] %>
```
  
olojs.protocols.fs.set
----------------------------------------------------------------------------
Modifies the content of a `.olo` file given its absolute path. If the path
ends with a `/` it throws an error.
```js
await olojs.protocols.fs.set("/path/to/doc", source);
```

- If path is `/path/to/doc`, the content of `/path/to/doc.olo` will
  be modified
- When the file that doesn't exist, it will be created
- If path is `/path/to/dir/`, it throws an `OperationNotAllowed` error
  
olojs.protocols.fs.delete
----------------------------------------------------------------------------
Deletes a `.olo` file given its absolute path. If the path ends with a `/`,
it throws an error.
```js
await olojs.protocols.fs.delete("/path/to/doc");
```

- If path is `/path/to/doc`, the file `/path/to/doc.olo` will be deleted
- When the file that doesn't exist, it will return silently
- If path is `/path/to/dir/`, it trows an `OperationNotAllowed` error.
  

