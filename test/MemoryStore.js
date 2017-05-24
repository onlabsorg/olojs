
const test = require("../lib/test");

const MemoryStore = require("../lib/MemoryStore");
const store = new MemoryStore();

store.__getUserRights = test.getUserRights;
store._data = test.data;

test.describeStore("MemoryStore", store);
