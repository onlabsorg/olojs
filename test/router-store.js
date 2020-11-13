var expect = require("chai").expect;
var document = require("../lib/document");
var errors = require("../lib/stores/store-errors");
var MemoryStore = require('../lib/stores/memory');
var RouterStore = require('../lib/stores/router');






describe("RouterStore", () => {
    
    describe(`source = router.get(path)`, () => {
        
        it("should delegate to the matching mounted store", async () => {
            var router = new RouterStore({
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
                })
            });
            expect(await router.get('/path/to/')).to.equal("doc @ store1:/");
            expect(await router.get('/path/to/doc')).to.equal("doc @ store1:/path/to/doc");
            expect(await router.get('/path/to/store2/path/to/doc')).to.equal("doc @ store2:/path/to/doc");
            expect(await router.get('/path/to/store2/')).to.equal("doc @ store2:/");
            expect(await router.get('/path_to/doc')).to.equal("doc @ root:/path_to/doc");
        });
        
        it("should return an empty document if no match is found", async () => {
            var router = new RouterStore({
                "path/to": new MemoryStore({
                    "/"    : "doc @ store1:/",
                    "doc"  : "doc @ store1:/path/to/doc"
                }),
                "/path/to/store2": new MemoryStore({
                    "/"             : "doc @ store2:/",
                    "/path/to/doc"  : "doc @ store2:/path/to/doc"
                }),
            });
            expect(await router.get('/path_to/doc')).to.equal("");
        })
    });
    
    describe(`entries = router.list(path)`, () => {
        
        it("should delegate to the matching mounted store", async () => {
            var memStore = new MemoryStore({
                "/path/to/doc1": "...",
                "/path/to/doc2": "...",
                "/path/to/dir1/": "...",
                "/path/to/dir1/doc1": "...",
                "/path/to/dir1/doc2": "...",
                "/path/to/dir2/": "...",
            });
            var router = new RouterStore({
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
            var router = new RouterStore({
                '/stores/mem': memStore
            })
            expect(await router.list("/path/to/dir")).to.deep.equal([]);            
        });
        
        it("should include mounted routes in the entries list", async () => {
            var router = new RouterStore({
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
    
    describe(`source = router.set(path, source)`, () => {
        
        it("should delegate to the matching mounted store", async () => {
            var store1 = new MemoryStore();
            var store2 = new MemoryStore();
            var router = new RouterStore({
                s1: store1,
                s2: store2
            });                
            await router.set('/s1/path/to/doc', "doc @ store1");
            await router.set('s2/path/to/doc', "doc @ store2");
            expect(await store1.get('/path/to/doc')).to.equal("doc @ store1");
            expect(await store2.get('/path/to/doc')).to.equal("doc @ store2");
        });
        
        it("should throw an error if no match is found", async () => {
            var router = new RouterStore();
            try {
                await router.set('/s1/path/to/doc', "...");
                throw new Error("Id did not throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.OperationNotAllowed);
                expect(error.message).to.equal('Operation not allowed: SET /s1/path/to/doc')
            }
        });
    });
    
    describe(`source = router.get(path)`, () => {
        
        it("should delegate to the matching mounted store", async () => {
            var store1 = new MemoryStore();
            var store2 = new MemoryStore();
            var router = new RouterStore({
                s1: store1,
                s2: store2
            });                
            await store1.set('/path/to/doc', "doc @ store1");
            await router.delete('/s1/path/to/doc');
            expect(store1.get('/path/to/doc')).to.equal("");
        });
        
        it("should throw an error if no match is found", async () => {
            var router = new RouterStore();
            try {
                await router.delete('/s1/path/to/doc');
                throw new Error("Id did not throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.OperationNotAllowed);
                expect(error.message).to.equal('Operation not allowed: DELETE /s1/path/to/doc')
            }                
        })
    });
});
