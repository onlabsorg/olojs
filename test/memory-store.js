const describeStore = require('./describe-store');
const MemoryStore = require("../lib/memory-store");

describeStore('MemoryStore', {
    create: content => new MemoryStore(content)
});
