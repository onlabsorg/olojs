
import utils from "../utils";
import Path from "../Path";


var $doc = Symbol("olojs.stores.$doc");


class AbstractStore {

    constructor (host) {
        this.host = host;
        this.connected = false;
        this.cache = {}
    }

    get Store () {
        return this.constructor;
    }

    get url () {
        return this.Store.protocol + "//" + this.host;
    }


    // Abstract methods
    async connect () {
        this.connected = true;
    }

    async getDocument (id) {
        var doc = this.cache[id];
        if (!doc) {
            doc = new this.Store.Document(this, id);
            await doc.open();
        }
        return doc;
    }

    async disconnect () {
        this.connected = false;
        for (let docId in this.cache) {
            await this.cache[docId].close();
        }
    }        

    static get protocol () {
        return "abstract:";
    }

    static get Document () {
        return Document;
    }
}


class Document {

    constructor (store, id) {
        this.store = store;
        this.id = id;
        this.subscriptions = [];
    }

    get Store () {
        return this.store.Store;
    }

    get url () {
        return this.store.url + "/" + this.id;
    }

    subscribe (path, callback) {
        var subscription = new Subscription(this, path, callback);
        this.subscriptions.push(subscription);
        return subscription;
    }

    dispatch (path, key, removed, inserted) {
        var change = new Change(this.type(path), [path,key], removed, inserted);
        for (let subscription of this.subscriptions) {
            var subChange = change.SubChange(subscription.path);
            if (subChange) subscription.callback(subChange);
        }
    }

    unsubscribe (subscription) {
        var index = this.subscriptions.indexOf(subscription);
        if (index !== -1) {
            this.subscriptions.splice(index, 1);
        }
    }


    clone (path) {
        return utils.clone(this.get(path));
    }


    // abstract methods

    async open () {
        this.store.cache[this.id] = this;
    }

    type (path) {
        /*  
         *  Returns the type of the data at the given path as a string.
         *  The returned value must be one of the following strings:
         *  
         *  - "dict"  for a plain object
         *  - "list"  for an array
         *  - "text"  for a string
         *  - "numb"  for a number
         *  - "bool"  for a boolean
         *  - "none"  if the item doesn't exist
         *
         */
    }

    get (path) {
        /*
         *  Returns the data at the given path as follows:
         *
         *  - "dict" data  ->  plain javascript object
         *  - "list" data  ->  javascript array
         *  - "text" data  ->  javascript string
         *  - "numb" data  ->  javascript number
         *  - "bool" data  ->  javascript true or false value
         *  - "none" data  ->  null
         */
    }

    getDictKeys (path) {}
    getListSize (path) {}
    getTextSize (path) {}

    setDictItem (path, key, newValue) {}
    setListItem (path, index, newItem) {}

    insertListItems (path, index, ...newItems) {}
    insertText (path, index, subString) {}

    removeDictItem (path, key) {}
    removeListItems (path, index, count) {} 
    removeText (path, index, count) {}

    async close () {
        delete this.store.cache[this.id];
    }
}



class Change {

    constructor (type, path, removed, inserted) {
        this.type = type;
        this.path = path instanceof Path ? path : new Path(path);
        this.removed = removed;
        this.inserted = inserted;
    }

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


class Subscription {

    constructor (doc, path, callback) {
        this[$doc] = doc;
        this.path = Path.from(path);
        this.callback = callback;
    }

    cancel () {
        this[$doc].unsubscribe(this);
    }
}


export default AbstractStore;
