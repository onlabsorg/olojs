
const Store = require("../lib/OlodbStore");
const store = new Store("localhost:8010", ssl=false);

const describeStore = require("test/Store");
describeStore("OlodbStore", store);
