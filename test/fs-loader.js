
var FSStore = require("../lib/environment/fs-store");

var initStore = require("./init-fs-store");
var ROOT_PATH = `${__dirname}/fs-store`;


async function createLoader (content) {
    await initStore(ROOT_PATH, content);
    return FSStore.createReader(ROOT_PATH);
}

var testLoader = require("./loader");

describe("loader = FSStore.createLoader(rootPath, options)", () => {
    testLoader(createLoader);
});
