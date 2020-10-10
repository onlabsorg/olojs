var expect = require("chai").expect;
var fs = require("fs");
var pathlib = require("path");
var document = require("../lib/document");
var Environment = require("../lib/environment");
var HTTPServer = require("../lib/servers/http");
var protocolErrors = require("../lib/protocols/.errors");
require("isomorphic-fetch");

describe("HTTPServer", () => {
    
    describe("Default HTTP server", () => {
        var store, env, server;
        
        before((done) => {
            store = new Map();
            env = Environment({
                protocols: {
                    home: {
                        get: path => store.get(pathlib.join('/', path)) || "",
                        set: (path, source) => store.set(pathlib.join('/', path), source),
                        delete: (path, source) => store.delete(pathlib.join('/', path)),
                    } ,
                    prv: {
                        get: path => {throw new protocolErrors.PermissionDenied('GET', path)},
                        set: path => {throw new protocolErrors.PermissionDenied('SET', path)},
                        delete: path => {throw new protocolErrors.PermissionDenied('DELETE', path)},
                    } ,
                    hid: {
                        get: path => {throw new protocolErrors.OperationNotAllowed('GET', path)},
                        set: path => {throw new protocolErrors.OperationNotAllowed('SET', path)},
                        delete: path => {throw new protocolErrors.OperationNotAllowed('DELETE', path)},
                    } ,
                    err: {
                        get: path => {throw new Error()},
                        set: path => {throw new Error()},
                        delete: path => {throw new Error()},
                    } ,
                },
                routes: {
                    '/': "home:/",
                    '/private': "prv:/",
                    '/hidden': "hid:/",
                    '/error': "err:/",
                }
            });
            server = HTTPServer(env);
            server.listen(8888, done);
        });            
        
        describe("HTTP GET /env/*", () => {
            
            it("should return the document source mapped to path by the passed loader", async () => {
                var docPath = "/path/to/doc1";
                var docSource = "document source ...";
                store.set(docPath, docSource);
                
                var response = await fetch(`http://localhost:8888/env${docPath}`, {
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
        });
            
        describe("HTTP PUT /env/*", () => {
            
            it("should modify the resource and return 200", async () => {
                var docPath = "/path/to/doc1";
                var docSource = "document source ...";
                store.set(docPath, docSource);
                
                var response = await fetch(`http://localhost:8888/env${docPath}`, {
                    method: 'put',
                    headers: {
                        'Accept': 'text/*',
                        'Content-Type': 'text/plain',
                    },
                    body: "new document source ..."
                });
                
                expect(response.status).to.equal(200);
                expect(store.get(docPath)).to.equal("new document source ...")
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
                store.set(docPath, docSource);
                
                var response = await fetch(`http://localhost:8888/env${docPath}`, {
                    method: 'delete',
                    headers: {
                        'Accept': 'text/*',
                        'Content-Type': 'text/plain',
                    },
                });
                
                expect(response.status).to.equal(200);
                expect(store.has(docPath)).to.be.false;
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

            store = new Map();
            env = Environment({
                protocols: {
                    home: (...paths) => store.get(pathlib.join('/', ...paths)) || "" ,
                },
                routes: {
                    '/': "home:/"
                }
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
