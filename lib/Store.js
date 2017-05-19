/**
 *  # olojs.Store module.
 *  - **Version:** 0.2.x
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
 *  ## Store abstract class
 *  A `Store` object in a frontend interface to a database containing JSON documents.
 */
class Store {

    constructor () {
        this._cache = {};
    }


    /**
     *  ### Store.prototype.connect(credentials) - async method
     *  This method establishes a connection with the backend.
     *  
     *  ###### Parameters
     *  - `credentials` : is an implementation-specific object that identified the user for access control.
     *    
     *  ###### Returns
     *  - `undefined`
     */
    async connect (credentials) {
        if (!this.connected) {
            await this.__connect(credentials);
        }
    }


    /**
     *  ### Store.prototype.connected - getter
     *  ###### Returns
     *  - `true` if the store-backend connection is active
     *  - `false` otherwise
     */
    get connected () {
        return this.__connected();
    }


    /**
     *  ### Store.prototype.getDocument(docId) - async method
     *  ###### Parameters
     *  - `docId` : a remote document id  
     *    
     *  ###### Returns
     *  - the [Document][] object with the given id
     *  - the same object when passing the same id (documents are cached)
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
     *  Closes all the open documents.  
     *  Cleares the documents cache.
     *
     *  ###### Resolves
     *  - `undefined` when the connection is established  
     *    
     *  ###### Rejects
     *  - `Error` if the disconnection failed
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
     *  
     *  The `__connect` method implementations should
     *  - establish a connection to the backend
     *  - log-in the user to the backend  
     *    
     *  ###### Parameters
     *  - `credentials` : implementation-specific object used to log-in  
     *    
     *  ###### Resolves
     *  - `undefined` when the connection is established and the user logged-in
     *    
     *  ###### Rejects
     *  - `Error` if either connection or login fails
     */
    async __connect (credentials) {}


    /**
     *  ### Document.prototype.__connected() - async virtual method
     *  ###### Returns
     *  - `true` if the store-backend connection is active
     *  - `false` otherwise
     */
    __connected () {}


    /**
     *  ### Document.prototype.__disconnect() - async virtual method
     *  Closes the connection to the backend.  
     *
     *  ###### Resolves
     *  - `undefined` when the connection is established  
     *    
     *  ###### Rejects
     *  - `Error` if the disconnection failed
     */
    async __disconnect () {}
}



/**
 *  ## Document abstract class
 *  A `Document` object represents a JSON document contained in a [Store][].
 */
class Document {

    /**
     *  ### new Document(store, docId) - constructor
     *  
     *  ###### Parameters
     *  - `store` : is the [Store][] containing this document
     *  - `docId` : is the id of this document  
     *    
     *  > You shouldn't call this constructor directly. Use `Store.prototype.getDocument` instead.
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
     *  ###### Returns
     *  - the [Store][] that contains this document
     */
    get store () {
        return this._store;
    }


    /**
     *  ### Document.prototype.id - getter
     *  ###### Returns 
     *  - the id of this document
     */
    get id () {
        return this._id;
    }


    /**
     *  ### Document.prototype.open() - async method
     *  Fetches the remote document and subscribes to change notifications.
     *  If the remote document doesn't exists, creates it.
     *  
     *  ###### Resolves
     *  - `undefined` when the document has been fetched and subscribed
     *  
     *  ###### Rejects
     *  - `errors.ReadPermissionError` if the user has no read permissions on the document
     *  - `errors.WritePermissionError` if the document doesn't exist and the user has no permissions to create it
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
    //  throws an error if the document is not open
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
     *  ### Document.prototype.isReadable(path) - method
     *  
     *  ###### Parameters
     *  - `path` : a document item path  
     *    
     *  ###### Returns
     *  - `true` if the user has read permissions on the given path
     *  - `false` otherwise
     */
    isReadable (path) {
        const role = this.__getUserRole();
        return role >= roles.READER;
    }


    //
    //  throws an error if the document path is not readable
    //
    _assertReadable (path) {
        if (!this.isReadable(path)) {
            throw new errors.ReadPermissionError(this.id, Path.from(path));
        }
        else {
            return this;
        }
    }


