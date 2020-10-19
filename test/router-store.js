var expect = require("chai").expect;
var document = require("../lib/document");
var errors = require("../lib/stores/store-errors");
var MemoryStore = require('../lib/stores/memory');
var RouterStore = require('../lib/stores/router');






describe("RouterStore", () => {
    
    describe(`source = router.get(path)`, () => {
        
        it("should delegate to the matching mounted store", async () => {
            var store1 = new MemoryStore();
            store1.set('/', "doc @ /")
            store1.set('/path/to/doc', "doc @ store1");
            var store2 = new MemoryStore();
            store2.set('/path/to/doc', "doc @ store2");
            var router = new RouterStore({
                s1: store1,
                s2: store2
            });
            expect(await router.get('/s1/path/to/doc')).to.equal("doc @ store1");
            expect(await router.get('/s2/path/to/doc')).to.equal("doc @ store2");
            expect(await router.get('/s1/')).to.equal("doc @ /");
        });
        
        it("should return an empty document if no match is found", async () => {
            var store1 = new MemoryStore();
            store1.set('/path/to/doc', "doc @ store1");
            var store2 = new MemoryStore();
            store2.set('/path/to/doc', "doc @ store2");
            var router = new RouterStore({
                s1: store1,
                s2: store2
            });
            expect(await router.get('/s3/path/to/doc')).to.equal("");
        })

        it("should return a document containing the `__children__` list when asking for `/`", async () => {
            var store1 = new MemoryStore();
            store1.set('/path/to/doc', "doc @ store1");
            var store2 = new MemoryStore();
            store2.set('/path/to/doc', "doc @ store2");
            var router = new RouterStore({
                s1: store1,
                s2: store2
            });
            var doc = await router.get(`/`);
            var docns = await document.parse(doc)(document.createContext());
            expect(docns.children.sort()).to.deep.equal(["/s1/", "/s2/"]);
            
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
        
        it("should throw an error if trying to set the root path", async () => {
            var router = new RouterStore({s1: new MemoryStore()});
            try {
                await router.set('/', "...");
                throw new Error("Id did not throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.OperationNotAllowed);
                expect(error.message).to.equal('Operation not allowed: SET /')
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

        it("should throw an error if trying to delete the root path", async () => {
            var router = new RouterStore({s1: new MemoryStore()});
            try {
                await router.delete('/');
                throw new Error("Id did not throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.OperationNotAllowed);
                expect(error.message).to.equal('Operation not allowed: DELETE /')
            }                                
        });
    });
});
