/**
 *  # olojs.MemoryStore module.
 *  - **Version:** 0.2.x
 *  - **Author:** Marcello Del Buono <m.delbuono@onlabs.org>
 *  - **License:** MIT
 */


const Store = require("./Store");
const Path = require("./Path");
const utils = require("./utils");
const errors = require("./errors");
const roles = require("./roles");



/**
 *  ## MemoryStore class
 *  Implements the [Store](./Store.md) interface for an in-memory backend.
 *
 *  ```javascript
 *  const store = new MemoryStore()
 *  ```
 */
class MemoryStore extends Store {

    constructor () {
        super();
        this._data = {};
    }


    __connect (credentials) {
        const user = new Store.User(credentials);
        return Promise.resolve(user);
    }


    __connected () {
        return this.user !== null;
    }


    __disconnect () {
        return Promise.resolve();
    }
}


MemoryStore.Document = class extends Store.Document {

    __init () {
        return Promise.resolve();
    }

    __fetch () {
        const role = this.__getUserRole();
        if (role < roles.READER) throw new errors.ReadPermissionError(this.id);
        const content = this.store._data[this.id] || null;
        return Promise.resolve(content);
    }
    
    __create (content) {
        const role = this.__getUserRole();
        if (role < roles.OWNER) throw new errors.WritePermissionError(this.id);
        this.store._data[this.id] = content;
        return Promise.resolve();
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

    __close () {
        return Promise.resolve();
    }
}


module.exports = MemoryStore;
