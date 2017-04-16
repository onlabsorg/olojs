# olojs.Store module.
- **Version:** 0.1.0
- **Author:** Marcello Del Buono <m.delbuono@onlabs.org>
- **License:** MIT
- **Content:**
    - [class Store][Store]
    - [class Store.Document][Document]
    - [class Store.Document.Item][Item]
    - [class Store.Document.Dict][Dict]
    - [class Store.Document.List][List]
    - [class Store.Document.Text][Text]
    - [class Store.Document.Change][Change]
    - [class Store.Document.Subscription][Subscription]
  
## Store class
A `Store` object represent a database containing JSON documents 
organized in collections.
  
### constructor
```javascript
var store = new Store(backend);
```
- **backend** is an implementation of the [AbstractBackend][] interface.
  [More info about backends](./backends.md).
  
### Store.prototype.host - getter
Returns the URL of the resource hosting the database.
  
### Store.prototype.connect(credentials) - async function
This method establishes a connection with the backend.  
- **credentials** is an object that identified the user for access control.
  The content of the credential object is defined by the backend implementation.
  
### Store.prototype.connected - getter
It returns true if the store is connected to the backend.
  
### Store.prototype.getDocument(collection, docId)
Returns a [Store.Document](#document-class) object.
- **collection** is the name of the store collection containing the document
- **docId** is the name of the document
  
This method caches the returned object, therefore it returns always
the same object when passing the same collection-docId combination.
  
### Store.prototype.disconnect() async function
Closes the connection to the backend.  
Closes all the open documents and cleares the documents cache.
  
## Document class
A `Document` object represents a JSON document contained in a [Store][].
  
### constructor
```javascript
var doc = new Store.Document(store, collection, id);
```
- **store** is the [Store][] containing this document
- **collection** is the name of the Store collection containing this document
- **id** is the name of this document
  
You shouldn't call this constructor directly. Use `Store.getDocument` instead.
  
### Document.prototype.store - getter
Returns the [Store][] object that contains this document.
  
### Document.prototype.collection - getter
Returns the name of the store collection that contains this document.
  
### Document.prototype.id - getter
Returns the name of this document.
  
### Document.prototype.open() - async function
Opens and establishes a connection to the remote document.  
This method will fail and throw a `ReadPermissionError` exception
if the user has no read permissions on the document.
  
### Document.prototype.isOpen - getter
Returns true if the document is open.
  
### Document.prototype.readable - getter
Returns true if the user has read permissions on this document.
  
### Document.prototype.writable - getter
Returns true if the user has write permissions on this document.
  
### Document.prototype.get(path)
Returns a pointer to the document item identified by the given path.
- **path** is a [Path][] object, a path literal or a path array.
  
The returned pointer object is mutable:
- It behaves like a [Dict][] object when the target is a mapping object
- It behaves like a [List][] object when the target is an array
- It behaves like a [Text][] object when the target is a string
- It behaves like an [Item][] object when the target is a primitive value  
  
If the target type changes, the pointer object will adjust its behaviour.
This is achieved by using [Proxy][] objects.  
  
The `.get` method caches the returned value, therefore it will always
return the same pointer when passing the same path.
  
### Document.prototype.close() - async function
Closes the connection with the document, cancels all the
subscriptions and clears the items cache.
  
## Item class
An `Item` object represents a value contained in a document.
  
### constructor
```javascript
var item = new Store.Document.Item(doc, path)
```
- **doc** is the [Document][] object that contains the item
- **path** is the [Path][] object or path literal or path array that 
  defines the item position inside the document  
  
This constructor should not be called directly. Use `Document.prototype.get` insetead.
  
### Item.prototype.doc - getter
Returns the [Document][] object that contains this item.
  
### Item.prototype.path - getter
Returns the [Path][] object that defines the item position inside its document.
  
### Item.prototype.type - getter
Returns a string describing the type of the item data:
- `"dict"` if the underlying data is an object
- `"list"` if the underlying data is an array
- `"text"` if the underlying data is a string
- `"numb"` if the underlying data is a number
- `"bool"` if the underlying data is a boolean
- `"none"` if the document path doesn't exist
  
### Item.prototype.get(subPath)
Return a sub-item of this item.  
In other words it is a shortcut for `item.doc.get([item.path, subPath])` 
  
### Item.prototype.value - getter
Returns a deep copy of the underlying data.  
Changing the returned value will not change the document data.
  
### Item.prototype.value - setter
Sets the underlying data to a deep copy of the passed value.  
Trying to set the document root item (`doc.get()`) to something other
than a dictionary, results in an exception.
  
### Item.prototype.subscribe(callback)
Registers a callback that will be invoked with a [Change][] object
as parameter, each time the item value changes.  
This method returns a [Subscription][] object.
  
## Dict class
A `Dict` is an [Item][] object that represents a JSON object contained in a document.
  
### Dict.prototype.keys - getter
Returns an array with all the keys contained in the dictionary.
  
### Dict.prototype.set(key, value)
Assigns the `value` parameter to the `key`.  
It throws an exception if value is not a valid JSON value or if it is null.
  
### Dict.prototype.remove(key)
Removes the item mapped to `key`.
  
## List class
A `List` is an [Item][] object that represents an array object contained in a document.
  
### List.prototype.size - getter
Returns the number of items in the list.
  
### List.prototype.set(index, item)
Changes the item value at the given index.  
If index is negative, it will be considered as relative to the end of the list.  
It thows an error if item is not a valid JSON object or if it is null or if index is not a valid number.
  
### List.prototype.insert(index, ...items)
Inserts the given `items` at the given `index`.  
If index is negative, it will be considered as relative to the end of the list.  
It thows an error if any new item is not a valid JSON object or if it is null or if index is not a valid number.
  
### List.prototype.append(...items)
Shortcut for `list.insert(list.size, ...items)`
  
### List.prototype.remove(index, count)
Removes `count` items starting at `index`.  
If index is negative, it will be considered as relative to the end of the list.  
If `count` is omitted, it defaults to 1.
  
## Text class
A `Text` is an [Item][] object that represents a string contained in a document.
  
### Text.prototype.size - getter
Returns the length of the string.
  
### Text.prototype.insert(index, subString)
Inserts the given `subString` at the given `index`, shifting the existing characters.  
If index is negative, it will be considered as relative to the end of the string.  
  
### Text.prototype.append(subString)
Shortcut for `text.insert(text.size, subString)`
  
### Text.prototype.remove(index, count)
Removes `count` characters starting at `index`.  
If index is negative, it will be considered as relative to the end of the string.  
If `count` is omitted, it defaults to 1.
  
## Change class
A `Change` object represents a change occurred in a [Document][] [Item][].  
It is passed to the change listeners attached to an [Item][] object 
via the `Item.prototype.subscribe` method.
  
### Properties
- `change.path`: the [Path][] object defining the position of the item that changed
- `change.removed`: the removed (old value) of the item
- `change.inserted`: the added (new value) of the item
  
A change object with the `removed` and `inserted` property both non null, represents a `set` change.  
A change object with null `inserted` property, represents a `remove` change.  
A change object with null `removed` property, represents an `insert` change.  
  
### Change.prototype.SubChange(subPath)
Returns a [Change][] object representing the effects of this change
on the sub-item at the given `subPath`.
  
## Subscription class  
Represent a change subscription and it is returned by the `Item.prototype.subscribe` method.  

### Properties
- `subscription.doc`: is the [Document][] containing the observed [Item][]
- `subscription.path`: is the [Path][] of the observed [Item][]
- `subscription.callback`: is the function that gets invoked when the item changes
  
### Subscription.prototype.cancel()
Cancels the subscription. As a consequence, furute changes to the observed item
will no longer be notified to `subscription.callback`.
  
[Store]: #store-class
[Document]: #document-class
[Item]: #item-class
[Dict]: #dict-class
[List]: #list-class
[Text]: #text-class
[Change]: #change-class
[Subscription]: #subscription-class
[AbstractBackend]: ./AbstractBackend.md
[Path]: ./Path.md#path-class
[Proxy]: https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Proxy
  
