
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
                var context = expression.createContext();
                var docNS = await evaluate(context);
                expect(docNS).to.deep.equal({a:10, b:20, __str__:"a + b = 30"});                
            });
            
            it("should contain the template fragments as functions", async () => {   

                // Fragment
                var source = `<def:Fragment1>This is the fragment number <% n=1, n %> rendered via <% caller %></def:Fragment1><% Fragment1({caller="swan"}) %>`;
                var docNS = await document.parse(source)(expression.createContext());
                
                expect(docNS.Fragment1).to.be.a("function");
                var fragment = await docNS.Fragment1({caller: "JS"});
                expect(fragment.n).to.equal(1);
                expect(await expression.stringify(fragment)).to.equal("This is the fragment number 1 rendered via JS");
                expect(await expression.stringify(docNS)).to.equal("This is the fragment number 1 rendered via swan");
                
                
                // Multiple fragments             
                var source = `
                    <def:Fragment1>This is the fragment number <% n=1, n %>, named <% name %></def:Fragment1>                    
                    <def:Fragment2>This is the fragment number <% n=2, n %>, named <% name %></def:Fragment2>                    
                    <% Fragment1() %>
                `;
                var docNS = await document.parse(source)(expression.createContext());
                
                expect(docNS.Fragment1).to.be.a("function");
                var fragment = await docNS.Fragment1({name: "f1"});
                expect(fragment.n).to.equal(1);
                expect(await expression.stringify(fragment)).to.equal("This is the fragment number 1, named f1");

                expect(docNS.Fragment2).to.be.a("function");
                var fragment = await docNS.Fragment2({name: "f2"});
                expect(fragment.n).to.equal(2);
                expect(await expression.stringify(fragment)).to.equal("This is the fragment number 2, named f2");

                // Nested fragments             
                var source = `
                    <def:ParentFragment>
                        <def:ChildFragment>
                            <% x=111 %>
                        </def:ChildFragment>
                    </def:ParentFragment>                    
                `;
                var docNS = await document.parse(source)(expression.createContext());
                
                expect(docNS.ParentFragment).to.be.a("function");
                var parent = await docNS.ParentFragment();
                expect(parent.ChildFragment).to.be.a("function");
                var child = await parent.ChildFragment();
                expect(child.x).to.equal(111);
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
        
        it("should decorate the stringified docns via constext.__render__(str) if it exists", async () => {
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
