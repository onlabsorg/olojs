/**
 *  # olojs.Store module.
 *  - **Version:** 0.1.0
 *  - **Author:** Marcello Del Buono <m.delbuono@onlabs.org>
 *  - **License:** MIT
 *  - **Content:**
 *      - [class Store][Store]
 *      - [class Store.Document][Document]
 *      - [class Store.Document.Item][Item]
 *      - [class Store.Document.Dict][Dict]
 *      - [class Store.Document.List][List]
 *      - [class Store.Document.Text][Text]
 *      - [class Store.Document.Change][Change]
 *      - [class Store.Document.Subscription][Subscription]
 */



const Path = require("./Path");
const Pointer = require("./Pointer");
const utils = require("./utils");
const errors = require("./errors");
const roles = require("./roles");




/**
 *  ## Store class
 *  A `Store` object represent a database containing JSON documents.
 */
class Store {

    constructor () {
        this._cache = {};
    }


    /**
     *  ### Store.prototype.connect(credentials) - async function
     *  This method establishes a connection with the backend.
     *  - **credentials** is an object that identified the user for access control.
     *    The content of the credential object is defined by the backend implementation.
     */
    async connect (credentials) {
        if (!this.connected) {
            await this.__connect(credentials);
        }
    }


    /**
     *  ### Store.prototype.connected - getter
     *  It returns true if the store is connected to the backend.
     */
    get connected () {
        return this.__connected();
    }


    /**
     *  ### Store.prototype.getDocument(docId) - async method
     *  Returns a [Store.Document](#document-class) object.
     *  - **docId** is the name of the document
     *
     *  This method caches the returned object, therefore it returns always
     *  the same object when passing the same docId.
     */
    async getDocument (docId) {
        var doc = this._cache[docId];
        if (!doc) {
            doc = this._cache[docId] = new this.constructor.Document(this, docId);
            await doc.__init();
        }
        return doc;
    }


    /**
     *  ### Store.prototype.disconnect() - async method
     *  Closes the connection to the backend.
     *  Closes all the open documents and cleares the documents cache.
     */
    async disconnect () {
        if (this.connected) {
            for (let docId in this._cache) {
                let doc = this._cache[docId];
                await doc.close();
            }
            this._cache = {};
            await this.__disconnect();
        }
    }


    /**
     *  ### Document.prototype.__connect(credentials) - async virtual method
     *  The `__connect` method implementations should establish a connection
     *  to the remote database and resolve when the connection is open.
     *  They should also reject in case of error.
     *
     *  The `__connect` method should also login the user to the remote
     *  backend using the passed implementation-specific `credentials` object.
     */
    async __connect (credentials) {}


    /**
     *  ### Document.prototype.__connected() - async virtual method
     *  The `__connected` method implementations should return true if the
     *  connection with the remote database is active.
     */
    __connected () {}


    /**
     *  ### Document.prototype.__disconnect() - async virtual method
     *  The `__disconnect` method implementations should close the connection
     *  to the remote database and resolve when the connection is closed.
     *  They should also reject in case of error.
     */
    async __disconnect () {}
}



/**
 *  ## Document class
 *  A `Document` object represents a JSON document contained in a [Store][].
 */
class Document {

    /**
     *  ### constructor
     *  ```javascript
     *  var doc = new Store.Document(store, docId);
     *  ```
     *  - **store** is the [Store][] containing this document
     *  - **docId** is the name of this document
     *
     *  You shouldn't call this constructor directly. Use `Store.getDocument` instead.
     */
    constructor (store, docId) {
        this._store = store;
        this._id = docId;
        this._subscriptions = [];
        this._cache = {};
        this.state = "closed";
    }


    /**
     *  ### Document.prototype.store - getter
     *  Returns the [Store][] object that contains this document.
     */
    get store () {
        return this._store;
    }


    /**
     *  ### Document.prototype.id - getter
     *  Returns the name of this document.
     */
    get id () {
        return this._id;
    }


    /**
     *  ### Document.prototype.open() - async function
     *  Opens and establishes a connection to the remote document.
     *  This method will fail and throw a `ReadPermissionError` exception
     *  if the user has no read permissions on the document.
     */
    async open () {
        if (this.state === "open") return;
        this.state = "opening";
        try {
            await this.__open();
            this.state = "open";
        }
        catch (err) {
            this.state = "closed";
            throw err;
        }
    }


    //
    //  throws an error if the document path is not readable
    //
    assertOpen () {
        if (this.state !== "open") {
            throw new errors.DocumentClosedError(this.id);
        }
        else {
            return this;
        }
    }


