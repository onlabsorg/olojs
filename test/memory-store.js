const expect = require("chai").expect;
const MemoryStore = require("../lib/stores/memory-store");

async function createStore (content, globals) {
    const map = new Map();
    const store = new MemoryStore(globals);
    for (let path in content) {
        store._map.set(path, content[path]);
    }
    return store;
}

describe("MemoryStore", () => {
    const test = require("./store");
    test("MemoryStore", createStore);
});
