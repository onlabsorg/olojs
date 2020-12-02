var expect = require("chai").expect;
var expression = require("../lib/expression");
var swan = require("@onlabsorg/swan-js");

describe("expression", () => {
    
    describe("expression.createContext", () => {
        
        it("should be a swan context", async () => {
            var swanContext = swan.createContext();
            var expContext = expression.createContext();
            for (let name in swanContext) {
                expect(expContext[name]).to.equal(swanContext[name]);
            }
        });
    });
    
    describe("expression.parse", () => {
        
        it("should return a function", async () => {
            var evaluate = expression.parse("2*3+1");
            expect(evaluate).to.be.a("function");
        });
        
        describe("the returned function", () => {
            
            it("should evaluate the parsed swan expressions", async () => {
                var evaluate = expression.parse("(x,y,z)");
                var context = expression.createContext({x:10, y:20, z:30});
                var tuple = await evaluate(context);
                expect(swan.T.isTuple(tuple)).to.be.true;
                expect(Array.from(tuple)).to.deep.equal([10,20,30]);
            });            
        });
    });
    
    
    
});
