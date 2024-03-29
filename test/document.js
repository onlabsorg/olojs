
var expect = require("chai").expect;
var swan = require("@onlabsorg/swan-js");

var document = require("../lib/document");
var Document = document.Document;
var MemoryStore = require("../lib/stores/memory-store");


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

    describe(`doc = new Document(store, path, source)`, () => {

        describe('doc.path', () => {

            it("should contain the normalized path of the documet in the store", () => {
                const store = new MemoryStore();
                const doc = new Document(store, 'path/to/x/../doc3', "bla bla");
                expect(doc.path).to.equal('/path/to/doc3');
            });
        });

        describe('doc.source', () => {

            it("should contain the stringified source passed to the constructor", async () => {
                const store = new MemoryStore();
                const doc = new Document(store, 'path/to/x/../doc3', "bla bla ...");
                expect(doc.source).to.equal('bla bla ...');
            });

            it("should default to an empty string if the source parameter is omitted", async () => {
                const store = new MemoryStore();
                const doc = new Document(store, 'path/to/x/../doc3');
                expect(doc.source).to.equal('');
            });
        });

        describe('docns = doc.evaluate(context)', () => {

            it("should contained the compiled source function", async () => {
                const store = new MemoryStore();
                const doc = new Document(store, '/path/to/doc', "2*x=<% y:2*x %>");
                expect(doc.evaluate).to.be.a("function");
                const context = document.createContext({x:10});
                const docns = await doc.evaluate(context);
                expect(docns.y).to.equal(20);
                expect(docns.__str__).to.equal('2*x=20');
            });
        });

        describe('context = doc.createContext(...presets)', () => {

            it("should return a valid document context", async () => {
                const doc = new Document(new MemoryStore(), '/path/to/doc');
                const context = doc.createContext();
                const document_context = document.createContext();
                for (let key in document_context) {
                    if (key !== "this") {
                        expect(context[key]).to.equal(document_context[key]);
                    }
                }
                expect(swan.types.unwrap(context.this)).to.equal(context);
            });

            it("should contain the document path as `__path__`", async () => {
                const doc = new Document(new MemoryStore(), '/path/to/doc');
                const context = doc.createContext();
                expect(context.__path__).to.equal(doc.path);
            });

            it("should contain the passed namespaces properties", async () => {
                const doc = new Document(new MemoryStore(), '/path/to/doc');
                const context = doc.createContext({x:10, y:20}, {y:30, z:40});
                expect(context.x).to.equal(10);
                expect(context.y).to.equal(30);
                expect(context.z).to.equal(40);
            });

            describe('context.import', () => {

                it("should be a function", async () => {
                    const doc = new Document(new MemoryStore(), '/path/to/doc');
                    const context = doc.createContext();
                    expect(context.import).to.be.a("function");
                });

                it("should return the namespace of the passed document", async () => {
                    const store = new MemoryStore({
                        "/path/to/doc2": "doc<% docnum : 2 %><% doc3 = import '/path/to/doc3' %>",
                        "/path/to/doc3": "doc<% docnum : 3 %>"
                    });
                    const doc = new Document(store, '/path/to/doc1');
                    const doc2ns = await doc.createContext().import('/path/to/doc2');
                    expect(doc2ns.docnum).to.equal(2);
                    expect(doc2ns.__str__).to.equal("doc2");
                    expect(doc2ns.doc3.docnum).to.equal(3)
                    expect(doc2ns.doc3.__str__).to.equal('doc3')
                });

                it("should resolve paths relative to the document path", async () => {
                    const store = new MemoryStore({
                        "/path/to/doc2": "doc<% docnum : 2 %><% doc3 = import '/path/to/doc3' %>",
                        "/path/to/doc3": "doc<% docnum : 3 %>"
                    });
                    const doc = new Document(store, '/path/to/doc1');
                    const doc2ns = await doc.createContext().import('./doc2');
                    expect(doc2ns.docnum).to.equal(2);
                    expect(doc2ns.__str__).to.equal("doc2");
                    expect(doc2ns.doc3.docnum).to.equal(3)
                    expect(doc2ns.doc3.__str__).to.equal('doc3')
                });

                it("should cache the documents", async () => {
                    const store = new MemoryStore({
                        '/exp/doc1': `2*x=<% y:2*x %>`,
                        '/exp/doc2': `<% docnum = 2, doc3 = import '/exp/doc3' %>doc2`,
                        '/exp/doc3': `<% docnum = 3 %>doc3`,
                    });
                    const xstore = Object.create(store);
                    xstore.loaded = [];
                    xstore.read = function (path) {
                        xstore.loaded.push(store.normalizePath(path))
                        return store.read(path);
                    }

                    const doc4 = new Document(xstore, '/exp/doc4', `<% import 'doc3', import './doc3', import '/exp/doc2'%>doc4`);
                    const doc4ns = await doc4.evaluate(doc4.createContext());
                    expect(xstore.loaded).to.deep.equal(['/exp/doc3', '/exp/doc2'])
                });
            });
        });
    })

    describe("doc = await document.load(store, path)", () => {

        it("should fetch the source and return the corresponding Document instance", async () => {
            const store = new MemoryStore({
                '/path/to/doc1': `Doc @ /path/to/doc1`,
                '/path/to/doc2': `Doc @ /path/to/doc2`,
                '/path/to/doc3': `Doc @ /path/to/doc3`,
            });

            const doc = await document.load(store, '/path/to/doc2');
            expect(doc).to.be.instanceof(Document);
            expect(doc.path).to.equal('/path/to/doc2');
            expect(doc.source).to.equal(`Doc @ /path/to/doc2`);
        });
    });
});
