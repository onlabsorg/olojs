var expect = require("chai").expect;
var fs = require("fs");
var pathlib = require("path");
var document = require("../lib/document");
var Store = require("../lib/store");
var MemoryStore = require("../lib/memory-store");
var Router = require("../lib/router");

var http = require('http');
var express = require('express');
var StoreMiddleware = require('../lib/store-middleware');

require("isomorphic-fetch");


describe("HTTPServer", () => {
    var homeStore, router, server;
    
    before((done) => {
        
        class PrivateStore extends Store {
            get (path) {throw new Store.PermissionDeniedError('GET', path)}
            set (path,src) {throw new Store.PermissionDeniedError('SET', path)}
            delete (path) {throw new Store.PermissionDeniedError('DELETE', path)}
        }
        
        class NotAllowedStore extends Store {
            get (path) {throw new Store.OperationNotAllowedError('GET', path)}
            set (path, src) {throw new Store.OperationNotAllowedError('SET', path)}
            delete (path) {throw new Store.OperationNotAllowedError('DELETE', path)}
        }
        
        class ErrorStore extends Store {
            get (path) {throw new Error()}
            set (path, src) {throw new Error()}
            delete (path) {throw new Error()}
        }
        
        homeStore = new MemoryStore();

        router = new Router({
            '/': homeStore,
            '/private/': new PrivateStore(),
            '/hidden/': new NotAllowedStore(),
            '/error/': new ErrorStore(),
        });
        
        const app = express();
        app.use('/', StoreMiddleware(router));
        
        server = http.createServer(app);
        server.listen(8888, done);
    });            
    
    describe("HTTP GET /*", () => {
        
        it("should return the document source mapped to path by the passed loader", async () => {
            var docPath = "/path/to/doc1";
            var docSource = "document source ...";
            await homeStore.set(docPath, docSource);
            
            var response = await fetch(`http://localhost:8888${docPath}`, {
                method: 'get',
                headers: {
                    'Accept': 'text/*'
                },
            });
            expect(response.status).to.equal(200);
            expect(await response.text()).to.equal(docSource);
        });
        
        it("should return the status code 403 if the backend environment throws PermissionDenied", async () => {
            var response = await fetch(`http://localhost:8888/private/path/to/doc`, {
                method: 'get',
                headers: {
                    'Accept': 'text/*'
                },
            });
            expect(response.status).to.equal(403);
        });
        
        it("should return the status code 405 if the backend environment throws OperationNotDefined", async () => {
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

        it("should respond with the JSON-stringified entries list if the accepted MimeType is `apprication/json`", async () => {
            var docPath = "/path/to/doc1";
            var docSource = "document source ...";
            await homeStore.set(docPath, docSource);
            
            var response = await fetch(`http://localhost:8888/`, {
                method: 'get',
                headers: {
                    'Accept': 'application/json'
                },
            });
            expect(response.status).to.equal(200);
            expect((await response.json()).sort()).to.deep.equal(['error/', 'hidden/', 'path/', 'private/']);
        });

        it("should return the status code 413 if the accepted MimeType is neither `text/*` nor `application/json`", async () => {
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
            homeStore.set(docPath, docSource);
            
            var response = await fetch(`http://localhost:8888${docPath}`, {
                method: 'put',
                headers: {
                    'Accept': 'text/*',
                    'Content-Type': 'text/plain',
                },
                body: "new document source ..."
            });
            
            expect(response.status).to.equal(200);
            expect(homeStore.get(docPath)).to.equal("new document source ...")
        });
        
        it("should return the status code 403 if the backend environment throws PermissionDenied", async () => {
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
        
        it("should return the status code 405 if the backend environment throws OperationNotDefined", async () => {
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
            homeStore.set(docPath, docSource);
            
            var response = await fetch(`http://localhost:8888${docPath}`, {
                method: 'delete',
                headers: {
                    'Accept': 'text/*',
                    'Content-Type': 'text/plain',
                },
            });
            
            expect(response.status).to.equal(200);
            expect(homeStore.get(docPath)).to.equal("");
        });
        
        it("should return the status code 403 if the backend environment throws PermissionDenied", async () => {
            var response = await fetch(`http://localhost:8888/private/path/to/doc`, {
                method: 'delete',
                headers: {
                    'Content-Type': 'text/plain',
                    'Accept': 'text/*'
                },
            });
            expect(response.status).to.equal(403);
        });
        
        it("should return the status code 405 if the backend environment throws OperationNotDefined", async () => {
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
