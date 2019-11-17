
var expect = require("chai").expect;
var stripIndent = require("strip-indent");

var Document = require("../lib/document");


describe("Document", () => {
    
    describe("document.body - property", () => {
        it("should contain she first argument passed to the constructor", () => {
            var source = "abcdef";
            var doc = new Document(source);
            expect(doc.body).to.equal(source);
        });
    });
    
    describe("context = document.createContext(globals)", () => {
        
        it("should extend the expression base context with the passed `globals` object", () => {
            var doc = new Document("");
            var context = doc.createContext({a:1, b:2});
            expect(context.$call).to.be.a("function");
            expect(context.a).to.equal(1);
            expect(context.b).to.equal(2);
        });
        
        it("should have no own properties", () => {
            var doc = new Document("");
            var context = doc.createContext({a:1, b:2});
            var localNames = Object.getOwnPropertyNames(context);
            expect(localNames).to.deep.equal([]);
        });        
    });
    
    describe("docNamespace = await document.evaluate(context)", () => {
        
        it("should contain the names defined by the inline expressions `<%...%>`", async () => {
            var source = stripIndent(`
                <%a=10%> <%b=a+10%> <%c=b+10%>
                `);
            var doc = new Document(source);
            var context = doc.createContext();
            var docNS = await doc.evaluate(context);
            expect(docNS).to.deep.equal({a:10, b:20, c:30, toString:docNS.toString, __text__:docNS.__text__});
        });
                
        it("should stringify to a text obtained by replacing the inline expressions `<%...%>` with their value", async () => {
            var doc = new Document(`x * 2 = <%x*2%>`);
            var context = doc.createContext({x:10});
            var docNS = await doc.evaluate(context);
            expect(String(docNS)).to.equal("x * 2 = 20");
        });
        
        it("should stringify the inline expressions results using the context `str` method", async () => {
            var doc = new Document(`str(a) = "<%a%>"`);
            var context = doc.createContext({a:["a","b","c"]});
            var docNS = await doc.evaluate(context);
            expect(String(docNS)).to.equal(`str(a) = "abc"`);            
        });
    });
});
