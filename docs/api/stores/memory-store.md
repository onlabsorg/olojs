  

MemoryStore
============================================================================
This store maps file-like paths to olo-document sources stored in the
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
  

  

async memStore.write: (String path, String source) -> undefined
------------------------------------------------------------------------
Maps a document path to a source, in memory.
  

```js
memStore.write("/path/to/doc", source);
```
  

- If path is `path/to/x/../doc`, the content of `/path/to/doc` will
  be modified with the passed source
- `source` will be always converted to string
  

  

asink memStore.delete: String path -> undefined
------------------------------------------------------------------------
Erases the doc source mapped in memory to the given path.
  

```js
memStore.delete("/path/to/doc");
```
  

- If path is `path/to/x/../doc`, the entry `/path/to/doc` will be deleted
  


