// Run test:
// $ node test/http-store-server
// $ mocha test/http-store-client

require("isomorphic-fetch");

const expect = require("chai").expect;

const fs = require("fs");
const rimraf = require("rimraf");

const FSBackend = require("../lib/backends/fs-backend");
const ROOT_PATH = `${__dirname}/fs-store`;

const HTTPBackendClient = require("../lib/backends/http-backend-client");
const Store = require("../lib/store");
const STORE_URL = `http://localhost:8888/store/`;

const errors = require("../lib/errors");

async function createStore (content) {
    const backend = new FSBackend(ROOT_PATH);
    const httpBackend = new HTTPBackendClient(STORE_URL, {auth:"Bearer Writer"}); 
    const store = new Store(STORE_URL, httpBackend);
    
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
        await backend.put(path, content[path]);
    }
    
    return store;
}

describe("HTTPStore", () => {
    
    const test = require("./store");
    test(createStore);    
        
    describe("access control: read-only", () => {
        var store;
        
        before(() => {
            var backend = new FSBackend(ROOT_PATH);
            var httpBackend = new HTTPBackendClient(STORE_URL, {auth:"Bearer Reader"}); 
            store = new Store(STORE_URL, httpBackend);            
        });
        
        it("should throw 'errors.WriteAccessDenied' when trying to write a resource", async () => {
            try {
                await store.write("/path/to/doc1", "doc1 new body");
                throw new Error("it didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.WriteAccessDenied);
            }
            var doc1 = await store.read("/path/to/doc1");
            expect(doc1.body).to.equal("doc1 body");
        });

        it("should throw 'errors.WriteAccessDenied' when trying to delete a resource", async () => {
            try {
                await store.delete("/path/to/doc1");
                throw new Error("it didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.WriteAccessDenied);
            }
            var doc1 = await store.read("/path/to/doc1");
            expect(doc1.body).to.equal("doc1 body");
        });
    });

    describe("access control: private", () => {
        var store;
        
        before(() => {
            var backend = new FSBackend(ROOT_PATH);
            var httpBackend = new HTTPBackendClient(STORE_URL, {auth:"Bearer None"}); 
            store = new Store(STORE_URL, httpBackend);            
        });
        
        it("should throw 'errors.ReadAccessDenied' when trying to read a document", async () => {
            try {
                var doc1 = await store.read("/path/to/doc1");
                throw new Error("it didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.ReadAccessDenied);
            }
        });

        it("should throw 'errors.ReadAccessDenied' when trying to list a container", async () => {
            try {
                var doc1 = await store.read("/path/to/");
                throw new Error("it didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.ReadAccessDenied);
            }
        });

        it("should throw 'errors.WriteAccessDenied' when trying to write a resource", async () => {
            try {
                await store.write("/path/to/doc1", "doc1 new body");
                throw new Error("it didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.WriteAccessDenied);
            }
        });

        it("should throw 'errors.WriteAccessDenied' when trying to delete a resource", async () => {
            try {
                await store.delete("/path/to/doc1");
                throw new Error("it didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.WriteAccessDenied);
            }
        });
    });
});
