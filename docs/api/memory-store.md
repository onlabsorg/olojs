MemoryStore
============================================================================
This store handles read/write operations on an in-memory map object.
```js
memStore = new MemoryStore(documents)
```
Where `documents` is an optional object containing path-document pairs that
will be added to the store upon creation.
The MemoryStore inherits the `load` method and the Error static properties
from the parent `Store` class.
  
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
Erases all the docs whos path starts with the given path.
```js
await memStore.deleteAll("/path/to/");
```
- If path is `path/to/x/../dir`, the entry `/path/to/dir/` will be deleted
  

