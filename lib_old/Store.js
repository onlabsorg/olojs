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

const $backend = Symbol("olojs.Store.$backend");
const $cache = Symbol("olojs.Store.$cache");
const $connected = Symbol("olojs.Store.$connected");
const $doc = Symbol("olojs.Store.$doc");
const $store = Symbol("olojs.Store.$store");
const $id = Symbol("olojs.Store.$id");
const $subscriptions = Symbol("olojs.Store.$subscriptions");
const $path = Symbol("olojs.Store.$path");



/**
 *  ## Store class
 *  A `Store` object represent a database containing JSON documents.
 */
class Store {

    /**
     *  ### constructor
     *  ```javascript
     *  var store = new Store(backend);
     *  ```
     *  - **backend** is an implementation of the [AbstractBackend][] interface.
     *    [More info about backends](./backends.md).
     */
    constructor (backend) {
        this[$backend] = backend;
        this[$cache] = {};
        this[$connected] = false;
    }


    /**
     *  ### Store.prototype.host - getter
     *  Returns the URL of the resource hosting the database.
     */
    get host () {
        return this[$backend].host;
    }


    /**
     *  ### Store.prototype.connect(credentials) - async function
     *  This method establishes a connection with the backend.
     *  - **credentials** is an object that identified the user for access control.
     *    The content of the credential object is defined by the backend implementation.
     */
    async connect (credentials) {
        if (!this.connected) {
            await this[$backend].connect(credentials);
        }
        this[$connected] = true;
    }


    /**
     *  ### Store.prototype.connected - getter
     *  It returns true if the store is connected to the backend.
     */
    get connected () {
        return this[$backend].connected;
    }


    /**
     *  ### Store.prototype.getDocument(docId)
     *  Returns a [Store.Document](#document-class) object.
     *  - **docId** is the name of the document
     *
     *  This method caches the returned object, therefore it returns always
     *  the same object when passing the same docId.
     */
    getDocument (docId) {
        return this[$cache][docId] || (this[$cache][docId] = new Document(this, docId));
    }


    /**
     *  ### Store.prototype.disconnect() async function
     *  Closes the connection to the backend.
     *  Closes all the open documents and cleares the documents cache.
     */
    async disconnect () {
        if (this.connected) {
            for (let docId in this[$cache]) {
                let doc = this.getDocument(docId);
                await doc.close();
            }
            this[$cache] = {};
            await this[$backend].disconnect();
            this[$connected] = false;
        }
    }
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
        this[$store] = store;
        this[$backend] = this.store[$backend].getDocument(docId);

        this[$subscriptions] = [];

        this[$backend].changeCallback = (path, removed, inserted) => {
            Object.getPrototypeOf(this[$backend]).changeCallback.call(this[$backend], path, removed, inserted);
            var change = new Change(this, path, removed, inserted);
            for (let subscription of this[$subscriptions]) {
                var subChange = change.SubChange(subscription.path);
                if (subChange) subscription.callback(subChange);
            }
        }

