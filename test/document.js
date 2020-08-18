
var expect = require("chai").expect;
var expression = require("../lib/expression");

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
                var context = expression.createContext();
                var docNS = await evaluate(context);
                expect(docNS).to.be.an("object");                
            });
            
            it("should contain all the names defined in the swan expressions", async () => {
                var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
                var evaluate = document.parse(source);
                var context = expression.createContext({});
                var docNS = await evaluate(context);
                expect(docNS).to.deep.equal({a:10, b:20, __str__:"a + b = 30"});                
            });
            
            it("should stringify to a text obtained replacing the swan expressions with their return value", async () => {
                var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
                var evaluate = document.parse(source);
                var context = expression.createContext();
                var docNS = await evaluate(context);
                expect(expression.stringify(docNS)).to.equal("a + b = 30");                
            });

            it("should return context.$renderError when an expression throws an error", async () => {
                var source = `<% 1 + [] %><% a=10 %>`;
                var evaluate = document.parse(source);
                expect(evaluate).to.be.a("function");
                var context = expression.createContext({
                    $renderError: error => "<ERR!>"
                }).$extend({});
                var docNS = await evaluate(context);
                expect(docNS).to.deep.equal({a:10, __str__:"<ERR!>"})
            });            
        });        
    });
    
    describe("rendered_doc = await document.render(doc_namespace)", () => {
        
        it("should stringify the document namespace", async () => {
            var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
            var evaluate = document.parse(source);
            var context = expression.createContext({});
            var doc_namespace = await evaluate(context);
            var doc_rendering = await document.render(doc_namespace);
            expect(doc_rendering).to.equal("a + b = 30");
        });
        
        it("should decorate the stringified docns via context.__render__(str) if it exists", async () => {
            var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
            var evaluate = document.parse(source);
            var context = expression.createContext({});
            context.__render__ = text => text + "!";
            var doc_namespace = await evaluate(context);
            var doc_rendering = await document.render(doc_namespace);
            expect(doc_rendering).to.equal("a + b = 30!");
        });        
    });
    
    describe("context = document.createContext(namespace)", () => {
        
        it("should be an expression context", () => {
            var expContext = Object.getPrototypeOf(expression.createContext());
            var docContext = document.createContext();
            expect(expContext.isPrototypeOf(docContext)).to.equal(true);
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
