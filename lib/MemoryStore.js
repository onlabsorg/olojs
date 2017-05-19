const Store = require("./Store");
const Path = require("./Path");
const utils = require("./utils");
const errors = require("./errors");
const roles = require("./roles");



class MemoryStore extends Store {

    constructor () {
        super();
        this._data = {};
        this._connected = false;
    }


    async __connect (credentials) {
        this._connected = true;
    }


    __connected () {
        return this._connected;
    }


    async __disconnect () {
        this._connected = false;
    }
}


MemoryStore.Document = class extends Store.Document {

    async __init () {}

    async __open () {
        this._assertReadable('');
        if (!this.store._data[this.id]) {
            this._assertWritable('');
            this.store._data[this.id] = this.constructor.template;
        }
    }

    __getUserRole () {
        return roles.OWNER;
    }

    __getItemValue (path) {
        return path.lookup(this.store._data[this.id]);        
    }

    __setDictItem (dictPath, key, newValue) {
        var dict = this.__getItemValue(dictPath);
        var oldValue = dict[key] !== undefined ? dict[key] : null;
        dict[key] = newValue;
        this._dispatch(new Path(dictPath, key), oldValue, newValue);
    }

    __removeDictItem (dictPath, key) {
        var dict = this.__getItemValue(dictPath);
        var oldValue = dict[key] !== undefined ? dict[key] : null;
        if (oldValue !== null) {
            delete dict[key];
            this._dispatch(new Path(dictPath, key), oldValue, null);
        }        
    }

    __setListItem (listPath, index, newItem) {
        var list = this.__getItemValue(listPath);
        var oldItem = list[index] !== undefined ? list[index] : null;
        list[index] = newItem;
        this._dispatch(new Path(listPath, index), oldItem, newItem);        
    }

    __insertListItem (listPath, index, newItem) {
        var list = this.__getItemValue(listPath);
        list.splice(index, 0, newItem);
        this._dispatch(new Path(listPath, index), null, newItem);        
    }

    __removeListItem (listPath, index) {
        var list = this.__getItemValue(listPath);
        var oldItem = list[index];
        list.splice(index, 1);
        this._dispatch(new Path(listPath, index), oldItem, null);        
    }

    __insertTextString (textPath, index, string) {
        var parent = this.__getItemValue(textPath.parent);
        var key = textPath.leaf;
        var text = parent[key];
        parent[key] = text.slice(0, index) + string + text.slice(index);
        this._dispatch(new Path(textPath, index), "", string);        
    }

    __removeTextString (textPath, index, count) {
        var parent = this.__getItemValue(textPath.parent);
        var key = textPath.leaf;
        var text = parent[key];
        var oldText = text.slice(index, index+count);
        parent[key] = text.slice(0, index) + text.slice(index+count);
        this._dispatch(new Path(textPath, index), oldText, "");        
    }

    async __close () {}
}


module.exports = MemoryStore;
