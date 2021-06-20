var expect = require("chai").expect;
var document = require("../lib/document");
var MemoryStore = require('../lib/memory-store');
var Protocols = require('../lib/protocols');



describe("Protocols instance", () => {
    
    describe(`source = protocols.read(path)`, () => {

        it("should delegate to the matching mounted protocol", async () => {
            var protocols = new Protocols({
                "http":    new MemoryStore({
                    "/"    : "doc @ http:/",
                    "/path/to/doc"  : "doc @ http:/path/to/doc"
                }),
                "ipfs":    new MemoryStore({
                    "/"             : "doc @ ipfs:/",
                    "/path/to/doc"  : "doc @ ipfs:/path/to/doc"
                }),
                "default": new MemoryStore({
                    "/"             : "doc @ default:/",
                    "/path/to/doc"  : "doc @ default:/path/to/doc",
                }),
            });
            expect(await protocols.read('http:/')).to.equal("doc @ http:/");
            expect(await protocols.read('http:/path/to/doc')).to.equal("doc @ http:/path/to/doc");
            expect(await protocols.read('ipfs:/')).to.equal("doc @ ipfs:/");
            expect(await protocols.read('ipfs:/path/to/doc')).to.equal("doc @ ipfs:/path/to/doc");
            expect(await protocols.read('/')).to.equal("doc @ default:/");
            expect(await protocols.read('/path/to/doc')).to.equal("doc @ default:/path/to/doc");
        });

        it("should return an empty document if no match is found", async () => {
            var protocols = new Protocols({
                "http": new MemoryStore({
                    "/"    : "doc @ store1:/",
                    "doc"  : "doc @ store1:/path/to/doc"
                }),
                "ipfs": new MemoryStore({
                    "/"             : "doc @ store2:/",
                    "/path/to/doc"  : "doc @ store2:/path/to/doc"
                }),
            });
            expect(await protocols.read('http:/path/to/undefined/doc')).to.equal("");
        })
    });

    describe(`entries = protocols.list(id)`, () => {

        it("should delegate to the matching mounted protocol", async () => {
            var protocols = new Protocols({
                mem: new MemoryStore({
                    "/path/to/doc1": "...",
                    "/path/to/doc2": "...",
                    "/path/to/dir1/": "...",
                    "/path/to/dir1/doc1": "...",
                    "/path/to/dir1/doc2": "...",
                    "/path/to/dir2/": "...",
                }),
                default: new MemoryStore({'/a':'...', '/b':'...', '/c':'...'})
            })

            expect((await protocols.list("mem:/path/to/")).sort()).to.deep.equal(['dir1/', 'dir2/', 'doc1', 'doc2']);
            expect(await protocols.list("mem:/path/")).to.deep.equal(['to/']);
            expect(await protocols.list("mem:/")).to.deep.equal(['path/']);
            expect(await protocols.list("/")).to.deep.equal(['a','b','c']);
        });

        it("should return an empty array if no match is found", async () => {
            var protocols = new Protocols({
                mem: new MemoryStore({
                    "/path/to/doc1": "...",
                    "/path/to/doc2": "...",
                    "/path/to/dir1/": "...",
                    "/path/to/dir1/doc1": "...",
                    "/path/to/dir1/doc2": "...",
                    "/path/to/dir2/": "...",
                }),
                default: new MemoryStore({'/a':'...', '/b':'...', '/c':'...'})
            })
            expect(await protocols.list("mem:/ppp")).to.deep.equal([]);
            expect(await protocols.list("/path/to/dir")).to.deep.equal([]);
        });
    });

    describe(`source = protocols.write(id, source)`, () => {

        it("should delegate to the matching mounted protocol", async () => {
            var store1 = new MemoryStore();
            var store2 = new MemoryStore();
            var protocols = new Protocols({
                s1: store1,
                s2: store2,
            });
            await protocols.write('s1:/path/to/doc', "doc @ store1");
            await protocols.write('s2:/path/to/doc', "doc @ store2");
            expect(await store1.read('/path/to/doc')).to.equal("doc @ store1");
            expect(await store2.read('/path/to/doc')).to.equal("doc @ store2");
        });

        it("should throw an error if no match is found", async () => {
            var protocols = new Protocols();
            try {
                await protocols.write('s1:/path/to/doc', "...");
                throw new Error("Id did not throw");
            } catch (error) {
                expect(error).to.be.instanceof(Protocols.WriteOperationNotAllowedError);
                expect(error.message).to.equal('Operation not allowed: WRITE /s1:/path/to/doc')
            }
        });
    });

    describe(`source = protocols.delete(id)`, () => {

        it("should delegate to the matching mounted protocol", async () => {
            var store1 = new MemoryStore();
            var store2 = new MemoryStore();
            var protocols = new Protocols({
                s1: store1,
                s2: store2,
            });

            await store1.write('/path/to/doc', "doc @ store1");
            await protocols.delete('s1:/path/to/doc');
            expect(store1.read('/path/to/doc')).to.equal("");
        });

        it("should throw an error if no match is found", async () => {
            var protocols = new Protocols();
            try {
                await protocols.delete('s1:/path/to/doc');
                throw new Error("Id did not throw");
            } catch (error) {
                expect(error).to.be.instanceof(Protocols.WriteOperationNotAllowedError);
                expect(error.message).to.equal('Operation not allowed: WRITE /s1:/path/to/doc')
            }
        })
    });

    describe(`source = protocols.deleteAll(id)`, () => {

        it("should delegate to the matching mounted protocol", async () => {
            var store1 = new MemoryStore();
            var store2 = new MemoryStore();
            var protocols = new Protocols({
                s1: store1,
                s2: store2,
            });

            var called = "";
            store1.deleteAll = path => {
                called = `store1.deleteAll ${path}`;
            }

            await protocols.deleteAll('s1:/path/to/dir');

            expect(called).to.equal("store1.deleteAll /path/to/dir");
        });

        it("should throw an error if no match is found", async () => {
            var protocols = new Protocols();
            try {
                await protocols.deleteAll('s1:/path/to/doc');
                throw new Error("Id did not throw");
            } catch (error) {
                expect(error).to.be.instanceof(Protocols.WriteOperationNotAllowedError);
                expect(error.message).to.equal('Operation not allowed: WRITE /s1:/path/to/doc')
            }
        })
    });
});