        this[$cache] = {};
    }


    /**
     *  ### Document.prototype.store - getter
     *  Returns the [Store][] object that contains this document.
     */
    get store () {
        return this[$store];
    }


    /**
     *  ### Document.prototype.id - getter
     *  Returns the name of this document.
     */
    get id () {
        return this[$backend].id;
    }


    /**
     *  ### Document.prototype.open() - async function
     *  Opens and establishes a connection to the remote document.
     *  This method will fail and throw a `ReadPermissionError` exception
     *  if the user has no read permissions on the document.
     */
    async open () {
        await this[$backend].open();
    }


    /**
     *  ### Document.prototype.isOpen - getter
     *  Returns true if the document is open.
     */
    get isOpen () {
        return Boolean(this[$backend].isOpen);
    }


    /**
     *  ### Document.prototype.readable - getter
     *  Returns true if the user has read permissions on this document.
     */
    get readable () {
        return this[$backend].readable;
    }


    /**
     *  ### Document.prototype.writable - getter
     *  Returns true if the user has write permissions on this document.
     */
    get writable () {
        return this[$backend].writable;
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
        if (itemPath === null) return null;
        var itemId = "/" + String(itemPath);
        return this[$cache][itemId] || (this[$cache][itemId] = new ItemPointer(this, itemPath));
    }


    //
    //  Return the internal value associated with the given path
    //
    _getItemValue (...path) {
        path = new Path(...path);
        return this[$backend].getItemValue(path);
    }


    //
    //  Subscribes a callback for changes.
    //  This is used by Item.prototype.subscribe.
    //
    _subscribe (path, callback) {
        var subscription = new Subscription(this, path, callback);
        this[$subscriptions].push(subscription);
        return subscription;
    }


    //
    // Cancels an existing subscription.
    // This is used by Subscription.prototype.cancel()
    //
    _unsubscribe (subscription) {
        var index = this[$subscriptions].indexOf(subscription);
        if (index !== -1) {
            this[$subscriptions].splice(index, 1);
        }
    }


    /**
     *  ### Document.prototype.close() - async function
     *  Closes the connection with the document, cancels all the
     *  subscriptions and clears the items cache.
     */
    async close () {
        await this[$backend].close();
        this[$subscriptions] = [];
        this[$cache] = {};
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
        this[$doc] = doc;
        this[$path] = Path.from(path);
    }


    /**
     *  ### Item.prototype.doc - getter
     *  Returns the [Document][] object that contains this item.
     */
    get doc () {
        return this[$doc];
    }


    /**
     *  ### Item.prototype.path - getter
     *  Returns the [Path][] object that defines the item position inside its document.
     */
    get path () {
        return this[$path];
    }


    //
    //  Deprecated
    //
    get fullPath () {
        return new Path(this.doc.store.host, this.doc.id, this.path);
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
        var value = this[$doc]._getItemValue(this.path);
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
            return this[$doc].get(path);
        } else {
            return this[$doc]._getItem(this.path, path);
        }
    }


    /**
     *  ### Item.prototype.value - getter
     *  Returns a deep copy of the underlying data.
     *  Changing the returned value will not change the document data.
     */
    get value () {
        return utils.clone(this[$doc]._getItemValue(this.path));
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
        return this[$doc]._subscribe(this.path, callback);
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
        return Object.keys(this[$doc]._getItemValue(this.path));
    }


    /**
     *  ### Dict.prototype.set(key, value)
     *  Assigns the `value` parameter to the `key`.
     *  It throws an exception if value is not a valid JSON value or if it is null.
     */
    set (key, value) {
        key = String(key);
        value = Validator.value(value);
        const oldValue = this[$doc]._getItemValue(this.path, key);
        if (!utils.isEqual(oldValue, value)) {
            this[$doc][$backend].setDictItem(this.path, key, value);
        }
    }


    /**
     *  ### Dict.prototype.remove(key)
     *  Removes the item mapped to `key`.
     */
    remove (key) {
        key = String(key);
        const oldValue = this[$doc]._getItemValue(this.path, key);
        if (oldValue !== null) {
            this[$doc][$backend].removeDictItem(this.path, key);
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
        return this[$doc]._getItemValue(this.path).length;
    }


    /**
     *  ### List.prototype.set(index, item)
     *  Changes the item value at the given index.
     *  If index is negative, it will be considered as relative to the end of the list.
     *  It thows an error if item is not a valid JSON object or if it is null or if index is not a valid number.
     */
    set (index, item) {
        index = Validator.index(index, this.size);
        item = Validator.value(item);
        const oldItem = this[$doc]._getItemValue(this.path, index);
        if (!utils.isEqual(oldItem, item)) {
            this[$doc][$backend].setListItem(this.path, index, item);
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
        items = items.map((item) => Validator.value(item));
        for (let item of items.reverse()) {
            this[$doc][$backend].insertListItem(this.path, index, item);
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
        count = Validator.count(count, index, size);
        for (let i=0; i<count; i++) {
            this[$doc][$backend].removeListItem(this.path, index);
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
        return this[$doc]._getItemValue(this.path).length;
    }


    /**
     *  ### Text.prototype.insert(index, subString)
     *  Inserts the given `subString` at the given `index`, shifting the existing characters.
     *  If index is negative, it will be considered as relative to the end of the string.
     */
    insert (index, string) {
        index = Validator.index(index, this.size, 1);
        string = String(string);
        this[$doc][$backend].insertTextString(this.path, index, string);
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
        count = Validator.count(count, index, size);
        this[$doc][$backend].removeTextString(this.path, index, count);
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
