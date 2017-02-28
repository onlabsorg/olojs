
var MemoryStore = require("./MemoryStore");
var LocalStorage = require("lockr");


class LocalStore extends MemoryStore {    

    constructor (host) {
        super(host);
        if (!LocalStorage.get(host)) LocalStorage.set(host, {});
    }

    static get protocol () {
        return "local:";
    }

    static get Document () {
        return Document;
    }
}


class Document extends MemoryStore.Document {

    constructor (store, id) {
        super(store, id);

        var localStore = LocalStorage.get(store.host);
        if (!localStore[id]) {
            localStore[id] = {};
            LocalStorage.set(store.host, localStore);
        }
        this.subscribe('', (change) => {
            localStore[id] = this.data;
            LocalStorage.set(store.host, localStore);
        });        
    }    
}


module.exports = LocalStore;
