
var expect = require("chai").expect;
var expression = require("../lib/expression");
var stripIndent = require("strip-indent");

var document = require("../lib/document");


describe("document", () => {
    
    describe("document.parse(source) - function", () => {
        
        it("should return a functions that takes a context as argument and return a Content object", async () => {
            var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
            var render = document.parse(source);
            expect(render).to.be.a("function");

            var context = expression.createContext();
            var dcon = await render(context);
            expect(dcon).to.be.instanceof(document.Content)
        });
    });
    
    describe("document.render(source, context) - async function", () => {
        
        it("should return a Content object", async () => {
            var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
            var context = expression.createContext();
            var dcon = await document.render(source, context);
            expect(dcon).to.be.instanceof(document.Content)
        });
    });    
    
    describe("document.Content instance", () => {
        
        it("should stringify to the rendered template text", async () => {
            var source = `<%a=10%><%b=a+10%>a + b = <%a+b%><%('!','!')%>`;
            var context = expression.createContext();
            var dcon = await document.render(source, context);
            expect(String(dcon)).to.equal("a + b = 30!!");
        });
        
        it("should give access to the namespace values vid the .get(name) method", async () => {
            var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
            var context = expression.createContext();
            var dcon = await document.render(source, context);
            expect(dcon.get('a')).to.equal(10);
            expect(dcon.get('b')).to.equal(20);
        });

        it("should yield the namespace names when addressed as iterator", async () => {
            var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
            var context = expression.createContext();
            var dcon = await document.render(source, context);
            expect(dcon[Symbol.iterator]).to.be.a("function");
            expect(Array.from(dcon).sort()).to.deep.equal(['a','b']);
        });
        
        it("should contain a `.size` property with the number of names in the namespaca", async () => {
            var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
            var context = expression.createContext();
            var dcon = await document.render(source, context);
            expect(dcon.size).to.equal(2);
        });
    });        
});
