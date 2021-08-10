const expect = require("chai").expect;
const olojs = require("../../browser");

const pathlib = require('path');
console.log(pathlib);

describe("olojs", () => {

    it("should export the `expression` module", () => {
        expect(olojs.expression).to.equal(require("../../lib/expression"));
        expect(olojs.expression).to.equal(require("@onlabsorg/swan-js"));
    });

    it("should export the `document` module", () => {
        expect(olojs.document).to.equal(require("../../lib/document"));
    });

    it("should export the `Store` class", () => {
        expect(olojs.Store).to.equal(require("../../lib/store"));
    });

    it("should export the `MemoryStore` class", () => {
        expect(olojs.MemoryStore).to.equal(require("../../lib/memory-store"));
    });

    it("should export the `BrowserStore` class", () => {
        expect(olojs.BrowserStore).to.equal(require("../../src/browser-store"));
    });

    it("should export the `HTTPStore` class", () => {
        expect(olojs.HTTPStore).to.equal(require("../../lib/http-store"));
    });

    it("should export the `Router` class", () => {
        expect(olojs.Router).to.equal(require("../../lib/router"));
    });
    
    it("should export the `Library` class", () => {
        expect(olojs.Library).to.equal(require("../../lib/library"));
    });    

    require("../expression");
    require("../document");
    require("../store");
    require("../memory-store");
    require("../browser-store");
    // require("./http-store");
    require("../router");
    require("../library");
});
