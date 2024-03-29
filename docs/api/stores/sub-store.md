  

SubStore
============================================================================
This store creates a shortcut for a path. A store is to a directory, what
a sub-store is to sub-directory.
  

```js
subStore = new MemoryStore(rootStore, rootPath);
```
  

Every `subStore.read`, `subStore.write` and `subStore.delete` calls with
a path `subPath` will be redirected to the corresponding rootStore
method, with path `rootPath+subPath`.
  

  

async subStore.read: String subPath -> String source
------------------------------------------------------------------------
Retrives the document at `rootPath + subPath` in the `rootStore`.
  

  

async subStore.write: (String subPath, String source) -> undefined
------------------------------------------------------------------------
Modifies the document at `rootPath + subPath` in the `rootStore`.
  

  

async subStore.delete: String subPath -> undefined
------------------------------------------------------------------------
Erases the document at `rootPath + subPath` from the `rootStore`.
  


