const utils = require("./utils");
const Path = require("./Path");

const AbstractStore = require("./stores/AbstractStore");
exports.AbstractStore = AbstractStore;

const MemoryStore = require("./stores/MemoryStore");
exports.MemoryStore = MemoryStore;

const LocalStore = require("./stores/LocalStore");
exports.LocalStore = LocalStore;

const SharedbStore = require("./stores/SharedbStore");
exports.SharedbStore = SharedbStore;


var storeCache = {};



function parseURL (urlStr) {
    var url = utils.parseURL(urlStr);

    // detect the store type
    var Store;
    switch (url.protocol) {

        case MemoryStore.protocol:
            Store = MemoryStore;
            break;

        case LocalStore.protocol:
            Store = LocalStore;
            break;

        case SharedbStore.protocol:
            Store = SharedbStore;
            break;

        default:
            throw new Error(`Unknown store protocol: "${this.url.protocol}"`);
    }

    var host = url.host;
    var docId = url.pathArray[0];
    var path = new Path(url.pathArray.slice(1));

    var storeURL = Store.protocol + "//" + host;
    var store = storeCache[storeURL];
    if (!store) {
        store = new Store(host);
        storeCache[storeURL] = store;            
    }

    return {
        store: store,
        docId: docId,
        path: path
    }
}

exports.parseURL = parseURL;
