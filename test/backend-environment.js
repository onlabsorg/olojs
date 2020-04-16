var expect = require("chai").expect;
var express = require("express");
var fs = require("fs");
var Path = require("path");
var Environment = require("../lib/environment/backend-environment");
var document = require("../lib/document");
var Router = require("../lib/stores/router");
require("isomorphic-fetch");

function createMemoryStore (docs) {
    var store = new Map();
    for (let path in docs) store.set(path, docs[path]);
    return {
        read: path => store.get(path) || "",
        write: (path, source) => store.set(path, String(source)),
        delete: path => store.delete(path)
    }
}


describe("BackendEnvironment", () => {
    
    describe("default server", () => {
        var store, server;
        
        before(async () => {
            store = createMemoryStore({
                "/path/to/doc1": "doc1 source"
            });
            var env = new Environment({store});
            server = await env.serve(8888);
        });
        
        describe("HTTP GET", () => {
            
            it("should return the document source at path if the mimeType is 'text/olo'", async () => {
                var docPath = "/path/to/doc1";
                var response = await fetch(`http://localhost:8888${docPath}`, {
                    method: 'get',
                    headers: {
                        'Accept': 'text/olo'
                    },
                });
                expect(response.status).to.equal(200);
                expect(await response.text()).to.equal(store.read(docPath));
            });
            
            it("should return the default index.html page if the path is '/'", async () => {
                var indexHTMLPage = fs.readFileSync(Path.resolve(__dirname, "../public/index.html"), "utf8");
                var response = await fetch(`http://localhost:8888/`);
                expect(response.status).to.equal(200);
                expect(await response.text()).to.equal(indexHTMLPage);                
            });

            it("should return files from the public path for non-text/olo GET requests", async () => {
                var indexHTMLPage = fs.readFileSync(Path.resolve(__dirname, "../public/index.html"), "utf8");
                var response = await fetch(`http://localhost:8888/index.html`);
                expect(response.status).to.equal(200);
                expect(await response.text()).to.equal(indexHTMLPage);                
            });
        });
        
        describe("HTTP PUT", () => {
            
            it("should set the document source at path equal to the body if the mimeType is 'text/olo'", async () => {
                var docPath = "/path/to/doc1";
                var newSource = "new doc1 source";
                var response = await fetch(`http://localhost:8888${docPath}`, {
                    method: 'put',
                    headers: {
                        'Accept': 'text/olo',
                        'Content-Type': 'text/olo'
                    },
                    body: newSource
                });
                expect(response.status).to.equal(200);
                expect(store.read(docPath)).to.equal(newSource);
            });            
        });
        
        describe("HTTP DELETE", () => {

            it("should remove the document at path if the mimeType is 'text/olo'", async () => {
                var docPath = "/path/to/doc1";
                var response = await fetch(`http://localhost:8888${docPath}`, {
                    method: 'delete',
                    headers: {
                        'Accept': 'text/olo'
                    }
                });
                expect(response.status).to.equal(200);
                expect(store.read(docPath)).to.equal("");
            });                        
        });
        
        after(async () => {
            await server.close();
        });
    });
    
    describe("custom server", () => {
        var store, server, customDocumentHTMLPage="<p>custom html document page</p>";
        
        before(async () => {
            var customPublicPath = Path.resolve(__dirname, "./public");
            fs.writeFileSync(customPublicPath+"/index.html", customDocumentHTMLPage, "utf8");

            store = createMemoryStore({
                "/path/to/doc1": "doc1 source"
            });
            
            var env = new Environment({
                store: store,
                publicPath: customPublicPath,
                allow: req => req.path.slice(0,9) !== "/private/"
            });
            
            server = await env.serve(8888);            
        });
        
        describe("HTTP GET", () => {
            
            it("should return the document source at path if the mimeType is 'text/olo'", async () => {
                var docPath = "/path/to/doc1";
                var response = await fetch(`http://localhost:8888${docPath}`, {
                    method: 'get',
                    headers: {
                        'Accept': 'text/olo'
                    },
                });
                expect(response.status).to.equal(200);
                expect(await response.text()).to.equal(store.read(docPath));
            });
            
            it("should return the custom index.html page if the path is '/'", async () => {
                var response = await fetch(`http://localhost:8888/`);
                expect(response.status).to.equal(200);
                expect(await response.text()).to.equal(customDocumentHTMLPage);                
            });
            
            it("should return files from the public path for non-text/olo GET requests", async () => {
                var response = await fetch(`http://localhost:8888/index.html`);
                expect(response.status).to.equal(200);
                expect(await response.text()).to.equal(customDocumentHTMLPage);                
            });

            it("should return a 403 status if reading the resource is not allowed", async () => {
                var response = await fetch(`http://localhost:8888/private/path/to/doc`, {
                    method: 'get',
                    headers: {
                        'Accept': 'text/olo'
                    },
                });
                expect(response.status).to.equal(403);                
                expect(await response.text()).to.equal("");
            });
        });
        
        describe("HTTP PUT", () => {
            
            it("should set the document source at path equal to the body if the mimeType is 'text/olo'", async () => {
                var docPath = "/path/to/doc1";
                var newSource = "new doc1 source";
                var response = await fetch(`http://localhost:8888${docPath}`, {
                    method: 'put',
                    headers: {
                        'Accept': 'text/olo',
                        'Content-Type': 'text/olo'
                    },
                    body: newSource
                });
                expect(response.status).to.equal(200);
                expect(store.read(docPath)).to.equal(newSource);
            });            

            it("should return a 403 status if writing the resource is not allowed", async () => {
                var docPath = "/private/path/to/doc1";
                var docSource = "private doc source";
                store.write(docPath, docSource);
                expect(store.read(docPath)).to.equal(docSource);
                
                var response = await fetch(`http://localhost:8888${docPath}`, {
                    method: 'put',
                    headers: {
                        'Accept': 'text/olo',
                        'Content-Type': 'text/olo'
                    },
                    body: "modified body"
                });
                
                expect(response.status).to.equal(403);                
                expect(store.read(docPath)).to.equal(docSource);
            });
        });
        
        describe("HTTP DELETE", () => {

            it("should remove the document at path if the mimeType is 'text/olo'", async () => {
                var docPath = "/path/to/doc1";
                var response = await fetch(`http://localhost:8888${docPath}`, {
                    method: 'delete',
                    headers: {
                        'Accept': 'text/olo'
                    }
                });
                expect(response.status).to.equal(200);
                expect(store.read(docPath)).to.equal("");
            });                        

            it("should return a 403 status if deleting the resource is not allowed", async () => {
                var docPath = "/private/path/to/doc1";
                var docSource = "private doc source";
                store.write(docPath, docSource);
                expect(store.read(docPath)).to.equal(docSource);
                
                var response = await fetch(`http://localhost:8888${docPath}`, {
                    method: 'delete',
                    headers: {
                        'Accept': 'text/olo'
                    },
                });
                
                expect(response.status).to.equal(403);                
                expect(store.read(docPath)).to.equal(docSource);
            });
        });
        
        after(async () => {
            await server.close();
        });
    });

    describe("BackendEnvironment globals", () => {
        
        it("should contain a `require` functions that loads the stdlib modules", async () => {
            var env = new Environment({
                store: new Router({
                    "/path/to": subPath => `<% math = require 'math' %>`,
                })
            });
            var ns = await env.loadDocument("/path/to/a/doc");
            expect(ns.math).to.equal(require("../lib/stdlib/math"));
        });
    });
});
