
var expect = require("chai").expect;
var swan = require("@onlabsorg/swan-js");

var document = require("../lib/document");


describe("document", () => {
    
    describe("context = document.createContext(namespace)", () => {
        
        it("should be an expression context", () => {
            var expContext = swan.createContext();
            var docContext = document.createContext();
            for (let name in expContext) {
                if (name !== 'this') {
                    expect(docContext[name]).to.equal(expContext[name]);
                }
            }
            expect(swan.types.unwrap(docContext.this)).to.equal(docContext);
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
                var docns = await evaluate(context);
                expect(docns).to.be.an("object");                
            });
            
            it("should contain all the names defined in the swan expressions", async () => {
                var source = `<%a=10%><%b=a+10%>`;
                var evaluate = document.parse(source);
                var context = document.createContext({});
                var docns = await evaluate(context);
                expect(docns.a).to.equal(10);
                expect(docns.b).to.equal(20);
            });
            
            describe("docns.__str__", () => {
                
                it("should be string obtained replacing the swan expressions with their stringified return value", async () => {
                    var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
                    var evaluate = document.parse(source);
                    var context = document.createContext();
                    var docns = await evaluate(context);
                    expect(docns.__str__).to.equal("a + b = 30");
                });

                it("should decorate the expression value with context.__renderexp__ if it is a function, before stringifying", async () => {
                    var source = `a = <%a:10%>`;
                    var evaluate = document.parse(source);
                    var context = document.createContext({
                        __renderexp__: async value => value+1
                    });
                    var docns = await evaluate(context);
                    expect(docns.__str__).to.equal("a = 11");
                });

                it("should render [[Undefined Syntax]] for expression with syntax error", async () => {
                    var source = `<% $x = 10 %>!`;
                    var evaluate = document.parse(source);
                    expect(evaluate).to.be.a("function");
                    var context = document.createContext();
                    var docns = await evaluate(context);
                    expect(docns.__str__).to.equal("[[Undefined Syntax]]!");
                });
                
                it("should be editable by the inline expressions", async () => {
                    var source = `delete me <% __str__ = "" %>Hello World!`;
                    var evaluate = document.parse(source);
                    var context = document.createContext();
                    var docns = await evaluate(context);
                    expect(docns.__str__).to.equal("Hello World!");
                });

                it("should be decorated by context.__renderdoc__ if it is a function", async () => {
                    var source = `<%a=10%><%b=a+10%>a + b = <%a+b%>`;
                    var evaluate = document.parse(source);
                    var context = document.createContext({
                        __renderdoc__: text => `[[${text}]]`
                    });
                    var docns = await evaluate(context);
                    expect(docns.__str__).to.equal("[[a + b = 30]]");
                })
            });
        });        
    });
});
