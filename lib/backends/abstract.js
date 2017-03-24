
const rights = require("../rights");
const errors = require("../errors");


class Store {

    async connect (credentials) {}

    get connected () {}

    getDocument (collection, id) {}

    async disconnect () {}
}


class Document {

    constructor (store, collection, id) {
        this.store = store;
        this.collection = collection;
        this.id = id;
    }

    async open () {}

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

    _assertReadable () {
        if (!this.readable) throw new errors.ReadPermissionError(this.collection, this.id);
    }

    _assertWritable () {
        if (!this.writable) throw new errors.WritePermissionError(this.collection, this.id);
    }
}



exports.Store = Store;
exports.Document = Document;
