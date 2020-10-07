const expect = require("chai").expect;
const Path = require('path');
const olojs = require("..");


describe("olojs", () => {
    
    it("should export the `expression` module", () => {
        expect(olojs.expression).to.equal(require("../lib/expression"));
    });

    it("should export the `document` module", () => {
        expect(olojs.expression).to.equal(require("../lib/expression"));
    });
    
    it("should export the `protocols/file` module", () => {
        expect(olojs.protocols.file).to.equal(require("../lib/protocols/file"));
    });
    
    it("should export the `protocols/http` module exports", () => {
        expect(olojs.protocols.http).to.equal(require("../lib/protocols/http"));
        expect(olojs.protocols.https).to.equal(require("../lib/protocols/https"));
    });

    it("should export the `protocols/null` module", () => {
        expect(olojs.protocols.null).to.equal(require("../lib/protocols/null"));
    });

    it("should export the `environment` module", () => {
        expect(olojs.Environment).to.equal(require("../lib/environment"));
    });
    
    it("should export the `servers/http` module", () => {
        expect(olojs.servers.http).to.equal(require("../lib/servers/http"));
    });
    
    require("./expression");
    require("./stdlib");    
    require("./document");
    require("./protocols");
    require("./environment");
    require("./http-server");    
});
