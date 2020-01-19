const expect = require("chai").expect;

const Environment = require("../lib/environment");
const Document = require("../lib/document");

const express = require("express");

describe("env = new Environment(config)", () => {
    
    describe("source = await env.fetch(path)", () => {
        
        it("should return the source mapped to the given path", async () => {
            var env = new Environment({
                loaders: {
                    "/path/to": subPath => `Document at /path/to${subPath}`,
                    "/path/to/store1": subPath => `Document at /path/to/store1${subPath}`,
                }
            });
            
            var source = await env.fetch("/path/to/store1/path/to/doc1");
            expect(source).to.equal("Document at /path/to/store1/path/to/doc1");
                        
            var source = await env.fetch("/path/to/store2/path/to/doc2");
            expect(source).to.equal("Document at /path/to/store2/path/to/doc2");
        });
        
        it("should return the response of an HTTP get request if the path start with http://", async () => {
            var env = new Environment({
                loaders: {
                    "/path/to": subPath => `Document at /path/to${subPath}`,
                    "/path/to/store1": subPath => `Document at /path/to/store1${subPath}`,
                }
            });

            const app = express();
            app.get("*", (req,res,next) => {
                res.status(200).send(`Document at path ${req.path}`);
            });
            var server = await new Promise((resolve, reject) => {
                var server = app.listen(8999, () => {
                    resolve(server);
                });
            });
            
            var source = await env.fetch("http://localhost:8999/path/to/doc1");
            expect(source).to.equal("Document at path /path/to/doc1");
            server.close();
        });
        
        it("should throw an error if no loader is defined for the given path", async () => {
            var env = new Environment({
                loaders: {
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
    });
    
    describe("doc = await env.load(path)", () => {
        
        it("should return a document instance", async () => {
            var env = new Environment({
                loaders: {
                    "/path/to": subPath => `Document at /path/to${subPath}`,
                }
            });            
            var doc = await env.load("/path/to/store1/path/to/doc1");
            expect(doc).to.be.instanceof(Document);            
        });
        
        it("should set the document globals to the environment globals", async () => {
            var env = new Environment({
                loaders: {
                    "/path/to": subPath => `Document at /path/to${subPath}`,
                }
            });
            var doc = await env.load("/path/to/store1/path/to/doc1");
            expect(doc.globals).to.equal(env.globals);
        });

        it("should fill the document locals with the document path", async () => {
            var env = new Environment({
                loaders: {
                    "/path/to": subPath => `Document at /path/to${subPath}`,
                }
            });
            var doc = await env.load("/path/to/store1/path/to/doc1");
            expect(doc.locals.path).to.equal("/path/to/store1/path/to/doc1");
        });
    });    
});
