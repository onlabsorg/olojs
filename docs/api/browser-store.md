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
  
browserStore.read - async method
----------------------------------------------------------------------------
Retrieves a document from the browser storage.

```js
source = await browserStore.read("/path/to/doc");
```

The document path gets normalized, therefore `path/to/doc`, 
`/path/to/./doc`, `/path/to/doc`, etc. refer to the same document.

If the passed path doesn't exist, it returns an empty string.
  
browserStore.list - method
------------------------------------------------------------------------
Returns the list of the children of a path.
```
entries = await browserStore.list('/path/to/dir/');
```

If the browser store contains the following paths ...

- `/path/to/dir/doc1`
- `/path/to/dir/doc2`
- `/path/to/dir/subdir/doc3`
- `/path/to/dir/subdir/doc4`
- `/path/to/otherdir/doc5`

... then `entries` is `["doc1", "doc2", "subdir/"]`.

The document path gets normalized, therefore `/path/to/dir/`, 
`/path/to/./dir`, `path/to/dir`, etc. are equivalent.

If the passed path doesn't exist, it returns `[]`.
  
browserStore.write - method
------------------------------------------------------------------------
Maps a document path to a source, in the browser storage.

```js
await browserStore.write("/path/to/doc", source);
```

The document path gets normalized, therefore `path/to/doc`, 
`/path/to/./doc`, `/path/to/doc`, etc. refer to the same document.

If the passed path doesn't exist, it will be created.
  
browserStore.delete - method
------------------------------------------------------------------------
Erases the doc source mapped in the browser storage to the given path.

```js
await browserStore.delete("/path/to/doc");
```

The document path gets normalized, therefore `path/to/doc`, 
`/path/to/./doc`, `/path/to/doc`, etc. refer to the same document.

If the passed path doesn't exist, the methods returns silently.
  
browserStore.deleteAll - method
------------------------------------------------------------------------
Erases all the docs whose path starts with the given path.

```js
await browserStore.deleteAll("/path/to/");
```

The document path gets normalized, therefore `/path/to/dir/`, 
`/path/to/./dir`, `path/to/dir`, etc. are equivalent.

If the passed path doesn't exist, the methods returns silently.
  
[IndexDB]: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
[localStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
  

