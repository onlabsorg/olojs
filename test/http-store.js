
var expect = require("chai").expect;
var rimraf = require("rimraf");
var mkdirp = require("mkdirp");
var fs = require("fs");

var ROOT_PATH = `${__dirname}/fs-store`;






describe("HTTPStore", () => {
    var server;
    var FileStore = require("../lib/file-store");
    var fileStore = new FileStore(ROOT_PATH);
    var HTTPStore = require("../lib/http-store");
    var TestHeader;

    before((done) => {
        initStore(ROOT_PATH);

        var express = require("express");
        var bodyParser = require("body-parser");
        var app = express();
        app.all("/private/*", (req, res, next) => {
            res.status(403).send(`Permission denied for access to document at ${req.path}`);
        });
        app.all("/hidden/*", (req, res, next) => {
            res.status(405).send(`Operation not define for document at ${req.path}`);
        });
        app.all("/error/*", (req, res, next) => {
            res.status(500).send(`An error occurred while retrieving the document at ${req.path}`);
        });
        app.all("/echo-hdr/*", (req, res, next) => {
            TestHeader = req.get('Test');
            res.status(200).send();
        })
        app.get("*", async (req, res, next) => {
            if (req.accepts('application/json')) {
                res.status(200).json(await fileStore.list(req.path));
            } else {
                res.status(200).send(await fileStore.read(req.path))
            }
        });
        app.delete("*", async (req, res, next) => {
            try {
                if (req.get('Content-Type') === `text/directory`) {
                    await fileStore.deleteAll(req.path);
                } else {
                    await fileStore.delete(req.path);
                }
                res.status(200).send();
            } catch (e) {
                res.status(500).send(e.message);
            }
        });
        app.use(bodyParser.text({
            type: "text/*"
        }));
        app.put("*", async (req, res, next) => {
            await fileStore.write(req.path, req.body);
            res.status(200).send();
        });
        app.use(express.static(ROOT_PATH) );
        server = app.listen(8010, done);
    });

    describe("source = await httpStore.read(path)", () => {

        it("should return the content of the files fetched via HTTP", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            var doc = await httpStore.read("/path/to/doc2");
            expect(doc).to.be.equal("doc2 @ /path/to/");

            var httpStore2 = new HTTPStore("http:/");
            var doc = await httpStore2.read("/localhost:8010/path/to/doc3");
            expect(doc).to.be.equal("doc3 @ /path/to/");
        });

        it("should throw a ReadPermissionDeniedError if the response status is 403", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.read("/private/path/to/doc");
                throw new NoError("It did not throw");
            } catch (error) {
                expect(error).to.be.instanceof(HTTPStore.ReadPermissionDeniedError);
                expect(error.message).to.equal("Permission denied: READ http://localhost:8010/private/path/to/doc");
            }
        });

        it("should return an empty string if the response status is 404", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            var doc = await httpStore.read("/path/to/non/existing/file");
            expect(doc).to.equal("");
        });

        it("should throw an ReadOperationNotAllowedError if the response status is 405", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.read("/hidden/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.be.instanceof(HTTPStore.ReadOperationNotAllowedError);
                expect(error.message).to.equal("Operation not allowed: READ http://localhost:8010/hidden/path/to/doc");
            }
        });

        it("should throw an error if the response code is not 2xx", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.read("/error/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.not.be.instanceof(NoError);
                expect(error.message).to.equal("An error occurred while retrieving the document at /error/path/to/doc");
            }
        });
    });

    describe("source = await httpStore.list(path)", () => {

        it("should return the list of the entries under the given path", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            var entries = await httpStore.list("/path/to/");
            expect(entries).to.be.an("array");
            expect(entries.sort()).to.deep.equal(["", "dir/", "doc1", "doc2", "doc3"]);
        });

        it("should throw a ReadPermissionDeniedError if the response status is 403", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.list("/private/path/to/doc");
                throw new NoError("It did not throw");
            } catch (error) {
                expect(error).to.be.instanceof(HTTPStore.ReadPermissionDeniedError);
                expect(error.message).to.equal("Permission denied: READ http://localhost:8010/private/path/to/doc");
            }
        });

        it("should return an empty array if the response status is 404", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            var entries = await httpStore.list("/path/to/non/existing/file");
            expect(entries).to.deep.equal([]);
        });

        it("should throw a ReadOperationNotAllowedError if the response status is 405", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.list("/hidden/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.be.instanceof(HTTPStore.ReadOperationNotAllowedError);
                expect(error.message).to.equal("Operation not allowed: READ http://localhost:8010/hidden/path/to/doc");
            }
        });

        it("should throw an error if the response code is not 2xx", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.list("/error/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.not.be.instanceof(NoError);
                expect(error.message).to.equal("An error occurred while retrieving the document at /error/path/to/doc");
            }
        });
    });

    describe("await httpStore.write(path, source)", () => {

        it("should change the source of the file at the given http url", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            expect(await fileStore.read(`/path/to/doc1`)).to.equal("doc1 @ /path/to/");
            await httpStore.write(`/path/to/doc1`, "new doc1 @ /path/to/");
            expect(await fileStore.read(`/path/to/doc1`)).to.equal("new doc1 @ /path/to/");
        });

        it("should throw a WritePermissionDeniedError if the response status is 403", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.write("/private/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.be.instanceof(HTTPStore.WritePermissionDeniedError);
                expect(error.message).to.equal("Permission denied: WRITE http://localhost:8010/private/path/to/doc");
            }
        });

        it("should throw a WriteOperationNotAllowedError if the response status is 405", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.write("/hidden/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.be.instanceof(HTTPStore.WriteOperationNotAllowedError);
                expect(error.message).to.equal("Operation not allowed: WRITE http://localhost:8010/hidden/path/to/doc");
            }
        });

        it("should throw an error if the response code is not 2xx", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.write("/error/path/to/doc");
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
            expect(await fileStore.read(`/path/to/doc1`)).to.equal("");
        });

        it("should throw a WritePermissionDeniedError if the response status is 403", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.delete("/private/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.be.instanceof(HTTPStore.WritePermissionDeniedError);
                expect(error.message).to.equal("Permission denied: WRITE http://localhost:8010/private/path/to/doc");
            }
        });

        it("should throw an WriteOperationNotAllowedError if the response status is 405", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.delete("/hidden/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.be.instanceof(HTTPStore.WriteOperationNotAllowedError);
                expect(error.message).to.equal("Operation not allowed: WRITE http://localhost:8010/hidden/path/to/doc");
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

    describe("await httpStore.deleteAll(path)", () => {

        it("should remove the directory at the given url path", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            expect(fs.existsSync(`${ROOT_PATH}/path/to/dir`)).to.be.true;
            expect(fs.statSync(`${ROOT_PATH}/path/to/dir`).isDirectory()).to.be.true;
            expect(await httpStore.read(`/path/to/dir/doc1`)).to.equal("doc1 @ /path/to/dir/");
            await httpStore.deleteAll(`/path/to/dir`);
            expect(fs.existsSync(`${ROOT_PATH}/path/to/dir`)).to.be.false;
            expect(await httpStore.read(`/path/to/dir/doc1`)).to.equal("");
        });

        it("should throw a WritePermissionDeniedError if the response status is 403", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.deleteAll("/private/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.be.instanceof(HTTPStore.WritePermissionDeniedError);
                expect(error.message).to.equal("Permission denied: WRITE http://localhost:8010/private/path/to/doc");
            }
        });

        it("should throw an WriteOperationNotAllowedError if the response status is 405", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.deleteAll("/hidden/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.be.instanceof(HTTPStore.WriteOperationNotAllowedError);
                expect(error.message).to.equal("Operation not allowed: WRITE http://localhost:8010/hidden/path/to/doc");
            }
        });

        it("should throw an error if the response code is not 2xx", async () => {
            var httpStore = new HTTPStore("http://localhost:8010");
            class NoError extends Error {};
            try {
                await httpStore.deleteAll("/error/path/to/doc");
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
            await httpStore.read('/echo-hdr/path/to/doc');
            expect(TestHeader).to.equal(customHeaders.Test);
        });

        it("should add the options.headers to each SET requst", async () => {
            var customHeaders = {
                Test: "test SET header"
            };
            var httpStore = new HTTPStore("http://localhost:8010", {headers:customHeaders});
            TestHeader = null;
            await httpStore.write('/echo-hdr/path/to/doc', "...");
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
    mkdirp.sync(`${rootPath}/path/to/dir`);
    mkdirp.sync(`${rootPath}/path/to/dir/sub-dir`);
    fs.writeFileSync(`${rootPath}/path/to/dir/doc1.olo`, "doc1 @ /path/to/dir/", 'utf8');
    fs.writeFileSync(`${rootPath}/path/to/dir/doc2.olo`, "doc2 @ /path/to/dir/", 'utf8');
    fs.writeFileSync(`${rootPath}/path/to/dir/doc3.olo`, "doc3 @ /path/to/dir/", 'utf8');
}