    /**
     *  ### Document.prototype.isReadable(path) - getter
     *  Returns true if the user has read permissions on the document path.
     */
    isReadable (path) {
        const role = this.__getUserRole();
        return role >= roles.READER;
    }


    //
    //  throws an error if the document path is not readable
    //
    assertReadable (path) {
        if (!this.isReadable(path)) {
            throw new errors.ReadPermissionError(this.id, Path.from(path));
        }
        else {
            return this;
        }
    }


    /**
     *  ### Document.prototype.isWritable(path) - getter
     *  Returns true if the user has write permissions on the document path.
     */
    isWritable (path) {
        path = Path.from(path);
        const role = this.__getUserRole();
        return path[0] === "root" ? role >= roles.WRITER : role >= roles.OWNER;
    }


    //
    //  throws an error if the document path is not readable
    //
    assertWritable (path) {
        if (!this.isWritable(path)) {
            throw new errors.WritePermissionError(this.id, Path.from(path));
        }
        else {
            return this;
        }
    }


    /**
     *  ### Document.prototype.get(path)
     *  Returns a pointer to the document item identified by the given path.
     *  - **path** is a [Path][] object, a path literal or a path array.
     *
     *  The returned pointer object is mutable:
     *  - It behaves like a [Dict][] object when the target is a mapping object
     *  - It behaves like a [List][] object when the target is an array
     *  - It behaves like a [Text][] object when the target is a string
     *  - It behaves like an [Item][] object when the target is a primitive value
     *
     *  If the target type changes, the pointer object will adjust its behaviour.
     *  This is achieved by using [Proxy][] objects.
     *
     *  The `.get` method caches the returned value, therefore it will always
     *  return the same pointer when passing the same path.
     */
    get (path) {
        return this._getItem("/", path);
    }


    //
    //  This is the method actually used by all the .get methods of this module.
    //
    _getItem (rootPath, subPath) {
        rootPath = Path.from(rootPath);
        subPath = Path.from(subPath);
        var itemPath = rootPath.subPath(subPath);
        this.assertOpen().assertReadable(itemPath);
        if (itemPath === null) return null;
        var itemId = "/" + String(itemPath);
        return this._cache[itemId] || (this._cache[itemId] = new ItemPointer(this, itemPath));
    }


    //
    //  Return the internal value associated with the given path
    //
    _getItemValue (...path) {
        path = new Path(...path);
        this.assertOpen().assertReadable(path);
        return this.__getItemValue(path);
    }


    //
    //  Subscribes a callback for changes.
    //  This is used by Item.prototype.subscribe.
    //
    _subscribe (path, callback) {
        this.assertOpen();
        var subscription = new Subscription(this, path, callback);
        this._subscriptions.push(subscription);
        return subscription;
    }


    //
    //  This function gets called every time
    //  the document content changes.
    //
    _dispatch (path, removed, inserted) {
        var change = new Change(this, path, removed, inserted);
        for (let subscription of this._subscriptions) {
            var subChange = change.SubChange(subscription.path);
            if (subChange) subscription.callback(subChange);
        }
    }


    //
    // Cancels an existing subscription.
    // This is used by Subscription.prototype.cancel()
    //
    _unsubscribe (subscription) {
        var index = this._subscriptions.indexOf(subscription);
        if (index !== -1) {
            this._subscriptions.splice(index, 1);
        }
    }


    /**
     *  ### Document.prototype.close() - async function
     *  Closes the connection with the document, cancels all the
     *  subscriptions and clears the items cache.
     */
    async close () {
        if (this.state === "open") await this.__close();
        this._subscriptions = [];
        this._cache = {};
        this.state = "closed";
    }


    //
    //  Virtual methods to be defined by the Store implementations
    //

    /**
     *  ### Store.Document.prototype.__init() - async virtual method
     *  This method should contain the asynchronous initialization
     *  of the `Store.Document` implmentations.
     */
     async __init () {}


     /**
      *  ### Store.Document.prototype.__open() - async virtual method
      *  The `.__open` method implementations should fetch the remote document
      *  and subscribe to change notifications.
      *  If the document doesn't exist, it should create it.
      *
      *  If the user has no read permissions on the documents, it should throw
      *  an errors.ReadPermissionError exception.
      *
      *  If the document doesn't exist and the user is not an OWNER,
      *  it should throw an errors.WritePermissionError exception.
      */
     async __open () {}


