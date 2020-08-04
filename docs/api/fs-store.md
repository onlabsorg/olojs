# fs-store module
This module exports the FSStore class.
  
### store = new FSStore(root_path)
Creates a new file-system based store which can read, write and delete 
the olo-documents contained in a given directory

###### root_path
String containing the absolute path of the root directory that contains
the olo-documents.

  
### doc_source = store.read(doc_path)
Retrieves a document from the file system.

###### doc_path
The path of the document to be retrieved, relative to the store root
directory path.

###### doc_source
The text source of the requested document.
If the document doesn't exist, it returns and empty string.
If the path ends with `/`, it returns an index document, which is 
a document containing a `items` list of the subpaths of the passed path.

  
### store.write(doc_path, doc_source)
Modifies the content of a document file.
If the document doesn't exist, this method will creates it.

###### doc_path
The path of the document to be modified, relative to the store root
directory path.

###### doc_source
The new value of the document source text.
If `doc_source` is missing, it deletes it (sets the source to "").

  
### store.delete(doc_path)
Deletes a document file, if it exists.

###### doc_path
The path of the document to be deleted, relative to the store root
directory path.
  
