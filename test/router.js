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

        it("should resolve .uri:/path/to/doc' paths to '/.uri/scheme/path/to/doc'", async () => {
            var router = new Router({
                "ppP.1:/host/": new MemoryStore({
                    "/"    : "doc @ ppp.1:/host/",
                    "doc"  : "doc @ ppp.1:/host/doc"
                }),
                "/.uri/qqq/": new MemoryStore({
                    "/"    : "doc @ qqq:/",
                    "doc"  : "doc @ qqq:/doc"
                })
            });
            expect(await router.read('pPp.1:/host/')).to.equal("doc @ ppp.1:/host/");
            expect(await router.read('/.uri/ppp.1/host/')).to.equal("doc @ ppp.1:/host/");
            expect(await router.read('PPP.1:/host/doc')).to.equal("doc @ ppp.1:/host/doc");
            expect(await router.read('/.uri/ppp.1/host/doc')).to.equal("doc @ ppp.1:/host/doc");
            expect(await router.read('qqq://')).to.equal("doc @ qqq:/");
            expect(await router.read('/.uri/qqq/')).to.equal("doc @ qqq:/");
            expect(await router.read('qqq://doc')).to.equal("doc @ qqq:/doc");
            expect(await router.read('/.uri/qqq/doc')).to.equal("doc @ qqq:/doc");
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
    
    describe(`items = await router.list(path)`, () => {
        
        it("should return the list of documents and directories contained in the given directory", async () => {
            var router = new Router({
                "path/to": new MemoryStore({
                    "/"    : "...",
                    "doc1" : "..."
                }),
                "/path/to/store2": new MemoryStore({
                    "/"             : "...",
                    "/path/to/doc2" : "..."
                }),
                "/": new MemoryStore({
                    "/path/to/doc3"  : "...",
                    "/path/to/dir/"  : "...",
                    "/path_to/doc4"  : "..."
                }),
            });
                        
            var items = await router.list('/path/to/');
            expect(items.sort()).to.deep.equal(['', 'dir/', 'doc1', 'doc3', 'store2/']);
        });

        it("should resolve .uri:/path/to/doc' paths to '/.uri/scheme/path/to/doc'", async () => {
            var router = new Router({
                "ppp:/path/to": new MemoryStore({
                    "/"    : "...",
                    "doc1" : "..."
                }),
                "ppp:/path/to/store2": new MemoryStore({
                    "/"             : "...",
                    "/path/to/doc2" : "..."
                }),
                "ppp:/": new MemoryStore({
                    "/path/to/doc3"  : "...",
                    "/path/to/dir/"  : "...",
                    "/path_to/doc4"  : "..."
                }),
            });

            var items1 = await router.list('ppp:/path/to/');
            expect(items1.sort()).to.deep.equal(['', 'dir/', 'doc1', 'doc3', 'store2/']);

            var items2 = await router.list('/.uri/ppp/path/to/');
            expect(items2.sort()).to.deep.equal(['', 'dir/', 'doc1', 'doc3', 'store2/']);
        });

        it("should return an empty array if the directory doesn't exist", async () => {
            var router = new Router({
                "path/to": new MemoryStore({
                    "/"    : "...",
                    "doc1" : "..."
                }),
                "/path/to/store2": new MemoryStore({
                    "/"             : "...",
                    "/path/to/doc2" : "..."
                }),
                "/": new MemoryStore({
                    "/path/to/doc3"  : "...",
                    "/path/to/dir/"  : "...",
                    "/path_to/doc4"  : "..."
                }),
            });

            var items = await router.list('/path/to/non-existing/dir/');
            expect(items.sort()).to.deep.equal([]);
        });
    });    

    describe(`router.write(path, source)`, () => {

        it("should delegate to the matching mounted store", async () => {
            var store1 = new MemoryStore();
            var store2 = new MemoryStore();
            var router = new Router({
                s1: store1,
                s2: store2,
            });
            await router.write('/s1/path/to/doc', "doc @ store1");
            await router.write('s2/path/to/doc', "doc @ store2");
            expect(await store1.read('/path/to/doc')).to.equal("doc @ store1");
            expect(await store2.read('/path/to/doc')).to.equal("doc @ store2");
        });

        it("should resolve .uri:/path/to/doc' paths to '/.uri/scheme/path/to/doc'", async () => {
            var store1 = new MemoryStore();
            var store2 = new MemoryStore();
            var router = new Router({
                's1:/': store1,
                's2:/': store2,
            });
            await router.write('s1:/path/to/doc', "doc @ store1");
            await router.write('/.uri/s2/path/to/doc', "doc @ store2");
            expect(await store1.read('/path/to/doc')).to.equal("doc @ store1");
            expect(await store2.read('/path/to/doc')).to.equal("doc @ store2");
        });

        it("should throw an error if no match is found", async () => {
            var router = new Router();
            try {
                await router.write('/s1/path/to/doc', "...");
                throw new Error("Id did not throw");
            } catch (error) {
                expect(error).to.be.instanceof(Router.WriteOperationNotAllowedError);
                expect(error.message).to.equal('Operation not allowed: WRITE /s1/path/to/doc')
            }
        });
    });

    describe(`router.delete(path)`, () => {

        it("should delegate to the matching mounted store", async () => {
            var store1 = new MemoryStore();
            var store2 = new MemoryStore();
            var router = new Router({
                s1: store1,
                s2: store2,
            });

            await store1.write('/path/to/doc', "doc @ store1");
            await router.delete('/s1/path/to/doc');
            expect(store1.read('/path/to/doc')).to.equal("");
        });

        it("should resolve .uri:/path/to/doc' paths to '/.uri/scheme/path/to/doc'", async () => {
            var store1 = new MemoryStore();
            var store2 = new MemoryStore();
            var router = new Router({
                's1:/': store1,
                's2:/': store2,
            });

            await store1.write('/path/to/doc', "doc @ store1");
            await router.delete('s1:/path/to/doc');
            expect(store1.read('/path/to/doc')).to.equal("");

            await store2.write('/path/to/doc', "doc @ store2");
            await router.delete('/.uri/s2/path/to/doc');
            expect(store2.read('/path/to/doc')).to.equal("");
        });

        it("should throw an error if no match is found", async () => {
            var router = new Router();
            try {
                await router.delete('/s1/path/to/doc');
                throw new Error("Id did not throw");
            } catch (error) {
                expect(error).to.be.instanceof(Router.WriteOperationNotAllowedError);
                expect(error.message).to.equal('Operation not allowed: WRITE /s1/path/to/doc')
            }
        })
    });
    
    describe(`doc = store.createDocument(path, source)`, () => {
        
        describe('doc.store', () => {
            
            it("should contain a reference to the store that created the document", () => {
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
                                            
                const doc = router.createDocument('/path/to/doc');
                expect(doc.store).to.equal(router);
            });
        });
        
        describe('doc.path', () => {
            
            it("should contain the normalized path of the documet in the store", () => {
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

                var doc = router.createDocument('path/to/../to/doc');
                expect(doc.path).to.equal('/path/to/doc');
            });
        });
        
        describe('doc.source', () => {
            
            it("should contain the stringified source passed to the constructor", () => {
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

                var doc = router.createDocument('/path/to/doc', {toString: () => 'doc @ /path/to/doc'});
                expect(doc.source).to.equal('doc @ /path/to/doc');
            });            
            
            it("should default to an empty string if the source parameter is omitted", () => {
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

                var doc = router.createDocument('/path/to/doc');
                expect(doc.source).to.equal('');
            });            
        });
        
        describe('docns = doc.evaluate(context)', () => {
            
            it("should contained the compiled source function", async () => {
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

                const doc = router.createDocument('/path/to/doc', '2*x=<% y:2*x %>');
                expect(doc.evaluate).to.be.a("function");
                const context = document.createContext({x:10});
                const docns = await doc.evaluate(context);
                expect(docns.y).to.equal(20);
                expect(docns.__text__).to.equal('2*x=20');
            });            
        });
        
        describe('context = doc.createContext(...presets)', () => {
            
            it("should return a valid document context", () => {
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

                const doc = router.createDocument('/path/to/doc1');
                const context = doc.createContext();
                const document_context = document.createContext();
                for (let key in document_context) {
                    if (key !== "this") {
                        expect(context[key]).to.equal(document_context[key]);
                    }
                }
                expect(swan.types.unwrap(context.this)).to.equal(context);
            });
            
            it("should contain the document path as `__path__`", () => {
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

                var doc = router.createDocument('/path/to/doc1');
                var context = doc.createContext();
                expect(context.__path__).to.equal('/path/to/doc1');
            });
            
            it("should contain the document parent path as `__dirpath__`", () => {
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

                var doc = router.createDocument('/path/to/doc1');
                var context = doc.createContext();
                expect(context.__dirpath__).to.equal('/path/to/');

                var doc = router.createDocument('/path/to/');
                var context = doc.createContext();
                expect(context.__dirpath__).to.equal('/path/to/');
            });
            
            it("should contain the passed namespaces properties", () => {
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

                const doc = router.createDocument('/path/to/doc1');
                const context = doc.createContext({x:10, y:20}, {y:30, z:40});
                expect(context.x).to.equal(10);
                expect(context.y).to.equal(30);
                expect(context.z).to.equal(40);
            });            
            
            describe('docns = await context.import(path)', () => {
                
                it("should be a function", () => {
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

                    const doc = router.createDocument('/path/to/doc1');
                    const context = doc.createContext();
                    expect(context.import).to.be.a("function");
                });
                
                it("should return the namespace of the passed document", async () => {
                    var router = new Router({
                        "path/to": new MemoryStore({
                            "/"    : "doc @ /path/to/",
                            "doc1" : "<% doc2 = import '/path_to/doc4' %>doc @ <% __path__ %>",
                        }),
                        "/path/to/store2": new MemoryStore({
                            "/"             : "doc @ /path/to/store2/",
                            "/path/to/doc2" : "doc @ /path/to/store2/path/to/doc2"
                        }),
                        "/": new MemoryStore({
                            "/path/to/doc3"  : "doc @ <% __path__ %>",
                            "/path/to/dir/"  : "doc @ <% __path__ %>",
                            "/path_to/doc4"  : "doc @ <% __path__ %>"
                        }),
                    });

                    var doc = router.createDocument('/path/to/doc');
                    const doc1ns = await doc.createContext().import('/path/to/doc1');
                    expect(doc1ns.__text__).to.equal("doc @ /path/to/doc1");
                    expect(doc1ns.doc2.__text__).to.equal('doc @ /path_to/doc4')
                });

                it("should resolve paths relative to the document path", async () => {
                    var router = new Router({
                        "path/to": new MemoryStore({
                            "/"    : "doc @ /path/to/",
                            "doc1" : "<% doc2 = import './store2/doc2' %>doc @ <% __path__ %>"
                        }),
                        "/path/to/store2": new MemoryStore({
                            "/"     : "doc @ <% __path__ %>",
                            "/doc2" : "doc @ <% __path__ %>"
                        }),
                    });

                    var doc = router.createDocument('/path/to/doc');
                    const doc1ns = await doc.createContext().import('/path/to/doc1');
                    expect(doc1ns.__text__).to.equal("doc @ /path/to/doc1");
                    expect(doc1ns.doc2.__text__).to.equal('doc @ /path/to/store2/doc2');
                });

                it("should cache the documents", async () => {
                    var router = new Router({
                        "path/to": new MemoryStore({
                            "/"    : "doc @ /path/to/",
                            "doc1" : "doc @ <% __path__ %><% doc2 = import 'doc2' %>",
                            "doc2" : "doc @ <% __path__ %>",
                        }),
                    });

                    const xstore = Object.create(router);
                    xstore.count = 0;
                    xstore.read = path => {
                        xstore.count += 1;
                        return router.read(path);
                    }                        
                    var doc = xstore.createDocument('/path/to/doc');

                    var doc2ns = await doc.createContext().import('/path/to/doc2');
                    expect(xstore.count).to.equal(1);
                    expect(doc2ns.__text__).to.equal("doc @ /path/to/doc2");

                    var doc2ns = await doc.createContext().import('/path/to/doc2');
                    expect(xstore.count).to.equal(1);
                    expect(doc2ns.__text__).to.equal("doc @ /path/to/doc2");
                    
                    var doc1ns = await doc.createContext().import('/path/to/doc1');
                    expect(xstore.count).to.equal(2);
                    expect(doc1ns.__text__).to.equal("doc @ /path/to/doc1");
                    expect(doc1ns.doc2.__text__).to.equal('doc @ /path/to/doc2')
                });
            });
        });
    }); 
    
    describe(`doc = await store.loadDocument(path)`, () => {
        
        it("shoudl return a document object containing the source mapped to the given path", async () => {
            var router = new Router({
                "path/to": new MemoryStore({
                    "/"    : "doc @ /path/to/",
                    "doc1" : "doc @ /path/to/doc1"
                }),
            });

            const doc = await router.loadDocument('/path/to/doc1');
            expect(doc).to.be.instanceof(router.createDocument('').constructor);
            expect(doc.store).to.equal(router);
            expect(doc.path).to.equal('/path/to/doc1');
            expect(doc.source).to.equal('doc @ /path/to/doc1');
        });
    });
    
    describe(`doc = await store.loadDocument('/path/to/dir/.info')`, () => {
        
        it("shoudl return a document defining the 'item' name, containing the list of children of `/path/to/dir/`", async () => {
            var router = new Router({
                "path/to": new MemoryStore({
                    "/"    : "...",
                    "doc1" : "...",
                    "doc2" : "...",
                }),
                "path/to/dir": new MemoryStore({
                    "doc3" : "...",
                    "doc4" : "...",
                }),
            });

            const doc = await router.loadDocument('/path/to/.info');
            expect(doc).to.be.instanceof(router.createDocument('').constructor);
            expect(doc.source).to.equal("<% items = ['', 'dir/', 'doc1', 'doc2'] %>");
        });
    });
    
    describe(`doc = await store.evaluateDocument(path, ...presets)`, () => {
        
        it("should load and evaluate a document from the store", async () => {
            var router = new Router({
                "path/to": new MemoryStore({
                    "/"    : "doc @ /path/to/",
                    "doc1" : "doc @ <% __path__ %><% y = 2*x %>"
                }),
            });

            const docns = await router.evaluateDocument('/path/to/doc1', {x:10});
            expect(docns.__text__).to.equal('doc @ /path/to/doc1');
            expect(docns.x).to.equal(10);
            expect(docns.y).to.equal(20);
        });
    });    
    
    describe(`doc = await store.evaluateDocument('/path/to/dir/.info')`, () => {
        
        it("shoudl return a namespace containing the 'item' name, containing the list of children of `/path/to/dir/`", async () => {
            var router = new Router({
                "path/to": new MemoryStore({
                    "/"    : "...",
                    "doc1" : "...",
                    "doc2" : "...",
                }),
                "path/to/dir": new MemoryStore({
                    "doc3" : "...",
                    "doc4" : "...",
                }),
            });

            const docns = await router.evaluateDocument('/path/to/.info');
            expect(docns.items).to.deep.equal(['', 'dir/', 'doc1', 'doc2']);
        });
    });        
});
