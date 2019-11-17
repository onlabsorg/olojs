# olojs.memory-store module
This module exports the `MemoryStore` class.
- License: MIT
- Author: Marcello Del Buono <m.delbuono@onlabs.org>
  
## olojs.MemoryStore class
The `MemoryStore` class implement an in-memory olojs store.
  
### MemoryStore.prototype.read(path) - async function
Returns the document source saved under `path` or "" if no document
can be found at `path`.
  
### MemoryStore.prototype.write(path, source) - async function
It writes the given document `source` at the given `path`.
  
### MemoryStore.prototype.delete(path) - async function
It deletes the document at the given `path`.
  
