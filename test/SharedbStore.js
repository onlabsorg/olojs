define([
    "test/Store",
    "olojs/stores/SharedbStore"
], function (describeStore, SharedbStore) {

    describeStore("SharedbStore", SharedbStore, "localhost:8080");
    
});
