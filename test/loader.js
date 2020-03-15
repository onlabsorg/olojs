const expect = require("chai").expect;
const document = require("../lib/document");


module.exports = function (createLoader) {    
    var load;
    
    before(async () => {
        load = await createLoader({
            "/path/to/doc1"             : "doc1 source",
            "/path/to/doc2"             : "doc2 source",
            "/path/to/doc3"             : "doc3 source",
            "/path/to/container1/doc4"  : "doc4 source",
            "/path/to/container2/doc5"  : "doc5 source",
            "/path/TO/doc6"             : "doc6 source",
            "/a/b/c/doc7"               : "doc7 source"
        });
    });
    
    describe(`load(documentPath) - async method`, () => {
        
        it("should return the document stored at the given path", async () => {
            var doc = await load("path/to/doc1");
            expect(doc).to.equal("doc1 source");

            var doc = await load("/path/to/doc2");
            expect(doc).to.be.equal("doc2 source");
        });

        it("should return an empty string if the path doesn't exist", async () => {
            var doc = await load("/path/to/doc111");
            expect(doc).to.equal("");            
        });
    });        

    describe(`load(containerPath) - async method`, () => {

        it("should return a document defining the child 'items' list of the container", async () => {
            var source = await load("/path/to/");
            var docNS = await document.parse(source)(document.createContext());

            expect(docNS.items).to.be.an("array");
            expect(docNS.items.sort()).to.deep.equal([
                "container1/doc4",
                "container2/doc5",
                "doc1",
                "doc2",
                "doc3",
            ]);
        });

        it("should work as well with root path `/`", async () => {
            var source = await load("/");
            var docNS = await document.parse(source)(document.createContext());
            
            expect(docNS.items).to.be.an("array");
            expect(docNS.items.sort()).to.deep.equal([
                "a/b/c/doc7",
                "path/TO/doc6",
                "path/to/container1/doc4",
                "path/to/container2/doc5",
                "path/to/doc1",
                "path/to/doc2",
                "path/to/doc3",
            ]);
        });

        it("should return a document empty 'items' lists if the path doesn't exist", async () => {
            var source = await load("/path/to/non-existing/container/");
            var docNS = await document.parse(source)(document.createContext());
            
            expect(docNS.items).to.be.an("array");
            expect(docNS.items.sort()).to.deep.equal([]);
        });            
    });    
}
