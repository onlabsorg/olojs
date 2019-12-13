const expect = require("chai").expect;
const document = require("../lib/document");

module.exports = function test (storeName, createStore) {    
    var store;
    
    before(async () => {
        store = await createStore({
            "/path/to/doc1"             : "doc1 body",
            "/path/to/doc2"             : "doc2 body",
            "/path/to/doc3"             : "doc3 body",
            "/path/to/container1/doc4"  : "doc4 body",
            "/path/to/container2/doc5"  : "doc5 body",
            "/path/TO/doc6"             : "doc6 body",
            "/a/b/c/doc7"               : "doc7 body"
        });
    });
    
    describe(`doc = ${storeName}.prototype.read(documentPath)`, () => {
        
        it("should return the document stored at the given path", async () => {
            var doc = await store.read("/path/to/doc1");
            expect(doc).to.equal("doc1 body");
        });
        
        it("should return an empty document if the path doesn't exist", async () => {
            var doc = await store.read("/path/to/doc111");
            expect(doc).to.equal("");            
        });
    });    
    
    describe(`${storeName}.prototype.write(documentPath, source) - async method`, () => {
    
        it("should map the passed document source to the passed path", async () => {
            var docContent = "doc11 body";
            await store.write("/path/to/doc11", docContent);
            var doc = await store.read("/path/to/doc11");
            expect(doc).to.equal(docContent);
        });
    });

    describe(`${storeName}.prototype.delete(documentPath) - async method`, () => {

        it("should remove the document at the given path", async () => {    
            var doc = await store.read("/path/to/doc11");
            expect(doc).to.equal("doc11 body");
            
            await store.delete("/path/to/doc11");
            var doc = await store.read("/path/to/doc11");
            expect(doc).to.equal("");
        });

        it("should fail silentrly if the document doesn't exist", async () => {
            var doc = await store.read("/path/to/doc11");
            expect(doc).to.equal("");
            
            await store.delete("path/to/doc11");
            var doc = await store.read("/path/to/doc11");
            expect(doc).to.equal("");
        });            
    });    
}
