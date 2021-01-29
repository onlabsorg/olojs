var expect = require("chai").expect;
var document = require('../lib/document');
var Store = require("../lib/store");


describe("Store", () => {

    describe("source = await store.read(path)", () => {

        describe(`when a document path is passed`, () => {
            it("should always return an empty string", async () => {
                var store = new Store();
                expect(await store.read("/pathh/to/doc1")).to.equal("");
                expect(await store.read("/pathh/to/doc2")).to.equal("");
                expect(await store.read("/pathh/to/../to/doc3/../doc4")).to.equal("");
            });
        });

        describe(`when a directory path is passed`, () => {
            it("should always return an empty string", async () => {
                var store = new Store();
                expect(await store.read("/pathh/to/dir1/")).to.equal("");
                expect(await store.read("/pathh/to/dir2/")).to.equal("");
                expect(await store.read("/pathh/to/../to/doc3/../dir4/")).to.equal("");
            });
        });
    });

    describe("entries = await store.list(path)", () => {
        it("should return an empty array", async () => {
            var store = new Store();
            expect(await store.list("/pathh/to/dir1/")).to.deep.equal([]);
            expect(await store.list("/pathh/to/dir2/")).to.deep.equal([]);
            expect(await store.list("/pathh/to/../to/doc3/../dir4/")).to.deep.equal([]);
        });
    });

    describe("await store.write(path, source)", () => {
        it("should throw a `WriteOperationNotAllowed` error", async () => {
            var store = new Store();
            try {
                await store.write("/path/to/doc1", "source of doc 1");
                throw new Error("Id didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(Store.WriteOperationNotAllowedError);
                expect(error.message).to.equal("Operation not allowed: WRITE /path/to/doc1");
            }
        });
    });

    describe("await store.delete(path)", () => {
        it("should throw a `WriteOperationNotAllowed` error", async () => {
            var store = new Store();
            try {
                await store.delete("/path/to/doc1");
                throw new Error("Id didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(Store.WriteOperationNotAllowedError);
                expect(error.message).to.equal("Operation not allowed: WRITE /path/to/doc1");
            }
        });
    });

    describe("await store.deleteAll(path)", () => {
        it("should throw a `WriteOperationNotAllowed` error", async () => {
            var store = new Store();
            try {
                await store.deleteAll("/path/to/");
                throw new Error("Id didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(Store.WriteOperationNotAllowedError);
                expect(error.message).to.equal("Operation not allowed: WRITE /path/to/");
            }
        });
    });

    describe('Store.parseId', () => {

        it("should return {path, argns}", () => {
            var pid = Store.parseId('/path/to/doc?x=1;y=2&s=abc;bool');
            expect(pid).to.deep.equal({
                path:   '/path/to/doc',
                argns:  {x:1, y:2, s:"abc", bool:true},
            });
        });

        it("should default to `/` if the path is missing", () => {
            expect(Store.parseId('?x=1;y=2&s=abc;bool')).to.deep.equal({
                path:  '/',
                argns:  {x:1, y:2, s:"abc", bool:true},
            });
        });

        it("should report an empty argns if the query part is missing", () => {
            expect(Store.parseId('/path/to/doc')).to.deep.equal({
                path:   '/path/to/doc',
                argns:  {},
            });
            expect(Store.parseId('/path/to/doc?')).to.deep.equal({
                path:   '/path/to/doc',
                argns:  {},
            });
        });

        it("should normalize the path", () => {
            expect(Store.parseId('/path/to/../doc?x=1;y=2&s=abc;bool')).to.deep.equal({
                path:   '/path/doc',
                argns:  {x:1, y:2, s:"abc", bool:true},
            });
            expect(Store.parseId('/../path/to/doc?x=1;y=2&s=abc;bool')).to.deep.equal({
                path:   '/path/to/doc',
                argns:  {x:1, y:2, s:"abc", bool:true},
            });
            expect(Store.parseId('path/to/doc?x=1;y=2&s=abc;bool')).to.deep.equal({
                path:   '/path/to/doc',
                argns:  {x:1, y:2, s:"abc", bool:true},
            });
            expect(Store.parseId('../path/to/doc?x=1;y=2&s=abc;bool')).to.deep.equal({
                path:   '/path/to/doc',
                argns:  {x:1, y:2, s:"abc", bool:true},
            });
        });
    });

    describe('context = store.createContext(docId)', () => {

        it("should return a document context", () => {
            var store = new Store();
            var context = store.createContext("/path/to/doc");
            var docContext = document.createContext();
            for (let name in docContext) {
                expect(context[name]).to.equal(docContext[name]);
            }
        });

        it("should contain include the store.globals object", () => {
            var store = new Store();
            Object.assign(store.globals, {x:10, y:20});
            var context = store.createContext("/path/to/doc");
            for (let name in store.globals) {
                expect(context[name]).to.equal(store.globals[name]);
            }

        });

        describe("context.__path__", () => {
            it("should contain the normalize path portion of the docId", () => {
                var store = new Store();

                var context = store.createContext("/path/to/doc?x=10;y=20");
                expect(context.__path__).to.equal("/path/to/doc");

                var context = store.createContext("path/to/doc?x=10;y=20");
                expect(context.__path__).to.equal("/path/to/doc");

                var context = store.createContext("?x=10;y=20");
                expect(context.__path__).to.equal("/");

                var context = store.createContext("..?x=10;y=20");
                expect(context.__path__).to.equal("/");
            });
        });

        describe("context.argns", () => {
            it("should contain the key-value pairs passed via the query string", () => {
                var store = new Store();
                var context = store.createContext("/path/to/doc?x=1;y=2&s=abc;bool");
                expect(context.argns).to.deep.equal({x:1, y:2, s:"abc", bool:true});
            });
        });

        describe("docns = context.import(id)", () => {

            it("should be a function", () => {
                const store = new Store();
                var context = store.createContext("/path/to/doc");
                expect(context.import).to.be.a("function");
            });

            it("should return the namespace of the document mapped to the passed id", async () => {
                var store = new Store();
                store.read = path => `<% p = "${path}" %>`

                var context = store.createContext("/path/to/doc?x=10");

                var doc1_ns = await context.import('/path/to/doc1');
                expect(doc1_ns.p).to.equal('/path/to/doc1');
                expect(doc1_ns.argns.x).to.be.undefined;

                var doc1_ns = await context.import('/path/to/doc1?x=20');
                expect(doc1_ns.p).to.equal('/path/to/doc1');
                expect(doc1_ns.argns.x).to.equal(20);
            });

            it("should resolve ids relative to doc.path", async () => {
                const store = new Store();
                store.read = path => `<% p = "${path}" %>`

                var ctx = store.createContext("/path/to/doc?x=10");
                expect((await ctx.import('doc1')).p).to.equal('/path/to/doc1');
                expect((await ctx.import('../doc2')).p).to.equal('/path/doc2');
                expect((await ctx.import('../doc2?x=20')).argns.x).to.equal(20);
                expect((await ctx.import('../doc2')).argns.x).to.be.undefined;

                var ctx = store.createContext("/path/to/");
                expect((await ctx.import('./doc1')).p).to.equal('/path/to/doc1');
            });

            it("should cache the documents and load them only once", async () => {
                var count = 0;
                const store = new Store();
                store.read = path => {
                    count += 1;
                    return `doc @ ${path}`;
                }
                var ctx = store.createContext("/path/to/doc");

                var ns = await ctx.import("/path/to/doc");
                expect(count).to.equal(1);

                var ns = await ctx.import("/path/to/doc?x=10");
                expect(count).to.equal(1);

                var ns = await ctx.import("/path/to/doc2");
                expect(count).to.equal(2);

                var ns = await ctx.import("/path/to/doc2");
                expect(count).to.equal(2);
            });
        });
    });

    describe('doc = await store.load(docId)', () => {
        it("should return an object containing the document source, context, namespace and rendered text", async () => {
            var store = new Store();
            store.read = path => `p = <% p: "${path}" %>, x = <% argns.x %>`;
            var doc = await store.load('/path/to/doc?x=10');
            expect(doc.source).to.equal(`p = <% p: "/path/to/doc" %>, x = <% argns.x %>`);
            expect(doc.context.__path__).to.equal("/path/to/doc");
            expect(doc.context.argns).to.deep.equal({x:10});
            expect(doc.namespace.p).to.equal("/path/to/doc");
            expect(doc.namespace.argns).to.deep.equal({x:10});
            expect(doc.text).to.equal(`p = /path/to/doc, x = 10`);
        });
    });
});
