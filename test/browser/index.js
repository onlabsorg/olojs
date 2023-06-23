const expect = require("chai").expect;
const olo = require("../../browser");

const pathlib = require('path');
console.log(pathlib);

describe("olojs", () => {
        
    require("../expression");
    require("../document");
    require("../store");
    require("../memory-store");
    // require("./http-store");
    require("../router");
    require("../uri-store");
    
    
    describe("index", () => {

        it("should export the `expression` module", () => {
            expect(olo.expression).to.equal(require("../../lib/expression"));
        });

        it("should export the `document` module", () => {
            expect(olo.document).to.equal(require("../../lib/document"));
        });

        it("should export the `Store` class", () => {
            expect(olo.Store).to.equal(require("../../lib/store"));
        });

        it("should export the `MemoryStore` class", () => {
            expect(olo.MemoryStore).to.equal(require("../../lib/memory-store"));
        });

        it("should export the `HTTPStore` class", () => {
            expect(olo.HTTPStore).to.equal(require("../../lib/http-store"));
        });

        it("should export the `Router` class", () => {
            expect(olo.Router).to.equal(require("../../lib/router"));
        });    
    });    
});
