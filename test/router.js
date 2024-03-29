var expect = require("chai").expect;
var MemoryStore = require('../lib/stores/memory-store');
var Router = require('../lib/stores/router');



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

    describe(`await router.write(path, source)`, () => {

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
            await router.write('/path/to/', "xxx1");
            expect(await router.read('/path/to/')).to.equal("xxx1");

            expect(await router.read('/path/to/doc')).to.equal("doc @ store1:/path/to/doc");
            await router.write('/path/to/doc', "xxx2");
            expect(await router.read('/path/to/doc')).to.equal("xxx2");

            expect(await router.read('/path/to/store2/path/to/doc')).to.equal("doc @ store2:/path/to/doc");
            await router.write('/path/to/store2/path/to/doc', "xxx3");
            expect(await router.read('/path/to/store2/path/to/doc')).to.equal("xxx3");

            expect(await router.read('/path/to/store2/')).to.equal("doc @ store2:/");
            await router.write('/path/to/store2/', "xxx4");
            expect(await router.read('/path/to/store2/')).to.equal("xxx4");

            expect(await router.read('/path_to/doc')).to.equal("doc @ root:/path_to/doc");
            await router.write('/path_to/doc', "xxx5");
            expect(await router.read('/path_to/doc')).to.equal("xxx5");
        });

        it("should throw WriteOperationNotAllowedError if no match is found", async () => {
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

            try {
                await router.write('/path_to/doc', "xxx");
                throw new Error("It did not throw")
            } catch (e) {
                expect(e).to.be.instanceof(Router.WriteOperationNotAllowedError);
            }
        })
    });

    describe(`await router.delete(path)`, () => {

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
            await router.delete('/path/to/');
            expect(await router.read('/path/to/')).to.equal("");

            expect(await router.read('/path/to/doc')).to.equal("doc @ store1:/path/to/doc");
            await router.delete('/path/to/doc');
            expect(await router.read('/path/to/doc')).to.equal("");

            expect(await router.read('/path/to/store2/path/to/doc')).to.equal("doc @ store2:/path/to/doc");
            await router.delete('/path/to/store2/path/to/doc');
            expect(await router.read('/path/to/store2/path/to/doc')).to.equal("");

            expect(await router.read('/path/to/store2/')).to.equal("doc @ store2:/");
            await router.delete('/path/to/store2/');
            expect(await router.read('/path/to/store2/')).to.equal("");

            expect(await router.read('/path_to/doc')).to.equal("doc @ root:/path_to/doc");
            await router.delete('/path_to/doc');
            expect(await router.read('/path_to/doc')).to.equal("");
        });

        it("should throw WriteOperationNotAllowedError if no match is found", async () => {
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

            try {
                await router.delete('/path_to/doc');
                throw new Error("It did not throw")
            } catch (e) {
                expect(e).to.be.instanceof(Router.WriteOperationNotAllowedError);
            }
        })
    });
});
