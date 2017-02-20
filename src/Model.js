
import utils from "./utils";
import Path from "./Path";
import AbstractStore from "./stores/AbstractStore";
import MemoryStore from "./stores/MemoryStore";
import SharedbStore from "./stores/SharedbStore";

var storeTypes = [MemoryStore, SharedbStore];

var cache = {
    stores: {},
    models: {}
}


async function Model (urlStr) {
    var model = cache.models[urlStr];

    if (!model) {
        var url = utils.parseURL(urlStr);

        // detect the store type
        var Store;
        for (let S of storeTypes) {
            if (S.protocol === url.protocol) {
                Store = S;
                break;
            }
        }
        if (!Store) {
            throw new Error(`Unknown store protocol: "${this.url.protocol}"`);
        }

        var host = url.host;
        var docId = url.pathArray[0];
        var path = new Path(url.pathArray.slice(1));

        var storeURL = Store.protocol + "//" + host;
        var store = cache.stores[storeURL];
        if (!store) {
            store = new Store(host);
            await store.connect();
            cache.stores[storeURL] = store;            
        }

        var doc = await store.getDocument(docId);

        model = cache.models[urlStr] = new SubModel(doc, path);
    }

    return model;
}



class SubModel {

    constructor (doc, path) {
        this._doc = doc;
        this._path = Path.from(path);
    }

    get path () {
        return this._path;
    }

    get url () {
        return this._doc.url + "/" + this.path.join("/");
    }

    get type () {
        return this._doc.type(this.path);
    }

    getSubModel (path) {
        if (typeof path === "string" && path[0] === "/") {
            var subModelPath = new Path(path);
        } else {
            var subModelPath = this.path.subPath(path);
            if (subModelPath === null) return null;
        }
        var modelURL = this._doc.url + "/" + subModelPath.join("/");
        var model = cache.models[modelURL] || (cache.models[modelURL] = new SubModel(this._doc, subModelPath));
        return model;
    }

    get parent () {
        return this.getSubModel("..");
    }

    get value () {
        return this._doc.clone(this.path);
    }

    set value (newValue) {
        var parent = this.parent;
        if (parent) {
            this.parent.set(this.path.leaf, newValue);
        } else {
            newValue = Object(newValue);
            for (let key in newValue) {
                this.set(key, newValue[key]);
            }
            for (let key of this.keys) {
                if (newValue[key] === undefined) {
                    this.remove(key);
                }
            }
        }
    }

    get keys () {
        if (this.type === "dict") {
            return this._doc.getDictKeys(this.path);
        } else {
            throwInvalidMethod(this.type, 'keys');
        }
    }

    get size () {
        switch (this.type) {

            case 'list':
                return this._doc.getListSize(this.path);
                break;

            case 'text':
                return this._doc.getTextSize(this.path);
                break;

            default:
                throwInvalidMethod(this.type, 'size');
        }
    }

    get (key) {
        switch (this.type) {

            case 'dict':
                key = String(key);
                return this.getSubModel(key);
                break;

            case 'list':
                var index = validIndex(key, this.size);
                return this.getSubModel(index);            
                break;

            default:
                throwInvalidMethod(this.type, 'get');
        }
    }

    set (key, value) {
        switch (this.type) {

            case 'dict':
                key = String(key);
                value = validValue(value);
                this._doc.setDictItem(this.path, key, value);
                break;

            case 'list':
                var index = validIndex(key, this.size);
                var item = validValue(value);
                this._doc.setListItem(this.path, index, item);
                break;

            default:
                throwInvalidMethod(this.type, 'set');
        }        
    }

    insert (index, ...items) {
        switch (this.type) {

            case 'list':
                index = validIndex(index, this.size, 1);
                items = items.map((item) => validValue(item));
                this._doc.insertListItems(this.path, index, ...items);
                break;

            case 'text':
                index = validIndex(index, this.size, 1);
                var subString = items.join("");
                this._doc.insertText(this.path, index, subString);
                break;

            default:
                throwInvalidMethod(this.type, 'insert');
        }        

    }

    append (...items) {
        this.insert(this.size, ...items);        
    }

    remove (key, count=1) {
        switch (this.type) {

            case 'dict':
                key = String(key);
                this._doc.removeDictItem(this.path, key);
                break;

            case 'list':
                var size = this.size;
                var index = validIndex(key, size);
                count = validCount(count, index, size);
                this._doc.removeListItems(this.path, index, count);
                break;

            case 'text':
                var size = this.size;
                var index = validIndex(key, size);
                count = validCount(count, index, size);
                this._doc.removeText(this.path, index, count);            
                break;

            default:
                throwInvalidMethod(this.type, 'remove');
        }
    }

    subscribe (callback) {
        return this._doc.subscribe(this.path, callback);
    }
}



function validValue (value) {

    if (utils.isPlainObject(value) || utils.isArray(value)) {
        return utils.clone(value);
    }

    if (utils.isString(value) || utils.isNumber(value) || utils.isBoolean(value)) {
        return value;
    }

    throw new Error("Invalid value type.")
}


function validIndex (index, size, overflow=0) {
    index = Number(index);
    if (utils.isInteger(index)) {
        if (index < 0) index = size + index;
        if (0 <= index && index < size+overflow) {
            return index;
        }
    }
    throw new Error("Invalid index.")
}


function validCount (count, index, size) {
    count = Number(count);
    if (utils.isInteger(count)) {
        return Math.min(count, size-index);
    }
    throw new Error("Count should be an integert.")
}



function throwInvalidMethod (type, method) {
    throw new Error(`Method '${method}' cannod be called on model type ${type}.`);
}


Model.prototype = SubModel.prototype;

export default Model;
