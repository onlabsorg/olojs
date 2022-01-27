
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
        
        describe("doc = await evaluateDocument(context)", () => {
            
            describe("doc.data", () => {
                
                it("should be an object", async () => {
                    var evaluate = document.parse("document source ...");
                    var context = swan.createContext();
                    var {data} = await evaluate(context);
                    expect(data).to.be.an("object");                
                });
                
                it("should contain all the names defined in the swan expressions", async () => {
                    var source = `<%a=10%><%b=a+10%>`;
                    var evaluate = document.parse(source);
                    var context = document.createContext({});
                    var {data} = await evaluate(context);
                    expect(data.a).to.equal(10);
                    expect(data.b).to.equal(20);
                });
            });
            
            describe("doc.text", () => {
                
                it("should be string obtained replacing the swan expressions with their stringified return value", async () => {
                    var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
                    var evaluate = document.parse(source);
                    var context = document.createContext();
                    var {text} = await evaluate(context);
                    expect(text).to.equal("a + b = 30");
                });

                it("should decorate the rendered text with the `__render__` function if it exists", async () => {
                    var source = `<% __render__ = text -> text + "!" %>Hello World`;
                    var evaluate = document.parse(source);
                    var context = document.createContext();
                    var {text} = await evaluate(context);
                    expect(text).to.equal("Hello World!");

                    var source = `<% __render__ = text -> {__str__: this -> text + "!!"} %>Hello World`;
                    var evaluate = document.parse(source);
                    var context = document.createContext();
                    var {text} = await evaluate(context);
                    expect(text).to.equal("Hello World!!");
                });
            });
        });        
    });
});
