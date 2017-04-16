
const AbstractBackend = require("../lib/backends/abstract");
const MemoryBackend = require("../lib/backends/memory");
const LocalBackend = require("../lib/backends/local");
const OlodbBackend = require("../lib/backends/olodb");
const Store = require("../lib/Store");
const Path = require("../lib/Path");
const errors = require("../lib/errors");
const rights = require("../lib/rights");

const olojs = require("../lib/index");



describe("olojs index", function () {
    
    it("should contain AbstractBackend", function () {
        expect(olojs.AbstractBackend).to.equal(AbstractBackend);
    });
    
    it("should contain MemoryBackend", function () {
        expect(olojs.MemoryBackend).to.equal(MemoryBackend);
    });
    
    it("should contain LocalBackend", function () {
        expect(olojs.LocalBackend).to.equal(LocalBackend);
    });
    
    it("should contain OlodbBackend", function () {
        expect(olojs.OlodbBackend).to.equal(OlodbBackend);
    });
    
    it("should contain Store", function () {
        expect(olojs.Store).to.equal(Store);
    });
    
    it("should contain Path", function () {
        expect(olojs.Path).to.equal(Path);
    });
    
    it("should contain errors", function () {
        expect(olojs.errors).to.equal(errors);
    });
    
    it("should contain rights", function () {
        expect(olojs.rights).to.equal(rights);
    });
});