const AbstractBackend = require("./abstract");
const Path = require("../Path");
const utils = require("../utils");
const errors = require("../errors");
const rights = require("../rights");


class Store extends AbstractBackend.Store {

    constructor () {
        super();
        this._data = {};
        this._connected = false;
        this._cache = {};
    }

    async connect () {
        this._connected = true;
    }

    get connected () {
        return this._connected;
    }

    getUserRights (collectionName, id) {
        return rights.WRITE;
    }

    getDocument (collection, id) {
        var path = `${collection}/${id}`;
        return this._cache[path] || (this._cache[path] = new Document(this, collection, id));
    }

    async disconnect () {
        this._connected = false;
    }
}


class Document extends AbstractBackend.Document {

    async open () {
        this._open = true;
        this._assertReadable();

        var collection = this.store._data[this.collection];
        if (!collection) {
            this._assertWritable();
            collection = this.store._data[this.collection] = {};
        }

        var  doc = collection[this.id];
        if (!doc) {
            this._assertWritable();
            collection = this.store._data[this.collection] = {};
            doc = collection[this.id] = {};
        }
    }

    get readable () {
        if (!this._open) return false;
        return this.store.getUserRights(this.collection, this.id) >= rights.READ;
    }

    get writable () {
        if (!this._open) return false;
        return this.store.getUserRights(this.collection, this.id) >= rights.WRITE;
    }

    getItemValue (path='') {
        this._assertReadable();
        path = Path.from(path);
        try {
            return path.lookup(this.store._data[this.collection][this.id]);
        } catch (e) {
            return null;
        }
    }

    setDictItem (path, key, newValue) {
        this._assertWritable();
        var dict = this.getItemValue(path);
        var oldValue = dict[key] !== undefined ? dict[key] : null;
        dict[key] = newValue;
        this.changeCallback(new Path(path, key), oldValue, newValue);
    }

    removeDictItem (path, key) {
        this._assertWritable();
        var dict = this.getItemValue(path);
        var oldValue = dict[key] !== undefined ? dict[key] : null;
        if (oldValue !== null) {
            delete dict[key];
            this.changeCallback(new Path(path, key), oldValue, null);
        }
    }

    setListItem (path, index, newItem) {
        this._assertWritable();
        var list = this.getItemValue(path);
        var oldItem = list[index] !== undefined ? list[index] : null;
        list[index] = newItem;
        this.changeCallback(new Path(path, index), oldItem, newItem);
    }

    insertListItem (path, index, newItem) {
        this._assertWritable();
        var list = this.getItemValue(path);
        list.splice(index, 0, newItem);
        this.changeCallback(new Path(path, index), null, newItem);
    }

    removeListItem (path, index) {
        this._assertWritable();
        var list = this.getItemValue(path);
        var oldItem = list[index];
        list.splice(index, 1);
        this.changeCallback(new Path(path, index), oldItem, null);
    }

    insertTextString (path, index, string) {
        this._assertWritable();
        var parent = this.getItemValue(path.parent);
        var key = path.leaf;
        var text = this.getItemValue(path);
        parent[key] = text.slice(0, index) + string + text.slice(index);
        this.changeCallback(new Path(path, index), "", string);
    }

    removeTextString (path, index, count) {
        this._assertWritable();
        var parent = this.getItemValue(path.parent);
        var key = path.leaf;
        var text = this.getItemValue(path);
        var oldText = text.slice(index, index+count);
        parent[key] = text.slice(0, index) + text.slice(index+count);
        this.changeCallback(new Path(path, index), oldText, "");
    }

    changeCallback (path, removed, inserted) {}

    async close () {
        this._open = false;
    }
}



exports.Store = Store;
exports.Document = Document;
