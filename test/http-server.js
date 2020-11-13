var expect = require("chai").expect;
var fs = require("fs");
var pathlib = require("path");
var document = require("../lib/document");
var Environment = require("../lib/environment");
var HTTPServer = require("../lib/servers/http");
var EmptyStore = require("../lib/stores/empty");
var MemoryStore = require("../lib/stores/memory");
var Router = require("../lib/stores/router");
var storeErrors = require("../lib/stores/store-errors");
require("isomorphic-fetch");

describe("HTTPServer", () => {
    
    describe("Default HTTP server", () => {
        var homeStore, env, server;
        
        before((done) => {
            
            class PrivateStore extends EmptyStore {
                get (path) {throw new storeErrors.PermissionDenied('GET', path)}
                set (path,src) {throw new storeErrors.PermissionDenied('SET', path)}
                delete (path) {throw new storeErrors.PermissionDenied('DELETE', path)}
            }
            
            class NotAllowedStore extends EmptyStore {
                get (path) {throw new storeErrors.OperationNotAllowed('GET', path)}
                set (path, src) {throw new storeErrors.OperationNotAllowed('SET', path)}
                delete (path) {throw new storeErrors.OperationNotAllowed('DELETE', path)}
            }
            
            class ErrorStore extends EmptyStore {
                get (path) {throw new Error()}
                set (path, src) {throw new Error()}
                delete (path) {throw new Error()}
            }
            

            env = new Environment({
                store: new Router({
                    home: (homeStore = new MemoryStore()),
                    private: new PrivateStore(),
                    hidden: new NotAllowedStore(),
                    error: new ErrorStore(),
                })
            });
            server = HTTPServer(env);
            server.listen(8888, done);
        });            
        
        describe("HTTP GET /env/*", () => {
            
            it("should return the document source mapped to path by the passed loader", async () => {
                var docPath = "/path/to/doc1";
                var docSource = "document source ...";
                await homeStore.set(docPath, docSource);
                
                var response = await fetch(`http://localhost:8888/env/home/${docPath}`, {
                    method: 'get',
                    headers: {
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(200);
                expect(await response.text()).to.equal(docSource);
            });
            
            it("should return the status code 403 if the backend environment throws PermissionDenied", async () => {
                var response = await fetch(`http://localhost:8888/env/private/path/to/doc`, {
                    method: 'get',
                    headers: {
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(403);
            });
            
            it("should return the status code 405 if the backend environment throws OperationNotDefined", async () => {
                var response = await fetch(`http://localhost:8888/env/hidden/path/to/doc`, {
                    method: 'get',
                    headers: {
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(405);                
            });
            
            it("should return the status code 403 if the backend environment throws a generic error", async () => {
                var response = await fetch(`http://localhost:8888/env/error/path/to/doc`, {
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
                
                var response = await fetch(`http://localhost:8888/env/`, {
                    method: 'get',
                    headers: {
                        'Accept': 'application/json'
                    },
                });
                expect(response.status).to.equal(200);
                expect((await response.json()).sort()).to.deep.equal(['error/', 'hidden/', 'home/', 'private/']);
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
            
        describe("HTTP PUT /env/*", () => {
            
            it("should modify the resource and return 200", async () => {
                var docPath = "/path/to/doc1";
                var docSource = "document source ...";
                homeStore.set(docPath, docSource);
                
                var response = await fetch(`http://localhost:8888/env/home/${docPath}`, {
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
                var response = await fetch(`http://localhost:8888/env/private/path/to/doc`, {
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
                var response = await fetch(`http://localhost:8888/env/hidden/path/to/doc`, {
                    method: 'put',
                    headers: {
                        'Content-Type': 'text/plain',
                        'Accept': 'text/*'
                    },
                    body: ""
                });
                expect(response.status).to.equal(405);                
            });
            
            it("should return the status code 403 if the backend environment throws a generic error", async () => {
                var response = await fetch(`http://localhost:8888/env/error/path/to/doc`, {
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

        describe("HTTP DELETE /env/*", () => {
            
            it("should remove the resource and return 200", async () => {
                var docPath = "/path/to/doc1";
                var docSource = "document source ...";
                homeStore.set(docPath, docSource);
                
                var response = await fetch(`http://localhost:8888/env/home/${docPath}`, {
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
                var response = await fetch(`http://localhost:8888/env/private/path/to/doc`, {
                    method: 'delete',
                    headers: {
                        'Content-Type': 'text/plain',
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(403);
            });
            
            it("should return the status code 405 if the backend environment throws OperationNotDefined", async () => {
                var response = await fetch(`http://localhost:8888/env/hidden/path/to/doc`, {
                    method: 'delete',
                    headers: {
                        'Content-Type': 'text/plain',
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(405);                
            });
            
            it("should return the status code 403 if the backend environment throws a generic error", async () => {
                var response = await fetch(`http://localhost:8888/env/error/path/to/doc`, {
                    method: 'delete',
                    headers: {
                        'Content-Type': 'text/plain',
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(500);                
            });
        });

        describe("HTTP GET /*", async () => {
            
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
    
    describe("HTTPServer with custom `options.publicPath` path", () => {
        var store, env, server, customPublicPath;
        
        before((done) => {
            customPublicPath = pathlib.resolve(__dirname, "./public");

            env = new Environment({
                store: (store = new MemoryStore())
            });
            server = HTTPServer(env, {
                publicPath: customPublicPath
            });
            server.listen(8888, done);
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