     /**
      *  ### Store.Document.prototype.__getUserRole() - virtual method
      *  It should return one of the following values:
      *
      *  | Role         | meta data  |    body    |
      *  |--------------|:----------:|:----------:|
      *  | roles.OWNER  |     rw     |     rw     |
      *  | roles.WRITER |     ro     |     rw     |
      *  | roles.READER |     ro     |     ro     |
      *  | roles.NONE   |     -      |     -      |
      *
      */
     __getUserRole () {}


     /**
      *  ### Store.Document.prototype.__getItemValue(path) - virtual method
      *  The `.__getItemValue` method implementations should return the value of the
      *  document item at the given path parameter or `null` if it doesn't exist.
      *
      *  The implementation can trust that
      *  - this document is open
      *  - `path` is always a [Path][] instance,
      *  - the user has read permissions on the document path
      */
     __getItemValue (path) {}


     /**
      *  ### Store.Document.prototype.setDictItem(dictPath, key, newValue) - virtual method
      *  The `.__setDictItem` method implementations should change the value of the
      *  item mapped to `key` in the dictionary at `path`.
      *
      *  As a consequence of this change, `this._dispatch` should be called.
      *
      *  The implementation can trust that:
      *  - this document is open
      *  - `dictPath` is always a [Path][] instance
      *  - `dictPath` points always to a dictionary item
      *  - `newValue` is a valid JSON value
      *  - the user has write permissions on the document path
      */
     __setDictItem (dictPath, key, value) {}


     /**
      *  ### Store.Document.prototype.__removeDictItem(dictPath, key) - virtual method
      *  The `.__removeDictItem` method implementations should remove the `key` from the
      *  dictionary item at `path`.
      *
      *  As a consequence of this change, `this._dispatch` should be called.
      *
      *  The implementation can trust that:
      *  - this document is open
      *  - `path` is always a [Path][] instance
      *  - `path` points always to a dictionary item
      *  - the user has write permissions on the document path
      */
     __removeDictItem (dictPath, key) {}


     /**
      *  ### Store.Document.prototype.__setListtem(listPath, index, newItem) - virtual method
      *  The `.__setListItem` method implementations should change the value of the
      *  item mapped to `index` in the array at `path`.
      *
      *  As a consequence of this change, `this._dispatch` should be called.
      *
      *  The implementation can trust that:
      *  - this document is open
      *  - `path` is always a [Path][] instance
      *  - `path` points always to an array item
      *  - `newItem` is a valid JSON value
      *  - the user has write permissions on the document path
      */
     __setListItem (itemPath, index, item) {}


     /**
      *  ### Store.Document.prototype.__insertListItem(listPath, index, newItem) - virtual method
      *  The `.__insertListItem` method implementations should insert the `newItem` at `index`
      *  in the array at `path` and shift the other items.
      *
      *  As a consequence of this change, `this._dispatch` should be called.
      *
      *  The implementation can trust that:
      *  - this document is open
      *  - `path` is always a [Path][] instance
      *  - `path` points always to an array item
      *  - `index` is a valid array index
      *  - `newItem` is a valid JSON value
      *  - the user has write permissions on the document path
      */
     __insertListItem (itemPath, index, item) {}


     /**
      *  ### Store.Document.prototype.__removeListItem(listPath, index) - virtual method
      *  The `.__removeListItem` method implementations should remove the array item
      *  `index` from the array at `path` and shift the other items.
      *
      *  As a consequence of this change, `this._dispatch` should be called.
      *
      *  The implementation can trust that:
      *  - this document is open
      *  - `path` is always a [Path][] instance
      *  - `path` points always to an array item
      *  - `index` is a valid array index
      *  - the user has write permissions on the document path
      */
     __removeListItem (itemPath, index) {}


     /**
      *  ### Store.Document.prototype.__insertTextString(textPath, index, subString) - virtual method
      *  The `.__insertTextString` method implementations should insert the `subString` at `index`
      *  in the string at `path` and shift the other characters.
      *
      *  As a consequence of this change, `this._dispatch` should be called.
      *
      *  The implementation can trust that:
      *  - this document is open
      *  - `path` is always a [Path][] instance
      *  - `path` points always to a text item
      *  - `index` is a valid string index
      *  - the user has write permissions on the document path
      */
     __insertTextString (textPath, index, string) {}


