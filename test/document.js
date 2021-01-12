
var expect = require("chai").expect;
var swan = require("@onlabsorg/swan-js");

var document = require("../lib/document");


describe("document", () => {
    
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
                var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
                var evaluate = document.parse(source);
                var context = swan.createContext({});
                var namespace = await evaluate(context);
                expect(namespace.__str__).to.be.a("function");
                expect(namespace).to.deep.equal({a:10, b:20, __str__:namespace.__str__});
            });
            
            it("should stringify to a text obtained replacing the swan expressions with their return value", async () => {
                var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
                var evaluate = document.parse(source);
                var context = swan.createContext();
                var namespace = await evaluate(context);
                expect(await context.str(namespace)).to.equal("a + b = 30");                
            });

            it("should use docns.__render__ as post-stringifier", async () => {
                var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
                var evaluate = document.parse(source);
                var context = swan.createContext();
                var namespace = await evaluate(context);
                namespace.__render__ = text => `${text}!`;
                expect(await context.str(namespace)).to.equal("a + b = 30!");                
            });

            it("should allow overriding the __str__ function", async () => {
                var source = `Hi<% __str__ = (__str__ >> (text -> text+"!")) %>`;
                var evaluate = document.parse(source);
                var context = swan.createContext();
                var namespace = await evaluate(context);
                expect(await context.str(namespace)).to.equal("Hi!");
            });

            it("should return context.$renderError when an expression throws an error", async () => {
                var source = `<% 1 + [] %><% a=10 %>`;
                var evaluate = document.parse(source);
                expect(evaluate).to.be.a("function");
                var context = swan.createContext({
                    $renderError: error => "<ERR!>"
                }).$extend({});
                var namespace = await evaluate(context);
                expect(namespace.a).to.equal(10);
                expect(await namespace.__str__(namespace)).to.equal("<ERR!>");
            });            
        });        
    });
    
    describe("context = document.createContext(namespace)", () => {
        
        it("should be an expression context", () => {
            var expContext = swan.createContext();
            var docContext = document.createContext();
            for (let name in expContext) {
                expect(docContext[name]).to.equal(expContext[name]);
            }
        });
        
        it("should contain a $renderError function", () => {
            var docContext = document.createContext();
            expect(docContext.$renderError).to.be.a("function");            
        });

        it("should contain the passed namespace properties as own properties", () => {
            var namespace = {a:1,b:2};
            var docContext = document.createContext(namespace);
            var ownProps = Object.assign({}, docContext);
            expect(ownProps).to.deep.equal(namespace);
        });
    });
});
