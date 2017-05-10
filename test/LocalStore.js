
localStorage.setItem('testStore', JSON.stringify({
    "writable.testDoc": {},
    "readonly.testDoc": {
        dict: {a:10, b:11, c:12},
        list: [10, 11, 12],
        text: "abc",
        item: 10
    },
    "private.testDoc": {}
}));

const Backend = require("olojs/backends/local");
const backend = new Backend('testStore');

const rights = require("olojs/rights");
backend.getUserRights = function (docId) {
    var collection = docId.split(".")[0];
    if (collection === "writable") return rights.WRITE;
    if (collection === "readonly") return rights.READ;
    if (collection === "private") return rights.NONE;
    return rights.NONE;
}


const Store = require("olojs/Store");
const store = new Store(backend);

const describeStore = require("test/Store");
describeStore("LocalStore", store);