     /**
      *  ### Store.Document.prototype.__removeTextString(textPath, index, count) - virtual method
      *  The `.__removeTextString` method implementations should remove `count` characters,
      *  starting at `index` from the string at `path`.
      *
      *  As a consequence of this change, `this._dispatch` should be called.
      *
      *  The implementation can trust that:
      *  - this document is open
      *  - `path` is always a [Path][] instance
      *  - `path` points always to a text item
      *  - `index` is a valid string index
      *  - `count` is a valid number of characters
      *  - the user has write permissions on the document path
      */
     __removeTextString (textPath, index, count) {}


     /**
      *  ### Store.Document.prototype.__close() - async virtual method
      *  The `.__close` method implementations should disconnect from the backend document and
      *  throw an error in case of failure.
      */
     async __close () {}


     //
     // Empty document template
     //
     static get template () {
         return {
             root: {},
         };
     }
}





/**
 *  ## Item class
 *  An `Item` object represents a value contained in a document.
 */
class Item {

    /**
     *  ### constructor
     *  ```javascript
     *  var item = new Store.Document.Item(doc, path)
     *  ```
     *  - **doc** is the [Document][] object that contains the item
     *  - **path** is the [Path][] object or path literal or path array that
     *    defines the item position inside the document
     *
     *  This constructor should not be called directly. Use `Document.prototype.get` insetead.
     */
    constructor (doc, path) {
        this._doc = doc;
        this._path = Path.from(path);
    }


    /**
     *  ### Item.prototype.doc - getter
     *  Returns the [Document][] object that contains this item.
     */
    get doc () {
        return this._doc;
    }


    /**
     *  ### Item.prototype.path - getter
     *  Returns the [Path][] object that defines the item position inside its document.
     */
    get path () {
        return this._path;
    }


    //
    //  Deprecated
    //
    get fullPath () {
        return new Path(this.doc.id, this.path);
    }


    /**
     *  ### Item.prototype.type - getter
     *  Returns a string describing the type of the item data:
     *  - `"dict"` if the underlying data is an object
     *  - `"list"` if the underlying data is an array
     *  - `"text"` if the underlying data is a string
     *  - `"numb"` if the underlying data is a number
     *  - `"bool"` if the underlying data is a boolean
     *  - `"none"` if the document path doesn't exist
     */
    get type () {
        var value = this.doc._getItemValue(this.path);
        if (utils.isPlainObject(value)) return "dict";
        if (utils.isArray(value)) return "list";
        if (utils.isString(value)) return "text";
        if (utils.isNumber(value)) return "numb";
        if (utils.isBoolean(value)) return "bool";
        return "none";
    }


    /**
     *  ### Item.prototype.get(subPath)
     *  Return a sub-item of this item.
     *  In other words it is a shortcut for `item.doc.get([item.path, subPath])`
     */
    get (path) {
        if (typeof path === "string" && path[0] === "/") {
            return this.doc.get(path);
        } else {
            return this.doc._getItem(this.path, path);
        }
    }


    /**
     *  ### Item.prototype.value - getter
     *  Returns a deep copy of the underlying data.
     *  Changing the returned value will not change the document data.
     */
    get value () {
        return utils.clone(this.doc._getItemValue(this.path));
    }


    /**
     *  ### Item.prototype.value - setter
     *  Sets the underlying data to a deep copy of the passed value.
     *  Trying to set the document root item (`doc.get()`) to something other
     *  than a dictionary, results in an exception.
     */
    set value (newValue) {

        // root item
        if (this.path.length === 0) {
            if (!utils.isPlainObject(newValue)) {
                throw new Error("The document root must be a dictionary.");
            }

            for (let key in newValue) {
                this.set(key, newValue[key]);
            }

            for (let key of this.keys) {
                if (newValue[key] === undefined) {
                    this.remove(key);
                }
            }
        }

        else {
            var parent = this.get("..");
            var parentType = parent.type;
            if (parentType === "dict" || parentType === "list") {
                parent.set(this.path.leaf, newValue);
            } else {
                throw new Error("Cannot set the item value if the parent item is not a container.");
            }
        }
    }


    /**
     *  ### Item.prototype.subscribe(callback)
     *  Registers a callback that will be invoked with a [Change][] object
     *  as parameter, each time the item value changes.
     *  This method returns a [Subscription][] object.
     */
    subscribe (callback) {
        return this.doc._subscribe(this.path, callback);
    }
}



/**
 *  ## Dict class
 *  A `Dict` is an [Item][] object that represents a JSON object contained in a document.
 */
class Dict extends Item {


