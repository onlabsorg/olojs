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

        it("should treat `scheme:/path/to/doc` routes as shortcut for `/.protocolos/scheme/path/to/doc`", async () => {
            var routes = {
                "http:/": new MemoryStore(),
                "/.schemes/https": new MemoryStore(),
                "/": new MemoryStore()
            }
            var router = new Router(routes);
            expect(router._match('https:/path/to/doc')).to.deep.equal([routes['/.schemes/https'], "/path/to/doc"]);
            expect(router._match('/.schemes/https/path/to/doc')).to.deep.equal([routes['/.schemes/https'], "/path/to/doc"]);
            expect(router._match('http:/path/to/doc')).to.deep.equal([routes['http:/'], "/path/to/doc"]);
            expect(router._match('/.schemes/http/path/to/doc')).to.deep.equal([routes['http:/'], "/path/to/doc"]);
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

    describe.skip("evaluate = router.parse(source)", () => {

        it("should return a function", () => {
            var store1 = new MemoryStore();
            var store2 = new MemoryStore();
            var router = new Router({
                s1: store1,
                s2: store2,
            });
            const evaluate = router.parse(`<%a=10%><%b=a+10%>a + b = <%a+b%>`);
            expect(evaluate).to.be.a("function");
        });

        describe("(await evaluate(context)).data", () => {

            it("should be an object", async () => {
                var store1 = new MemoryStore();
                var store2 = new MemoryStore();
                var router = new Router({
                    s1: store1,
                    s2: store2,
                });
                const evaluate = router.parse("");
                const context = document.createContext();
                const {data} = await evaluate(context);
                expect(data).to.be.an("object");
            });

            it("should contain all the names defined in the swan expressions", async () => {
                var store1 = new MemoryStore();
                var store2 = new MemoryStore();
                var router = new Router({
                    s1: store1,
                    s2: store2,
                });
                const evaluate = router.parse(`<%a=10%><%b=a+10%>`);
                const context = document.createContext({});
                const {data} = await evaluate(context);
                expect(data.a).to.equal(10);
                expect(data.b).to.equal(20);
            });
        });

        describe("(await evaluate(context)).text", () => {

            it("should be string obtained replacing the swan expressions with their stringified return value", async () => {
                var store1 = new MemoryStore();
                var store2 = new MemoryStore();
                var router = new Router({
                    s1: store1,
                    s2: store2,
                });
                const evaluate = router.parse(`<%a=10%><%b=a+10%>a + b = <%a+b%>`);
                const context = document.createContext();
                const {text} = await evaluate(context);
                expect(text).to.equal("a + b = 30");
            });

            it("should decorate the rendered text with the `__render__` function if it exists", async () => {
                var store1 = new MemoryStore();
                var store2 = new MemoryStore();
                var router = new Router({
                    s1: store1,
                    s2: store2,
                });

                var evaluate = router.parse(`<% __render__ = text -> text + "!" %>Hello World`);
                var context = document.createContext();
                var {text} = await evaluate(context);
                expect(text).to.equal("Hello World!");

                var evaluate = router.parse(`<% __render__ = text -> {__text__: text + "!!"} %>Hello World`);
                var {text} = await evaluate(context);
                expect(text).to.equal("Hello World!!");
            });
        });
    });

    describe.skip("context = router.createContext(docPath, ...namespaces)", () => {

        it("should be a document context", () => {
            var router = new Router({
                s1: new MemoryStore(),
                s2: new MemoryStore()
            });
            const document_context = document.createContext();
            const context = router.createContext('/path/to/doc1');
            for (let key in document_context) {
                if (key !== "this") {
                    expect(context[key]).to.equal(document_context[key]);
                }
            }
            expect(context.this).to.equal(context);
        })

        it("should contain the document path as '__path__'", () => {
            var router = new Router({
                '/path/to/s1': new MemoryStore(),
                '/path/to/s2': new MemoryStore()
            });
            const context = router.createContext('/path/to/s1/dir1/doc1');
            expect(context.__path__).to.equal('/path/to/s1/dir1/doc1');
        });

        it("should contain the document directory path as '__dirpath__'", () => {
            var router = new Router({
                '/path/to/s1': new MemoryStore(),
                '/path/to/s2': new MemoryStore()
            });
            const context = router.createContext('/path/to/s1/dir1/doc1');
            expect(context.__dirpath__).to.equal('/path/to/s1/dir1');
        });

        it("should contain the passed namespaces properties", () => {
            var router = new Router({
                '/path/to/s1': new MemoryStore(),
                '/path/to/s2': new MemoryStore()
            });
            const context = router.createContext('/path/to/doc1', {x:10, y:20}, {y:30, z:40});
            expect(context.x).to.equal(10);
            expect(context.y).to.equal(30);
            expect(context.z).to.equal(40);
        });

        it("should contain an 'import' function", () => {
            var router = new Router({
                '/path/to/s1': new MemoryStore(),
                '/path/to/s2': new MemoryStore()
            });
            const context = router.createContext('/path/to/doc1');
            expect(context.import).to.be.a("function");
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

            it("should correctly resolve url-like path", async () => {

                const router = new Router({
                    '/store1': new MemoryStore({
                        '/path/to/doc1': "<% docnum = 11 %>",
                        '/path/to/doc2': "<% docnum = 12 %>",
                        '/path/to/doc3': "<% docnum = 13 %>",
                    }),

                    'xxx:/': new MemoryStore({
                        '/path/to/doc1': "<% docnum = 21 %>",
                        '/path/to/doc2': "<% docnum = 22 %>",
                        '/path/to/doc3': "<% docnum = 23 %>",
                    })
                });

                const ctx1 = await router.createContext('/store1/path/to/doc1');

                const doc2_ns = await ctx1.import('doc2');
                expect(doc2_ns.docnum).to.equal(12);
                expect(doc2_ns.__path__).to.equal('/store1/path/to/doc2')

                const doc3_ns = await ctx1.import('xxx:/path/to/doc3');
                expect(doc3_ns.docnum).to.equal(23);
                expect(doc3_ns.__path__).to.equal('/.schemes/xxx/path/to/doc3')
            });
        });
    });
});
