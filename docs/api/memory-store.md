MemoryStore
============================================================================
This store maps file-like patsh to olo-document sources stored in the
local memory.
```js
memStore = new MemoryStore({
    "/path/to/doc1": "source of doc1",
    "/path/to/doc2": "source of doc2",
    ...
})
```
> MemoryStore inherits from the [Store](./store.md) class and overrides the
> methods described below.
  

async memStore.read: String path -> String source
------------------------------------------------------------------------
Retrieves the in-memory document source mapped to the given path.
```js
const source = await memStore.read("/path/to/doc");
```
- When requesting `path/to/x/../doc`, the content of `/path/to/doc` will
  be returned
- When requesting an entry that doesn't exist, an empty string will be
  returned
  


