/**
 *  # olojs.AbstractBackend module
 *  - **Version:** 0.1.0
 *  - **Author:** Marcello Del Buono <m.delbuono@onlabs.org>
 *  - **License:** MIT
 *  - **Content:**
 *      - [class AbstractBackend](#abstractbackend-class)
 *      - [class AbstractBackend.Document](#abstractbackenddocument-class)
 */



const rights = require("../rights");
const errors = require("../errors");



/**
 *  ## AbstractBackend class
 *  This abstract class describes the interface to a JSON databse.  
 */
class AbstractBackend {

    /**
     *  ### Constructor
     *  A constructor requires a `host` name as parameter.  
     *  You can do your Backend initialization here, but `super()`` must be called
     *  because this constructor does some general initializations itself.
     */
    constructor (host) {
        this.host = host;
        this.documentCache = {};
    }


    /**
     *  ### AbstractBackend.prototype.connect - async virtual method
     *  The `connect` method implementations should establish a connection
     *  to the remote database and resolve when the connection is open. 
     *  They should also reject in case of error.  
     *  
     *  The `connect` method should also login the user to the remote
     *  backend using the passed implementation-specific `credentials` object.
     */
    async connect (credentials) {}


    /**
     *  ### AbstractBackend.prototype.connected - virtual getter
     *  The `connected` getter implementations should return true if the 
     *  connection is established.
     */
    get connected () {}


    /**
     *  ### AbstractBackend.prototype.getDocument
     *  This method returns a `AbsstractBackend.Document` instance.  
     *  It should not be defined by interface implementations but just inherited.  
     *  The interface implementations should just implement the `AbstactBackend.Document`
     *  interface as a Backend static property.
     */
    getDocument (collection, id) {
        var path = `${collection}/${id}`;
        var doc = this.documentCache[path];
        if (!doc) {
            doc = new this.constructor.Document(this, collection, id);
            this.documentCache[path] = doc;
        }
        return doc;
    }


    /**
     *  ### AbstractBackend.prototype.disconnect - async virtual method
     *  The `disconnect` method implementations should close the connection
     *  to the remote database and resolve when the connection is closed. 
     *  They should also reject in case of error.  
     */
    async disconnect () {}
}



/**
 *  ## AbstractBackend.Document class
 *  This abstract class describes the interface to a JSON databse's document.  
 *  Each Backend implementation should have a `Backend.Document` property
 *  extending this class.  
 *
 *  ### Properties
 *  - `document.store` is the Backend object that created this document
 *  - `document.collection` is the name of the backend collection that contains the document
 *  - `document.id` is the name of the document
 *    
 *  The AbstractBackend.Document implementations should not worry about creating
 *  this properties, because the Abstract class takes care of if. 
 */
