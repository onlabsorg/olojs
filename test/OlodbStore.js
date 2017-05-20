
const Store = require("../lib/OlodbStore");
const store = new Store("ws://localhost:8010");

const describeStore = require("test/Store");
describeStore("OlodbStore", store);
