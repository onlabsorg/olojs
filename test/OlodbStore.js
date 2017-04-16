
const Backend = require("olojs/backends/olodb");
const backend = new Backend("localhost:8010");

const Store = require("olojs/Store");
const store = new Store(backend);

const describeStore = require("test/Store");
describeStore("OlodbStore", store);
