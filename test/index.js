const expect = require("chai").expect;


describe("olojs", () => {
    require("./path");
    require("./expression");
    require("./document");
    require("./environment");
    require("./fs-store");
    require("./http-store");
    require("./router");
    require("./http-server");    
    require("./stdlib");
    
    describe("main exports", () => {
        
        it("should export the expression module", () => {
            expect(require("../index").expression).to.equal(require("../lib/expression"));
        });
        
        it("should export the document module", () => {
            expect(require("../index").document).to.equal(require("../lib/document"));
        });
        
        it("should export the Environment class", () => {
            expect(require("../index").Environment).to.equal(require("../lib/environment"));
        });
    });
});
