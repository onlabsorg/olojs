BrowserStore
============================================================================
This is a [Store](./store.md) object backed by the browser permanent storage
([IndexDB] or [localStorage]).
```js
fileStore = new BrowserStore(storeId)
```
- `storeId` is a name that uniquely identifies your store in the browser
  storage.

> BrowserStore inherits from the [Store](./store.md) class and overrides the
> methods described below.
  
async browserStore.read: String path -> String source
----------------------------------------------------------------------------
Retrieves a document from the browser storage.
```js
source = await browserStore.read("/path/to/doc");
```
The document path gets normalized, therefore `path/to/doc`,
`/path/to/./doc`, `/path/to/doc`, etc. refer to the same document.

If the passed path doesn't exist, it returns an empty string.
  
async browserStore.list: String path -> Array items
------------------------------------------------------------------------
Returns the lists of document names and directory names contained
under the given directory path. The directory names end with a forward
slash, while the document names don't.
```js
const items = await browserStore.list("/path/to/dir");
```
The document path gets normalized, therefore `path/to/doc`,
`/path/to/./doc`, `/path/to/doc`, etc. refer to the same document.

When requesting a directory entry that doesn't exist, an empty array 
will be returned
  
async browserStore.write: (String path, String source) -> undefined
------------------------------------------------------------------------
Maps a document path to a source, in the browser storage.
```js
await browserStore.write("/path/to/doc", source);
```
The document path gets normalized, therefore `path/to/doc`,
`/path/to/./doc`, `/path/to/doc`, etc. refer to the same document.

If the passed path doesn't exist, it will be created.
  
async browserStore.delete: String path -> undefined
------------------------------------------------------------------------
Erases the doc source mapped in the browser storage to the given path.
```js
await browserStore.delete("/path/to/doc");
```

The document path gets normalized, therefore `path/to/doc`,
`/path/to/./doc`, `/path/to/doc`, etc. refer to the same document.

If the passed path doesn't exist, the methods returns silently.
  
[IndexDB]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
[localStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
  

