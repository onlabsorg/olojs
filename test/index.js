const expect = require("chai").expect;
const olo = require("..");


describe("olojs", () => {

    require("./expression");
    require("./markdown-swan-module");
    require("./document");
    require("./store");
    require("./memory-store");
    require("./file-store");
    require("./http-store");
    require("./router");
    require("./uri-store");
    require("./http-server");

    describe("index", () => {

        it("should export the `expression` module", () => {
            expect(olo.expression).to.equal(require("../lib/expression"));
        });

        it("should export the `document` module", () => {
            expect(olo.document).to.equal(require("../lib/document"));
        });

        it("should export the `Store` class", () => {
            expect(olo.Store).to.equal(require("../lib/store"));
        });

        it("should export the `MemoryStore` class", () => {
            expect(olo.MemoryStore).to.equal(require("../lib/memory-store"));
        });

        it("should export the `FileStore` class", () => {
            expect(olo.FileStore).to.equal(require("../lib/file-store"));
        });

        it("should export the `HTTPStore` class", () => {
            expect(olo.HTTPStore).to.equal(require("../lib/http-store"));
        });

        it("should export the `Router` class", () => {
            expect(olo.Router).to.equal(require("../lib/router"));
        });
        
        it("should export the `http-server` module", () => {
            expect(olo.HTTPServer).to.equal(require("../lib/http-server"));
        });
    });    
});
