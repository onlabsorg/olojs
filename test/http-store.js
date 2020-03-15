const expect = require("chai").expect;

var HTTPStore = require("../lib/environment/http-store");
var FSStore = require("../lib/environment/fs-store");

var express = require("express");

var initStore = require("./init-fs-store");
var ROOT_PATH = `${__dirname}/fs-store`;

var startServer = require("./serve-store");
var port = 8888;

var testStore = require("./store");

describe("load = HTTPStore.createLoader(url, options)", () => {
    var server, store;
    
    before(async () => {
        var fsStore = new FSStore(ROOT_PATH);
        server = await startServer(fsStore, port);
    });
    
    testStore(async function (content) {
        await initStore(ROOT_PATH, content);
        store = new HTTPStore(`http://localhost:${port}`);
        return store;
    });

    describe("access control", () => {
        
        it("should throw HTTPStore.ReadAccessDeniedError on 403 GET responses", async () => {
            try {
                await store.read("/private/path/to/doc");
                throw new Error("it didn't throw")
            } catch (error) {
                expect(error).to.be.instanceof(HTTPStore.ReadAccessDeniedError);
            } 
        });

        it("should throw HTTPStore.WriteAccessDeniedError on 403 PUT responses", async () => {
            try {
                await store.write("/private/path/to/doc", "xxx");
                throw new Error("it didn't throw")
            } catch (error) {
                expect(error).to.be.instanceof(HTTPStore.WriteAccessDeniedError);
            } 
        });

        it("should throw HTTPStore.WriteAccessDeniedError on 403 DELETE responses", async () => {
            try {
                await store.delete("/private/path/to/doc");
                throw new Error("it didn't throw")
            } catch (error) {
                expect(error).to.be.instanceof(HTTPStore.WriteAccessDeniedError);
            } 
        });
    });
    
    
    after(async () => {
        await server.close();
    });
});
