define([
    "olojs/utils",
    "olojs/Path",
    "olojs/stores/AbstractStore",

    "olojs/stores/MemoryStore",
    //"olojs/stores/LocalStore",
    "olojs/stores/SharedbStore"

], function (utils, Path, AbstractStore, ...storeTypes) {

    var cache = {
        stores: {},
        models: {}
    }

    var $doc = Symbol("olojs.Model.$doc");
    var $path = Symbol("olojs.Model.$path");


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

            var pointer = new Pointer(doc, path);
            model = cache.models[urlStr] = new Proxy(pointer, modelProxyHandler);
        }

        return model;
    }



    class Pointer {

        constructor (doc, path) {
            this.doc = doc;
            this.path = path;
        }

        get target () {
            switch (this.doc.type(this.path)) {

                case "dict": 
                    return new Model.Dict(this.doc, this.path);

                case "list": 
                    return new Model.List(this.doc, this.path);

                case "text": 
                    return new Model.Text(this.doc, this.path);

                case "numb": 
                case "bool":
                case "none":
                default:
                    return new Model.Item(this.doc, this.path);
            }
        }
    }


    var modelProxyHandler = {

        getPrototypeOf: (pointer) => 
                Reflect.getPrototypeOf(pointer.target),

        setPrototypeOf: (pointer, prototype) => 
                Reflect.setPrototypeOf(pointer.target, prototype),

        isExtensible: (pointer) => 
                Reflect.isExtensible(pointer.target),

        preventExtensions: (pointer) =>
                Reflect.preventExtensions(pointer.target),

        getOwnPropertyDescriptor: (pointer, key) =>
                Reflect.getOwnPropertyDescriptor(pointer.target, key),

        defineProperty: (pointer, key, propertyDescriptor) =>
                Reflect.defineProperty(pointer.target, key, propertyDescriptor),

        has: (pointer, key) =>
                Reflect.has(pointer.target, key),

        get: (pointer, key, receiver) =>
                Reflect.get(pointer.target, key),

        set: (pointer, key, value, receiver) =>
                Reflect.set(pointer.target, key, value),

        deleteProperty: (pointer, key) =>
                Reflect.deleteProperty(pointer.target, key),

        ownKeys: (pointer) =>
            Reflect.ownKeys(pointer.target),
    }


    Model.Item = class {

        constructor (doc, path) {
            this[$doc] = doc;
            this[$path] = Path.from(path);
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
            var model = cache.models[modelURL];
            if (!model) {
                var pointer = new Pointer(this[$doc], subModelPath);
                model = cache.models[modelURL] = new Proxy(pointer, modelProxyHandler);            
            }
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
    }


    Model.Dict = class extends Model.Item {

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
            this[$doc].setDictItem(this.path, key, value);
        }

        remove (key) {
            key = String(key);
            this[$doc].removeDictItem(this.path, key);
        }
    }


    Model.List = class extends Model.Item {

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
            this[$doc].setListItem(this.path, index, item);
        }

        insert (index, ...items) {
            index = validIndex(index, this.size, 1);
            items = items.map((item) => validValue(item));
            this[$doc].insertListItems(this.path, index, ...items);
        }

        append(...items) {
            this.insert(this.size, ...items);
        }

        remove (index, count=1) {
            var size = this.size;
            index = validIndex(index, size);
            count = validCount(count, index, size);
            this[$doc].removeListItems(this.path, index, count);
        }
    }


    Model.Text = class extends Model.Item {

        get size () {
            return this[$doc].getTextSize(this.path);
        }

        insert (index, subString) {
            index = validIndex(index, this.size, 1);
            subString = String(subString);
            this[$doc].insertText(this.path, index, subString);
        }

        append (subString) {
            this.insert(this.size, subString);
        }

        remove (index, count=1) {
            var size = this.size;
            index = validIndex(index, size);
            count = validCount(count, index, size);
            this[$doc].removeText(this.path, index, count);            
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


    return Model;
});

