# FSStore class
This class defines a file-system based store. Given a directory path, a
store instance can read, write and delete the olo-documents under that
directory.
  
### new FSStore(rootPath)
The parameter is the absolute path of the root directory that containes
the olo-documents.
  
### FSStore.prototype.read(path)
Returns the olo-document at the given path, which is considered as
relative to the root path.
If the path ends with `/`, it returns an index document. The indec document
defines an `items` name which contains the list of the subpaths of
the passed path.
  
### FSStore.prototype.write(path, source)
Midifies the content of the document at `path` with the given `source`.
If the document at `path` doesn't exist, it creates it.
If the `source` is an empty string, this is equivalent to `.delete(path)`.
  
### FSStore.prototype.delete(path)
Deletes the olo-document at `path` if it exists.
  
### FSStore.createReader(rootPath)
Returns the `FSStore.prototype.read` function bound to the given `rootPath`.
  