    /**
     *  ### Document.prototype.isWritable(path) - method
     *  
     *  ###### Parameters
     *  - `path` : a document item path  
     *    
     *  ###### Returns
     *  - `true` if the user has write permissions on the given path
     *  - `false` otherwise
     */
    isWritable (path) {
        path = Path.from(path);
        const role = this.__getUserRole();
        return path[0] === "root" ? role >= roles.WRITER : role >= roles.OWNER;
    }


    //
    //  throws an error if the document path is not writable
    //
    _assertWritable (path) {
        if (!this.isWritable(path)) {
            throw new errors.WritePermissionError(this.id, Path.from(path));
        }
        else {
            return this;
        }
    }


    /**
     *  ### Document.prototype.get(path) - method
     *  Creates a pointer to the to a document item.  
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
     *  ###### Parameters
     *  - `path` : a document item path  
     *    
     *  ###### Returns
     *  - the pointer to the document item
     *  - the same pointer when passing the same path (caches items)  
     *    
     *  ###### Throws
     *  - `errors.DocumentClosedError` if the document is not open
     *  - `errors.ReadPermissionError` if the user has no read permissions on the document
     *
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
        this.assertOpen()._assertReadable(itemPath);
        if (itemPath === null) return null;
        var itemId = "/" + String(itemPath);
        return this._cache[itemId] || (this._cache[itemId] = new ItemPointer(this, itemPath));
    }


    //
    //  Returns the internal value associated with the given path
    //
    _getItemValue (...path) {
        path = new Path(...path);
        this.assertOpen()._assertReadable(path);
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
     *  ### Document.prototype.close() - async method
     *  Closes the connection with the document, cancels all the
     *  subscriptions and clears the items cache.
     *  
     *  ###### Resolves
     *  - `undefined` if the document has been successfully closed
     *  
     *  ###### Rejects
     *  - `Error` if the closing didn't succeed.
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
     *  It gets invoked by the `Store.prototype.getDocument` method.
     *    
     *  ###### Should return
     *  - `undefined` always
     */
     async __init () {}


     /**
      *  ### Store.Document.prototype.__open() - async virtual method
      *  Fetches the remote document and subscribes to change notifications.
      *  If the remote document doesn't exists, creates it.
      *  
      *  ###### Resolves
      *  - `undefined` when the document has been fetched and subscribed
      *  
      *  ###### Rejects
      *  - `errors.ReadPermissionError` if the user has no read permissions on the document
      *  - `errors.WritePermissionError` if the document doesn't exist and the user has no permissions to create it
      */
     async __open () {}


     /**
      *  ### Store.Document.prototype.__getUserRole() - virtual method
      *  THe `.__getUserRole` implementations should retrieve the user role 
      *  on this document.
      *  
      *  ###### Should return
      *  one of the following values:
      *     
      *  | Role         | meta data  |    body    |
      *  |--------------|:----------:|:----------:|
      *  | roles.OWNER  |     rw     |     rw     |
      *  | roles.WRITER |     ro     |     rw     |
      *  | roles.READER |     ro     |     ro     |
      *  | roles.NONE   |     -      |     -      |
      */
     __getUserRole () {}


     /**
      *  ### Store.Document.prototype.__getItemValue(path) - virtual method
      *  The `.__getItemValue` method implementations should retrieve the value of a
      *  document item.
      *  
      *  ###### Parameters
      *  - `path` : the document item path  
      *    
      *  ###### Should return
      *  - the item raw value if it exists
      *  - `null` if the item path doesn't exist
      *    
      *  > The implementation can trust that
      *  > - this document is open
      *  > - `path` is always a [Path][] instance,
      *  > - the user has read permissions on the document path
      */
     __getItemValue (path) {}


     /**
      *  ### Store.Document.prototype.setDictItem(dictPath, key, newValue) - virtual method
      *  The `.__setDictItem` method implementations should change the value of 
      *  of a dictionary item.
      *  
      *  As a consequence of this change, `this._dispatch` should be called.
      *  
      *  ###### Parameters
      *  - `dictPath` : the path to the dictionary containing the target item
      *  - `key` : the key of the target item
      *  - `newValue` : the value to assign to the target item  
      *    
      *  ###### Should return
      *  - `undefined` if the assignment was successful  
      *    
      *  > The implementation can trust that:
      *  > - this document is open
      *  > - `dictPath` is always a [Path][] instance
      *  > - `dictPath` points always to a dictionary item
      *  > - `newValue` is a valid JSON value
      *  > - the user has write permissions on the document path
      */
     __setDictItem (dictPath, key, value) {}


