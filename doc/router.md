# Router class
A Router is a store that works as a hub for sub-stores. You can mount
several different stores to virtual paths and access all of them as if
they belonget to one store.
  
### new Router(routes)
The routes parameter is an object mapping paths to stores.
Say you created a router as follows ...
```js
router = new Router({
    "/root/path1": store1,
    "/root_path2": store2,
    "/rp3": store3,
    ...
})
```
... then
- `router.read("/root/path1/path/to/docA")` will call `store1.read("/path/to/docA")`
  and return the returned string as document source
- `router.read("/root_path2/path/to/docB")` will call `store2.read("/path/to/docB")`
  and return the returned string as document source
- `router.read("/rp3/path/to/docC")` will call `store3.read("/path/to/docC")`
   and return the returned string as document source
Of course the same goes for the `write`, `delete` and `append` methdos.
  
### Router.prototype.read(path)
This function takes a path, finds the first store matching the
path and returns `store.read(subPath)`.
  
### Router.prototype.write(path, source)
This function takes a path and an olo-document source, finds the first
store matching the path and calls `store.write(subPath, source)`.

If source is an empty string, it will instead call `store.delete(path)`.
  
### Router.prototype.delete(path)
This function takes a path as argument, finds the first
store matching the path and calls `store.delete(subPath)`.
  
### Router.prototype.append(path, source)
This function takes a path and an olo-document source, finds the first
store matching the path and calls `store.append(subPath, source)`.
  

