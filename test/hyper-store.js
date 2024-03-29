var expect = require("chai").expect;
var Store = require('../lib/stores/store');
var MemoryStore = require('../lib/stores/memory-store');
var HyperStore = require('../lib/stores/hyper-store');



describe("HyperStore", () => {

    describe("normURI = hyperStore.normalizePath(uri)", () => {

        it("should resolve relative paths", () => {
            const hyperStore = new HyperStore({sss: new MemoryStore()});
            expect(hyperStore.normalizePath('abc:/../path/to//./dir/../doc')).to.equal('abc://path/to/doc');
        });

        it("should lowercase the scheme", () => {
            const hyperStore = new HyperStore({sss: new MemoryStore()});
            expect(hyperStore.normalizePath('aBC:/path/to//./dir/../doc')).to.equal('abc://path/to/doc');
        });

        it("should default to the 'home' scheme if the uri is scheme-less", () => {
            const hyperStore = new HyperStore({sss: new MemoryStore()});
            expect(hyperStore.normalizePath('../path/to//./dir/../doc')).to.equal('home://path/to/doc');
        });

    });

    describe("normURI = hyperStore.resolvePath(baseURI, subPath)", () => {

        it("should return an absolute URI, made treating subPath as relative to the baseURI path", () => {
            const hyperStore = new HyperStore({abc: new MemoryStore()});
            expect(hyperStore.resolvePath('abc:/path/to/doc1', './doc2')).to.equal('abc://path/to/doc2');
            expect(hyperStore.resolvePath('abc:/path/to/doc1', 'doc2')).to.equal('abc://path/to/doc2');
            expect(hyperStore.resolvePath('abc:/path/to/doc1', '../to_doc2')).to.equal('abc://path/to_doc2');
            expect(hyperStore.resolvePath('abc:/path/to/', './doc2')).to.equal('abc://path/to/doc2');
        });

        it("should keep only the base URI if subPath is an absolute path", () => {
            const hyperStore = new HyperStore({abc: new MemoryStore()});
            expect(hyperStore.resolvePath('abc:/path/to/doc1', '/doc2')).to.equal('abc://doc2');
        });

        it("should return subPath if it is an URI", () => {
            const hyperStore = new HyperStore({abc: new MemoryStore()});
            expect(hyperStore.resolvePath('abc:/path/to/doc1', 'xxx:/path_to/dir/../doc2')).to.equal('xxx://path_to/doc2');
        });
    });

    describe(`source = hyperStore.read(uri)`, () => {

        it("should delegate to the matching mounted store", async () => {
            var hyperStore = new HyperStore({
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
            expect(await hyperStore.read('aaa://path/to/doc1')).to.equal("doc @ aaa://path/to/doc1");
            expect(await hyperStore.read('bbb://path/to/doc1')).to.equal("doc @ bbb://path/to/doc1");
            expect(await hyperStore.read('ccc://path/to/doc1')).to.equal("doc @ ccc://path/to/doc1");
            expect(await hyperStore.read('/path/to/doc1')).to.equal("doc @ home://path/to/doc1");
            expect(await hyperStore.read('aaa:/path/to/dir/../doc1')).to.equal("doc @ aaa://path/to/doc1");
        });

        it("should return an empty document if no match is found", async () => {
            var hyperStore = new HyperStore({
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
            expect(await hyperStore.read('ddd://path/to/doc1')).to.equal("");
        })

        it("should ignore stores with invalid schemes", async () => {
            var hyperStore = new HyperStore({
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
            expect(await hyperStore.read('a?a://path/to/doc1')).to.equal("");
        })
    });

    describe(`hyperStore.write(uri, source)`, () => {

        it("should delegate to the matching mounted store", async () => {
            var hyperStore = new HyperStore({
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
                "home": new MemoryStore({
                    "/path/to/doc1" : "doc @ home://path/to/doc1",
                    "/path/to/doc2" : "doc @ home://path/to/doc2",
                    "/path/to/doc3" : "doc @ home://path/to/doc3",
                }),
            });

            expect(await hyperStore.read('aaa://path/to/doc1')).to.equal("doc @ aaa://path/to/doc1");
            await hyperStore.write('aaa://path/to/doc1', "aaa1");
            expect(await hyperStore.read('aaa://path/to/doc1')).to.equal("aaa1");

            expect(await hyperStore.read('bbb://path/to/doc1')).to.equal("doc @ bbb://path/to/doc1");
            await hyperStore.write('bbb://path/to/doc1', "bbb1");
            expect(await hyperStore.read('bbb://path/to/doc1')).to.equal("bbb1");

            expect(await hyperStore.read('/path/to/doc1')).to.equal("doc @ home://path/to/doc1");
            await hyperStore.write('/path/to/doc1', "home1");
            expect(await hyperStore.read('/path/to/doc1')).to.equal("home1");

            expect(await hyperStore.read('home://path/to/doc2')).to.equal("doc @ home://path/to/doc2");
            await hyperStore.write('home://path/to/doc2', "home2");
            expect(await hyperStore.read('home://path/to/doc2')).to.equal("home2");

            expect(await hyperStore.read('aaa:/path/to/dir/../doc2')).to.equal("doc @ aaa://path/to/doc2");
            await hyperStore.write('aaa://path/to/dir/../doc2', "aaa2");
            expect(await hyperStore.read('aaa://path/to/dir/../doc2')).to.equal("aaa2");
        });

        it("should throw WriteOperationNotAllowedError if no match is found", async () => {
            var hyperStore = new HyperStore({
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

            try {
                await hyperStore.write('ddd://path/to/doc1', "ddd1");
                throw new Error("It didn't throw!");
            } catch (e) {
                expect(e).to.be.instanceof(Store.WriteOperationNotAllowedError);
            }
        })

        it("should ignore stores with invalid schemes", async () => {
            var hyperStore = new HyperStore({
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

            await hyperStore.write('a?a://path/to/doc1', "a?a1");
            expect(await hyperStore.read('home://a?a:/path/to/doc1')).to.equal("a?a1");
        })
    });

    describe(`hyperStore.delete(uri)`, () => {

        it("should delegate to the matching mounted store", async () => {
            var hyperStore = new HyperStore({
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
                "home": new MemoryStore({
                    "/path/to/doc1" : "doc @ home://path/to/doc1",
                    "/path/to/doc2" : "doc @ home://path/to/doc2",
                    "/path/to/doc3" : "doc @ home://path/to/doc3",
                }),
            });

            expect(await hyperStore.read('aaa://path/to/doc1')).to.equal("doc @ aaa://path/to/doc1");
            await hyperStore.delete('aaa://path/to/doc1');
            expect(await hyperStore.read('aaa://path/to/doc1')).to.equal("");

            expect(await hyperStore.read('bbb://path/to/doc1')).to.equal("doc @ bbb://path/to/doc1");
            await hyperStore.delete('bbb://path/to/doc1');
            expect(await hyperStore.read('bbb://path/to/doc1')).to.equal("");

            expect(await hyperStore.read('/path/to/doc1')).to.equal("doc @ home://path/to/doc1");
            await hyperStore.delete('/path/to/doc1');
            expect(await hyperStore.read('/path/to/doc1')).to.equal("");

            expect(await hyperStore.read('home://path/to/doc2')).to.equal("doc @ home://path/to/doc2");
            await hyperStore.delete('home://path/to/doc2');
            expect(await hyperStore.read('home://path/to/doc2')).to.equal("");

            expect(await hyperStore.read('aaa:/path/to/dir/../doc2')).to.equal("doc @ aaa://path/to/doc2");
            await hyperStore.delete('aaa://path/to/dir/../doc2');
            expect(await hyperStore.read('aaa://path/to/dir/../doc2')).to.equal("");
        });

        it("should throw WriteOperationNotAllowedError if no match is found", async () => {
            var hyperStore = new HyperStore({
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

            try {
                await hyperStore.delete('ddd://path/to/doc1');
                throw new Error("It didn't throw!");
            } catch (e) {
                expect(e).to.be.instanceof(Store.WriteOperationNotAllowedError);
            }
        })

        it("should ignore stores with invalid schemes", async () => {
            var hyperStore = new HyperStore({
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

            await hyperStore.write('a?a://path/to/doc1', "a?a1");
            expect(await hyperStore.read('home://a?a:/path/to/doc1')).to.equal("a?a1");

            await hyperStore.delete('a?a://path/to/doc1');
            expect(await hyperStore.read('home://a?a:/path/to/doc1')).to.equal("");
        })
    });
});
