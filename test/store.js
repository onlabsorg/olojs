const expect = require("chai").expect;

const expression = require("../lib/expression");
const document = require("../lib/document");
const Store = require("../lib/store");

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

    describe(`doc = await ${storeName}.prototype.load(documentPath)`, () => {
    
        it("should return a Store.Document instance", async () => {
            var doc = await store.load("/path/to/doc1");
            expect(doc).to.be.instanceof(Store.Document);
        });
        
        describe("context = doc.createContext(globals)", () => {
            
            it("should create an expression context containing the names defined in `globals`", async () => {
                var doc = await store.load("/path/to/doc1");
                var ctx = doc.createContext({a:1, b:2});                
                expect(await expression.evaluate("a+b", ctx)).to.equal(3);
            });

            it("should create an expression context containing the document id as namespace", async () => {
                var doc = await store.load("/path/to/doc1");
                var ctx = doc.createContext();      
                var id = await expression.evaluate("ID", ctx);
                expect(id.path).to.equal("/path/to/doc1");
                expect(id).to.deep.equal(doc.id.toNamespace());
            });

            it("should create an expression context containing the `import(id)` function", async () => {
                await store.write("/path/to/doc8", `<%n = "doc8"%>`)
                await store.write("/path/to/doc9", `<%n = "doc9"%>`)
                var doc1 = await store.load("/path/to/doc8");
                var ctx = doc1.createContext();                
                expect(await expression.evaluate("(import('./doc9')).n", ctx)).to.equal("doc9");
            });
        });
        
        describe("content = await doc.render(context)", () => {
            
            it("should return the rendered content of the document", async () => {
                await store.write("/path/to/doc", `<%description%> <%p = ID.path%><%p%>`)
                var doc = await store.load("/path/to/doc");
                var context = doc.createContext({description: "Document path:"});             
                var content = await doc.render(context);
                expect(content).to.be.instanceof(document.Content);
                expect(content.get("p")).to.equal("/path/to/doc");
                expect(String(content)).to.equal("Document path: /path/to/doc");
            });
        });
        
        describe("doc.source = newSource", () => {
            
            it("should modify the document source", async () => {
                await store.write("/path/to/doc", "Doc content <% ver %>")
                
                var doc = await store.load("/path/to/doc");
                expect(doc.source).to.equal("Doc content <% ver %>");
                var context = doc.createContext({ver: 1});             
                var content = await doc.render(context);
                expect(String(content)).to.equal("Doc content 1");

                doc.source = "Doc content <% ver+1 %>"
                expect(doc.source).to.equal("Doc content <% ver+1 %>");
                content = await doc.render(context);
                expect(String(content)).to.equal("Doc content 2");
            });
        });
        
        describe("await doc.save()", () => {
            
            it("should call the write method of the parent router, passing the doc id as path and the doc source", async () => {
                await store.write("/path/to/doc", "Doc content 1")
                
                var doc = await store.load("/path/to/doc");
                expect(doc.source).to.equal("Doc content 1");

                doc.source = "Doc content 2";
                await doc.save();
                var doc2 = await store.load("/path/to/doc");
                expect(doc2.source).to.equal("Doc content 2");
            });
        });
    });
}
