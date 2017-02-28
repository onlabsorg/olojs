
const utils = require("./utils");
const Path = require("./Path");
const Pointer = require("./Pointer");
const stores = require("./stores");

const $doc = Symbol("olojs.Model.$doc");
const $path = Symbol("olojs.Model.$path");

var modelCache = {};


class Model {

    constructor (doc, path) {
        this[$doc] = doc;
        this[$path] = path;
    }

    get path () {
        return this[$path];
    }

    get url () {
        return this[$doc].url + "/" + this.path.join("/");
    }

    get type () {
        return this[$doc].type(this.path);
    }

    getSubModel (path) {
        if (typeof path === "string" && path[0] === "/") {
            var subModelPath = new Path(path);
        } else {
            var subModelPath = this.path.subPath(path);
            if (subModelPath === null) return null;
        }
        var modelURL = this[$doc].url + "/" + subModelPath.join("/");
        var model = modelCache[modelURL] || (modelCache[modelURL] = new ModelPointer(this[$doc], subModelPath));
        return model;
    }

    get parent () {
        return this.getSubModel("..");
    }

    get value () {
        return this[$doc].clone(this.path);
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

    subscribe (callback) {
        return this[$doc].subscribe(this.path, callback);
    }

    static async load (urlStr) {
        var model = modelCache[urlStr];

        if (!model) {
            var modelPromise = modelCache[urlStr] = ModelPointer.create(urlStr);
            model = modelCache[urlStr] = await modelPromise;
        }

        return model instanceof Promise ? await model : model;
    }
}


class DictModel extends Model {

    get keys () {
        return this[$doc].getDictKeys(this.path);
    }

    get (key) {
        key = String(key);
        return this.getSubModel(key);
    }

    set (key, value) {
        key = String(key);
        value = validValue(value);
        if (!this[$doc].canWrite(this.path, key)) throwWritePermissionDenied(this.url+"/"+key);
        this[$doc].setDictItem(this.path, key, value);
    }

    remove (key) {
        key = String(key);
        if (!this[$doc].canWrite(this.path, key)) throwWritePermissionDenied(this.url+"/"+key);
        this[$doc].removeDictItem(this.path, key);
    }
}


class ListModel extends Model {

    get size () {
        return this[$doc].getListSize(this.path);
    }

    get (index) {
        index = validIndex(index, this.size);
        return this.getSubModel(index);            
    }

    set (index, item) {
        index = validIndex(index, this.size);
        item = validValue(item);
        if (!this[$doc].canWrite(this.path, index)) throwWritePermissionDenied(this.url+"/"+index);
        this[$doc].setListItem(this.path, index, item);
    }

    insert (index, ...items) {
        index = validIndex(index, this.size, 1);
        items = items.map((item) => validValue(item));
        if (!this[$doc].canWrite(this.path)) throwWritePermissionDenied(this.url);
        this[$doc].insertListItems(this.path, index, ...items);
    }

    append (...items) {
        this.insert(this.size, ...items);        
    }

    remove (index, count=1) {
        var size = this.size;
        index = validIndex(index, size);
        count = validCount(count, index, size);
        for (let i=index; i<index+count; i++) {
            if (!this[$doc].canWrite(this.path, index)) throwWritePermissionDenied(this.url+"/"+index);    
        }
        
        this[$doc].removeListItems(this.path, index, count);
    }
}


class TextModel extends Model {

    get size () {
        return this[$doc].getTextSize(this.path);
    }

    insert (index, string) {
        if (!this[$doc].canWrite(this.path)) throwWritePermissionDenied(this.url);
        index = validIndex(index, this.size, 1);
        string = String(string);
        this[$doc].insertText(this.path, index, string);
    }

    append (string) {
        this.insert(this.size, string);        
    }

    remove (index, count=1) {
        if (!this[$doc].canWrite(this.path)) throwWritePermissionDenied(this.url);
        var size = this.size;
        index = validIndex(index, size);
        count = validCount(count, index, size);
        this[$doc].removeText(this.path, index, count);            
    }
}


class ModelPointer extends Pointer {

    init (doc, path) {
        this.doc = doc;
        this.path = path;
    }

    get target () {
        var modelType = this.doc.type(this.path);

        switch (modelType) {

            case "dict":
                return new DictModel(this.doc, this.path);

            case "list":
                return new ListModel(this.doc, this.path);

            case "text":
                return new TextModel(this.doc, this.path);

            default:
                return new Model(this.doc, this.path);
        }
    }

    static async create (urlStr) {
        var url = stores.parseURL(urlStr);

        if (!url.store.connected) {
            await url.store.connect();
        }

        var doc = await url.store.getDocument(url.docId);

        return new ModelPointer(doc, url.path);    
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


function throwWritePermissionDenied (url) {
    throw new Error(`Write permission denied on url ${url}`);
}


Model.Dict = DictModel;
Model.List = ListModel;
Model.Text = TextModel;

module.exports = Model;
