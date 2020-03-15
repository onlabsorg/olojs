const expect = require("chai").expect;

var HTTPStore = require("../lib/environment/http-store");
var FSStore = require("../lib/environment/fs-store");

var express = require("express");

var initStore = require("./init-fs-store");
var ROOT_PATH = `${__dirname}/fs-store`;

var startServer = require("./serve-store");
var port = 8888;

var testLoader = require("./loader");

describe("load = HTTPStore.createReader(url, options)", () => {
    var server, loader;
    
    before(async () => {
        var fsStore = new FSStore(ROOT_PATH);
        server = await startServer(fsStore, port);
    });
    
    testLoader(async function (content) {
        await initStore(ROOT_PATH, content);
        loader = HTTPStore.createReader(`http://localhost:${port}`);
        return loader;
    });
    
    describe("access control", () => {
        
        it("should throw HTTPStore.ReadAccessDeniedError on 403 GET responses", async () => {
            try {
                await loader("/private/path/to/doc");
                throw new Error("it didn't throw")
            } catch (error) {
                expect(error).to.be.instanceof(HTTPStore.ReadAccessDeniedError);
            } 
        });
    });
    
    after(async () => {
        await server.close();
    });
});
