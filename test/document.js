
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
    
    describe("text = document.render(namespace)", () => {
        
        it("should return the rendered document from its evaluated namespace", async () => {
            var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
            var evaluate = document.parse(source);
            var context = expression.createContext();
            var docNS = await evaluate(context);
            var text = await document.render(docNS);
            expect(text).to.equal("a + b = 30");
        });
    });
    
    describe("doc = await document.load(environment, path)", () => {
        
        describe("doc.source", () => {
            it("should return a document with the source returned by environment.readDocument", async () => {
                var env = {
                    readDocument: createReader({
                        "/path/to/doc1": "Source of document at /path/to/doc1",
                        "/path/to/doc2": "Source of document at /path/to/doc2"
                    })
                };
                
                var doc = await document.load(env, "/path/to/doc1");
                expect(doc.source).to.equal("Source of document at /path/to/doc1");
                            
                var doc = await document.load(env, "/path/to/doc2");
                expect(doc.source).to.equal("Source of document at /path/to/doc2");
            });               
        });
        
        describe("doc.evaluate(presets)", () => {
            
            it("should return the document namespace", async () => {
                var env = {
                    readDocument: createReader({
                        "/path/to/doc1": `<% x = 10 %>`,
                    })
                };            
                var doc = await document.load(env, "/path/to/doc1");
                var namespace = await doc.evaluate();
                expect(namespace.x).to.equal(10);
            });
            
            it("should add the presets names before evaluating the source", async () => {
                var env = {
                    readDocument: createReader({
                        "/path/to/doc1": `<% x = 10+y %>`,
                    })
                };            
                var doc = await document.load(env, "/path/to/doc1");
                var namespace = await doc.evaluate({y:3});
                expect(namespace.x).to.equal(13);
            });

            it("should add the document __path__ to the document locals", async () => {
                var env = {
                    readDocument: createReader({
                        "/path/to/doc1": `<% x = __path__ %>`,
                    })
                };            
                var doc = await document.load(env, "/path/to/doc1");
                var namespace = await doc.evaluate();
                expect(namespace.x).to.equal("/path/to/doc1");
            });
            
            it("should add the import function to the document locals", async () => {
                var env = {
                    readDocument: createReader({
                        "/path/to/doc1": `<% x = (import "./doc2").y %>`,
                        "/path/to/doc2": `<% y = 11 %>`,
                    })
                };            
                var doc = await document.load(env, "/path/to/doc1");
                var namespace = await doc.evaluate();
                expect(namespace.x).to.equal(11);
            });
        });                 
    });    
});

function createReader (docs) {
    return path => docs[path];
}
