
localStorage.setItem('testStore', JSON.stringify({

    "owned.testDoc": {
        meta: {},
        root: {}
    },

    "writable.testDoc": {
        meta: {
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
        meta: {
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
        meta: {},
        root: {}
    }
}));

const LocalStore = require("../lib/LocalStore");
const store = new LocalStore("testStore");

const roles = require("../lib/roles");
LocalStore.Document.prototype.__getUserRole = function () {
    var collection = this.id.split(".")[0];
    if (collection === "owned") return roles.OWNER;
    if (collection === "writable") return roles.WRITER;
    if (collection === "readonly") return roles.READER;
    if (collection === "private") return roles.NONE;
    return roles.NONE;
}


const describeStore = require("test/Store");
describeStore("LocalStore", store);
