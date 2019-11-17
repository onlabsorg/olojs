const expect = require("chai").expect;

const FlatBackend = require("../lib/backends/flat-backend");
const Document = require("../lib/document");
const Store = require("../lib/store");
const Hub = require("../lib/hub");
const errors = require("../lib/errors");

class TestStore extends Store {
    
    constructor (uri) {
        const backend = new FlatBackend( new Map() );
        super(uri, backend);
    }
    
    async read (path) {
        this.lastOp = {
            type: "read",
            path: path
        }
        return await super.read(path);
    }

    async write (path, data) {
        this.lastOp = {
            type: "write",
            path: path,
            data: data
        }
        await super.write(path, data);
    }

    async delete (path) {
        this.lastOp = {
            type: "delete",
            path: path
        }
        await super.delete(path);
    }
}

describe("Hub", () => {
    
    describe("Hub.prototype.read(uri) - async method", () => {
        
        it("should delegate to the proper mounted store's `read` method", async () => {
            var store1 = new TestStore("//test-store-1");
            var store2 = new TestStore("//test-store-2");
            var hub = new Hub(store1, store2)
            var doc = await hub.read("//test-store-2/path/to/doc");
            expect(String(doc.uri)).to.equal("//test-store-2/path/to/doc");
            expect(store1.lastOp).to.be.undefined;
            expect(store2.lastOp).to.deep.equal({
                type: "read",
                path: "/path/to/doc"
            });
        });
        
        it("should add the `import` function to the document presets", async () => {
            var store1 = new TestStore("map://test-store-1");
            var store2 = new TestStore("map://test-store-2");
            var hub = new Hub(store1, store2)

            await store1.write("/path/to/doc1", `<% doc2 = import("./doc2") %>`);
            await store1.write("/path/to/doc2", "Document 2");

            var doc1 = await hub.read("map://test-store-1/path/to/doc1");
            var context = doc1.createContext();
            var doc1Val = await doc1.evaluate(context);
            expect(String(doc1Val.doc2)).to.equal("Document 2");
            
            await store1.write("/path/to/doc3", `<% doc4 = import("map://test-store-2/path/to/doc4") %>`);
            await store2.write("/path/to/doc4", "Document 4");
            
            var doc3 = await hub.read("map://test-store-1/path/to/doc3");
            var context = doc1.createContext();
            var doc3Val = await doc3.evaluate(context);
            expect(String(doc3Val.doc4)).to.equal("Document 4");
        });        

        it("should throw an error if no mounted store matches the uri", async () => {
            var store1 = new TestStore("map://test-store-1");
            var store2 = new TestStore("map://test-store-2");
            var hub = new Hub(store1, store2)
            try {
                var doc = await hub.read("map://test-store-3/path/to/doc");
                throw new Error("It didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.UnknownStore);
            }
        });
    });
    
    describe("Hub.prototype.write(path, source) - async method", () => {
        
        it("should delegate to the proper mounted store's `write` method", async () => {
            var store1 = new TestStore("//test-store-1");
            var store2 = new TestStore("//test-store-2");
            var hub = new Hub(store1, store2)
            await hub.write("//test-store-2/path/to/doc", "doc body");
            expect(store1.lastOp).to.be.undefined;
            expect(store2.lastOp).to.deep.equal({
                type: "write",
                path: "/path/to/doc",
                data: "doc body"
            });
            
            var doc = await store2.read("/path/to/doc");
            expect(doc.body).to.equal("doc body");
        });    

        it("should throw an error if no mounted store matches the uri", async () => {
            var store1 = new TestStore("map://test-store-1");
            var store2 = new TestStore("map://test-store-2");
            var hub = new Hub(store1, store2)
            try {
                await hub.write("map://test-store-3/path/to/doc", "doc body");
                throw new Error("It didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.UnknownStore);
            }
        });
    });
    
    describe("Hub.prototype.delete(path) - async method", () => {
        
        it("should delegate to the proper mounted store's `write` method", async () => {
            var store1 = new TestStore("//test-store-1");
            var store2 = new TestStore("//test-store-2");
            var hub = new Hub(store1, store2)
            
            await store2.write("/path/to/doc", "doc body");
            var doc = await store2.read("/path/to/doc");
            expect(doc.body).to.equal("doc body");
            
            await hub.delete("//test-store-2/path/to/doc");
            expect(store1.lastOp).to.be.undefined;
            expect(store2.lastOp).to.deep.equal({
                type: "delete",
                path: "/path/to/doc",
            });            
            var doc = await store2.read("/path/to/doc");
            expect(doc.body).to.equal("");
        });    
        
        it("should fail silentrly if the document or the store doesn't exist", async () => {
            var store1 = new TestStore("//test-store-1");
            var store2 = new TestStore("//test-store-2");
            var hub = new Hub(store1, store2)
            
            var doc = await store2.read("/path/to/doc");
            expect(doc.body).to.equal("");
            
            await hub.delete("//test-store-2/path/to/doc");
            expect(store1.lastOp).to.be.undefined;
            expect(store2.lastOp).to.deep.equal({
                type: "delete",
                path: "/path/to/doc",
            });            
            var doc = await store2.read("/path/to/doc");
            expect(doc.body).to.equal("");
        });

        it("should throw an error if no mounted store matches the uri", async () => {
            var store1 = new TestStore("map://test-store-1");
            var store2 = new TestStore("map://test-store-2");
            var hub = new Hub(store1, store2)
            try {
                await hub.delete("map://test-store-3/path/to/doc", "doc body");
                throw new Error("It didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.UnknownStore);
            }
        });
    });
        
    describe("Hub.prototype.mount(store) - method", () => {
                
        it("shoul add an extra store to the hub", async () => {
            var store1 = new TestStore("//test-store-1");
            var store2 = new TestStore("//test-store-2");
            var hub = new Hub(store1)
            hub.mount(store2);
            
            var doc = await hub.read("//test-store-2/path/to/doc");
            expect(String(doc.uri)).to.equal("//test-store-2/path/to/doc");
            expect(store1.lastOp).to.be.undefined;
            expect(store2.lastOp).to.deep.equal({
                type: "read",
                path: "/path/to/doc"
            });
        });
    });    
    
    describe("Hub.prototype.unmount(name) - method", () => {
        
        it("should remove a store from the hub", async () => {
            var store1 = new TestStore("map://test-store-1");
            var store2 = new TestStore("map://test-store-2");
            var store3 = new TestStore("map://test-store-3");
            var hub = new Hub(store1, store2, store3)
            
            var doc = await hub.read("map://test-store-3/path/to/doc");
            expect(doc).to.be.instanceof(Document);
            hub.unmount("map://test-store-3/");
            try {
                var doc = await hub.read("map://test-store-3/path/to/doc");
                throw new Error("It didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.UnknownStore);
            }

            var doc = await hub.read("map://test-store-2/path/to/doc");
            expect(doc).to.be.instanceof(Document);
            hub.unmount(store2);
            try {
                var doc = await hub.read("map://test-store-2/path/to/doc");
                throw new Error("It didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.UnknownStore);
            }
        });        
    });        
});
