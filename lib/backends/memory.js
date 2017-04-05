const AbstractBackend = require("./abstract");
const Path = require("../Path");
const utils = require("../utils");
const errors = require("../errors");
const rights = require("../rights");


class MemoryBackend extends AbstractBackend {

    constructor (host) {
        super(host);
        this._data = {};
        this._connected = false;
    }

    async connect () {
        this._connected = true;
    }

    get connected () {
        return this._connected;
    }

    getUserRights (collectionName, docId) {
        return rights.WRITE;
    }

    async disconnect () {
        this._connected = false;
    }
}

MemoryBackend.Document = class extends AbstractBackend.Document {

    async open () {
        this._assertReadable();

        var collection = this.store._data[this.collection];
        if (!collection) {
            this._assertWritable();
            collection = this.store._data[this.collection] = {};
        }

        var  doc = collection[this.id];
        if (!doc) {
            this._assertWritable();
            doc = collection[this.id] = {};
        }

        this._isOpen = true;
    }

    get isOpen () {
        return this._isOpen;
    }

    get readable () {
        return this.store.getUserRights(this.collection, this.id) >= rights.READ;
    }

    get writable () {
        return this.store.getUserRights(this.collection, this.id) >= rights.WRITE;
    }

    getItemValue (path='') {
        this._assertOpen()._assertReadable();
        path = Path.from(path);
        try {
            return path.lookup(this.store._data[this.collection][this.id]);
        } catch (e) {
            return null;
        }
    }

    setDictItem (path, key, newValue) {
        this._assertOpen()._assertWritable();
        var dict = this.getItemValue(path);
        var oldValue = dict[key] !== undefined ? dict[key] : null;
        dict[key] = newValue;
        this.changeCallback(new Path(path, key), oldValue, newValue);
    }

    removeDictItem (path, key) {
        this._assertOpen()._assertWritable();
        var dict = this.getItemValue(path);
        var oldValue = dict[key] !== undefined ? dict[key] : null;
        if (oldValue !== null) {
            delete dict[key];
            this.changeCallback(new Path(path, key), oldValue, null);
        }
    }

    setListItem (path, index, newItem) {
        this._assertOpen()._assertWritable();
        var list = this.getItemValue(path);
        var oldItem = list[index] !== undefined ? list[index] : null;
        list[index] = newItem;
        this.changeCallback(new Path(path, index), oldItem, newItem);
    }

    insertListItem (path, index, newItem) {
        this._assertOpen()._assertWritable();
        var list = this.getItemValue(path);
        list.splice(index, 0, newItem);
        this.changeCallback(new Path(path, index), null, newItem);
    }

    removeListItem (path, index) {
        this._assertOpen()._assertWritable();
        var list = this.getItemValue(path);
        var oldItem = list[index];
        list.splice(index, 1);
        this.changeCallback(new Path(path, index), oldItem, null);
    }

    insertTextString (path, index, string) {
        this._assertOpen()._assertWritable();
        var parent = this.getItemValue(path.parent);
        var key = path.leaf;
        var text = this.getItemValue(path);
        parent[key] = text.slice(0, index) + string + text.slice(index);
        this.changeCallback(new Path(path, index), "", string);
    }

    removeTextString (path, index, count) {
        this._assertOpen()._assertWritable();
        var parent = this.getItemValue(path.parent);
        var key = path.leaf;
        var text = this.getItemValue(path);
        var oldText = text.slice(index, index+count);
        parent[key] = text.slice(0, index) + text.slice(index+count);
        this.changeCallback(new Path(path, index), oldText, "");
    }

    changeCallback (path, removed, inserted) {}

    async close () {
        this._isOpen = false;
    }
}


module.exports = MemoryBackend;
