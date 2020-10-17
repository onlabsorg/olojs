
var expect = require("chai").expect;
var rimraf = require("rimraf");
var mkdirp = require("mkdirp");
var fs = require("fs");
var errors = require("../lib/stores/store-errors");

var ROOT_PATH = `${__dirname}/fs-store`;






describe("HTTPStore", () => {
    var server;
    var FileStore = require("../lib/stores/file");
    var fileStore = new FileStore(ROOT_PATH);
    var HTTPStore = require("../lib/stores/http");
    var TestHeader;
    
    before((done) => {
        initStore(ROOT_PATH);
        
        var express = require("express");
        var bodyParser = require("body-parser");
        var app = express();
        app.all( "/private/*", (req, res, next) => {
            res.status(403).send(`Permission denied for access to document at ${req.path}`);
        });      
        app.all( "/hidden/*", (req, res, next) => {
            res.status(405).send(`Operation not define for document at ${req.path}`);
        });                        
        app.all( "/error/*", (req, res, next) => {
            res.status(500).send(`An error occurred while retrieving the document at ${req.path}`);
        });
        app.all( "/echo-hdr/*", (req, res, next) => {
            TestHeader = req.get('Test');
            res.status(200).send();
        })
        app.delete( "*", async (req, res, next) => {
            await fileStore.delete(req.path);
            res.status(200).send();
        });
        app.use(bodyParser.text({
            type: "text/*"
        }));    
        app.put( "*", async (req, res, next) => {
            await fileStore.set(req.path, req.body);
            res.status(200).send();
        });
        app.use( express.static(ROOT_PATH) );
        server = app.listen(8010, done);
    });
    
    describe("source = await httpStore.get(path)", () => {
        
        it("should return the content of the files fetched via HTTP", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            var doc = await httpStore.get("/path/to/doc2.olo");
            expect(doc).to.be.equal("doc2 @ /path/to/");            
        });
        
        it("should throw a PermissionDenied error if the response status is 403", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.get("/private/path/to/doc");
                throw new NoError("It did not throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.PermissionDenied);
                expect(error.message).to.equal("Permission denied: GET http://localhost:8010/private/path/to/doc");
            }
        });

        it("should return an empty string if the response status is 404", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            var doc = await httpStore.get("/path/to/non/existing/file");
            expect(doc).to.equal("");
        });

        it("should throw an OperationNotAllowed error if the response status is 405", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.get("/hidden/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.be.instanceof(errors.OperationNotAllowed);
                expect(error.message).to.equal("Operation not allowed: GET http://localhost:8010/hidden/path/to/doc");
            }
        });

        it("should throw an error if the response code is not 2xx", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.get("/error/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.not.be.instanceof(NoError);
                expect(error.message).to.equal("An error occurred while retrieving the document at /error/path/to/doc");
            }
        });
    });        
    
    describe("await httpStore.set(path, source)", () => {
        
        it("should change the source of the file at the given http url", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            expect(await fileStore.get(`/path/to/doc1`)).to.equal("doc1 @ /path/to/");
            await httpStore.set(`/path/to/doc1`, "new doc1 @ /path/to/");
            expect(await fileStore.get(`/path/to/doc1`)).to.equal("new doc1 @ /path/to/");
        });
        
        it("should throw a PermissionDenied error if the response status is 403", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.set("/private/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.be.instanceof(errors.PermissionDenied);
                expect(error.message).to.equal("Permission denied: SET http://localhost:8010/private/path/to/doc");
            }
        });

        it("should throw an OperationNotAllowed error if the response status is 405", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.set("/hidden/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.be.instanceof(errors.OperationNotAllowed);
                expect(error.message).to.equal("Operation not allowed: SET http://localhost:8010/hidden/path/to/doc");
            }
        });

        it("should throw an error if the response code is not 2xx", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.set("/error/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.not.be.instanceof(NoError);
                expect(error.message).to.equal("An error occurred while retrieving the document at /error/path/to/doc");
            }
        });
    });
    
    describe("await httpStore.delete(path)", () => {
        
        it("should remove the file at the given url path", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.true;
            await httpStore.delete(`/path/to/doc1`);
            expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.false;
            expect(await fileStore.get(`/path/to/doc1`)).to.equal("");
        });
        
        it("should throw a PermissionDenied error if the response status is 403", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.delete("/private/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.be.instanceof(errors.PermissionDenied);
                expect(error.message).to.equal("Permission denied: DELETE http://localhost:8010/private/path/to/doc");
            }
        });

        it("should throw an OperationNotAllowed error if the response status is 405", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.delete("/hidden/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.be.instanceof(errors.OperationNotAllowed);
                expect(error.message).to.equal("Operation not allowed: DELETE http://localhost:8010/hidden/path/to/doc");
            }
        });

        it("should throw an error if the response code is not 2xx", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.delete("/error/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.not.be.instanceof(NoError);
                expect(error.message).to.equal("An error occurred while retrieving the document at /error/path/to/doc");
            }
        });
    });
    
    describe("custom headers", () => {
        
        it("should add the options.headers to each GET requst", async () => {
            var customHeaders = {
                Test: "test GET header"
            };
            var httpStore = new HTTPStore("http://localhost:8010", {headers:customHeaders});                
            TestHeader = null;
            await httpStore.get('/echo-hdr/path/to/doc');
            expect(TestHeader).to.equal(customHeaders.Test);
        });
        
        it("should add the options.headers to each SET requst", async () => {
            var customHeaders = {
                Test: "test SET header"
            };
            var httpStore = new HTTPStore("http://localhost:8010", {headers:customHeaders});                
            TestHeader = null;
            await httpStore.set('/echo-hdr/path/to/doc', "...");
            expect(TestHeader).to.equal(customHeaders.Test);
        });
        
        it("should add the options.headers to each DELETE requst", async () => {
            var customHeaders = {
                Test: "test DELETE header"
            };
            var httpStore = new HTTPStore("http://localhost:8010", {headers:customHeaders});                
            TestHeader = null;
            await httpStore.delete('/echo-hdr/path/to/doc');
            expect(TestHeader).to.equal(customHeaders.Test);                
        });
    });

    after(() => {
        server.close();
    });
});    








async function initStore (rootPath) {
    rimraf.sync(`${rootPath}`);
    mkdirp.sync(`${rootPath}/path/to`);
    fs.writeFileSync(`${rootPath}/doc1.olo`, "doc1 @ /", 'utf8');
    fs.writeFileSync(`${rootPath}/doc2.olo`, "doc2 @ /", 'utf8');
    fs.writeFileSync(`${rootPath}/doc3.olo`, "doc3 @ /", 'utf8');
    fs.writeFileSync(`${rootPath}/path/to/.olo`, ".olo @ /path/to/", 'utf8');
    fs.writeFileSync(`${rootPath}/path/to/doc1.olo`, "doc1 @ /path/to/", 'utf8');
    fs.writeFileSync(`${rootPath}/path/to/doc2.olo`, "doc2 @ /path/to/", 'utf8');
    fs.writeFileSync(`${rootPath}/path/to/doc3.olo`, "doc3 @ /path/to/", 'utf8');
}
