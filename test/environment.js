
var expect = require("chai").expect;
const Path = require('path');

var expression = require("../lib/expression");
var document = require("../lib/document");
var Environment = require("../lib/environment");
var EmptyStore = require("../lib/stores/empty");
var MemoryStore = require("../lib/stores/memory");



describe("Environment class", () => {
    
    it("should contain the passed options.globals object or {}", () => {
        var globals = {};
        var env = new Environment({globals});
        expect(globals.isPrototypeOf(env.globals)).to.be.true;
        
        var env = new Environment();
        expect(Object.keys(env.globals).length).to.equal(1);
        
        var globals = [1,2,3];
        var env = new Environment({globals});
        expect(globals.isPrototypeOf(env.globals)).to.be.false;
        expect(Object.keys(env.globals).length).to.equal(1);
    });
    
    it("should contains the passed options.scope or MemoryStore", () => {
        var store = new EmptyStore;
        var env = new Environment({store});
        expect(env.store).to.equal(store);
        
        var env = new Environment();
        expect(env.store).to.be.instanceof(MemoryStore);
        
        var store = {get:()=>""};
        var env = new Environment({store});
        expect(env.store).to.be.instanceof(MemoryStore);
        
    });
    
    describe("doc = environment.createDocument(source, presets)", () => {
        
        it("should return an object", async () => {
            var env = new Environment();
            var doc = env.createDocument("/", "source");
            expect(doc).to.be.an("object");
        });
        
        describe("doc.id", () => {
            it("should contain the passed document id in normalized form", () => {
                var env = new Environment();
                
                var doc = env.createDocument('/path/[ ] to/x/../doc?x=1&y=2', "...");
                expect(doc.id).to.equal('/path/[ ] to/doc?x=1&y=2');

                var doc = env.createDocument('path/to/./doc?x=1&y=2#ha', "...");
                expect(doc.id).to.equal('/path/to/doc?x=1&y=2#ha');

                var doc = env.createDocument('path/to/./doc#ha', "...");
                expect(doc.id).to.equal('/path/to/doc#ha');

                var doc = env.createDocument('path/to/./doc/', "...");
                expect(doc.id).to.equal('/path/to/doc/');
            });
        });
        
        describe("doc.source", () => {
            
            it("should contain the document source", () => {
                var env = new Environment();
                var source = "this is the document source";
                var doc = env.createDocument('/', source);
                expect(doc.source).to.equal(source);
                
            });
        });
        
        describe("doc.evaluate", () => {
            
            it("should contain the function returned by document.parse(doc.source)", async () => {
                var env = new Environment();
                var doc = env.createDocument('/', "<% y = 2*x %>");
                expect(doc.evaluate).to.be.a("function");
                
                var context = document.createContext({x:10});
                var docNS = await doc.evaluate(context);
                expect(docNS.y).to.equal(20);
            });
            
            it("should return always the same function (parse only once)", async () => {
                var env = new Environment();
                var doc = env.createDocument('/', "...");
                expect(doc.evaluate).to.equal(doc.evaluate);
            });
        });
        
        describe("context = doc.createContext(...namespace)", () => {
            
            it("should return a document context", async () => {
                var env = new Environment();
                var doc = env.createDocument('/', "...");
                var docContextPrototype = document.createContext();
                var docContext = doc.createContext();
                
                for (let name in docContextPrototype) {
                    expect(docContext[name]).to.equal(docContextPrototype[name]);
                }
            });
            
            it("should contain the names contained in the passed namespaces", async () => {
                var env = new Environment();
                var doc = env.createDocument('/', "...");
                var context = doc.createContext({x:10, y:20}, {y:30});
                expect(context.x).to.equal(10);
                expect(context.y).to.equal(30);
            });
            
            it("should contain the names contained in the `globals` namespaces passed to the environment constructor", () => {
                var env = new Environment({
                    globals: {x:10, y:20}
                });
                var doc = env.createDocument('/', "...");
                var context = doc.createContext({y:30});
                expect(context.x).to.equal(10);
                expect(context.y).to.equal(30);
            });
            
            it("should contain the names contained in the `presets` namespace", () => {
                var env = new Environment();
                var doc = env.createDocument('/', "...", {x:10, y:20});
                var context = doc.createContext({y:30});
                expect(context.x).to.equal(10);
                expect(context.y).to.equal(20);
            });
            
            it("should contain a `argns` object with all the parameters defined in the id query string", () => {
                var env = new Environment();
                var doc = env.createDocument('/path/to/doc?x=10&s=abc', "...");
                var context = doc.createContext();
                expect(context.argns).to.deep.equal({x:10, s:'abc'});
            });
            
            it("should contain the property `import` mapping to a function", async () => {
                var env = new Environment({
                    protocols: {
                        ppp: {get: path => `Doc source @ ppp:${Path.join('/',path)}`}
                    }
                });
                var doc = await env.createDocument(`/`, "...");
                var context = doc.createContext();
                expect(context.import).to.be.a("function");
            });
            
            describe("docNS = context.import(uri, ...namespaces)", () => {
                
                it("should load, evaluate and return the namespace of the olo-document mapped to `uri`", async () => {
                    
                    class TestStore extends EmptyStore {
                        get (path) {
                            return `<% i = "${Path.join('/',path)}" %>`;
                        }
                    }                    
                    
                    var env = new Environment({
                        store: new TestStore()
                    });
                    var doc1 = env.createDocument(`/path/to/doc1`, '...');
                    var context1 = doc1.createContext();
                    var doc2_ns = await context1.import("/path/to/doc2");
                    expect(doc2_ns.i).to.equal("/path/to/doc2");
                });                    
                
                it("should resolve `uri` relative to the calling document URI", async () => {

                    class TestStore extends EmptyStore {
                        get (path) {
                            return `<% i = "${Path.join('/',path)}" %>`;
                        }
                    }                    

                    var env = new Environment({
                        store: new TestStore()
                    });
                    var doc1 = await env.createDocument(`/path/to/doc1`, "...");
                    var context1 = doc1.createContext();
                    
                    var doc2_ns = await context1.import("./doc2");
                    expect(doc2_ns.i).to.equal("/path/to/doc2");

                    var doc3_ns = await context1.import("../to_doc3");
                    expect(doc3_ns.i).to.equal("/path/to_doc3");

                    var doc4_ns = await context1.import("/path_to/doc4");
                    expect(doc4_ns.i).to.equal("/path_to/doc4");
                    
                    var dir = await env.createDocument(`/path/to/`, "...");
                    var context2 = dir.createContext();
                    
                    var doc5_ns = await context2.import("./doc5");
                    expect(doc5_ns.i).to.equal("/path/to/doc5");

                    var doc6_ns = await context2.import("../to_doc6");
                    expect(doc6_ns.i).to.equal("/path/to_doc6");

                    var doc7_ns = await context2.import("/path_to/doc7");
                    expect(doc7_ns.i).to.equal("/path_to/doc7");
                });
                
                it("should cache the imported documents", async () => {
                    var counter = 0;

                    class TestStore extends EmptyStore {
                        get (path) {
                            counter += 1;
                            return `<% i = "${Path.join('/',path)}" %>`;
                        }
                    }                    

                    var env = new Environment({
                        store: new TestStore()
                    });

                    var doc1 = await env.createDocument(`ppp:/path/to/doc1`);
                    var context1 = doc1.createContext();
                    expect(counter).to.equal(0);

                    var doc2_NS = await context1.import("/path/to/doc2");
                    expect(counter).to.equal(1);
                    
                    var doc2_NS = await context1.import("/path/to/doc2");
                    expect(counter).to.equal(1);
                    
                    var doc3_NS = await context1.import("/path/to/doc3");
                    expect(counter).to.equal(2);
                });
            });        
        });        
    });
    
    describe("environment.render", () => {
        
        it("should delegate to `document.render`", () => {
            var render = document.render;
            document.render = value => [value];
            var env = new Environment();
            expect(env.render(10)).to.deep.equal([10]);
            expect(env.render({x:1})).to.deep.equal([{x:1}]);
            document.render = render;
        });
    });
    
    describe("doc = await environment.readDocument(id)", () => {
        
        it("should call the store.get method", async () => {
            var pathParameter;
            
            class TestStore extends EmptyStore {
                get (path) {
                    pathParameter = path;
                }
            }
            
            var env = new Environment({
                store: new TestStore()
            });
            
            await env.readDocument("/path/to/doc");            
            expect(pathParameter).to.equal("/path/to/doc");
        });        
        
        it("should return a document with source given by the proper protocol get handler", async () => {
            class TestStore extends EmptyStore {
                get (path) {
                    return `Doc source @ ${path}`;
                }
            }
            
            var env = new Environment({
                store: new TestStore()
            });
            
            var doc = await env.readDocument(`/path/to/doc`);
            expect(doc.id).to.equal(`/path/to/doc`);
            expect(doc.source).to.equal("Doc source @ /path/to/doc");
        });
    });
    
    describe("await environment.writeDocument(path, source)", () => {
        
        it("should call the store.set method", async () => {
            var writtenSource;
            
            class TestStore extends EmptyStore {
                set (path, source) {
                    writtenSource = source;
                }
            }
            
            var env = new Environment({
                store: new TestStore()
            });
            
            await env.writeDocument("/path/to/doc", "Doc source @ /path/to/doc");            
            expect(writtenSource).to.equal("Doc source @ /path/to/doc");
        });        
    });

    describe("await environment.deleteDocument(path)", () => {
        
        it("should call the store.get method", async () => {
            var pathParameter;
            
            class TestStore extends EmptyStore {
                delete (path) {
                    pathParameter = path;
                }
            }
            
            var env = new Environment({
                store: new TestStore()
            });
            
            await env.deleteDocument("/path/to/doc");            
            expect(pathParameter).to.equal("/path/to/doc");
        });        
    });
});
