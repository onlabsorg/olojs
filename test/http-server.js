var expect = require("chai").expect;
var fs = require("fs");
var pathlib = require("path");
var document = require("../lib/document");
var Store = require("../lib/store");
var MemoryStore = require("../lib/memory-store");
var Router = require("../lib/router");

var http = require('http');
var express = require('express');
var HTTPServer = require('../lib/http-server');

require("isomorphic-fetch");


describe("HTTPServer", () => {

    describe("Default HTTPServer", () => {
        var homeStore, router, server;

        before((done) => {

            class PrivateStore extends Store {
                read (path) {throw new Store.ReadPermissionDeniedError(path)}
                list (path) {throw new Store.ReadPermissionDeniedError(path)}
                write (path,src) {throw new Store.WritePermissionDeniedError(path)}
                delete (path) {throw new Store.WritePermissionDeniedError(path)}
            }

            class NotAllowedStore extends Store {
                read (path) {throw new Store.ReadOperationNotAllowedError(path)}
                list (path) {throw new Store.ReadOperationNotAllowedError(path)}
                write (path, src) {throw new Store.WriteOperationNotAllowedError(path)}
                delete (path) {throw new Store.WriteOperationNotAllowedError(path)}
            }

            class ErrorStore extends Store {
                read (path) {throw new Error()}
                write (path, src) {throw new Error()}
                delete (path) {throw new Error()}
            }

            homeStore = new MemoryStore();

            router = new Router({
                '/': homeStore,
                '/private/': new PrivateStore(),
                '/hidden/': new NotAllowedStore(),
                '/error/': new ErrorStore(),
            });

            server = HTTPServer.createServer(router);
            server.listen(8888, done);
        });

        describe("HTTP GET /docs/*", () => {

            it("should return the document source mapped to path by the passed loader", async () => {
                var docPath = "/path/to/doc1";
                var docSource = "document source ...";
                await homeStore.write(docPath, docSource);

                var response = await fetch(`http://localhost:8888/docs/${docPath}`, {
                    method: 'get',
                    headers: {
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(200);
                expect(await response.text()).to.equal(docSource);
            });

            it("should return the status code 403 if the backend environment throws ReadPermissionDenied", async () => {
                var response = await fetch(`http://localhost:8888/docs/private/path/to/doc`, {
                    method: 'get',
                    headers: {
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(403);
            });

            it("should return the status code 405 if the backend environment throws Store.ReadOperationNotDefined", async () => {
                var response = await fetch(`http://localhost:8888/docs/hidden/path/to/doc`, {
                    method: 'get',
                    headers: {
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(405);
            });

            it("should return the status code 500 if the backend environment throws a generic error", async () => {
                var response = await fetch(`http://localhost:8888/docs/error/path/to/doc`, {
                    method: 'get',
                    headers: {
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(500);
            });

            it("should respond with the JSON-stringified entries list if the accepted MimeType is `apprication/json`", async () => {
                var docPath = "/path/to/doc1";
                var docSource = "document source ...";
                await homeStore.write(docPath, docSource);

                var response = await fetch(`http://localhost:8888/docs/`, {
                    method: 'get',
                    headers: {
                        'Accept': 'application/json'
                    },
                });
                expect(response.status).to.equal(200);
                expect((await response.json()).sort()).to.deep.equal(['error/', 'hidden/', 'path/', 'private/']);
            });

            it("should return the status code 413 if the accepted MimeType is neither `text/*` nor `application/json`", async () => {
                var response = await fetch(`http://localhost:8888/docs/env/path/to/img`, {
                    method: 'get',
                    headers: {
                        'Accept': 'image/bmp'
                    },
                });
                expect(response.status).to.equal(415);
            });
        });

        describe("HTTP PUT /docs/*", () => {

            it("should modify the resource and return 200", async () => {
                var docPath = "/path/to/doc1";
                var docSource = "document source ...";
                homeStore.write(docPath, docSource);

                var response = await fetch(`http://localhost:8888/docs${docPath}`, {
                    method: 'put',
                    headers: {
                        'Accept': 'text/*',
                        'Content-Type': 'text/plain',
                    },
                    body: "new document source ..."
                });

                expect(response.status).to.equal(200);
                expect(homeStore.read(docPath)).to.equal("new document source ...")
            });

            it("should return the status code 403 if the backend environment throws WritePermissionDenied", async () => {
                var response = await fetch(`http://localhost:8888/docs/private/path/to/doc`, {
                    method: 'put',
                    headers: {
                        'Content-Type': 'text/plain',
                        'Accept': 'text/*'
                    },
                    body: ""
                });
                expect(response.status).to.equal(403);
            });

            it("should return the status code 405 if the backend environment throws WriteOperationNotDefined", async () => {
                var response = await fetch(`http://localhost:8888/docs/hidden/path/to/doc`, {
                    method: 'put',
                    headers: {
                        'Content-Type': 'text/plain',
                        'Accept': 'text/*'
                    },
                    body: ""
                });
                expect(response.status).to.equal(405);
            });

            it("should return the status code 500 if the backend environment throws a generic error", async () => {
                var response = await fetch(`http://localhost:8888/docs/error/path/to/doc`, {
                    method: 'put',
                    headers: {
                        'Content-Type': 'text/plain',
                        'Accept': 'text/*'
                    },
                    body: ""
                });
                expect(response.status).to.equal(500);
            });
        });

        describe("HTTP DELETE /docs/*", () => {

            it("should remove the resource and return 200", async () => {
                var docPath = "/path/to/doc1";
                var docSource = "document source ...";
                homeStore.write(docPath, docSource);

                var response = await fetch(`http://localhost:8888/docs${docPath}`, {
                    method: 'delete',
                    headers: {
                        'Accept': 'text/*',
                        'Content-Type': 'text/plain',
                    },
                });

                expect(response.status).to.equal(200);
                expect(homeStore.read(docPath)).to.equal("");
            });

            it("should remove all the resources matching the path if Content-Type is `text/directory`", async () => {
                await homeStore.write("/path/to/doc1", "doc @ /path/to/doc1");
                await homeStore.write("/path/to/dir/", "doc @ /path/to/dir/");
                await homeStore.write("/path/to/dir/doc2", "doc @ /path/to/dir/doc2");

                expect(await homeStore.read("/path/to/doc1")).to.equal("doc @ /path/to/doc1");
                expect(await homeStore.read("/path/to/dir/")).to.equal("doc @ /path/to/dir/");
                expect(await homeStore.read("/path/to/dir/doc2")).to.equal("doc @ /path/to/dir/doc2");

                var response = await fetch(`http://localhost:8888/docs/path/to/dir`, {
                    method: 'delete',
                    headers: {
                        'Accept': 'text/*',
                        'Content-Type': 'text/directory',
                    },
                });

                expect(response.status).to.equal(200);
                expect(await homeStore.read("/path/to/doc1")).to.equal("doc @ /path/to/doc1");
                expect(await homeStore.read("/path/to/dir/")).to.equal("");
                expect(await homeStore.read("/path/to/dir/doc2")).to.equal("");
            });

            it("should return the status code 403 if the backend environment throws WritePermissionDenied", async () => {
                var response = await fetch(`http://localhost:8888/docs/private/path/to/doc`, {
                    method: 'delete',
                    headers: {
                        'Content-Type': 'text/plain',
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(403);
            });

            it("should return the status code 405 if the backend environment throws WriteOperationNotDefined", async () => {
                var response = await fetch(`http://localhost:8888/docs/hidden/path/to/doc`, {
                    method: 'delete',
                    headers: {
                        'Content-Type': 'text/plain',
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(405);
            });

            it("should return the status code 500 if the backend environment throws a generic error", async () => {
                var response = await fetch(`http://localhost:8888/docs/error/path/to/doc`, {
                    method: 'delete',
                    headers: {
                        'Content-Type': 'text/plain',
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(500);
            });
        });

        describe("HTTP GET /docs/*", async () => {

            it("should return the default index.html page if the path is '/'", async () => {
                var indexHTMLPage = fs.readFileSync(pathlib.resolve(__dirname, "../public/index.html"), "utf8");
                var response = await fetch(`http://localhost:8888/`);
                expect(response.status).to.equal(200);
                expect(await response.text()).to.equal(indexHTMLPage);
            });

            it("should return files from the public path for non `/env/*` GET requests", async () => {
                var indexHTMLPage = fs.readFileSync(pathlib.resolve(__dirname, "../public/index.html"), "utf8");
                var response = await fetch(`http://localhost:8888/index.html`);
                expect(response.status).to.equal(200);
                expect(await response.text()).to.equal(indexHTMLPage);
            });
        });

        after((done) => {
            server.close(done);
        });
    });

    describe("Custom HTTPServer", () => {
        var store, server, customPublicPath;

        before((done) => {
            customPublicPath = pathlib.resolve(__dirname, "./public");
            store = new MemoryStore();

            const beforeMiddleware = express.Router();
            beforeMiddleware.all(`/store/before/*`, (req, res, next) => {
                res.status(200).send(`@before: ${req.method} ${req.path}`);
            });

            const afterMiddleware = express.Router();
            afterMiddleware.all(`/after/*`, (req, res, next) => {
                res.status(200).send(`@after: ${req.method} ${req.path}`);
            });

            server = HTTPServer.createServer(store, {
                before: beforeMiddleware,
                storeRoute: '/store',
                after: afterMiddleware,
                publicPath: customPublicPath
            });

            server.listen(8888, done);
        });

        it("should call the `options.before` middleware at every request", async () => {
            var response = await fetch(`http://localhost:8888/store/before/test`);
            expect(response.status).to.equal(200);
            expect(await response.text()).to.equal("@before: GET /store/before/test");
        });

        it("should delegate to the store middleware if the path starts with `options.storeRoute`", async () => {
            await store.write('/path/to/doc', "Doc @ /path/to/doc");
            var response = await fetch(`http://localhost:8888/store/path/to/doc`);
            expect(response.status).to.equal(200);
            expect(await response.text()).to.equal("Doc @ /path/to/doc");
        });

        it("should call the `options.after` middleware at every request not handled by the store middleware", async () => {
            var response = await fetch(`http://localhost:8888/after/test`);
            expect(response.status).to.equal(200);
            expect(await response.text()).to.equal("@after: GET /after/test");
        });

        it("should return the custom index.html page if the path is '/'", async () => {
            var customIndexPage = "<p>custom html document page</p>";
            fs.writeFileSync(customPublicPath+"/index.html", customIndexPage, "utf8");

            var response = await fetch(`http://localhost:8888/`);
            expect(response.status).to.equal(200);
            expect(await response.text()).to.equal(customIndexPage);
        });

        it("should return files from the public path for non-text/olo GET requests", async () => {
            var file1_content = "content of file 1";
            fs.writeFileSync(customPublicPath+"/file1.txt", file1_content, "utf8");

            var response = await fetch(`http://localhost:8888/file1.txt`);
            expect(response.status).to.equal(200);
            expect(await response.text()).to.equal(file1_content);
        });

        after((done) => {
            server.close(done);
        });
    });
});
