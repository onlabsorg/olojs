const expect = require("chai").expect;

const URI = require("../lib/uri");
const Document = require("../lib/document");
const Store = require("../lib/store");
const FlatBackend = require("../lib/backends/flat-backend");

async function createStore (content) {
    const map = new Map();
    for (let path in content) {
        map.set(path, content[path]);
    }
    const backend = new FlatBackend( map );
    const store = new Store("//test-store/", backend);
    return store;
}

describe("FlatStore", () => {
    const test = require("./store");
    test(createStore);
    
    describe("document presets", () => {
        it("should add the presets to the namespace if returned by the backend", async () => {
            var map = new Map();
            map.set("/path/to/doc", {
                presets: {x:10, y:20, z:30},
                body: "doc body"            
            });
            var backend = new FlatBackend( map );
            var store = new Store("//test-store/", backend);
            
            var doc = await store.read("/path/to/doc");
            expect(doc).to.be.instanceof(Document);
            expect(doc.uri).to.be.instanceof(URI);
            expect(String(doc.uri)).to.equal(String(store.uri) + "path/to/doc");
            expect(doc.presets).to.deep.equal({x:10, y:20, z:30});
            expect(doc.body).to.be.equal("doc body");
            
            var context = doc.createContext();
            expect(context.x).to.equal(10);
            expect(context.y).to.equal(20);
            expect(context.z).to.equal(30);
            
            var docVal = await doc.evaluate(context);
            expect(docVal.x).to.equal(10);
            expect(docVal.y).to.equal(20);
            expect(docVal.z).to.equal(30);
            expect(await docVal.URI.__text__()).to.equal(String(store.uri) + "path/to/doc");            
        });        
    });
});
