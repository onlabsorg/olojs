var expect = require("chai").expect;
var Store = require("../lib/store");


describe("Store", () => {
    
    describe("source = await store.get(path)", () => {
        
        describe(`when a document path is passed`, () => {
            it("should always return an empty string", async () => {
                var store = new Store();
                expect(await store.get("/pathh/to/doc1")).to.equal("");
                expect(await store.get("/pathh/to/doc2")).to.equal("");
                expect(await store.get("/pathh/to/../to/doc3/../doc4")).to.equal("");
            });
        });

        describe(`when a directory path is passed`, () => {            
            it("should always return an empty string", async () => {
                var store = new Store();
                expect(await store.get("/pathh/to/dir1/")).to.equal("");
                expect(await store.get("/pathh/to/dir2/")).to.equal("");
                expect(await store.get("/pathh/to/../to/doc3/../dir4/")).to.equal("");
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

    describe("await store.set(path, source)", () => {
        it("should throw an `OperationNotAllowed` error", async () => {
            var store = new Store();
            try {
                await store.set("/path/to/doc1", "source of doc 1");
                throw new Error("Id didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(Store.OperationNotAllowedError);
                expect(error.message).to.equal("Operation not allowed: SET /path/to/doc1");
            }
        });
    });        

    describe("await store.delete(path)", () => {
        it("should throw an `OperationNotAllowed` error", async () => {
            var store = new Store();
            try {
                await store.delete("/path/to/doc1");
                throw new Error("Id didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(Store.OperationNotAllowedError);
                expect(error.message).to.equal("Operation not allowed: DELETE /path/to/doc1");
            }
        });
    });        
});    
