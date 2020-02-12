
var expect = require("chai").expect;
var expression = require("../lib/expression");

var Document = require("../lib/document");


describe("Document", () => {
    
    describe("Document.parse(source) - function", () => {
        it("should return a functions that takes a context as argument and return the document local namespace", async () => {
            var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
            var render = Document.parse(source);
            expect(render).to.be.a("function");

            var context = expression.createContext();
            var docNS = await render(context);
            expect(docNS).to.deep.equal({a:10, b:20, __str__:"a + b = 30"})
        });
    });
    
    describe("doc = new Document(source, locals, globals)", () => {
        
        it("should return a document instance with `doc.source`, `doc.locals` and `doc.globals` properties", () => {
            var s="sss", l={}, g={};
            var doc = new Document(s, l, g);
            expect(doc.source).to.equal(s);
            expect(doc.locals).to.equal(l);
            expect(doc.globals).to.equal(g);
        });
        
        describe("content = await doc.evaluate(params)", () => {

            describe("content.namespace", () => {
                it("should contain the document local namespace, evaluated in the expression context created with doc.globals, doc.locals and params", async () => {
                    var g = {n1:10};
                    var l = {n2:20};
                    var p = {n3:30};
                    var s = "<% n4=2*n3 %>n1 + n2 = <% n1+n2 %>";
                    var doc = new Document(s, l, g);
                    var content = await doc.evaluate(p);
                    expect(content.namespace).to.deep.equal({
                        n2: 20,
                        n3: 30,
                        n4: 60,
                        __str__: "n1 + n2 = 30"
                    });
                });
            });
            
            describe("content.render()", () => {
                
                it("should return the document rendered text: replacing the inline expressions with their result", async () => {
                    var g = {n1:10};
                    var l = {n2:20};
                    var p = {n3:30};
                    var s = "<% n4=2*n3 %>n1 + n2 = <% n1+n2 %>";
                    var doc = new Document(s, l, g);
                    var content = await doc.evaluate(p)
                    expect(await content.render()).to.equal("n1 + n2 = 30");
                });

                it("should return return the result of `context.__render__(text)` if it exists", async () => {
                    var g = {n1:10, __render__: text => "decorated: " + text};
                    var l = {n2:20};
                    var p = {n3:30};
                    var s = "<% n4=2*n3 %>n1 + n2 = <% n1+n2 %>";
                    var doc = new Document(s, l, g);
                    var content = await doc.evaluate(p);
                    expect(await content.render()).to.equal("decorated: n1 + n2 = 30");
                });
            });                    
        });
    });
});
