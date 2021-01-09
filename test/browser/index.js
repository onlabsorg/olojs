const expect = require("chai").expect;
const olojs = require("../../browser");


describe("olojs", () => {
    
    it("should export the `document` module", () => {
        expect(olojs.document).to.equal(require("../../lib/document"));
    });
    
    it("should export the `Store` class", () => {
        expect(olojs.Store).to.equal(require("../../lib/store"));
    });

    it("should export the `MemoryStore` class", () => {
        expect(olojs.MemoryStore).to.equal(require("../../lib/memory-store"));
    });

    it("should export the `HTTPStore` class", () => {
        expect(olojs.HTTPStore).to.equal(require("../../lib/http-store"));
    });

    it("should export the `Router` class", () => {
        expect(olojs.Router).to.equal(require("../../lib/router"));
    });
    
    it("should export the `viewer` module", () => {
        expect(olojs.Viewer).to.equal(require("../../src/viewer"));
    });

    require("../document");
    require("../store");
    require("../memory-store");
    // require("./http-store");
    require("../router");
});
