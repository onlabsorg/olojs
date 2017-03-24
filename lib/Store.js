
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


class Store {

    constructor (backend) {
        this[$backend] = backend;
        this[$cache] = {};
        this[$connected] = false;
    }

    get host () {
        return this[$backend].host;
    }

    get connected () {
        return this[$backend].connected;
    }

    async connect (credentials) {
        if (!this.connected) {
            await this[$backend].connect(credentials);
        }
        this[$connected] = true;
    }

    getDocument (collection, id) {
        var path = `${collection}/${id}`;
        return this[$cache][path] || (this[$cache][path] = new Document(this, collection, id));
    }

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


class Document {

    constructor (store, collection, id) {
        this[$store] = store;
        this[$backend] = this.store[$backend].getDocument(collection, id);

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

    get store () {
        return this[$store];
    }

    get collection () {
        return this[$backend].collection;
    }

    get id () {
        return this[$backend].id;
    }

    async open () {
        await this[$backend].open();
    }

    get isOpen () {
        return this[$backend].isOpen;
    }

    get readable () {
        return this[$backend].readable;
    }

    get writable () {
        return this[$backend].writable;
    }

    get (path) {
        return this._getItem("/", path);
    }

    _getItem (rootPath, subPath) {
        rootPath = Path.from(rootPath);
        subPath = Path.from(subPath);
        var itemPath = rootPath.subPath(subPath);
        if (itemPath === null) return null;
        var itemId = String(itemPath);
        return this[$cache][itemId] || (this[$cache][itemId] = new ItemPointer(this, itemPath));
    }

    _subscribe (path, callback) {
        var subscription = new Subscription(this, path, callback);
        this[$subscriptions].push(subscription);
        return subscription;
    }

    _unsubscribe (subscription) {
        var index = this[$subscriptions].indexOf(subscription);
        if (index !== -1) {
            this[$subscriptions].splice(index, 1);
        }
    }

    async close () {
        await this[$backend].close();
        this[$subscriptions] = [];
        this[$cache] = {};
    }
}


class Item {

    constructor (doc, path) {
        this[$doc] = doc;
        this[$path] = Path.from(path);
    }

    get doc () {
        return this[$doc];
    }

    get path () {
        return this[$path];
    }

    get type () {
        var value = this[$doc][$backend].getItemValue(this.path);
        if (utils.isPlainObject(value)) return "dict";
        if (utils.isArray(value)) return "list";
        if (utils.isString(value)) return "text";
        if (utils.isNumber(value)) return "numb";
        if (utils.isBoolean(value)) return "bool";
        return "none";
    }

    get (path) {
        if (typeof path === "string" && path[0] === "/") {
            return this[$doc].get(path);
        } else {
            return this[$doc]._getItem(this.path, path);
        }
    }

    get value () {
        return utils.clone(this[$doc][$backend].getItemValue(this.path));
    }

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

    subscribe (callback) {
        return this[$doc]._subscribe(this.path, callback);
    }
}


class Dict extends Item {

    get keys () {
        return Object.keys(this[$doc][$backend].getItemValue(this.path));
    }

    set (key, value) {
        key = String(key);
        value = Validator.value(value);
        this[$doc][$backend].setDictItem(this.path, key, value);
    }

    remove (key) {
        key = String(key);
        this[$doc][$backend].removeDictItem(this.path, key);
    }
}


class List extends Item {

    get size () {
        return this[$doc][$backend].getItemValue(this.path).length;
    }

    set (index, item) {
        index = Validator.index(index, this.size);
        item = Validator.value(item);
        this[$doc][$backend].setListItem(this.path, index, item);
    }

    insert (index, ...items) {
        index = Validator.index(index, this.size, 1);
        items = items.map((item) => Validator.value(item));
        for (let item of items.reverse()) {
            this[$doc][$backend].insertListItem(this.path, index, item);
        }
    }

    append (...items) {
        this.insert(this.size, ...items);
    }

    remove (index, count=1) {
        var size = this.size;
        index = Validator.index(index, size);
        count = Validator.count(count, index, size);
        for (let i=0; i<count; i++) {
            this[$doc][$backend].removeListItem(this.path, index);
        }
    }
}


class Text extends Item {

    get size () {
        return this[$doc][$backend].getItemValue(this.path).length;
    }

    insert (index, string) {
        index = Validator.index(index, this.size, 1);
        string = String(string);
        this[$doc][$backend].insertTextString(this.path, index, string);
    }

    append (string) {
        this.insert(this.size, string);
    }

    remove (index, count=1) {
        var size = this.size;
        index = Validator.index(index, size);
        count = Validator.count(count, index, size);
        this[$doc][$backend].removeTextString(this.path, index, count);
    }
}


class Change {

    constructor (doc, path, removed, inserted) {
        this.doc = doc;
        this.path = Path.from(path);
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
        this.doc = doc;
        this.path = Path.from(path);
        this.callback = callback;
    }

    cancel () {
        this.doc._unsubscribe(this);
    }
}


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


Store.Document = Document;
Store.Document.Item = Item;
Store.Document.Dict = Dict;
Store.Document.List = List;
Store.Document.Text = Text;
Store.Document.Change = Change;
Store.Document.Subscription = Subscription;

module.exports = Store;
