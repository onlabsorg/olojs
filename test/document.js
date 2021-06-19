
var expect = require("chai").expect;
var swan = require("@onlabsorg/swan-js");

var document = require("../lib/document");


describe("document", () => {
    
    describe("context = document.createContext(namespace)", () => {
        
        it("should be an expression context", () => {
            var expContext = swan.createContext();
            var docContext = document.createContext();
            for (let name in expContext) {
                expect(docContext[name]).to.equal(expContext[name]);
            }
        });
        
        it("should contain the passed namespace properties as own properties", () => {
            var namespace = {a:1,b:2};
            var docContext = document.createContext(namespace);
            var ownProps = Object.assign({}, docContext);
            expect(ownProps).to.deep.equal(namespace);
        });
    });    
    
    describe("evaluateDocument = document.parse(source)", () => {
        
        it("should be a function", () => {
            var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
            var evaluate = document.parse(source);
            expect(evaluate).to.be.a("function");            
        });
        
        describe("docns = await evaluateDocument(context)", () => {
            
            it("should be an object", async () => {
                var evaluate = document.parse("document source ...");
                var context = swan.createContext();
                var namespace = await evaluate(context);
                expect(namespace).to.be.an("object");                
            });
            
            it("should contain all the names defined in the swan expressions", async () => {
                var source = `<%a=10%><%b=a+10%>`;
                var evaluate = document.parse(source);
                var context = document.createContext({});
                var namespace = await evaluate(context);
                expect(namespace.a).to.equal(10);
                expect(namespace.b).to.equal(20);
            });
            
            it("should strngify to the text obtained replacing the swan expressions with their stringified return value", async () => {
                var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
                var evaluate = document.parse(source);
                var context = document.createContext();
                var namespace = await evaluate(context);
                expect(await context.str(namespace)).to.equal("a + b = 30");
            });

            it("should decorate the rendered text with the `__render__` function if it exists", async () => {
                var source = `<% __render__ = text -> text + "!" %>Hello World`;
                var evaluate = document.parse(source);
                var context = document.createContext();
                var namespace = await evaluate(context);
                expect(await context.str(namespace)).to.equal("Hello World!");

                var source = `<% __render__ = text -> {__str__:text + "!!"} %>Hello World`;
                var evaluate = document.parse(source);
                var context = document.createContext();
                var namespace = await evaluate(context);
                expect(await context.str(namespace)).to.equal("Hello World!!");
            });
        });        
    });
});
