<!--<% __render__ = require 'markdown' %>-->

MemoryStore
============================================================================
This store handles read/write operations on an in-memory map object.
```js
memStore = new MemoryStore({
    "/path/to/doc1": "source of doc1",
    "/path/to/doc2": "source of doc2",
    ...
})
```

> MemoryStore inherits from the [Store](./store.md) class and overrides the 
> methods described below.
  
memStore.read - method
------------------------------------------------------------------------
Retrieves the in-memory document source mapped to the given path.
```js
const source = await memStore.read("/path/to/doc");
```

- When requesting `path/to/x/../doc`, the content of `/path/to/doc` will
  be returned
- When requesting an entry that doesn't exist, and empty string will be
  returned
  
memStore.list - method
------------------------------------------------------------------------
Returns the list of the children of a path.
```
entries = await memStore.list('/path/to/dir/');
```

If the meomry store contains the following paths ...

- `/path/to/dir/doc1`
- `/path/to/dir/doc2`
- `/path/to/dir/subdir/doc3`
- `/path/to/dir/subdir/doc4`
- `/path/to/otherdir/doc5`

... then `entries` is `["doc1", "doc2", "subdir/"]`.

If the passed path doesn't exist, it returns `[]`.
  
memStore.write - method
------------------------------------------------------------------------
Maps a document path to a source, in memory.

```js
await memStore.write("/path/to/doc", source);
```

- If path is `path/to/x/../doc`, the content of `/path/to/doc` will
  be modified with the passed source
- `source` will be always converted to string
  
memStore.delete - method
------------------------------------------------------------------------
Erases the doc source mapped in memory to the given path.

```js
await memStore.delete("/path/to/doc");
```

- If path is `path/to/x/../doc`, the entry `/path/to/doc` will be deleted
  
memStore.deleteAll - method
------------------------------------------------------------------------
Erases all the docs whose path starts with the given path.

```js
await memStore.deleteAll("/path/to/");
```

- If path is `path/to/x/../dir`, the entres starting by `/path/to/dir/` 
  will be deleted
  

