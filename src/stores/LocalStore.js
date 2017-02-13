define([
    "olojs/stores/MemoryStore"
], function (MemoryStore) {

    class LocalStore extends MemoryStore {}

    LocalStore.scheme = "local:";

    return LocalStore;
});