     /**
      *  ### Store.Document.prototype.__removeDictItem(dictPath, key) - virtual method
      *  The `.__removeDictItem` method implementations should remove a dictionary item.
      *    
      *  As a consequence of this change, `this._dispatch` should be called.  
      *  
      *  ###### Parameters
      *  - `dictPath` : the path to the dictionary containing the target item
      *  - `key` : the key of the target item  
      *    
      *  ###### Should return
      *  - `undefined` if the item was successfully removed  
      *    
      *  > The implementation can trust that:
      *  > - this document is open
      *  > - `path` is always a [Path][] instance
      *  > - `path` points always to a dictionary item
      *  > - the user has write permissions on the document path
      */
     __removeDictItem (dictPath, key) {}


     /**
      *  ### Store.Document.prototype.__setListtem(listPath, index, newItem) - virtual method
      *  The `.__setListItem` method implementations should change the value of a list item.
      *    
      *  As a consequence of this change, `this._dispatch` should be called.
      *  
      *  ###### Parameters
      *  - `listPath` : the path to the list containing the target item
      *  - `index` : the position of the target item  
      *  - `newItem` : the value to assign to the target item
      *    
      *  ###### Should return
      *  - `undefined` if the assignment was successfull  
      *    
      *  > The implementation can trust that:
      *  > - this document is open
      *  > - `path` is always a [Path][] instance
      *  > - `path` points always to an array item
      *  > - `newItem` is a valid JSON value
      *  > - the user has write permissions on the document path
      */
     __setListItem (itemPath, index, item) {}


     /**
      *  ### Store.Document.prototype.__insertListItem(listPath, index, newItem) - virtual method
      *  The `.__insertListItem` method implementations should insert an item 
      *  in a list and shift the other items.
      *    
      *  As a consequence of this change, `this._dispatch` should be called.
      *  
      *  ###### Parameters
      *  - `listPath` : the path to the list containing the target item
      *  - `index` : the position where the item should be placed
      *  - `newItem` : the item to be inserted  
      *    
      *  ###### Should return
      *  - `undefined` if the item was successfully inserted  
      *    
      *  > The implementation can trust that:
      *  > - this document is open
      *  > - `path` is always a [Path][] instance
      *  > - `path` points always to an array item
      *  > - `index` is a valid array index
      *  > - `newItem` is a valid JSON value
      *  > - the user has write permissions on the document path
      */
     __insertListItem (itemPath, index, item) {}


     /**
      *  ### Store.Document.prototype.__removeListItem(listPath, index) - virtual method
      *  The `.__removeListItem` method implementations should remove an item
      *  from its parent list and shift the other items.
      *    
      *  As a consequence of this change, `this._dispatch` should be called.
      *  
      *  ###### Parameters
      *  - `listPath` : the path to the list containing the target item
      *  - `index` : the position of the target item
      *    
      *  ###### Should return
      *  - `undefined` if the item was successfully removed  
      *    
      *  > The implementation can trust that:
      *  > - this document is open
      *  > - `path` is always a [Path][] instance
      *  > - `path` points always to an array item
      *  > - `index` is a valid array index
      *  > - the user has write permissions on the document path
      */
     __removeListItem (itemPath, index) {}


     /**
      *  ### Store.Document.prototype.__insertTextString(textPath, index, subString) - virtual method
      *  The `.__insertTextString` method implementations should insert a ssub-string
      *  in a text item.
      *    
      *  As a consequence of this change, `this._dispatch` should be called.
      *  
      *  ###### Parameters
      *  - `textPath` : the path to the target text item
      *  - `index` : the position where the sub-string should be inserted
      *  - `subString` : the string to be inserted  
      *    
      *  ###### Should return
      *  - `undefined` if the sub-string was successfully inserted  
      *    
      *  > The implementation can trust that:
      *  > - this document is open
      *  > - `path` is always a [Path][] instance
      *  > - `path` points always to a text item
      *  > - `index` is a valid string index
      *  > - the user has write permissions on the document path
      */
     __insertTextString (textPath, index, string) {}


