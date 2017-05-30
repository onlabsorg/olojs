
const test = require("./Store");

const MemoryStore = require("../lib/MemoryStore");
MemoryStore.Document.prototype.__getUserRole = test.getUserRole;

const store = new MemoryStore();
store._data = test.data;

test.describeStore("MemoryStore", store);
