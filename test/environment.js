const expect = require("chai").expect;

const Environment = require("../lib/environment");
const Document = require("../lib/document");


const fs = require("fs")
const FSStore = require("../lib/stores/fs-store")

const express = require("express");
const HTTPStore = require("../lib/stores/http-store");

const stdlibStore = require("../lib/stores/stdlib-store");

describe("env = new Environment(config)", () => {
    
    describe("source = await env.fetch(path)", () => {
        
        it("should return the source mapped to the given path", async () => {
            var env = new Environment({
                stores: {
                    "/path/to": subPath => `Document at /path/to${subPath}`,
                    "/path/to/store1": subPath => `Document at /path/to/store1${subPath}`,
                }
            });
            
            var source = await env.fetch("/path/to/store1/path/to/doc1");
            expect(source).to.equal("Document at /path/to/store1/path/to/doc1");
                        
            var source = await env.fetch("/path/to/store2/path/to/doc2");
            expect(source).to.equal("Document at /path/to/store2/path/to/doc2");
        });
        
        it("should work with URL-like paths `protocol://path/to/`", async () => {
            var env = new Environment({
                stores: {
                    "ppp://path/to": subPath => `Document at ppp://path/to${subPath}`,
                    "ppp://path/to/store1": subPath => `Document at ppp://path/to/store1${subPath}`,
                }
            });

            var source = await env.fetch("ppp://path/to/store1/path/to/doc1");
            expect(source).to.equal("Document at ppp://path/to/store1/path/to/doc1");
                        
            var source = await env.fetch("ppp://path/to/store2/path/to/doc2");
            expect(source).to.equal("Document at ppp://path/to/store2/path/to/doc2");
        });
        
        it("should work also when the loader is defined as `read` method of the store", async () => {
            var env = new Environment({
                stores: {
                    "/path/to": {read: subPath => `Document at /path/to${subPath}`},
                    "/path/to/store1": {read: subPath => `Document at /path/to/store1${subPath}`},
                    "ppp://path/to": {read: subPath => `Document at ppp://path/to${subPath}`},
                    "ppp://path/to/store1": {read: subPath => `Document at ppp://path/to/store1${subPath}`},
                }
            });
            
            var source = await env.fetch("/path/to/store1/path/to/doc1");
            expect(source).to.equal("Document at /path/to/store1/path/to/doc1");
                        
            var source = await env.fetch("/path/to/store2/path/to/doc2");
            expect(source).to.equal("Document at /path/to/store2/path/to/doc2");

            var source = await env.fetch("ppp://path/to/store1/path/to/doc1");
            expect(source).to.equal("Document at ppp://path/to/store1/path/to/doc1");
                        
            var source = await env.fetch("ppp://path/to/store2/path/to/doc2");
            expect(source).to.equal("Document at ppp://path/to/store2/path/to/doc2");
        });

        it("should throw an error if no loader is defined for the given path", async () => {
            var env = new Environment({
                stores: {
                    "/path/to": subPath => `Document at /path/to${subPath}`,
                    "/path/to/store1": subPath => `Document at /path/to/store1${subPath}`,
                }
            });
            
            class ExceptionExpected extends Error {};
            try {
                await env.fetch("/unmapped-store/path/to/doc");
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
                expect(e.message).to.equal("Loader not defined for path /unmapped-store/path/to/doc");
            }
        });
        
        it("should cache the loaded documents", async () => {
            var store = new Map();
            store.set("/docs/doc1", "document 1");
            store.set("/docs/doc2", "document 2");
            var env = new Environment({
                stores: {
                    "/path/to": subPath => store.get(subPath),
                }
            });
            expect(await env.fetch("/path/to/docs/doc1")).to.equal("document 1")
            store.set("/docs/doc1", "document 1 modified");
            expect(await env.fetch("/path/to/docs/doc1")).to.equal("document 1")
        });
        
        it("should load the `index` document if the path ends with `/`", async () => {
            var env = new Environment({
                stores: {
                    "/path/to": subPath => `Document at /path/to${subPath}`,
                    "ppp://path/to": subPath => `Document at ppp://path/to${subPath}`,
                }
            });
            
            var source = await env.fetch("/path/to/dir/");
            expect(source).to.equal("Document at /path/to/dir/index");

            var source = await env.fetch("ppp://path/to/store1/path/to/dir/");
            expect(source).to.equal("Document at ppp://path/to/store1/path/to/dir/index");
        });
    });
    
    describe("doc = await env.load(path)", () => {
        
        it("should return a document instance", async () => {
            var env = new Environment({
                stores: {
                    "/path/to": subPath => `Document at /path/to${subPath}`,
                }
            });            
            var doc = await env.load("/path/to/store1/path/to/doc1");
            expect(doc).to.be.instanceof(Document);            
        });
        
        it("should set the document globals to the environment globals", async () => {
            var env = new Environment({
                stores: {
                    "/path/to": subPath => `Document at /path/to${subPath}`,
                }
            });
            var doc = await env.load("/path/to/store1/path/to/doc1");
            expect(doc.globals).to.equal(env.globals);
        });

        it("should add the document PATH to the document locals", async () => {
            var env = new Environment({
                stores: {
                    "/path/to": subPath => `Document at /path/to${subPath}`,
                }
            });
            var doc = await env.load("/path/to/store1/path/to/doc1");
            expect(doc.locals.PATH).to.equal("/path/to/store1/path/to/doc1");
        });
        
        it("should return the `store.read` return value if it is an instance of Document", async () => {
            var env = new Environment({
                stores: {
                    "/path/to": subPath => new Document(`Document at /path/to${subPath}`, {loc:1}, {glob:2})
                }
            });
            var doc = await env.load("/path/to/store1/path/to/doc1");
            expect(doc).to.be.instanceof(Document);
            expect(doc.source).to.equal("Document at /path/to/store1/path/to/doc1");
            expect(doc.locals).to.deep.equal({loc:1});
            expect(doc.globals).to.deep.equal({glob:2});
        });
    });    
    
    describe("FSStore", () => {
        it("should retrieve a source file from the filesystem", async () => {
            var docSource = "Test document source";
            fs.writeFileSync(__dirname+"/package/doc.olo", docSource, "utf8");
            var env = new Environment({
                stores: {
                    "/fs/test": new FSStore(__dirname+"/package")
                }
            });            
            expect(await env.fetch("/fs/test/doc")).to.equal(docSource);
        });
    });

    describe("HTTPStore", () => {
        var server;
        
        before (done => {
            var app = express();
            app.get("*", (req, res, next) => {
                res.status(200).send(`Document at ${req.path}`);
            });
            server = app.listen(8999, done);
        });
        
        it("should retrieve a source file via HTTP GET request", async () => {
            var env = new Environment({
                stores: {
                    "/http/test": new HTTPStore("http://localhost:8999")
                }
            });            
            expect(await env.fetch("/http/test/doc")).to.equal("Document at /doc");
        });
        
        after (async () => {
            await server.close();            
        });
    });
    
    describe("StdlibStore", () => {
        it("should import a javascript module from the standard library", async () => {
            var env = new Environment({
                stores: {
                    "/stdlib/test": stdlibStore
                }
            });       
            var doc = await env.load("/stdlib/test/math");
            expect(doc).to.be.instanceof(Document);

            var mathModule = require("../lib/stores/stdlib/math");     
            expect(await doc.evaluate()).to.equal(mathModule);
        });
    });
});
