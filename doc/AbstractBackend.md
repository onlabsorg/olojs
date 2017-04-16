# olojs.AbstractBackend module
- **Version:** 0.1.0
- **Author:** Marcello Del Buono <m.delbuono@onlabs.org>
- **License:** MIT
- **Content:**
    - [class AbstractBackend](#abstractbackend-class)
    - [class AbstractBackend.Document](#abstractbackenddocument-class)
  
## AbstractBackend class
This abstract class describes the interface to a JSON databse.  
  
### Constructor
A constructor requires a `host` name as parameter.  
You can do your Backend initialization here, but `super()`` must be called
because this constructor does some general initializations itself.
  
### AbstractBackend.prototype.connect - async virtual method
The `connect` method implementations should establish a connection
to the remote database and resolve when the connection is open. 
They should also reject in case of error.  

The `connect` method should also login the user to the remote
backend using the passed implementation-specific `credentials` object.
  
### AbstractBackend.prototype.connected - virtual getter
The `connected` getter implementations should return true if the 
connection is established.
  
### AbstractBackend.prototype.getDocument
This method returns a `AbsstractBackend.Document` instance.  
It should not be defined by interface implementations but just inherited.  
The interface implementations should just implement the `AbstactBackend.Document`
interface as a Backend static property.
  
### AbstractBackend.prototype.disconnect - async virtual method
The `disconnect` method implementations should close the connection
to the remote database and resolve when the connection is closed. 
They should also reject in case of error.  
  
## AbstractBackend.Document class
This abstract class describes the interface to a JSON databse's document.  
Each Backend implementation should have a `Backend.Document` property
extending this class.  
### Properties
- `document.store` is the Backend object that created this document
- `document.collection` is the name of the backend collection that contains the document
- `document.id` is the name of the document
  
The AbstractBackend.Document implementations should not worry about creating
this properties, because the Abstract class takes care of if. 
  
### Constructor
This class should not be instantiated directrly: the `AbstractStore.getDocument`
method takes care of it.
  
### AbstractBackend.Document.prototype.open() - async virtual method
The `.open` method implementations should connect to the backend document and
throw an error in case of failure.  
They should also call the `this._assertReadable()` method which will throw a
standard exception if the user doesn't have read permissions.
  
### AbstractBackend.Document.prototype.isOpen() - virtual method
The `.isOpen` method implementations should return true if the
document is open.
  
### AbstractBackend.Document.prototype.readable - virtual getter
The `.readable` getter implementations should return true if the
user has read access to this document.
  
### AbstractBackend.Document.prototype.writable - virtual getter
The `.writable` getter implementations should return true if the
user has write access to this document.
  
### AbstractBackend.Document.prototype.getItemValue(path) - virtual method
The `.getItemValue` method implementations should return the value of the
document item at the given path parameter.  
  
The implementation should also call `this._assertOpen()` and `this._assertReadable()`.  
  
The implementation can trust that `path` is always a [Path][] instance.
  
### AbstractBackend.Document.prototype.setDictItem(dictPath, key, newValue) - virtual method
The `.setDictItem` method implementations should change the value of the
item mapped to `key` in the dictionary at `path`.  
   
As a consequence of this change, `this.changeCallback` should be called.
  
The implementation should call also `this._assertOpen()` and `this._assertWritable()`.  
  
The implementation can trust that: 
- `path` is always a [Path][] instance
- `path` points always to a dictionary item
- `newValue` is a valid JSON value
  
### AbstractBackend.Document.prototype.removeDictItem(dictPath, key) - virtual method
The `.removeDictItem` method implementations should remove the `key` from the
dictionary item at `path`.  
   
As a consequence of this change, `this.changeCallback` should be called.
  
The implementation should also call `this._assertOpen()` and `this._assertWritable()`.  
  
The implementation can trust that: 
- `path` is always a [Path][] instance
- `path` points always to a dictionary item
  
### AbstractBackend.Document.prototype.setListtem(listPath, index, newItem) - virtual method
The `.setListItem` method implementations should change the value of the
item mapped to `index` in the array at `path`.  
   
As a consequence of this change, `this.changeCallback` should be called.
  
The implementation should also call `this._assertOpen()` and `this._assertWritable()`.  
  
The implementation can trust that: 
- `path` is always a [Path][] instance
- `path` points always to an array item
- `newItem` is a valid JSON value
  
### AbstractBackend.Document.prototype.insertListItem(listPath, index, newItem) - virtual method
The `.insertListItem` method implementations should insert the `newItem` at `index`
in the array at `path` and shift the other items.  
   
As a consequence of this change, `this.changeCallback` should be called.
  
The implementation should also call `this._assertOpen()` and `this._assertWritable()`.  
  
The implementation can trust that: 
- `path` is always a [Path][] instance
- `path` points always to an array item
- `index` is a valid array index
- `newItem` is a valid JSON value
  
### AbstractBackend.Document.prototype.removeListItem(listPath, index) - virtual method
The `.removeListItem` method implementations should remove the array item 
`index` from the array at `path` and shift the other items.  
   
As a consequence of this change, `this.changeCallback` should be called.
  
The implementation should also call `this._assertOpen()` and `this._assertWritable()`.  
  
The implementation can trust that: 
- `path` is always a [Path][] instance
- `path` points always to an array item
- `index` is a valid array index
  
### AbstractBackend.Document.prototype.insertTextString(textPath, index, subString) - virtual method
The `.insertTextString` method implementations should insert the `subString` at `index`
in the string at `path` and shift the other characters.  
   
As a consequence of this change, `this.changeCallback` should be called.
  
The implementation should also call `this._assertOpen()` and `this._assertWritable()`.  
  
The implementation can trust that: 
- `path` is always a [Path][] instance
- `path` points always to a text item
- `index` is a valid string index
  
### AbstractBackend.Document.prototype.removeTextString(textPath, index, count) - virtual method
The `.removeTextString` method implementations should remove `count` characters, 
starting at `index` from the string at `path`.  
   
As a consequence of this change, `this.changeCallback` should be called.
  
The implementation should also call `this._assertOpen()` and `this._assertWritable()`.  
  
The implementation can trust that: 
- `path` is always a [Path][] instance
- `path` points always to a text item
- `index` is a valid string index
- `count` is a valid number of characters
  
### AbstractBackend.Document.prototype.changeCallback(path, removed, inserted)
The `changedCallback` function should be called every time the backend changes.  
Also changes made remotely, should result in a call to this function.    
   
The implementation doesn't need to define this function, since it will be
defined by the [Store][] object that uses the backend.  
  
### AbstractBackend.Document.prototype.close() - async virtual method
The `.close` method implementations should disconnect from the backend document and
throw an error in case of failure.  
  
[Path]: ./Path.md#path-class
[Store]: ./Store.md#store-class
  
