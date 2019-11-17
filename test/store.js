const expect = require("chai").expect;
const Document = require("../lib/document");
const URI = require("../lib/uri");
const errors = require("../lib/errors");

module.exports = function test (Store) {    
    var store;
    
    before(async () => {
        store = await Store({
            "/path/to/doc1"             : "doc1 body",
            "/path/to/doc2"             : "doc2 body",
            "/path/to/doc3"             : "doc3 body",
            "/path/to/container1/doc4"  : "doc4 body",
            "/path/to/container2/doc5"  : "doc5 body",
            "/path/TO/doc6"             : "doc6 body",
            "/a/b/c/doc7"               : "doc7 body"
        });
    });
    
    describe(`Store.prototype.read(documentPath)`, () => {
        
        it("should return the document stored at the given path", async () => {
            var doc = await store.read("path/to/doc1");
            expect(doc).to.be.instanceof(Document);
            expect(doc.uri).to.be.instanceof(URI);
            expect(String(doc.uri)).to.equal(String(store.uri) + "path/to/doc1");
            expect(doc.presets).to.deep.equal({});
            expect(doc.body).to.equal("doc1 body");

            var doc = await store.read("/path/to/doc2");
            expect(doc).to.be.instanceof(Document);
            expect(doc.uri).to.be.instanceof(URI);
            expect(String(doc.uri)).to.equal(String(store.uri) + "path/to/doc2");
            expect(doc.presets).to.deep.equal({});
            expect(doc.body).to.be.equal("doc2 body");
        });

        it("should return an empty string if the path doesn't exist", async () => {
            var doc = await store.read("/path/to/doc111");
            expect(doc).to.be.instanceof(Document);
            expect(doc.presets).to.deep.equal({});
            expect(doc.body).to.equal("");            
        });
    });        

    describe(`Store.prototype.read(containerPath) - async method`, () => {

        it("should return a document body defining the child 'items' and 'subPaths' list of the container", async () => {
            var doc = await store.read("/path/to/");
            expect(doc).to.be.instanceof(Document);
            var context = doc.createContext();
            var docVal = await doc.evaluate(context);

            expect(docVal.items).to.be.an("array");
            expect(docVal.items.sort()).to.deep.equal([
                "container1/",
                "container2/",
                "doc1",
                "doc2",
                "doc3",
            ]);

            expect(docVal.subPaths).to.be.an("array");
            expect(docVal.subPaths.sort()).to.deep.equal([
                "container1/doc4",
                "container2/doc5",
                "doc1",
                "doc2",
                "doc3",
            ]);
        });

        it("should work as well with root path `/`", async () => {
            var doc = await store.read("/");
            expect(doc).to.be.instanceof(Document);
            var context = doc.createContext();
            var docVal = await doc.evaluate(context);
            
            expect(docVal.items).to.be.an("array");
            expect(docVal.items.sort()).to.deep.equal([
                "a/",
                "path/"
            ]);

            expect(docVal.subPaths).to.be.an("array");
            expect(docVal.subPaths.sort()).to.deep.equal([
                "a/b/c/doc7",
                "path/TO/doc6",
                "path/to/container1/doc4",
                "path/to/container2/doc5",
                "path/to/doc1",
                "path/to/doc2",
                "path/to/doc3",
            ]);
        });

        it("should return a document body defining empty 'items' and 'subPaths' lists if the path doesn't exist", async () => {
            var doc = await store.read("/path/to/non-existing/container/");
            expect(doc).to.be.instanceof(Document);
            var context = doc.createContext();
            var docVal = await doc.evaluate(context);
            
            expect(docVal.items).to.be.an("array");
            expect(docVal.items.sort()).to.deep.equal([]);

            expect(docVal.subPaths).to.be.an("array");
            expect(docVal.subPaths.sort()).to.deep.equal([]);
        });            
    });

    describe(`Store.prototype.write(documentPath, body) - async method`, () => {
    
        it("should map the passed document body to the passed path", async () => {
            var docContent = "doc11 body";
            await store.write("/path/to/doc11", docContent);
            var doc = await store.read("/path/to/doc11");
            expect(doc).to.be.instanceof(Document);
            expect(doc.body).to.equal(docContent);
            
            var containerDoc = await store.read("/path/to/");
            var context = containerDoc.createContext();
            var docVal = await containerDoc.evaluate(context);    
            expect(docVal.subPaths.sort()).to.deep.equal([
                "container1/doc4",
                "container2/doc5",
                "doc1",
                "doc11",
                "doc2",
                "doc3",
            ]);
        });
        
        it("should create the intermediate containers if they don't exist", async () => {
            var docContent = "doc12 body";
            await store.write("/path/to/container3/container4/doc12", docContent);
            var doc = await store.read("/path/to/container3/container4/doc12");
            expect(doc).to.be.instanceof(Document);
            expect(doc.body).to.equal(docContent);
            
            var containerDoc = await store.read("/path/to/");
            var context = containerDoc.createContext();
            var docVal = await doc.evaluate(context);    
            expect(docVal.subPaths.sort()).to.deep.equal([
                "container1/doc4",
                "container2/doc5",
                "container3/container4/doc12",
                "doc1",
                "doc11",
                "doc2",
                "doc3",
            ]);
        });
    });

    describe(`Store.prototype.write(containerPath, body) - async method`, () => {
        
        it("should throw a WriteOperationNotAllowed", async () => {
            try {
                await store.write("/path/to/container1/", {
                    'doc41': "doc41 body",
                    'container5/doc51': "doc51 body"
                });
                throw new Error("It didn't throw.")
            } catch (error) {
                expect(error).to.be.instanceof(errors.WriteOperationNotAllowed);
            }
        });
    });
    
    describe(`Store.prototype.delete(documentPath) - async method`, () => {

        it("should remove the document at the given path", async () => {    
            var doc = await store.read("/path/to/doc11");
            expect(doc.body).to.equal("doc11 body");
            
            await store.delete("path/to/doc11");
            var doc = await store.read("/path/to/doc11");
            expect(doc.body).to.equal("");
            
            var containerDoc = await store.read("/path/to/");
            var context = containerDoc.createContext();
            var docVal = await containerDoc.evaluate(context);    
            expect(docVal.subPaths.sort()).to.deep.equal([
                "container1/doc4",
                "container2/doc5",
                "container3/container4/doc12",
                "doc1",
                "doc2",
                "doc3",
            ]);                
        });

        it("should fail silentrly if the document doesn't exist", async () => {
            var doc = await store.read("/path/to/doc11");
            expect(doc.body).to.equal("");
            
            await store.delete("path/to/doc11");
            var doc = await store.read("/path/to/doc11");
            expect(doc.body).to.equal("");
            
            var containerDoc = await store.read("/path/to/");
            var context = containerDoc.createContext();
            var docVal = await containerDoc.evaluate(context);    
            expect(docVal.subPaths.sort()).to.deep.equal([
                "container1/doc4",
                "container2/doc5",
                "container3/container4/doc12",
                "doc1",
                "doc2",
                "doc3",
            ]);                
        });            

        it("should remove also the container if it become empty", async () => {    
            var doc = await store.read("/path/to/container3/container4/doc12");
            expect(doc.body).to.equal("doc12 body");
            
            await store.delete("/path/to/container3/container4/doc12");
            var doc = await store.read("/path/to/container3/container4/doc12");
            expect(doc.body).to.equal("");
            
            var containerDoc = await store.read("/path/to/");
            var context = containerDoc.createContext();
            var docVal = await containerDoc.evaluate(context);    
            expect(docVal.subPaths.sort()).to.deep.equal([
                "container1/doc4",
                "container2/doc5",
                "doc1",
                "doc2",
                "doc3",
            ]);                
        });

    });
    
    describe(`Store.prototype.delete(containerPath) - async method`, () => {
        
        it("should remove the given container and its content", async () => {
            await store.write("/path/to/container1/doc41", "doc41 body");
            await store.write("/path/to/container1/doc42", "doc42 body");
            
            // verify current situation
            var containerDoc = await store.read("/path/to/");
            var context = containerDoc.createContext();
            var docVal = await containerDoc.evaluate(context);    
            expect(docVal.subPaths.sort()).to.deep.equal([
                "container1/doc4",
                "container1/doc41",
                "container1/doc42",
                "container2/doc5",
                "doc1",
                "doc2",
                "doc3",
            ]);                

            // delete container1
            await store.delete("/path/to/container1/");

            var containerDoc = await store.read("/path/to/");
            var context = containerDoc.createContext();
            var docVal = await containerDoc.evaluate(context);    
            expect(docVal.subPaths.sort()).to.deep.equal([
                "container2/doc5",
                "doc1",
                "doc2",
                "doc3",
            ]);                
        });

        it("should fail silently if the the given path doesn't exist", async () => {
            
            // verify current situation
            var containerDoc = await store.read("/path/to/");
            var context = containerDoc.createContext();
            var docVal = await containerDoc.evaluate(context);    
            expect(docVal.subPaths.sort()).to.deep.equal([
                "container2/doc5",
                "doc1",
                "doc2",
                "doc3",
            ]);                

            // delete container1
            await store.delete("/path/to/container1/");

            var containerDoc = await store.read("/path/to/");
            var context = containerDoc.createContext();
            var docVal = await containerDoc.evaluate(context);    
            expect(docVal.subPaths.sort()).to.deep.equal([
                "container2/doc5",
                "doc1",
                "doc2",
                "doc3",
            ]);                
        });
    });
}