     /**
      *  ### Store.Document.prototype.__removeTextString(textPath, index, count) - virtual method
      *  The `.__removeTextString` method implementations should remove a sub-string
      *  from a text item,
      *    
      *  As a consequence of this change, `this._dispatch` should be called.
      *  
      *  ###### Parameters
      *  - `textPath` : the path to the target text item
      *  - `index` : the position where to start removing characters
      *  - `count` : the number of characters to be removed    
      *    
      *  ###### Should return
      *  - `undefined` if the sub-string was successfully removed  
      *    
      *  > The implementation can trust that:
      *  > - this document is open
      *  > - `path` is always a [Path][] instance
      *  > - `path` points always to a text item
      *  > - `index` is a valid string index
      *  > - `count` is a valid number of characters
      *  > - the user has write permissions on the document path
      */
     __removeTextString (textPath, index, count) {}


     /**
      *  ### Store.Document.prototype.__close() - async virtual method
      *  The `.__close` method implementations should disconnect from the 
      *  backend document and cancel the change subscription.
      *  
      *  ###### Should resolve
      *  - `undefined` if the document was successfully closed
      *    
      *  ###### Should reject
      *  - `Error` if the document could not be closed
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
 *  An `Item` object represents a value contained in a JSON document.
 */
class Item {

    /**
     *  ### new Item(doc, path) - constructor
     *  
     *  ###### Parameters
     *  - `doc` : is the [Document][] that contains the item
     *  - `path` is the [Path][] object or path literal or path array that
     *    defines the item position inside the document  
     *    
     *  > This constructor should not be called directly. 
     *  > Use `Document.prototype.get` insetead.
     */
    constructor (doc, path) {
        this._doc = doc;
        this._path = Path.from(path);
    }


    /**
     *  ### Item.prototype.doc - getter
     *  ###### Returns
     *  - the [Document][] object that contains this item.
     */
    get doc () {
        return this._doc;
    }


    /**
     *  ### Item.prototype.path - getter
     *  ###### Returns 
     *  - the [Path][] object that defines the item position inside its document.
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
     *  
     *  ###### Returns 
     *  - `"dict"` if the underlying data is an object
     *  - `"list"` if the underlying data is an array
     *  - `"text"` if the underlying data is a string
     *  - `"numb"` if the underlying data is a number
     *  - `"bool"` if the underlying data is a boolean
     *  - `"none"` if the document path doesn't exist  
     *    
     *  ###### Throws
     *  - `errors.DocumentClosedError` if the containing document is not open
     *  - `errors.ReadPermissionError` if the user has no read permissions
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
     *  ### Item.prototype.get(subPath) - method
     *  Retrieves a sub-item of this item.  
     *  In other words it is a shortcut for `item.doc.get([item.path, subPath])`
     *  
     *  ###### Parameters
     *  - `subPath` : the relarive path of the target sub-item
     *    
     *  ###### Returns 
     *  - a pointer to the sub-item.
     *    
     *  ###### Throws
     *  - `errors.DocumentClosedError` if the containing document is not open
     *  - `errors.ReadPermissionError` if the user has no read permissions
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
     *  Retrieves this item value.
     *  
     *  ###### Returns
     *  - a deep copy of the underlying data.
     *  - `null` if this item path doesn't exist
     *    
     *  ###### Throws
     *  - `errors.DocumentClosedError` if the containing document is not open
     *  - `errors.ReadPermissionError` if the user has no read permissions
     *  
     *  > Changing the returned value will not change the document data.
     */
    get value () {
        return utils.clone(this.doc._getItemValue(this.path));
    }


    /**
     *  ### Item.prototype.value - setter
     *  Changes the underlying data to a deep copy of the passed value.
     *  
     *  ###### Returns
     *  - `undefined` if the assignment was successfull
     *  
     *  ###### Throws
     *  - `errors.DocumentClosedError` if the containing document is not open
     *  - `errors.ReadPermissionError` if the user has no read permissions
     *  - `errors.WritePermissionError` if the user has no write permissions
     *  - `Error` if trying to set the document root item (`doc.get()`) 
     *    to something other than a dictionary
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
     *  ### Item.prototype.subscribe(callback) - method
     *  Registers a callback that will be invoked with a [Change][] object
     *  as parameter, each time the item value changes.
     *  
     *  ###### Returns
     *  a [Subscription][] object
     *  
     *  ###### Throws
     *  - `errors.DocumentClosedError` if the document is not open
     */
    subscribe (callback) {
        return this.doc._subscribe(this.path, callback);
    }
}



/**
 *  ## Dict class
 *  A `Dict` is an [Item][] object that represents a dictionary contained in 
 *  a document.
 */
class Dict extends Item {

