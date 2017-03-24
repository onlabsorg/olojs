
const MemoryBackend = require("./memory");


class Store extends MemoryBackend.Store {

    constructor (id) {
        super();
        this._id = id;
        this._data = JSON.parse(localStorage.getItem(this._id));
        if (this._data === undefined) {
            this._data = {};
            this._update();
        }
    }

    getDocument (collection, id) {
        var path = `${collection}/${id}`;
        return this._cache[path] || (this._cache[path] = new Document(this, collection, id));
    }

    _update () {
        localStorage.setItem(this._id, JSON.stringify(this._data));
    }
}


class Document extends MemoryBackend.Document {

    async open () {
        await super.open();
        this.store._update();
    }

    changeCallback (path, removed, inserted) {
        this.store._update();
    }
}



exports.Store = Store;
exports.Document = Document;






// class LocalStore extends MemoryStore {
//
//     constructor (host) {
//         super(host);
//         if (!LocalStorage.get(host)) LocalStorage.set(host, {});
//     }
//
//     static get protocol () {
//         return "local:";
//     }
//
//     static get Document () {
//         return Document;
//     }
// }
//
//
// class Document extends MemoryStore.Document {
//
//     constructor (store, id) {
//         super(store, id);
//
//         var localStore = LocalStorage.get(store.host);
//         if (!localStore[id]) {
//             localStore[id] = {};
//             LocalStorage.set(store.host, localStore);
//         }
//         this.subscribe('', (change) => {
//             localStore[id] = this.data;
//             LocalStorage.set(store.host, localStore);
//         });
//     }
// }
//
//
// module.exports = LocalStore;
