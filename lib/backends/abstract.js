
const rights = require("../rights");
const errors = require("../errors");


class AbstractBackend {

    constructor (host) {
        this.host = host;
        this.documentCache = {};
    }

    async connect (credentials) {}

    get connected () {}

    getDocument (collection, id) {
        var path = `${collection}/${id}`;
        var doc = this.documentCache[path];
        if (!doc) {
            doc = new this.constructor.Document(this, collection, id);
            this.documentCache[path] = doc;
        }
        return doc;
    }

    async disconnect () {}
}


AbstractBackend.Document = class {

    constructor (store, collection, id) {
        this.store = store;
        this.collection = collection;
        this.id = id;
    }

    async open () {}

    get isOpen () {}

    get readable () {}

    get writable () {}

    getItemValue (path) {}

    setDictItem (path, key, newValue) {}
    removeDictItem (path, key) {}

    setListItem (path, index, newItem) {}
    insertListItem (path, index, newItem) {}
    removeListItem (path, index) {}

    insertTextString (path, index, string) {}
    removeTextString (path, index, count) {}

    changeCallback (path, removed, inserted) {}

    async close () {}

    _assertOpen () {
        if (!this.isOpen) throw new errors.DocumentClosedError(this.collection, this.id);
        return this;
    }

    _assertReadable () {
        if (!this.readable) throw new errors.ReadPermissionError(this.collection, this.id);
        return this;
    }

    _assertWritable () {
        if (!this.writable) throw new errors.WritePermissionError(this.collection, this.id);
        return this;
    }
}



module.exports = AbstractBackend;