    /**
     *  ### Dict.prototype.keys - getter
     *  
     *  ###### Returns 
     *  - an array with all the keys contained in the dictionary.
     *  
     *  ###### Throws
     *  - `errors.DocumentClosedError` if the document is not open
     *  - `errors.ReadPermissionError` if the user has no read pemissions
     */
    get keys () {
        return Object.keys(this.doc._getItemValue(this.path));
    }


    /**
     *  ### Dict.prototype.set(key, value)
     *  Assigns a value to a key.
     *  
     *  ###### Parameters
     *  - `key` : the key to be assigned a new value
     *  - `value` : the new value
     *  
     *  ###### Returns
     *  - `udefined` if the assigment was successfull
     *  
     *  ###### Throws
     *  - `errors.DocumentClosedError` if the document is not open
     *  - `errors.WritePermissionError` if the user has no write pemissions
     *  - `Error` if the new value is not a valid JSON object or if it is null
     */
    set (key, value) {
        
        key = String(key);
        
        this.doc.assertOpen()._assertWritable([this.path, key]);
        
        value = Validator.value(value);
        
        const oldValue = this._doc._getItemValue(this.path, key);
        if (!utils.isEqual(oldValue, value)) {
            this.doc.__setDictItem(this.path, key, value);
        }
    }


    /**
     *  ### Dict.prototype.remove(key)
     *  Removes a key
     *  
     *  ###### Parameters
     *  - `key` : the key to be removed
     *  
     *  ###### Returns
     *  - `udefined` if the key was successfully removed
     *  
     *  ###### Throws
     *  - `errors.DocumentClosedError` if the document is not open
     *  - `errors.WritePermissionError` if the user has no write pemissions
     */
    remove (key) {
        
        key = String(key);
        
        this.doc.assertOpen()._assertWritable([this.path, key]);
        
        const oldValue = this._doc._getItemValue(this.path, key);
        if (oldValue !== null) {
            this.doc.__removeDictItem(this.path, key);
        }
    }
}



/**
 *  ## List class
 *  A `List` is an [Item][] object that represents an array object contained 
 *  in a JSON document.
 */
class List extends Item {

    /**
     *  ### List.prototype.size - getter
     *  
     *  ###### Returns 
     *  - the number of items in the list.
     *  
     *  ###### Throws
     *  - `errors.DocumentClosedError` if the document is not open
     *  - `errors.ReadPermissionError` if the user has no read pemissions
     */
    get size () {
        return this.doc._getItemValue(this.path).length;
    }


    /**
     *  ### List.prototype.set(index, item) - method
     *  Changes an item value.
     *  
     *  ###### Parameters
     *  - `index` : the position of the item to be assigned a value
     *  - `item` : the new item value
     *  
     *  ###### Returns
     *  - `undefined` if the assignment was successfull
     *  
     *  ###### Throws
     *  - `errors.DocumentClosedError` if the document is not open
     *  - `errors.WritePermissionError` if the user has no write pemissions
     *  - `Error` if the new item value is not a valid JSON object or if it is null
     *  - `Error` if index is not a valid number.
     *  
     *  > If index is negative, it will be considered as relative to the end 
     *  > of the list.
     */
    set (index, item) {
        
        index = Validator.index(index, this.size);
        
        this.doc.assertOpen()._assertWritable([this.path, index]);
        
        item = Validator.value(item);
        
        const oldItem = this.doc._getItemValue(this.path, index);
        if (!utils.isEqual(oldItem, item)) {
            this.doc.__setListItem(this.path, index, item);
        }
    }


