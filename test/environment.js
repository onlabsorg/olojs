const expect = require("chai").expect;

const Environment = require("../lib/environment");
const Document = require("../lib/document");

const express = require("express");

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
        
        it("should work also when the loader is defined as `fetch` method of the store", async () => {
            var env = new Environment({
                stores: {
                    "/path/to": {fetch: subPath => `Document at /path/to${subPath}`},
                    "/path/to/store1": {fetch: subPath => `Document at /path/to/store1${subPath}`},
                    "ppp://path/to": {fetch: subPath => `Document at ppp://path/to${subPath}`},
                    "ppp://path/to/store1": {fetch: subPath => `Document at ppp://path/to/store1${subPath}`},
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
        
        it("should delegate to the store `load` method if defined", async () => {
            var env = new Environment({
                stores: {
                    "/path/to": {
                        fetch: subPath => `Document at /path/to${subPath}`,
                        load: subPath => ({path: `/path/to${subPath}`})
                    }
                }
            });
            var doc = await env.load("/path/to/store1/path/to/doc1");
            expect(doc).to.deep.equal({
                path: "/path/to/store1/path/to/doc1"
            })
        });
    });    
});
