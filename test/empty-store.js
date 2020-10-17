var expect = require("chai").expect;
var EmptyStore = require("../lib/stores/empty");
var errors = require("../lib/stores/store-errors");


describe("EmptyStore", () => {
    
    describe("source = nullStore.get(path)", () => {
        
        describe(`when a document path is passed`, () => {
            it("should always return an empty string", async () => {
                var nullStore = new EmptyStore();
                expect(await nullStore.get("/pathh/to/doc1")).to.equal("");
                expect(await nullStore.get("/pathh/to/doc2")).to.equal("");
                expect(await nullStore.get("/pathh/to/../to/doc3/../doc4")).to.equal("");
            });
        });

        describe(`when a directory path is passed`, () => {            
            it("should always return an empty string", async () => {
                var nullStore = new EmptyStore();
                expect(await nullStore.get("/pathh/to/dir1/")).to.equal("");
                expect(await nullStore.get("/pathh/to/dir2/")).to.equal("");
                expect(await nullStore.get("/pathh/to/../to/doc3/../dir4/")).to.equal("");
            });
        });
    });        

    describe("nullStore.set(path, source)", () => {
        it("should throw an `OperationNotAllowed` error", async () => {
            var nullStore = new EmptyStore();
            try {
                await nullStore.set("/path/to/doc1", "source of doc 1");
                throw new Error("Id didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.OperationNotAllowed);
                expect(error.message).to.equal("Operation not allowed: SET /path/to/doc1");
            }
        });
    });        

    describe("nullStore.delete(path)", () => {
        it("should throw an `OperationNotAllowed` error", async () => {
            var nullStore = new EmptyStore();
            try {
                await nullStore.delete("/path/to/doc1");
                throw new Error("Id didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.OperationNotAllowed);
                expect(error.message).to.equal("Operation not allowed: DELETE /path/to/doc1");
            }
        });
    });        
});    