AbstractBackend.Document = class {

    /**
     *  ### Constructor
     *  This class should not be instantiated directrly: the `AbstractStore.getDocument`
     *  method takes care of it.
     */
    constructor (store, collection, id) {
        this.store = store;
        this.collection = collection;
        this.id = id;
    }


    /**
     *  ### AbstractBackend.Document.prototype.open() - async virtual method
     *  The `.open` method implementations should connect to the backend document and
     *  throw an error in case of failure.  
     *  They should also call the `this._assertReadable()` method which will throw a
     *  standard exception if the user doesn't have read permissions.
     */
    async open () {}


    /**
     *  ### AbstractBackend.Document.prototype.isOpen() - virtual method
     *  The `.isOpen` method implementations should return true if the
     *  document is open.
     */
    get isOpen () {}


    /**
     *  ### AbstractBackend.Document.prototype.readable - virtual getter
     *  The `.readable` getter implementations should return true if the
     *  user has read access to this document.
     */
    get readable () {}


    /**
     *  ### AbstractBackend.Document.prototype.writable - virtual getter
     *  The `.writable` getter implementations should return true if the
     *  user has write access to this document.
     */
    get writable () {}


    /**
     *  ### AbstractBackend.Document.prototype.getItemValue(path) - virtual method
     *  The `.getItemValue` method implementations should return the value of the
     *  document item at the given path parameter.  
     *    
     *  The implementation should also call `this._assertOpen()` and `this._assertReadable()`.  
     *    
     *  The implementation can trust that `path` is always a [Path][] instance.
     */
    getItemValue (path) {}


    /**
     *  ### AbstractBackend.Document.prototype.setDictItem(dictPath, key, newValue) - virtual method
     *  The `.setDictItem` method implementations should change the value of the
     *  item mapped to `key` in the dictionary at `path`.  
     *     
     *  As a consequence of this change, `this.changeCallback` should be called.
     *    
     *  The implementation should call also `this._assertOpen()` and `this._assertWritable()`.  
     *    
     *  The implementation can trust that: 
     *  - `path` is always a [Path][] instance
     *  - `path` points always to a dictionary item
     *  - `newValue` is a valid JSON value
     */
    setDictItem (path, key, newValue) {}


    /**
     *  ### AbstractBackend.Document.prototype.removeDictItem(dictPath, key) - virtual method
     *  The `.removeDictItem` method implementations should remove the `key` from the
     *  dictionary item at `path`.  
     *     
     *  As a consequence of this change, `this.changeCallback` should be called.
     *    
     *  The implementation should also call `this._assertOpen()` and `this._assertWritable()`.  
     *    
     *  The implementation can trust that: 
     *  - `path` is always a [Path][] instance
     *  - `path` points always to a dictionary item
     */
    removeDictItem (path, key) {}


    /**
     *  ### AbstractBackend.Document.prototype.setListtem(listPath, index, newItem) - virtual method
     *  The `.setListItem` method implementations should change the value of the
     *  item mapped to `index` in the array at `path`.  
     *     
     *  As a consequence of this change, `this.changeCallback` should be called.
     *    
     *  The implementation should also call `this._assertOpen()` and `this._assertWritable()`.  
     *    
     *  The implementation can trust that: 
     *  - `path` is always a [Path][] instance
     *  - `path` points always to an array item
     *  - `newItem` is a valid JSON value
     */
    setListItem (path, index, newItem) {}


    /**
     *  ### AbstractBackend.Document.prototype.insertListItem(listPath, index, newItem) - virtual method
     *  The `.insertListItem` method implementations should insert the `newItem` at `index`
     *  in the array at `path` and shift the other items.  
     *     
     *  As a consequence of this change, `this.changeCallback` should be called.
     *    
     *  The implementation should also call `this._assertOpen()` and `this._assertWritable()`.  
     *    
     *  The implementation can trust that: 
     *  - `path` is always a [Path][] instance
     *  - `path` points always to an array item
     *  - `index` is a valid array index
     *  - `newItem` is a valid JSON value
     */
    insertListItem (path, index, newItem) {}


    /**
     *  ### AbstractBackend.Document.prototype.removeListItem(listPath, index) - virtual method
     *  The `.removeListItem` method implementations should remove the array item 
     *  `index` from the array at `path` and shift the other items.  
     *     
     *  As a consequence of this change, `this.changeCallback` should be called.
     *    
     *  The implementation should also call `this._assertOpen()` and `this._assertWritable()`.  
     *    
     *  The implementation can trust that: 
     *  - `path` is always a [Path][] instance
     *  - `path` points always to an array item
     *  - `index` is a valid array index
     */
    removeListItem (path, index) {}


    /**
     *  ### AbstractBackend.Document.prototype.insertTextString(textPath, index, subString) - virtual method
     *  The `.insertTextString` method implementations should insert the `subString` at `index`
     *  in the string at `path` and shift the other characters.  
     *     
     *  As a consequence of this change, `this.changeCallback` should be called.
     *    
     *  The implementation should also call `this._assertOpen()` and `this._assertWritable()`.  
     *    
     *  The implementation can trust that: 
     *  - `path` is always a [Path][] instance
     *  - `path` points always to a text item
     *  - `index` is a valid string index
     */
    insertTextString (path, index, string) {}
    
    
    /**
     *  ### AbstractBackend.Document.prototype.removeTextString(textPath, index, count) - virtual method
     *  The `.removeTextString` method implementations should remove `count` characters, 
     *  starting at `index` from the string at `path`.  
     *     
     *  As a consequence of this change, `this.changeCallback` should be called.
     *    
     *  The implementation should also call `this._assertOpen()` and `this._assertWritable()`.  
     *    
     *  The implementation can trust that: 
     *  - `path` is always a [Path][] instance
     *  - `path` points always to a text item
     *  - `index` is a valid string index
     *  - `count` is a valid number of characters
     */
    removeTextString (path, index, count) {}


    /**
     *  ### AbstractBackend.Document.prototype.changeCallback(path, removed, inserted)
     *  The `changedCallback` function should be called every time the backend changes.  
     *  Also changes made remotely, should result in a call to this function.    
     *     
     *  The implementation doesn't need to define this function, since it will be
     *  defined by the [Store][] object that uses the backend.  
     */
    changeCallback (path, removed, inserted) {}


    /**
     *  ### AbstractBackend.Document.prototype.close() - async virtual method
     *  The `.close` method implementations should disconnect from the backend document and
     *  throw an error in case of failure.  
     */
    async close () {}


    //
    //  Throws if the document is not open
    //
    _assertOpen () {
        if (!this.isOpen) throw new errors.DocumentClosedError(this.collection, this.id);
        return this;
    }


    //
    //  Throws if the document is not readable
    //
    _assertReadable () {
        if (!this.readable) throw new errors.ReadPermissionError(this.collection, this.id);
        return this;
    }


    //
    //  Throws if the document is not writable
    //
    _assertWritable () {
        if (!this.writable) throw new errors.WritePermissionError(this.collection, this.id);
        return this;
    }
}



module.exports = AbstractBackend;



// Markdown links used for documentation

/**
 *  [Path]: ./Path.md#path-class
 *  [Store]: ./Store.md#store-class
 */
