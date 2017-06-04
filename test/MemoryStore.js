
const test = require("./Store");

const MemoryStore = require("../lib/MemoryStore");
const store = new MemoryStore();
store.getUserRole = test.getUserRole;
store._data = test.data;

test.describeStore("MemoryStore", store);
