
const Backend = require("olojs/backends/memory");
const backend = new Backend("test-store");

const rights = require("olojs/rights");

backend.getUserRights = function (collection, id) {
    if (collection === "writable") return rights.WRITE;
    if (collection === "readonly") return rights.READ;
    if (collection === "private") return rights.NONE;
    return rights.NONE;
}

backend._data = {
    writable: {
        testDoc: {}
    },
    readonly: {
        testDoc: {
            dict: {a:10, b:11, c:12},
            list: [10, 11, 12],
            text: "abc",
            item: 10
        }
    },
    private: {
        testDoc: {}
    }
};


const Store = require("olojs/Store");
const store = new Store(backend);

const describeStore = require("test/Store");
describeStore("MemoryStore", store);
