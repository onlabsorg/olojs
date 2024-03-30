const expect = require("chai").expect;
const olo = require("../../browser");

const pathlib = require('path');
console.log(pathlib);

describe("olojs", () => {
        
    require("../expression");
    require("../document");
    require("../store");
    require("../memory-store");
    require("../browser-store");
    // require("./http-store");
    require("../router");
    require("../hyper-store");
    require("../sub-store");
    
    
    describe("index", () => {

        it("should export the `expression` module", () => {
            expect(olo.expression).to.equal(require("../../lib/expression"));
        });

        it("should export the `document` module", () => {
            expect(olo.document).to.equal(require("../../lib/document"));
        });

        it("should export the `Store` class", () => {
            expect(olo.Store).to.equal(require("../../lib/stores/store"));
        });

        it("should export the `MemoryStore` class", () => {
            expect(olo.MemoryStore).to.equal(require("../../lib/stores/memory-store"));
        });

        it("should export the `HTTPStore` class", () => {
            expect(olo.HTTPStore).to.equal(require("../../lib/stores/http-store"));
        });

        it("should export the `BrowserStore` class", () => {
            expect(olo.BrowserStore).to.equal(require("../../src/browser-store"));
        });

        it("should export the `Router` class", () => {
            expect(olo.Router).to.equal(require("../../lib/stores/router"));
        });

        it("should export the `HyperStore` class", () => {
            expect(olo.HyperStore).to.equal(require("../../lib/stores/hyper-store"));
        });

        it("should export the `SubStore` class", () => {
            expect(olo.SubStore).to.equal(require("../../lib/stores/sub-store"));
        });
    });
});
