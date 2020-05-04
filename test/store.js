const expect = require("chai").expect;
const document = require("../lib/document");


module.exports = function (createStore) {    
    var store;
    
    before(async () => {
        store = await createStore({
            "/path/to/doc1"             : "doc1 source",
            "/path/to/doc2"             : "doc2 source",
            "/path/to/doc3"             : "doc3 source",
            "/path/to/container1/doc4"  : "doc4 source",
            "/path/to/container2/doc5"  : "doc5 source",
            "/path/TO/doc6"             : "doc6 source",
            "/a/b/c/doc7"               : "doc7 source"
        });
    });
    
    describe(`Store.prototype.read(documentPath) - async method`, () => {
        
        it("should return the document stored at the given path", async () => {
            var doc = await store.read("path/to/doc1");
            expect(doc).to.equal("doc1 source");

            var doc = await store.read("/path/to/doc2");
            expect(doc).to.be.equal("doc2 source");
        });

        it("should return an empty string if the path doesn't exist", async () => {
            var doc = await store.read("/path/to/doc111");
            expect(doc).to.equal("");            
        });
    });        

    describe(`Store.prototype.read(containerPath) - async method`, () => {

        it("should return a document defining the child 'items' list of the container", async () => {
            var source = await store.read("/path/to/");
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
            var source = await store.read("/");
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
            var source = await store.read("/path/to/non-existing/container/");
            var docNS = await document.parse(source)(document.createContext());
            
            expect(docNS.items).to.be.an("array");
            expect(docNS.items.sort()).to.deep.equal([]);
        });            
    });
    
    describe(`Store.prototype.write(documentPath, source) - async method`, () => {

        it("should map the passed document source to the passed path", async () => {
            var docSource = "doc11 source";
            await store.write("/path/to/doc11", docSource);
            var source = await store.read("/path/to/doc11");
            expect(source).to.equal(docSource);
            
            var containerDocSource = await store.read("/path/to/");
            var docNS = await document.parse(containerDocSource)(document.createContext());
            expect(docNS.items.sort()).to.deep.equal([
                "container1/doc4",
                "container2/doc5",
                "doc1",
                "doc11",
                "doc2",
                "doc3",
            ]);
        });
        
        it("should create the intermediate containers if they don't exist", async () => {
            var docSource = "doc12 source";
            await store.write("/path/to/container3/container4/doc12", docSource);
            var source = await store.read("/path/to/container3/container4/doc12");
            expect(source).to.equal(docSource);
            
            var containerDocSource = await store.read("/path/to/");
            var docNS = await document.parse(containerDocSource)(document.createContext());
            expect(docNS.items.sort()).to.deep.equal([
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
    
    describe(`Store.prototype.delete(documentPath) - async method`, () => {
        
        it("should remove the document at the given path", async () => {    
            var docSource = await store.read("/path/to/doc11");
            expect(docSource).to.equal("doc11 source");
            
            await store.delete("path/to/doc11");
            var docSource = await store.read("/path/to/doc11");
            expect(docSource).to.equal("");
            
            var containerDocSource = await store.read("/path/to/");
            var docNS = await document.parse(containerDocSource)(document.createContext());
            expect(docNS.items.sort()).to.deep.equal([
                "container1/doc4",
                "container2/doc5",
                "container3/container4/doc12",
                "doc1",
                "doc2",
                "doc3",
            ]);                
        });

        it("should fail silentrly if the document doesn't exist", async () => {
            var docSource = await store.read("/path/to/doc11");
            expect(docSource).to.equal("");
            
            await store.delete("path/to/doc11");
            var docSource = await store.read("/path/to/doc11");
            expect(docSource).to.equal("");
            
            var containerDocSource = await store.read("/path/to/");
            var docNS = await document.parse(containerDocSource)(document.createContext());
            expect(docNS.items.sort()).to.deep.equal([
                "container1/doc4",
                "container2/doc5",
                "container3/container4/doc12",
                "doc1",
                "doc2",
                "doc3",
            ]);                
        });            

        it("should remove also the container if it become empty", async () => {    
            var docSource = await store.read("/path/to/container3/container4/doc12");
            expect(docSource).to.equal("doc12 source");
            
            await store.delete("/path/to/container3/container4/doc12");
            var docSource = await store.read("/path/to/container3/container4/doc12");
            expect(docSource).to.equal("");
            
            var containerDocSource = await store.read("/path/to/");
            var docNS = await document.parse(containerDocSource)(document.createContext());
            expect(docNS.items.sort()).to.deep.equal([
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
            await store.write("/path/to/container1/doc41", "doc41 source");
            await store.write("/path/to/container1/doc42", "doc42 source");
            
            // verify current situation
            var containerDocSource = await store.read("/path/to/");
            var docNS = await document.parse(containerDocSource)(document.createContext());
            expect(docNS.items.sort()).to.deep.equal([
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

            var containerDocSource = await store.read("/path/to/");
            var docNS = await document.parse(containerDocSource)(document.createContext());
            expect(docNS.items.sort()).to.deep.equal([
                "container2/doc5",
                "doc1",
                "doc2",
                "doc3",
            ]);                
        });

        it("should fail silently if the the given path doesn't exist", async () => {
            
            // verify current situation
            var containerDocSource = await store.read("/path/to/");
            var docNS = await document.parse(containerDocSource)(document.createContext());
            expect(docNS.items.sort()).to.deep.equal([
                "container2/doc5",
                "doc1",
                "doc2",
                "doc3",
            ]);                

            // delete container1
            await store.delete("/path/to/container1/");

            var containerDocSource = await store.read("/path/to/");
            var docNS = await document.parse(containerDocSource)(document.createContext());
            expect(docNS.items.sort()).to.deep.equal([
                "container2/doc5",
                "doc1",
                "doc2",
                "doc3",
            ]);                
        });
    });

    describe("Store.prototype.append(path, source) - async method", () => {
        
        it("should add a document to the directory path, assigning a timestamp name to it", async () => {
            var docSource = "post source";
            var timeBefore = (new Date()).getTime();
            await store.append("/path/to/posts", docSource);
            var timeAfter = (new Date()).getTime();
            
            var posts = await document.parse(await store.read("/path/to/posts/"))(document.createContext());
            expect(posts.items.length).to.equal(1);
            var postTimestamp = (new Date(posts.items[0])).getTime();
            
            expect(timeBefore <= postTimestamp && postTimestamp <= timeAfter).to.be.true;
            
            expect(await store.read(`/path/to/posts/${posts.items[0]}`)).to.equal(docSource);
        });        
        
        it("should do nothing if the source is an empty string", async () => {
            await store.append("/path/to/posts", "");
            var posts = await document.parse(await store.read("/path/to/posts/"))(document.createContext());
            expect(posts.items.length).to.equal(1);
        });
    });
}