    /**
     *  ### Dict.prototype.keys - getter
     *  Returns an array with all the keys contained in the dictionary.
     */
    get keys () {
        return Object.keys(this.doc._getItemValue(this.path));
    }


    /**
     *  ### Dict.prototype.set(key, value)
     *  Assigns the `value` parameter to the `key`.
     *  It throws an exception if value is not a valid JSON value or if it is null.
     */
    set (key, value) {
        key = String(key);
        this.doc.assertOpen().assertWritable([this.path, key]);
        value = Validator.value(value);
        const oldValue = this._doc._getItemValue(this.path, key);
        if (!utils.isEqual(oldValue, value)) {
            this.doc.__setDictItem(this.path, key, value);
        }
    }


    /**
     *  ### Dict.prototype.remove(key)
     *  Removes the item mapped to `key`.
     */
    remove (key) {
        key = String(key);
        this.doc.assertOpen().assertWritable([this.path, key]);
        const oldValue = this._doc._getItemValue(this.path, key);
        if (oldValue !== null) {
            this.doc.__removeDictItem(this.path, key);
        }
    }
}



/**
 *  ## List class
 *  A `List` is an [Item][] object that represents an array object contained in a document.
 */
class List extends Item {

    /**
     *  ### List.prototype.size - getter
     *  Returns the number of items in the list.
     */
    get size () {
        return this.doc._getItemValue(this.path).length;
    }


    /**
     *  ### List.prototype.set(index, item)
     *  Changes the item value at the given index.
     *  If index is negative, it will be considered as relative to the end of the list.
     *  It thows an error if item is not a valid JSON object or if it is null or if index is not a valid number.
     */
    set (index, item) {
        index = Validator.index(index, this.size);
        this.doc.assertOpen().assertWritable([this.path, index]);
        item = Validator.value(item);
        const oldItem = this.doc._getItemValue(this.path, index);
        if (!utils.isEqual(oldItem, item)) {
            this.doc.__setListItem(this.path, index, item);
        }
    }


    /**
     *  ### List.prototype.insert(index, ...items)
     *  Inserts the given `items` at the given `index`.
     *  If index is negative, it will be considered as relative to the end of the list.
     *  It thows an error if any new item is not a valid JSON object or if it is null or if index is not a valid number.
     */
    insert (index, ...items) {
        index = Validator.index(index, this.size, 1);
        this.doc.assertOpen().assertWritable(this.path);
        items = items.map((item) => Validator.value(item));
        for (let item of items.reverse()) {
            this.doc.__insertListItem(this.path, index, item);
        }
    }


    /**
     *  ### List.prototype.append(...items)
     *  Shortcut for `list.insert(list.size, ...items)`
     */
    append (...items) {
        this.insert(this.size, ...items);
    }


    /**
     *  ### List.prototype.remove(index, count)
     *  Removes `count` items starting at `index`.
     *  If index is negative, it will be considered as relative to the end of the list.
     *  If `count` is omitted, it defaults to 1.
     */
    remove (index, count=1) {
        var size = this.size;
        index = Validator.index(index, size);
        this.doc.assertOpen().assertWritable(this.path);
        count = Validator.count(count, index, size);
        for (let i=0; i<count; i++) {
            this.doc.__removeListItem(this.path, index);
        }
    }
}



/**
 *  ## Text class
 *  A `Text` is an [Item][] object that represents a string contained in a document.
 */
class Text extends Item {

    /**
     *  ### Text.prototype.size - getter
     *  Returns the length of the string.
     */
    get size () {
        return this._doc._getItemValue(this.path).length;
    }


    /**
     *  ### Text.prototype.insert(index, subString)
     *  Inserts the given `subString` at the given `index`, shifting the existing characters.
     *  If index is negative, it will be considered as relative to the end of the string.
     */
    insert (index, string) {
        index = Validator.index(index, this.size, 1);
        this.doc.assertOpen().assertWritable(this.path);
        string = String(string);
        this.doc.__insertTextString(this.path, index, string);
    }


    /**
     *  ### Text.prototype.append(subString)
     *  Shortcut for `text.insert(text.size, subString)`
     */
    append (string) {
        this.insert(this.size, string);
    }


    /**
     *  ### Text.prototype.remove(index, count)
     *  Removes `count` characters starting at `index`.
     *  If index is negative, it will be considered as relative to the end of the string.
     *  If `count` is omitted, it defaults to 1.
     */
    remove (index, count=1) {
        var size = this.size;
        index = Validator.index(index, size);
        this.doc.assertOpen().assertWritable(this.path);
        count = Validator.count(count, index, size);
        this.doc.__removeTextString(this.path, index, count);
    }
}



