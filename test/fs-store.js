
var FSStore = require("../lib/stores/fs-store");

var initStore = require("./init-fs-store");
var ROOT_PATH = `${__dirname}/fs-store`;


async function createStore (content) {
    await initStore(ROOT_PATH, content);
    return new FSStore(ROOT_PATH);
}

var testStore = require("./store");

describe("FSStore", () => {    
    testStore(createStore);
});
