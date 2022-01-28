var expect = require("chai").expect;
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
                "/": new MemoryStore()
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

    describe("router.mount(path, store)", () => {
        
        it("should add a new store to the router", () => {
            var routes = {
                "path/to": new MemoryStore(),
                "/path/to/store2": new MemoryStore(),
                "/": new MemoryStore()
            }
            var router = new Router(routes);
            expect(Array.from(router._iterRoutes())).to.deep.equal([
                ['/path/to/store2/', routes["/path/to/store2"]],
                ['/path/to/', routes["path/to"]],
                ['/', routes["/"]],
            ]);

            var store3 = new MemoryStore();
            router.mount('/path/to/new/store', store3);
            expect(Array.from(router._iterRoutes())).to.deep.equal([
                ['/path/to/store2/', routes["/path/to/store2"]],
                ['/path/to/new/store/', store3],
                ['/path/to/', routes["path/to"]],
                ['/', routes["/"]],
            ]);
        });

        it("should fail silently is store is not a valid store", () => {
            var routes = {
                "path/to": new MemoryStore(),
                "/path/to/store2": new MemoryStore(),
                "/": new MemoryStore()
            }
            var router = new Router(routes);
            expect(Array.from(router._iterRoutes())).to.deep.equal([
                ['/path/to/store2/', routes["/path/to/store2"]],
                ['/path/to/', routes["path/to"]],
                ['/', routes["/"]],
            ]);

            router.mount('/path/to/new/store', {});
            expect(Array.from(router._iterRoutes())).to.deep.equal([
                ['/path/to/store2/', routes["/path/to/store2"]],
                ['/path/to/', routes["path/to"]],
                ['/', routes["/"]],
            ]);
        });
    });

    describe("router.unmount(routeId)", () => {
        
        it("should remove the store mapped to the given Id from the router", () => {
            var routes = {
                "path/to": new MemoryStore(),
                "/path/to/store2": new MemoryStore(),
                "/": new MemoryStore()
            }
            var router = new Router(routes);
            expect(Array.from(router._iterRoutes())).to.deep.equal([
                ['/path/to/store2/', routes["/path/to/store2"]],
                ['/path/to/', routes["path/to"]],
                ['/', routes["/"]],
            ]);

            router.unmount('path/to/store2');
            expect(Array.from(router._iterRoutes())).to.deep.equal([
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

    describe(`entries = router.list(id)`, () => {

        it("should delegate to the matching mounted store", async () => {
            var memStore = new MemoryStore({
                "/path/to/doc1": "...",
                "/path/to/doc2": "...",
                "/path/to/dir1/": "...",
                "/path/to/dir1/doc1": "...",
                "/path/to/dir1/doc2": "...",
                "/path/to/dir2/": "...",
            });
            var router = new Router({
                '/stores/mem': memStore
            })

            expect((await router.list("/stores/mem/path/to/")).sort()).to.deep.equal(['dir1/', 'dir2/', 'doc1', 'doc2']);
            expect(await router.list("/stores/mem/path/")).to.deep.equal(['to/']);
            expect(await router.list("/stores/mem/")).to.deep.equal(['path/']);
            expect(await router.list("/stores/mem")).to.deep.equal(['path/']);
        });

        it("should return an empty array if no match is found", async () => {
            var memStore = new MemoryStore({
                "/path/to/doc1": "...",
                "/path/to/doc2": "...",
                "/path/to/dir1/": "...",
                "/path/to/dir1/doc1": "...",
                "/path/to/dir1/doc2": "...",
                "/path/to/dir2/": "...",
            });
            var router = new Router({
                '/stores/mem': memStore
            })
            expect(await router.list("/path/to/dir")).to.deep.equal([]);
        });

        it("should include mounted routes in the entries list", async () => {
            var router = new Router({
                '/store': new MemoryStore({
                    "/path/to/doc1": "...",
                    "/path/to/doc2": "...",
                }),
                '/store/path': new MemoryStore({
                    "/to/doc1": "...",
                    "/to/doc3": "...",
                    "/to/dir1/doc": "...",
                }),
                '/': new MemoryStore({
                    "/store/path/to/doc1": "...",
                    "/store/path/to/doc4": "...",
                    "/doc5": "...",
                }),
                '/store/path/to/dir2/': new MemoryStore(),
                '/store/path/to/dir2/dir/': new MemoryStore(),
                '/path/to/dir3': new MemoryStore(),
            })
            expect((await router.list("/store/path/to/")).sort()).to.deep.equal(['dir1/', 'dir2/', 'doc1', 'doc2', 'doc3', 'doc4']);
            expect((await router.list("/")).sort()).to.deep.equal(['doc5', 'path/', 'store/']);
        });
    });

    describe(`source = router.write(id, source)`, () => {

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

    describe(`source = router.delete(id)`, () => {

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

    describe(`source = router.deleteAll(id)`, () => {

        it("should delegate to the matching mounted store", async () => {
            var store1 = new MemoryStore();
            var store2 = new MemoryStore();
            var router = new Router({
                s1: store1,
                s2: store2,
            });

            var called = "";
            store1.deleteAll = path => {
                called = `store1.deleteAll ${path}`;
            }

            await router.deleteAll('/s1/path/to/dir');

            expect(called).to.equal("store1.deleteAll /path/to/dir");
        });

        it("should throw an error if no match is found", async () => {
            var router = new Router();
            try {
                await router.deleteAll('/s1/path/to/doc');
                throw new Error("Id did not throw");
            } catch (error) {
                expect(error).to.be.instanceof(Router.WriteOperationNotAllowedError);
                expect(error.message).to.equal('Operation not allowed: WRITE /s1/path/to/doc')
            }
        })
    });
    
    describe(`context = router.createContext(path, presets)`, () => {
        
        it("should delegate the context creation to the first matching store", () => {
            const store1 = new MemoryStore();
            const store2 = Object.create(store1);
            store2.createContext = (path, presets) => {
                const context = store1.createContext(path, presets);
                context.storeName = "store2";
                return context;
            }
            var router = new Router({
                '/store1': store1,
                '/store2': store2
            });
            
            const ctx = router.createContext('/store2/path/to/doc', {x:10});
            expect(ctx.x).to.equal(10);
            expect(ctx.storeName).to.equal("store2");
            expect(ctx.__path__).to.equal('/store2/path/to/doc');
        });

        it("should delegate to the parent store if no match is found", () => {
            var router = new Router({
                '/store1': new MemoryStore(),
                '/store2': new MemoryStore()
            });
            
            const ctx = router.createContext('/store3/path/to/doc', {x:10});
            expect(ctx.x).to.equal(10);
            expect(ctx.storeName).to.be.undefined;
            expect(ctx.__path__).to.equal('/store3/path/to/doc');
        });
        
        describe("context.import function", () => {
            
            it("should resolve paths relative to the router, not to the context store", async () => {
                const router = new Router({
                    '/store1': new MemoryStore({
                        '/path/to/doc1': "<% docnum = 1 %>",
                        '/path/to/doc2': "<% docnum = 2 %>",
                        '/path/to/doc3': "<% docnum = 3 %>",
                    })
                });
                
                const ctx1 = await router.createContext('/store1/path/to/doc1');
                
                const doc2_ns = await ctx1.import('doc2');
                expect(doc2_ns.docnum).to.equal(2);
                expect(doc2_ns.__path__).to.equal('/store1/path/to/doc2')

                const doc3_ns = await ctx1.import('/store1/path/to/doc3');
                expect(doc3_ns.docnum).to.equal(3);                
                expect(doc3_ns.__path__).to.equal('/store1/path/to/doc3')
            });
        });
    });
});
