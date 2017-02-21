
var describeStore = require("test/Store");
var SharedbStore = require("olojs/stores/SharedbStore");

describeStore("SharedbStore", SharedbStore, "localhost:8080");
//describeStore("SharedbStore", SharedbStore, "130.211.85.222"); 