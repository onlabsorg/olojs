
const MemoryStore = require("../lib/MemoryStore");
const roles = require("../lib/roles");

MemoryStore.Document.prototype.__getUserRole = function () {
    var collection = this.id.split(".")[0];
    if (collection === "owned") return roles.OWNER;
    if (collection === "writable") return roles.WRITER;
    if (collection === "readonly") return roles.READER;
    if (collection === "private") return roles.NONE;
    return roles.NONE;    
}

const store = new MemoryStore();

store._data = {

    "owned.testDoc": {
        __meta__: {},
        root: {}
    },

    "writable.testDoc": {
        __meta__: {
            dict: {a:10, b:11, c:12},
            list: [10, 11, 12],
            text: "abc",
            item: 10
        },
        root: {
            dict: {a:10, b:11, c:12},
            list: [10, 11, 12],
            text: "abc",
            item: 10                        
        }
    },

    "readonly.testDoc": {
        __meta__: {
            dict: {a:10, b:11, c:12},
            list: [10, 11, 12],
            text: "abc",
            item: 10
        },
        root: {
            dict: {a:10, b:11, c:12},
            list: [10, 11, 12],
            text: "abc",
            item: 10
        }
    },

    "private.testDoc": {
        __meta__: {},
        root: {}
    }
};

const describeStore = require("test/Store");
describeStore("MemoryStore", store);
