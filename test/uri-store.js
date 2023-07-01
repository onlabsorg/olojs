var expect = require("chai").expect;
var swan = require('../lib/expression');
var document = require("../lib/document");
var Store = require('../lib/store');
var MemoryStore = require('../lib/memory-store');
var URIStore = require('../lib/uri-store');



describe("URIStore", () => {

    describe("normURI = uriStore.normalizePath(uri)", () => {

        it("should resolve relative paths", () => {
            const uriStore = new URIStore({sss: new MemoryStore()});
            expect(uriStore.normalizePath('abc:/../path/to//./dir/../doc')).to.equal('abc://path/to/doc');
        });

        it("should lowercase the scheme", () => {
            const uriStore = new URIStore({sss: new MemoryStore()});
            expect(uriStore.normalizePath('aBC:/path/to//./dir/../doc')).to.equal('abc://path/to/doc');
        });

        it("should default to the 'home' scheme if the uri is scheme-less", () => {
            const uriStore = new URIStore({sss: new MemoryStore()});
            expect(uriStore.normalizePath('../path/to//./dir/../doc')).to.equal('home://path/to/doc');
        });

    });

    describe("normURI = uriStore.resolvePath(baseURI, subPath)", () => {

        it("should return an absolute URI, made treating subPath as relative to the baseURI path", () => {
            const uriStore = new URIStore({abc: new MemoryStore()});
            expect(uriStore.resolvePath('abc:/path/to/doc1', './doc2')).to.equal('abc://path/to/doc2');
            expect(uriStore.resolvePath('abc:/path/to/doc1', 'doc2')).to.equal('abc://path/to/doc2');
            expect(uriStore.resolvePath('abc:/path/to/doc1', '../to_doc2')).to.equal('abc://path/to_doc2');
            expect(uriStore.resolvePath('abc:/path/to/', './doc2')).to.equal('abc://path/to/doc2');
        });

        it("should keep only the base URI if subPath is an absolute path", () => {
            const uriStore = new URIStore({abc: new MemoryStore()});
            expect(uriStore.resolvePath('abc:/path/to/doc1', '/doc2')).to.equal('abc://doc2');
        });

        it("should return subPath if it is an URI", () => {
            const uriStore = new URIStore({abc: new MemoryStore()});
            expect(uriStore.resolvePath('abc:/path/to/doc1', 'xxx:/path_to/dir/../doc2')).to.equal('xxx://path_to/doc2');
        });
    });

    describe(`source = uriStore.read(path)`, () => {

        it("should delegate to the matching mounted store", async () => {
            var uriStore = new URIStore({
                "aaa": new MemoryStore({
                    "/path/to/doc1" : "doc @ aaa://path/to/doc1",
                    "/path/to/doc2" : "doc @ aaa://path/to/doc2",
                    "/path/to/doc3" : "doc @ aaa://path/to/doc3",
                }),
                "bBb": new MemoryStore({
                    "/path/to/doc1" : "doc @ bbb://path/to/doc1",
                    "/path/to/doc2" : "doc @ bbb://path/to/doc2",
                    "/path/to/doc3" : "doc @ bbb://path/to/doc3",
                }),
                "ccc": new MemoryStore({
                    "/path/to/doc1" : "doc @ ccc://path/to/doc1",
                    "/path/to/doc2" : "doc @ ccc://path/to/doc2",
                    "/path/to/doc3" : "doc @ ccc://path/to/doc3",
                }),
                "home": new MemoryStore({
                    "/path/to/doc1" : "doc @ home://path/to/doc1",
                    "/path/to/doc2" : "doc @ home://path/to/doc2",
                    "/path/to/doc3" : "doc @ home://path/to/doc3",
                }),
            });
            expect(await uriStore.read('aaa://path/to/doc1')).to.equal("doc @ aaa://path/to/doc1");
            expect(await uriStore.read('bbb://path/to/doc1')).to.equal("doc @ bbb://path/to/doc1");
            expect(await uriStore.read('ccc://path/to/doc1')).to.equal("doc @ ccc://path/to/doc1");
            expect(await uriStore.read('/path/to/doc1')).to.equal("doc @ home://path/to/doc1");
            expect(await uriStore.read('aaa:/path/to/dir/../doc1')).to.equal("doc @ aaa://path/to/doc1");
        });

        it("should return an empty document if no match is found", async () => {
            var uriStore = new URIStore({
                "aaa": new MemoryStore({
                    "/path/to/doc1" : "doc @ aaa://path/to/doc1",
                    "/path/to/doc2" : "doc @ aaa://path/to/doc2",
                    "/path/to/doc3" : "doc @ aaa://path/to/doc3",
                }),
                "bBb": new MemoryStore({
                    "/path/to/doc1" : "doc @ bbb://path/to/doc1",
                    "/path/to/doc2" : "doc @ bbb://path/to/doc2",
                    "/path/to/doc3" : "doc @ bbb://path/to/doc3",
                }),
                "ccc": new MemoryStore({
                    "/path/to/doc1" : "doc @ ccc://path/to/doc1",
                    "/path/to/doc2" : "doc @ ccc://path/to/doc2",
                    "/path/to/doc3" : "doc @ ccc://path/to/doc3",
                }),
                "home": new MemoryStore({
                    "/path/to/doc1" : "doc @ home://path/to/doc1",
                    "/path/to/doc2" : "doc @ home://path/to/doc2",
                    "/path/to/doc3" : "doc @ home://path/to/doc3",
                }),
            });
            expect(await uriStore.read('ddd://path/to/doc1')).to.equal("");
        })

        it("should ignore stores with invalid schemes", async () => {
            var uriStore = new URIStore({
                "a?a": new MemoryStore({
                    "/path/to/doc1" : "doc @ aaa://path/to/doc1",
                    "/path/to/doc2" : "doc @ aaa://path/to/doc2",
                    "/path/to/doc3" : "doc @ aaa://path/to/doc3",
                }),
                "bBb": new MemoryStore({
                    "/path/to/doc1" : "doc @ bbb://path/to/doc1",
                    "/path/to/doc2" : "doc @ bbb://path/to/doc2",
                    "/path/to/doc3" : "doc @ bbb://path/to/doc3",
                }),
                "ccc": new MemoryStore({
                    "/path/to/doc1" : "doc @ ccc://path/to/doc1",
                    "/path/to/doc2" : "doc @ ccc://path/to/doc2",
                    "/path/to/doc3" : "doc @ ccc://path/to/doc3",
                }),
                "home": new MemoryStore({
                    "/path/to/doc1" : "doc @ home://path/to/doc1",
                    "/path/to/doc2" : "doc @ home://path/to/doc2",
                    "/path/to/doc3" : "doc @ home://path/to/doc3",
                }),
            });
            expect(await uriStore.read('a?a://path/to/doc1')).to.equal("");
        })
    });
    
    describe(`doc = store.loadDocument(path, source)`, () => {
        
        describe('doc.path', () => {
            
            it("should contain the normalized path of the documet in the store", async () => {
                var uriStore = new URIStore({
                    "aaa": new MemoryStore({
                        "/path/to/doc1" : "doc @ aaa://path/to/doc1",
                        "/path/to/doc2" : "doc @ aaa://path/to/doc2",
                        "/path/to/doc3" : "doc @ aaa://path/to/doc3",
                    }),
                    "bBb": new MemoryStore({
                        "/path/to/doc1" : "doc @ bbb://path/to/doc1",
                        "/path/to/doc2" : "doc @ bbb://path/to/doc2",
                        "/path/to/doc3" : "doc @ bbb://path/to/doc3",
                    }),
                    "ccc": new MemoryStore({
                        "/path/to/doc1" : "doc @ ccc://path/to/doc1",
                        "/path/to/doc2" : "doc @ ccc://path/to/doc2",
                        "/path/to/doc3" : "doc @ ccc://path/to/doc3",
                    }),
                    "home": new MemoryStore({
                        "/path/to/doc1" : "doc @ home://path/to/doc1",
                        "/path/to/doc2" : "doc @ home://path/to/doc2",
                        "/path/to/doc3" : "doc @ home://path/to/doc3",
                    }),
                });

                var doc = await uriStore.loadDocument('aaa:/path/to/../to/doc1');
                expect(doc.path).to.equal('aaa://path/to/doc1');

                var doc = await uriStore.loadDocument('path/to/../to/doc1');
                expect(doc.path).to.equal('home://path/to/doc1');
            });
        });
        
        describe('doc.source', () => {
            
            it("should contain the stringified source passed to the constructor", async () => {
                var uriStore = new URIStore({
                    "aaa": new MemoryStore({
                        "/path/to/doc1" : "doc @ aaa://path/to/doc1",
                        "/path/to/doc2" : "doc @ aaa://path/to/doc2",
                        "/path/to/doc3" : "doc @ aaa://path/to/doc3",
                    }),
                    "bBb": new MemoryStore({
                        "/path/to/doc1" : "doc @ bbb://path/to/doc1",
                        "/path/to/doc2" : "doc @ bbb://path/to/doc2",
                        "/path/to/doc3" : "doc @ bbb://path/to/doc3",
                    }),
                    "ccc": new MemoryStore({
                        "/path/to/doc1" : "doc @ ccc://path/to/doc1",
                        "/path/to/doc2" : "doc @ ccc://path/to/doc2",
                        "/path/to/doc3" : "doc @ ccc://path/to/doc3",
                    }),
                    "home": new MemoryStore({
                        "/path/to/doc1" : "doc @ home://path/to/doc1",
                        "/path/to/doc2" : "doc @ home://path/to/doc2",
                        "/path/to/doc3" : "doc @ home://path/to/doc3",
                    }),
                });

                var doc = await uriStore.loadDocument('/path/to/doc1');
                expect(doc.source).to.equal('doc @ home://path/to/doc1');
            });            
        });
        
        describe('docns = doc.evaluate(context)', () => {
            
            it("should contained the compiled source function", async () => {
                var uriStore = new URIStore({
                    "aaa": new MemoryStore({
                        "/path/to/doc1"  : '2*x=<% y:2*x %>',
                        "/path/to/doc2" : "doc @ /path/to/doc1"
                    }),
                });

                const doc = await uriStore.loadDocument('aaa://path/to/doc1');
                expect(doc.evaluate).to.be.a("function");
                const context = document.createContext({x:10});
                const docns = await doc.evaluate(context);
                expect(docns.y).to.equal(20);
                expect(docns.__text__).to.equal('2*x=20');
            });            
        });
        
        describe('context = doc.createContext(...presets)', () => {
            
            it("should return a valid document context", async () => {
                var uriStore = new URIStore({
                    "path/to": new MemoryStore({
                        "/"    : "doc @ /path/to/",
                        "doc1" : "doc @ /path/to/doc1"
                    }),
                    "/path/to/store2": new MemoryStore({
                        "/"             : "doc @ /path/to/store2/",
                        "/path/to/doc2" : "doc @ /path/to/store2/path/to/doc2"
                    }),
                    "/": new MemoryStore({
                        "/path/to/doc3"  : "doc @ /path/to/doc3",
                        "/path/to/dir/"  : "doc @ /path/to/dir/",
                        "/path_to/doc4"  : "doc @ /path_to/doc4"
                    }),
                });

                const doc = await uriStore.loadDocument('/path/to/doc1');
                const context = doc.createContext();
                const document_context = document.createContext();
                for (let key in document_context) {
                    if (key !== "this") {
                        expect(context[key]).to.equal(document_context[key]);
                    }
                }
                expect(swan.types.unwrap(context.this)).to.equal(context);
            });
            
            it("should contain a reference to the document as `__doc__`", async () => {
                var uriStore = new URIStore({
                    "path/to": new MemoryStore({
                        "/"    : "doc @ /path/to/",
                        "doc1" : "doc @ /path/to/doc1"
                    }),
                    "/path/to/store2": new MemoryStore({
                        "/"             : "doc @ /path/to/store2/",
                        "/path/to/doc2" : "doc @ /path/to/store2/path/to/doc2"
                    }),
                    "/": new MemoryStore({
                        "/path/to/doc3"  : "doc @ /path/to/doc3",
                        "/path/to/dir/"  : "doc @ /path/to/dir/",
                        "/path_to/doc4"  : "doc @ /path_to/doc4"
                    }),
                });

                var doc = await uriStore.loadDocument('/path/to/doc1');
                var context = doc.createContext();
                expect(context.__doc__).to.equal(doc);
            });
            
            it("should contain the document store path as `__store__`", async () => {
                var uriStore = new URIStore({
                    "path/to": new MemoryStore({
                        "/"    : "doc @ /path/to/",
                        "doc1" : "doc @ /path/to/doc1"
                    }),
                    "/path/to/store2": new MemoryStore({
                        "/"             : "doc @ /path/to/store2/",
                        "/path/to/doc2" : "doc @ /path/to/store2/path/to/doc2"
                    }),
                    "/": new MemoryStore({
                        "/path/to/doc3"  : "doc @ /path/to/doc3",
                        "/path/to/dir/"  : "doc @ /path/to/dir/",
                        "/path_to/doc4"  : "doc @ /path_to/doc4"
                    }),
                });

                var doc = await uriStore.loadDocument('/path/to/doc1');
                var context = doc.createContext();
                expect(context.__store__).to.equal(uriStore);

                var doc = await uriStore.loadDocument('/path/to/');
                var context = doc.createContext();
                expect(context.__store__).to.equal(uriStore);
            });
            
            it("should contain the passed namespaces properties", async () => {
                var uriStore = new URIStore({
                    "path/to": new MemoryStore({
                        "/"    : "doc @ /path/to/",
                        "doc1" : "doc @ /path/to/doc1"
                    }),
                    "/path/to/store2": new MemoryStore({
                        "/"             : "doc @ /path/to/store2/",
                        "/path/to/doc2" : "doc @ /path/to/store2/path/to/doc2"
                    }),
                    "/": new MemoryStore({
                        "/path/to/doc3"  : "doc @ /path/to/doc3",
                        "/path/to/dir/"  : "doc @ /path/to/dir/",
                        "/path_to/doc4"  : "doc @ /path_to/doc4"
                    }),
                });

                const doc = await uriStore.loadDocument('/path/to/doc1');
                const context = doc.createContext({x:10, y:20}, {y:30, z:40});
                expect(context.x).to.equal(10);
                expect(context.y).to.equal(30);
                expect(context.z).to.equal(40);
            });            
            
            describe('docns = await context.import(path)', () => {
                
                it("should be a function", async () => {
                    var uriStore = new URIStore({
                        "aaa": new MemoryStore({
                            "/path/to/doc1"    : "doc @ /path/to/doc1",
                            "/path/to/doc2"    : "doc @ /path/to/doc2",
                        }),
                    });

                    const doc = await uriStore.loadDocument('aaa://path/to/doc1');
                    const context = doc.createContext();
                    expect(context.import).to.be.a("function");
                });
                
                it("should return the namespace of the passed document", async () => {
                    var uriStore = new URIStore({
                        aaa: new MemoryStore({
                            "/path/to/doc1" : "<% doc2 = import 'bbb:/path/to/dir/../doc2' %>doc @ <% __doc__.path %>",
                        }),
                        bbb: new MemoryStore({
                            "/path/to/doc1" : "doc @ bbb://path/to/doc1",
                            "/path/to/doc2" : "doc @ bbb://path/to/doc2"
                        }),
                    });

                    var doc = await uriStore.loadDocument('aaa://path/to/doc');
                    const doc1ns = await doc.createContext().import('aaa://path/to/doc1');
                    expect(doc1ns.__text__).to.equal("doc @ aaa://path/to/doc1");
                    expect(doc1ns.doc2.__text__).to.equal('doc @ bbb://path/to/doc2')
                });

                it("should resolve paths relative to the document path", async () => {
                    var uriStore = new URIStore({
                        aaa: new MemoryStore({
                            "/path/to/doc1" : "<% doc2 = import '/path/to/doc2' %>doc @ <% __doc__.path %>",
                            "/path/to/doc2" : "doc @ aaa://path/to/doc2"
                        }),
                    });

                    var doc = await uriStore.loadDocument('aaa://path/to/doc');
                    const doc1ns = await doc.createContext().import('doc1');
                    expect(doc1ns.__text__).to.equal("doc @ aaa://path/to/doc1");
                    expect(doc1ns.doc2.__text__).to.equal('doc @ aaa://path/to/doc2');
                });

                it("should cache the documents", async () => {
                    var uriStore = new URIStore({
                        "abc": new MemoryStore({
                            "/path/to/doc1": "2*x=<% y:2*x %>",
                            "/path/to/doc2": "<% docnum = 2, doc3 = import '/path/to/doc3' %>doc2",
                            "/path/to/doc3": "<% docnum = 3 %>doc3",
                            "/path/to/doc4": "<% import 'doc3', import './doc3', import '/path/to/doc2'%>doc4"
                        }),
                    });

                    const xstore = Object.create(uriStore);
                    xstore.loaded = [];
                    xstore.read = function (path) {
                        xstore.loaded.push(uriStore.normalizePath(path))
                        return uriStore.read(path);
                    }

                    const doc4 = await xstore.loadDocument('abc://path/to/doc4');
                    const doc4ns = await doc4.evaluate(doc4.createContext());
                    expect(xstore.loaded).to.deep.equal(['abc://path/to/doc4', 'abc://path/to/doc3', 'abc://path/to/doc2'])
                });
            });
        });
    }); 
    
    describe(`doc = await store.evaluateDocument(path, ...presets)`, () => {
        
        it("should load and evaluate a document from the store", async () => {
            var uriStore = new URIStore({
                home: new MemoryStore({
                    "/path/to/doc1" : "doc @ <% __doc__.path %><% y = 2*x %>"
                }),
            });

            const docns = await uriStore.evaluateDocument('/path/to/doc1', {x:10});
            expect(docns.__text__).to.equal('doc @ home://path/to/doc1');
            expect(docns.x).to.equal(10);
            expect(docns.y).to.equal(20);
        });
    });

    describe("substore = store.createSubStore(rootURI)", () => {

        it("should be a Store object", () => {
            var uriStore = new URIStore({
                "aaa": new MemoryStore({
                    "/path/to/doc1" : "doc @ aaa://path/to/doc1",
                    "/path/to/doc2" : "doc @ aaa://path/to/doc2",
                    "/path/to/doc3" : "doc @ aaa://path/to/doc3",
                }),
                "bbb": new MemoryStore({
                    "/path/to/doc1" : "doc @ bbb://path/to/doc1",
                    "/path/to/doc2" : "doc @ bbb://path/to/doc2",
                    "/path/to/doc3" : "doc @ bbb://path/to/doc3",
                }),
                "ccc": new MemoryStore({
                    "/path/to/doc1" : "doc @ ccc://path/to/doc1",
                    "/path/to/doc2" : "doc @ ccc://path/to/doc2",
                    "/path/to/doc3" : "doc @ ccc://path/to/doc3",
                }),
                "home": new MemoryStore({
                    "/path/to/doc1" : "doc @ home://path/to/doc1",
                    "/path/to/doc2" : "doc @ home://path/to/doc2",
                    "/path/to/doc3" : "doc @ home://path/to/doc3",
                }),
            });
            const substore = uriStore.createSubStore('aaa://path/');
            expect(substore).to.be.instanceof(Store);
        });

        describe("substore.read(path)", () => {

            it("should delegate to store.read(rootPath+path)", async () => {
                var uriStore = new URIStore({
                    "aaa": new MemoryStore({
                        "/path/to/doc1" : "doc @ aaa://path/to/doc1",
                        "/path/to/doc2" : "doc @ aaa://path/to/doc2",
                        "/path/to/doc3" : "doc @ aaa://path/to/doc3",
                    }),
                    "bbb": new MemoryStore({
                        "/path/to/doc1" : "doc @ bbb://path/to/doc1",
                        "/path/to/doc2" : "doc @ bbb://path/to/doc2",
                        "/path/to/doc3" : "doc @ bbb://path/to/doc3",
                    }),
                    "ccc": new MemoryStore({
                        "/path/to/doc1" : "doc @ ccc://path/to/doc1",
                        "/path/to/doc2" : "doc @ ccc://path/to/doc2",
                        "/path/to/doc3" : "doc @ ccc://path/to/doc3",
                    }),
                    "home": new MemoryStore({
                        "/path/to/doc1" : "doc @ home://path/to/doc1",
                        "/path/to/doc2" : "doc @ home://path/to/doc2",
                        "/path/to/doc3" : "doc @ home://path/to/doc3",
                    }),
                });

                var substore = uriStore.createSubStore('aaa://path/');
                expect(await substore.read('to/doc1')).to.equal("doc @ aaa://path/to/doc1");
                expect(await substore.read('/to/doc1')).to.equal("doc @ aaa://path/to/doc1");
                expect(await substore.read('../to/doc1')).to.equal("doc @ aaa://path/to/doc1");

                var substore = uriStore.createSubStore('aaa://path');
                expect(await substore.read('to/doc1')).to.equal("doc @ aaa://path/to/doc1");
                expect(await substore.read('/to/doc1')).to.equal("doc @ aaa://path/to/doc1");
                expect(await substore.read('../to/doc1')).to.equal("doc @ aaa://path/to/doc1");

                var substore = uriStore.createSubStore('aaa:/');
                expect(await substore.read('path/to/doc1')).to.equal("doc @ aaa://path/to/doc1");
                expect(await substore.read('/path/to/doc1')).to.equal("doc @ aaa://path/to/doc1");
                expect(await substore.read('../path/to/doc1')).to.equal("doc @ aaa://path/to/doc1");

                var substore = uriStore.createSubStore('/path');
                expect(await substore.read('to/doc1')).to.equal("doc @ home://path/to/doc1");
                expect(await substore.read('/to/doc1')).to.equal("doc @ home://path/to/doc1");
                expect(await substore.read('../to/doc1')).to.equal("doc @ home://path/to/doc1");
            });
        });

        describe("substore.createSubStore(path)", () => {

            it("should delegate to store.createSubStore(rootPath+path)", async () => {
                var uriStore = new URIStore({
                    "aaa": new MemoryStore({
                        "/path/to/doc1" : "doc @ aaa://path/to/doc1",
                        "/path/to/doc2" : "doc @ aaa://path/to/doc2",
                        "/path/to/doc3" : "doc @ aaa://path/to/doc3",
                    }),
                    "bbb": new MemoryStore({
                        "/path/to/doc1" : "doc @ bbb://path/to/doc1",
                        "/path/to/doc2" : "doc @ bbb://path/to/doc2",
                        "/path/to/doc3" : "doc @ bbb://path/to/doc3",
                    }),
                    "ccc": new MemoryStore({
                        "/path/to/doc1" : "doc @ ccc://path/to/doc1",
                        "/path/to/doc2" : "doc @ ccc://path/to/doc2",
                        "/path/to/doc3" : "doc @ ccc://path/to/doc3",
                    }),
                    "home": new MemoryStore({
                        "/path/to/doc1" : "doc @ home://path/to/doc1",
                        "/path/to/doc2" : "doc @ home://path/to/doc2",
                        "/path/to/doc3" : "doc @ home://path/to/doc3",
                    }),
                });
                var substore = uriStore.createSubStore('aaa://path/');
                var sub_substore = substore.createSubStore("to")
                expect(await sub_substore.read('doc1')).to.equal("doc @ aaa://path/to/doc1");
                expect(await sub_substore.read('/doc1')).to.equal("doc @ aaa://path/to/doc1");
                expect(await sub_substore.read('../doc1')).to.equal("doc @ aaa://path/to/doc1");
            });
        });
    });
});
