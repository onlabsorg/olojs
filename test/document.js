
var expect = require("chai").expect;
var expression = require("../lib/expression");

var document = require("../lib/document");


describe("document", () => {
    
    describe("evaluate = document.parse(source)", () => {
        
        it("should be a function", () => {
            var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
            var evaluate = document.parse(source);
            expect(evaluate).to.be.a("function");            
        });
        
        it("should take a context as argument and return the document local namespace", async () => {
            var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
            var evaluate = document.parse(source);
            var context = expression.createContext();
            var docNS = await evaluate(context);
            expect(docNS).to.deep.equal({a:10, b:20, __str__:"a + b = 30"})
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
        
        it("should contain the rendered text as __str__ property", async () => {
            var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
            var evaluate = document.parse(source);
            var context = expression.createContext({}).$extend();
            var docNS = await evaluate(context);
            expect(docNS).to.deep.equal({a:10, b:20, __str__:"a + b = 30"})                        
        });
        
        it("should contain the result of context.__render__(text), if it exists, as __str__ property", async () => {
            var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
            var evaluate = document.parse(source);
            var context = expression.createContext({
                __render__: text => text + " ..."
            }).$extend();
            var docNS = await evaluate(context);
            expect(docNS).to.deep.equal({a:10, b:20, __str__:"a + b = 30 ..."})            
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
