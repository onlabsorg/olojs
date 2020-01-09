``// Run test:
// $ node test/http-store-server
// $ mocha test/http-store-client

require("isomorphic-fetch");

const expect = require("chai").expect;

const fs = require("fs");
const rimraf = require("rimraf");

const FSStore = require("../lib/stores/fs-store");
const ROOT_PATH = `${__dirname}/fs-store`;

const HTTPStoreClient = require("../lib/stores/http-store-client");
const STORE_URL = `http://localhost:8888/store/`;

async function createStore (content, globals) {
    const backend = new FSStore(ROOT_PATH);
    
    // clear the store
    await new Promise((resolve, reject) => {
        rimraf(`${ROOT_PATH}`, (err) => {
            if (err) reject(err);
            else resolve();
        })
    });
    
    fs.mkdirSync(ROOT_PATH);
    
    // create all the listed documents
    for (let path in content) {
        await backend.write(path, content[path]);
    }
    
    return new HTTPStoreClient(STORE_URL, {auth:"Bearer Writer"}, globals);
}

class DidNotThrow extends Error {}

describe("HTTPStore", () => {
    
    const test = require("./store");
    test("HTTPStore", createStore);    
        
    describe("access control: read-only", () => {
        var store;
        
        before(() => {
            var backend = new FSStore(ROOT_PATH);
            store = new HTTPStoreClient(STORE_URL, {auth:"Bearer Reader"}); 
        });
        
        it("should throw an error when trying to write a resource", async () => {
            try {
                await store.write("/path/to/doc1", "doc1 new body");
                throw new DidNotThrow();
            } catch (error) {
                expect(error).to.not.be.instanceof(DidNotThrow);
                expect(error.message).to.equal("Write access denied to http://localhost:8888/store/path/to/doc1");
            }
            var doc1 = await store.read("/path/to/doc1");
            expect(doc1).to.equal("doc1 body");
        });
    });

    describe("access control: private", () => {
        var store;
        
        before(() => {
            var backend = new FSStore(ROOT_PATH);
            store = new HTTPStoreClient(STORE_URL, {auth:"Bearer None"}); 
        });
        
        it("should throw an error when trying to read a document", async () => {
            try {
                await store.read("/path/to/doc1", "doc1 new body");
                throw new DidNotThrow();
            } catch (error) {
                expect(error).to.not.be.instanceof(DidNotThrow);
                expect(error.message).to.equal("Read access denied to http://localhost:8888/store/path/to/doc1");
            }
        });

        it("should throw an error when trying to write a resource", async () => {
            try {
                await store.write("/path/to/doc1", "doc1 new body");
                throw new DidNotThrow();
            } catch (error) {
                expect(error).to.not.be.instanceof(DidNotThrow);
                expect(error.message).to.equal("Write access denied to http://localhost:8888/store/path/to/doc1");
            }
        });
    });
});
