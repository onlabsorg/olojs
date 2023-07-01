var expect = require("chai").expect;
var swan = require('../lib/expression');
var document = require("../lib/document");
var Store = require('../lib/store');
var MemoryStore = require('../lib/memory-store');
var Router = require('../lib/router');



describe("Router", () => {

    describe("iterator = router._iterRoutes()", () => {

        it("should return an iterator yielding all the [routeId, store] pairs in analphabetic order", () => {
            var routes = {
                "path/to": new MemoryStore(),
                "/path/to/store2": new MemoryStore(),
                "/": new MemoryStore(),
            }
            var router = new Router(routes);
            expect(router._iterRoutes()[Symbol.iterator]).to.be.a("function");
            expect(Array.from(router._iterRoutes())).to.deep.equal([
                ['/path/to/store2/', routes["/path/to/store2"]],
                ['/path/to/', routes["path/to"]],
                ['/', routes["/"]],
            ]);
        });
    });

    describe("[store, subPath] = router._match(path)", () => {

        it("should return store mounted at the route matching the path and the subPath relative to that route", () => {
            var routes = {
                "path/to": new MemoryStore(),
                "/path/to/store2": new MemoryStore(),
                "/": new MemoryStore()
            }
            var router = new Router(routes);
            expect(router._match('/path/to/')).to.deep.equal([routes['path/to'], "/"]);
            expect(router._match('/path/to/doc')).to.deep.equal([routes['path/to'], "/doc"]);
            expect(router._match('/path/to/store2/path/to/doc')).to.deep.equal([routes['/path/to/store2'], "/path/to/doc"]);
            expect(router._match('/path/to/store2/')).to.deep.equal([routes['/path/to/store2'], "/"]);
            expect(router._match('/path_to/doc')).to.deep.equal([routes['/'], "/path_to/doc"]);
        });

        it("should return [null, path] if no match is found", () => {
            var routes = {
                "/path/to/s1": new MemoryStore(),
                "/path/to/s2": new MemoryStore(),
            }
            var router = new Router(routes);
            expect(router._match('/path/to/s3/doc')).to.deep.equal([null, "/path/to/s3/doc"]);
        });
    });

    describe(`source = router.read(path)`, () => {

        it("should delegate to the matching mounted store", async () => {
            var router = new Router({
                "path/to": new MemoryStore({
                    "/"    : "doc @ store1:/",
                    "doc"  : "doc @ store1:/path/to/doc"
                }),
                "/path/to/store2": new MemoryStore({
                    "/"             : "doc @ store2:/",
                    "/path/to/doc"  : "doc @ store2:/path/to/doc"
                }),
                "/": new MemoryStore({
                    "/path/to/doc"  : "doc @ root:/path/to/doc",
                    "/path_to/doc"  : "doc @ root:/path_to/doc"
                }),
            });
            expect(await router.read('/path/to/')).to.equal("doc @ store1:/");
            expect(await router.read('/path/to/doc')).to.equal("doc @ store1:/path/to/doc");
            expect(await router.read('/path/to/store2/path/to/doc')).to.equal("doc @ store2:/path/to/doc");
            expect(await router.read('/path/to/store2/')).to.equal("doc @ store2:/");
            expect(await router.read('/path_to/doc')).to.equal("doc @ root:/path_to/doc");
        });

        it("should return an empty document if no match is found", async () => {
            var router = new Router({
                "path/to": new MemoryStore({
                    "/"    : "doc @ store1:/",
                    "doc"  : "doc @ store1:/path/to/doc"
                }),
                "/path/to/store2": new MemoryStore({
                    "/"             : "doc @ store2:/",
                    "/path/to/doc"  : "doc @ store2:/path/to/doc"
                }),
            });
            expect(await router.read('/path_to/doc')).to.equal("");
        })
    });
    
    describe(`doc = store.loadDocument(path, source)`, () => {
        
        describe('doc.path', () => {
            
            it("should contain the normalized path of the documet in the store", async () => {
                var router = new Router({
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

                var doc = await router.loadDocument('path/to/../to/doc');
                expect(doc.path).to.equal('/path/to/doc');
            });
        });
        
        describe('doc.source', () => {
            
            it("should contain the stringified source passed to the constructor", async () => {
                var router = new Router({
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

                var doc = await router.loadDocument('/path/to/doc1');
                expect(doc.source).to.equal('doc @ /path/to/doc1');
            });            
        });
        
        describe('docns = doc.evaluate(context)', () => {
            
            it("should contained the compiled source function", async () => {
                var router = new Router({
                    "path/to": new MemoryStore({
                        "/"    : "doc @ /path/to/",
                        "doc"  : '2*x=<% y:2*x %>',
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

                const doc = await router.loadDocument('/path/to/doc');
                expect(doc.evaluate).to.be.a("function");
                const context = document.createContext({x:10});
                const docns = await doc.evaluate(context);
                expect(docns.y).to.equal(20);
                expect(docns.__text__).to.equal('2*x=20');
            });            
        });
        
        describe('context = doc.createContext(...presets)', () => {
            
            it("should return a valid document context", async () => {
                var router = new Router({
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

                const doc = await router.loadDocument('/path/to/doc1');
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
                var router = new Router({
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

                var doc = await router.loadDocument('/path/to/doc1');
                var context = doc.createContext();
                expect(context.__doc__).to.equal(doc);
            });
            
            it("should contain the document store path as `__store__`", async () => {
                var router = new Router({
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

                var doc = await router.loadDocument('/path/to/doc1');
                var context = doc.createContext();
                expect(context.__store__).to.equal(router);

                var doc = await router.loadDocument('/path/to/');
                var context = doc.createContext();
                expect(context.__store__).to.equal(router);
            });
            
            it("should contain the passed namespaces properties", async () => {
                var router = new Router({
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

                const doc = await router.loadDocument('/path/to/doc1');
                const context = doc.createContext({x:10, y:20}, {y:30, z:40});
                expect(context.x).to.equal(10);
                expect(context.y).to.equal(30);
                expect(context.z).to.equal(40);
            });            
            
            describe('docns = await context.import(path)', () => {
                
                it("should be a function", async () => {
                    var router = new Router({
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

                    const doc = await router.loadDocument('/path/to/doc1');
                    const context = doc.createContext();
                    expect(context.import).to.be.a("function");
                });
                
                it("should return the namespace of the passed document", async () => {
                    var router = new Router({
                        "path/to": new MemoryStore({
                            "/"    : "doc @ /path/to/",
                            "doc1" : "<% doc2 = import '/path_to/doc4' %>doc @ <% __doc__.path %>",
                        }),
                        "/path/to/store2": new MemoryStore({
                            "/"             : "doc @ /path/to/store2/",
                            "/path/to/doc2" : "doc @ /path/to/store2/path/to/doc2"
                        }),
                        "/": new MemoryStore({
                            "/path/to/doc3"  : "doc @ <% __doc__.path %>",
                            "/path/to/dir/"  : "doc @ <% __doc__.path %>",
                            "/path_to/doc4"  : "doc @ <% __doc__.path %>"
                        }),
                    });

                    var doc = await router.loadDocument('/path/to/doc');
                    const doc1ns = await doc.createContext().import('/path/to/doc1');
                    expect(doc1ns.__text__).to.equal("doc @ /path/to/doc1");
                    expect(doc1ns.doc2.__text__).to.equal('doc @ /path_to/doc4')
                });

                it("should resolve paths relative to the document path", async () => {
                    var router = new Router({
                        "path/to": new MemoryStore({
                            "/"    : "doc @ /path/to/",
                            "doc1" : "<% doc2 = import './store2/doc2' %>doc @ <% __doc__.path %>"
                        }),
                        "/path/to/store2": new MemoryStore({
                            "/"     : "doc @ <% __doc__.path %>",
                            "/doc2" : "doc @ <% __doc__.path %>"
                        }),
                    });

                    var doc = await router.loadDocument('/path/to/doc');
                    const doc1ns = await doc.createContext().import('/path/to/doc1');
                    expect(doc1ns.__text__).to.equal("doc @ /path/to/doc1");
                    expect(doc1ns.doc2.__text__).to.equal('doc @ /path/to/store2/doc2');
                });

                it("should cache the documents", async () => {
                    var router = new Router({
                        "path/to": new MemoryStore({
                            "doc1": "2*x=<% y:2*x %>",
                            "doc2": "<% docnum = 2, doc3 = import '/path/to/doc3' %>doc2",
                            "doc3": "<% docnum = 3 %>doc3",
                            "doc4": "<% import 'doc3', import './doc3', import '/path/to/doc2'%>doc4"
                        }),
                    });

                    const xstore = Object.create(router);
                    xstore.loaded = [];
                    xstore.read = function (path) {
                        xstore.loaded.push(router.normalizePath(path))
                        return router.read(path);
                    }

                    const doc4 = await xstore.loadDocument('/path/to/doc4');
                    const doc4ns = await doc4.evaluate(doc4.createContext());
                    expect(xstore.loaded).to.deep.equal(['/path/to/doc4', '/path/to/doc3', '/path/to/doc2'])
                });
            });
        });
    }); 
    
    describe(`doc = await store.evaluateDocument(path, ...presets)`, () => {
        
        it("should load and evaluate a document from the store", async () => {
            var router = new Router({
                "path/to": new MemoryStore({
                    "/"    : "doc @ /path/to/",
                    "doc1" : "doc @ <% __doc__.path %><% y = 2*x %>"
                }),
            });

            const docns = await router.evaluateDocument('/path/to/doc1', {x:10});
            expect(docns.__text__).to.equal('doc @ /path/to/doc1');
            expect(docns.x).to.equal(10);
            expect(docns.y).to.equal(20);
        });
    });

    describe("substore = router.createSubStore(rootPath)", () => {

        it("should be a Store object", () => {
            var router = new Router({
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
            });
            const substore = router.createSubStore('/aaa/path/');
            expect(substore).to.be.instanceof(Store);
        });

        describe("substore.read(path)", () => {

            it("should delegate to store.read(rootPath+path)", async () => {
                var router = new Router({
                    "aaa": new MemoryStore({
                        "/path/to/doc1" : "doc @ /aaa/path/to/doc1",
                        "/path/to/doc2" : "doc @ /aaa/path/to/doc2",
                        "/path/to/doc3" : "doc @ /aaa/path/to/doc3",
                    }),
                    "bbb": new MemoryStore({
                        "/path/to/doc1" : "doc @ /bbb/path/to/doc1",
                        "/path/to/doc2" : "doc @ /bbb/path/to/doc2",
                        "/path/to/doc3" : "doc @ /bbb/path/to/doc3",
                    }),
                    "ccc": new MemoryStore({
                        "/path/to/doc1" : "doc @ /ccc/path/to/doc1",
                        "/path/to/doc2" : "doc @ /ccc/path/to/doc2",
                        "/path/to/doc3" : "doc @ /ccc/path/to/doc3",
                    }),
                });

                var substore = router.createSubStore('/aaa/path/');
                expect(await substore.read('to/doc1')).to.equal("doc @ /aaa/path/to/doc1");
                expect(await substore.read('/to/doc1')).to.equal("doc @ /aaa/path/to/doc1");
                expect(await substore.read('../to/doc1')).to.equal("doc @ /aaa/path/to/doc1");

                var substore = router.createSubStore('/aaa/path');
                expect(await substore.read('to/doc1')).to.equal("doc @ /aaa/path/to/doc1");
                expect(await substore.read('/to/doc1')).to.equal("doc @ /aaa/path/to/doc1");
                expect(await substore.read('../to/doc1')).to.equal("doc @ /aaa/path/to/doc1");

                var substore = router.createSubStore('/aaa');
                expect(await substore.read('/path/to/doc1')).to.equal("doc @ /aaa/path/to/doc1");
                expect(await substore.read('path/to/doc1')).to.equal("doc @ /aaa/path/to/doc1");
                expect(await substore.read('../path/to/doc1')).to.equal("doc @ /aaa/path/to/doc1");
            });
        });

        describe("substore.createSubStore(path)", () => {

            it("should delegate to store.createSubStore(rootPath+path)", async () => {
                var router = new Router({
                    "aaa": new MemoryStore({
                        "/path/to/doc1" : "doc @ /aaa/path/to/doc1",
                        "/path/to/doc2" : "doc @ /aaa/path/to/doc2",
                        "/path/to/doc3" : "doc @ /aaa/path/to/doc3",
                    }),
                    "bbb": new MemoryStore({
                        "/path/to/doc1" : "doc @ /bbb/path/to/doc1",
                        "/path/to/doc2" : "doc @ /bbb/path/to/doc2",
                        "/path/to/doc3" : "doc @ /bbb/path/to/doc3",
                    }),
                    "ccc": new MemoryStore({
                        "/path/to/doc1" : "doc @ /ccc/path/to/doc1",
                        "/path/to/doc2" : "doc @ /ccc/path/to/doc2",
                        "/path/to/doc3" : "doc @ /ccc/path/to/doc3",
                    }),
                });
                var substore = router.createSubStore('/aaa/path/');
                var sub_substore = substore.createSubStore("to")
                expect(await sub_substore.read('doc1')).to.equal("doc @ /aaa/path/to/doc1");
                expect(await sub_substore.read('/doc1')).to.equal("doc @ /aaa/path/to/doc1");
                expect(await sub_substore.read('../doc1')).to.equal("doc @ /aaa/path/to/doc1");
            });
        });
    });
});