/**
 *  ## Change class
 *  A `Change` object represents a change occurred in a [Document][] [Item][].
 *  It is passed to the change listeners attached to an [Item][] object
 *  via the `Item.prototype.subscribe` method.
 *
 *  ### Properties
 *  - `change.path`: the [Path][] object defining the position of the item that changed
 *  - `change.removed`: the removed (old value) of the item
 *  - `change.inserted`: the added (new value) of the item
 *
 *  A change object with the `removed` and `inserted` property both non null, represents a `set` change.
 *  A change object with null `inserted` property, represents a `remove` change.
 *  A change object with null `removed` property, represents an `insert` change.
 */
class Change {

    constructor (doc, path, removed, inserted) {
        this.doc = doc;
        this.path = Path.from(path);
        this.removed = removed;
        this.inserted = inserted;
    }

    /**
     *  ### Change.prototype.SubChange(subPath)
     *  Returns a [Change][] object representing the effects of this change
     *  on the sub-item at the given `subPath`.
     */
    SubChange (path) {
        path = Path.from(path);

        if (this.path.isSubPathOf(path)) {
            var subPath = this.path.slice(path.length);
            return new Change(this.type, subPath, this.removed, this.inserted);
        }

        else if (path.isSubPathOf(this.path)) {
            var subPath = path.slice(this.path.length);
            var removed = subPath.lookup(this.removed);
            var inserted = subPath.lookup(this.inserted);
            return new Change(this.type, [], removed, inserted);
        }

        else {
            return null;
        }
    }
}



/**
 *  ## Subscription class
 *  Represent a change subscription and it is returned by the `Item.prototype.subscribe` method.
 *
 *  ### Properties
 *  - `subscription.doc`: is the [Document][] containing the observed [Item][]
 *  - `subscription.path`: is the [Path][] of the observed [Item][]
 *  - `subscription.callback`: is the function that gets invoked when the item changes
 */
class Subscription {

    constructor (doc, path, callback) {
        this.doc = doc;
        this.path = Path.from(path);
        this.callback = callback;
    }


    /**
     *  ### Subscription.prototype.cancel()
     *  Cancels the subscription. As a consequence, furute changes to the observed item
     *  will no longer be notified to `subscription.callback`.
     */
    cancel () {
        this.doc._unsubscribe(this);
    }
}



//
//  ## ItemPointer class
//
class ItemPointer extends Pointer {

    init (doc, path) {
        this.doc = doc;
        this.path = path;
        this.item = new Item(this.doc, this.path);
    }

    get target () {
        switch (this.item.type) {

            case "dict":
                return this.dict || (this.dict = new Dict(this.doc, this.path));

            case "list":
                return this.list || (this.list = new List(this.doc, this.path));

            case "text":
                return this.text || (this.text = new Text(this.doc, this.path));

            default:
                return this.item;
        }
    }
}



//
//  ## Validator utility
//
const Validator = {

    value: function (value) {

        if (utils.isPlainObject(value) || utils.isArray(value)) {
            return utils.clone(value);
        }

        if (utils.isString(value) || utils.isNumber(value) || utils.isBoolean(value)) {
            return value;
        }

        throw new Error("Invalid value type.")
    },

    index: function (index, size, overflow=0) {
        index = Number(index);
        if (utils.isInteger(index)) {
            if (index < 0) index = size + index;
            if (0 <= index && index < size+overflow) {
                return index;
            }
        }
        throw new Error("Invalid index.")
    },

    count: function (count, index, size) {
        count = Number(count);
        if (!utils.isInteger(count) || count < 0)
            throw new Error("Count should be a positive integer.");
        return Math.min(count, size-index);
    },
}



//
//  ## Exports
//

Store.Document = Document;
Store.Document.Item = Item;
Store.Document.Dict = Dict;
Store.Document.List = List;
Store.Document.Text = Text;
Store.Document.Change = Change;
Store.Document.Subscription = Subscription;

module.exports = Store;



// Markdown links used for documentation

/**
 *  [Store]: #store-class
 *  [Document]: #document-class
 *  [Item]: #item-class
 *  [Dict]: #dict-class
 *  [List]: #list-class
 *  [Text]: #text-class
 *  [Change]: #change-class
 *  [Subscription]: #subscription-class
 *  [AbstractBackend]: ./AbstractBackend.md
 *  [Path]: ./Path.md#path-class
 *  [Proxy]: https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 */
