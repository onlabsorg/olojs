
const Backend = require("olojs/backends/olodb");
const backend = new Backend.Store("ws://localhost:8080");

const Store = require("olojs/Store");
const store = new Store(backend);

const describeStore = require("test/Store");
describeStore("OlodbStore", store);
