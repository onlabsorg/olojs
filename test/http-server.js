var expect = require("chai").expect;
var fs = require("fs");
var pathlib = require("path");
var document = require("../lib/document");
var Store = require("../lib/store");
var MemoryStore = require("../lib/memory-store");
var Router = require("../lib/router");
var HTTPServer = require("../lib/http-server");

var http = require('http');
var express = require('express');

require("isomorphic-fetch");

describe("HTTPServer", () => {

    describe("HTTPServer.createMiddleware", () => {
        var homeStore, server;

        before((done) => {

            class PrivateStore extends Store {
                read (path) {throw new Store.ReadPermissionDeniedError(path)}
                write (path,src) {throw new Store.WritePermissionDeniedError(path)}
                delete (path) {throw new Store.WritePermissionDeniedError(path)}
            }

            class NotAllowedStore extends Store {
                read (path) {throw new Store.ReadOperationNotAllowedError(path)}
                write (path, src) {throw new Store.WriteOperationNotAllowedError(path)}
                delete (path) {throw new Store.WriteOperationNotAllowedError(path)}
            }

            class ErrorStore extends Store {
                read (path) {throw new Error()}
                write (path, src) {throw new Error()}
                delete (path) {throw new Error()}
            }

            homeStore = new MemoryStore();

            const router = new Router({
                '/': homeStore,
                '/private/': new PrivateStore(),
                '/hidden/': new NotAllowedStore(),
                '/error/': new ErrorStore(),
            });

            const app = express();
            app.use('/docs', HTTPServer.createMiddleware(router));
            server = http.createServer(app);
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

            it("should return the status code 413 if the accepted MimeType is not `text/*`", async () => {
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

        after((done) => {
            server.close(done);
        });
    });

    describe("HTTPServer.create", () => {
        var homeStore, server;

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

            const router = new Router({
                '/': homeStore,
                '/private/': new PrivateStore(),
                '/hidden/': new NotAllowedStore(),
                '/error/': new ErrorStore(),
            });

            server = HTTPServer.create(router);
            server.listen(8888, done);
        });

        describe("HTTP GET /*", () => {

            it("should return the document source mapped to path by the passed loader", async () => {
                var docPath = "/path/to/doc1";
                var docSource = "document source ...";
                await homeStore.write(docPath, docSource);

                var response = await fetch(`http://localhost:8888/${docPath}`, {
                    method: 'get',
                    headers: {
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(200);
                expect(await response.text()).to.equal(docSource);
            });

            it("should return the status code 403 if the backend environment throws ReadPermissionDenied", async () => {
                var response = await fetch(`http://localhost:8888/private/path/to/doc`, {
                    method: 'get',
                    headers: {
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(403);
            });

            it("should return the status code 405 if the backend environment throws Store.ReadOperationNotDefined", async () => {
                var response = await fetch(`http://localhost:8888/hidden/path/to/doc`, {
                    method: 'get',
                    headers: {
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(405);
            });

            it("should return the status code 500 if the backend environment throws a generic error", async () => {
                var response = await fetch(`http://localhost:8888/error/path/to/doc`, {
                    method: 'get',
                    headers: {
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(500);
            });

            it("should return the status code 413 if the accepted MimeType is not `text/*``", async () => {
                var response = await fetch(`http://localhost:8888/env/path/to/img`, {
                    method: 'get',
                    headers: {
                        'Accept': 'image/bmp'
                    },
                });
                expect(response.status).to.equal(415);
            });
        });

        describe("HTTP PUT /*", () => {

            it("should modify the resource and return 200", async () => {
                var docPath = "/path/to/doc1";
                var docSource = "document source ...";
                homeStore.write(docPath, docSource);

                var response = await fetch(`http://localhost:8888${docPath}`, {
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
                var response = await fetch(`http://localhost:8888/private/path/to/doc`, {
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
                var response = await fetch(`http://localhost:8888/hidden/path/to/doc`, {
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
                var response = await fetch(`http://localhost:8888/error/path/to/doc`, {
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

        describe("HTTP DELETE /*", () => {

            it("should remove the resource and return 200", async () => {
                var docPath = "/path/to/doc1";
                var docSource = "document source ...";
                homeStore.write(docPath, docSource);

                var response = await fetch(`http://localhost:8888${docPath}`, {
                    method: 'delete',
                    headers: {
                        'Accept': 'text/*',
                        'Content-Type': 'text/plain',
                    },
                });

                expect(response.status).to.equal(200);
                expect(homeStore.read(docPath)).to.equal("");
            });

            it("should return the status code 403 if the backend environment throws WritePermissionDenied", async () => {
                var response = await fetch(`http://localhost:8888/private/path/to/doc`, {
                    method: 'delete',
                    headers: {
                        'Content-Type': 'text/plain',
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(403);
            });

            it("should return the status code 405 if the backend environment throws WriteOperationNotDefined", async () => {
                var response = await fetch(`http://localhost:8888/hidden/path/to/doc`, {
                    method: 'delete',
                    headers: {
                        'Content-Type': 'text/plain',
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(405);
            });

            it("should return the status code 500 if the backend environment throws a generic error", async () => {
                var response = await fetch(`http://localhost:8888/error/path/to/doc`, {
                    method: 'delete',
                    headers: {
                        'Content-Type': 'text/plain',
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(500);
            });
        });

        after((done) => {
            server.close(done);
        });
    });
});
