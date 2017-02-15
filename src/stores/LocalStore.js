
var MemoryStore = require("./MemoryStore")';'

class LocalStore extends MemoryStore {}

LocalStore.scheme = "local:";

module.exports = LocalStore;