    /**
     *  ### List.prototype.insert(index, ...items) - method
     *  Inserts sub-items to a list.
     *  
     *  ###### Parameters
     *  - `index` : the position of the item to be assigned a value
     *  - `...items` : the sub-items to be added
     *  
     *  ###### Returns
     *  - `undefined` if the items were successfully inserted
     *  
     *  ###### Throws
     *  - `errors.DocumentClosedError` if the document is not open
     *  - `errors.WritePermissionError` if the user has no write pemissions
     *  - `Error` if the new item value is not a valid JSON object or if it is null
     *  - `Error` if index is not a valid number.
     *  
     *  > If index is negative, it will be considered as relative to the end 
     *  > of the list.
     */
    insert (index, ...items) {
        
        index = Validator.index(index, this.size, 1);
        
        this.doc.assertOpen()._assertWritable(this.path);
        
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
     *  Remove items from a list.
     *  
     *  ###### Parameters
     *  - `index` : the position of the first item to be removed
     *  - `count` : the number of items to be removed (default to 1)
     *  
     *  ###### Returns
     *  - `undefined` if the items were successfully removed
     *  
     *  ###### Throws
     *  - `errors.DocumentClosedError` if the document is not open
     *  - `errors.WritePermissionError` if the user has no write pemissions
     *  - `Error` if index is not a valid number.
     *  
     *  > If index is negative, it will be considered as relative to the end 
     *  > of the list.
     */
    remove (index, count=1) {
        
        const size = this.size;
        
        index = Validator.index(index, size);
        
        this.doc.assertOpen()._assertWritable(this.path);
        
        count = Validator.count(count, index, size);
        for (let i=0; i<count; i++) {
            this.doc.__removeListItem(this.path, index);
        }
    }
}



/**
 *  ## Text class
 *  A `Text` is an [Item][] object that represents a string contained in 
 *  a JSON document.
 */
class Text extends Item {


    /**
     *  ### Text.prototype.size - getter
     *  
     *  ###### Returns 
     *  - the length of the string.
     *
     *  ###### Throws
     *  - `errors.DocumentClosedError` if the document is not open
     *  - `errors.ReadPermissionError` if the user has no read pemissions
     */
    get size () {
        return this._doc._getItemValue(this.path).length;
    }


    /**
     *  ### Text.prototype.insert(index, subString) - method
     *  Inserts a sub-string in a text item.
     *  
     *  ###### Parameters 
     *  - `index` : the position where the sub-string should be inserted
     *  - `subString` : the string to be inserted
     *  
     *  ###### Returns
     *  - `undefined` if the sub-string was successfully inserted
     *  
     *  ###### Throws
     *  - `errors.DocumentClosedError` if the document is not open
     *  - `errors.WritePermissionError` if the user has no write pemissions
     *  - `Error` if index is not a valid number.
     *  
     *  > If index is negative, it will be considered as relative to the end 
     *  > of the text.
     */
    insert (index, string) {
        
        index = Validator.index(index, this.size, 1);
        
        this.doc.assertOpen()._assertWritable(this.path);
        
        this.doc.__insertTextString(this.path, index, String(string));
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
     *  Removes a sub-string from a text item.
     *  
     *  ###### Parameters 
     *  - `index` : the position of the first character to be removed
     *  - `count` : the number of characters to be removed (defaults to 1)
     *  
     *  ###### Returns
     *  - `undefined` if the sub-string was successfully removed
     *  
     *  ###### Throws
     *  - `errors.DocumentClosedError` if the document is not open
     *  - `errors.WritePermissionError` if the user has no write pemissions
     *  - `Error` if index is not a valid number.
     *  
     *  > If index is negative, it will be considered as relative to the end 
     *  > of the text.
     */
    remove (index, count=1) {
        
        var size = this.size;
        
        index = Validator.index(index, size);
        
        this.doc.assertOpen()._assertWritable(this.path);
        
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
 *  ###### Properties
 *  - `change.path`: the [Path][] object defining the position of the item that changed
 *  - `change.removed`: the removed (old value) of the item
 *  - `change.inserted`: the added (new value) of the item
 *  
 *  > - A change object with the `removed` and `inserted` property both non null, represents a `set` change.  
 *  > - A change object with null `inserted` property, represents a `remove` change.  
 *  > - A change object with null `removed` property, represents an `insert` change.  
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
     *  Genertates the Change object relative to a sub-item.
     *  
     *  ###### Parameters
     *  - `path` : the subPath of the target item
     *  
     *  ###### Returns 
     *  - a [Change][] object representing the effects of this change
     *    on the sub-item.
     *  - `null` if the sub-item is not affected by this change
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
 *  ###### Properties
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
     *  ### Subscription.prototype.cancel() - method
     *  Cancels the subscription. As a consequence, furute changes to the observed item
     *  will no longer be notified to `subscription.callback`.
     *  
     *  ###### Returns
     *  `undefined` if the subscription was successfully cancelled
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
 *  [Store]: #store-abstract-class
 *  [Document]: #document-abstract-class
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
