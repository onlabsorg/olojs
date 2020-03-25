const expect = require("chai").expect;

const Environment = require("../lib/environment");
const document = require("../lib/document");


describe("env = new Environment(config)", () => {
    
    describe("doc = await env.readDocument(path)", () => {
        
        it("should return the source mapped to the given path", async () => {
            var env = new Environment({
                stores: {
                    "/path/to": subPath => `Document at /path/to${subPath}`,
                    "/path/to/store1": subPath => `Document at /path/to/store1${subPath}`,
                }
            });
            
            var doc = await env.readDocument("/path/to/store1/path/to/doc1");
            expect(doc).to.equal("Document at /path/to/store1/path/to/doc1");
                        
            var doc = await env.readDocument("/path/to/store2/path/to/doc2");
            expect(doc).to.equal("Document at /path/to/store2/path/to/doc2");
        });
        
        it("should work with URL-like paths `protocol://path/to/`", async () => {
            var env = new Environment({
                stores: {
                    "ppp://path/to": subPath => `Document at ppp://path/to${subPath}`,
                    "ppp://path/to/store1": subPath => `Document at ppp://path/to/store1${subPath}`,
                    "ppp://": subPath => `Document at ppp://${subPath}`,
                }
            });

            var doc = await env.readDocument("ppp://path/to/store1/path/to/doc1");
            expect(doc).to.equal("Document at ppp://path/to/store1/path/to/doc1");
                        
            var doc = await env.readDocument("ppp://path/to/store2/path/to/doc2");
            expect(doc).to.equal("Document at ppp://path/to/store2/path/to/doc2");

            console.log(env._stores);
            console.log('subpath:', env._stores[2].path.getSubPath("ppp://path_to/doc"));
            console.log('storepath:', String(env._stores[2].path));
            
            var doc = await env.readDocument("ppp://path_to/doc");
            expect(doc).to.equal("Document at ppp://path_to/doc");
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
            
            var doc = await env.readDocument("/path/to/store1/path/to/doc1");
            expect(doc).to.equal("Document at /path/to/store1/path/to/doc1");
                        
            var doc = await env.readDocument("/path/to/store2/path/to/doc2");
            expect(doc).to.equal("Document at /path/to/store2/path/to/doc2");

            var doc = await env.readDocument("ppp://path/to/store1/path/to/doc1");
            expect(doc).to.equal("Document at ppp://path/to/store1/path/to/doc1");
                        
            var doc = await env.readDocument("ppp://path/to/store2/path/to/doc2");
            expect(doc).to.equal("Document at ppp://path/to/store2/path/to/doc2");
        });

        it("should throw an error if no store is defined for the given path", async () => {
            var env = new Environment({
                stores: {
                    "/path/to": subPath => `Document at /path/to${subPath}`,
                    "/path/to/store1": subPath => `Document at /path/to/store1${subPath}`,
                }
            });
            
            class ExceptionExpected extends Error {};
            try {
                await env.readDocument("/unmapped-store/path/to/doc");
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
                expect(e.message).to.equal("Store not defined for path /unmapped-store/path/to/doc");
            }
        });
        
        it("should throw an error if the store doesn't define a `read` method", async () => {
            var env = new Environment({
                stores: {
                    "/path/to/store1": {},
                }
            });
            
            class ExceptionExpected extends Error {};
            try {
                await env.readDocument("/path/to/store1/doc");
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
                expect(e.message).to.equal("Read operation not defined for paths /path/to/store1/*");
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
            expect((await env.readDocument("/path/to/docs/doc1"))).to.equal("document 1")
            store.set("/docs/doc1", "document 1 modified");
            expect((await env.readDocument("/path/to/docs/doc1"))).to.equal("document 1")
        });
    });
    
    describe("await env.deleteDocument(path)", () => {
        
        it("should call the proper store.delete method", async () => {
            var deleted = "";
            var env = new Environment({
                stores: {
                    "/path/to/store1": {delete: subPath => {deleted = "/path/to/store1"+subPath}},
                    "/path/to": {delete: subPath => {deleted = "$/path/to"+subPath}}
                }
            })
            
            await env.deleteDocument("/path/to/store1/subpath/to/doc1");
            expect(deleted).to.equal("/path/to/store1/subpath/to/doc1");

            await env.deleteDocument("/path/to/store2/subpath/to/doc2");
            expect(deleted).to.equal("$/path/to/store2/subpath/to/doc2");
        });

        it("should throw an error if no store is defined for the given path", async () => {
            var env = new Environment({
                stores: {
                    "/path/to": subPath => `Document at /path/to${subPath}`,
                    "/path/to/store1": subPath => `Document at /path/to/store1${subPath}`,
                }
            });
            
            class ExceptionExpected extends Error {};
            try {
                await env.deleteDocument("/unmapped-store/path/to/doc");
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
                expect(e.message).to.equal("Store not defined for path /unmapped-store/path/to/doc");
            }
        });
        
        it("should throw an error if the store doesn't define a `delete` method", async () => {
            var env = new Environment({
                stores: {
                    "/path/to/store1": {},
                }
            });
            
            class ExceptionExpected extends Error {};
            try {
                await env.deleteDocument("/path/to/store1/doc");
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
                expect(e.message).to.equal("Delete operation not defined for paths /path/to/store1/*");
            }
        });        
    });
    
    describe("await env.writeDocument(path, source)", () => {
        
        it("should call the proper store.write method", async () => {
            var docs = {};
            var env = new Environment({
                stores: {
                    "/path/to/store1": {write: (subPath, source) => {docs["/path/to/store1"+subPath] = source}},
                    "/path/to": {write: (subPath, source) => {docs["$/path/to"+subPath] = source}}
                }
            })
            
            await env.writeDocument("/path/to/store1/subpath/to/doc1", "doc1 source");
            expect(docs["/path/to/store1/subpath/to/doc1"]).to.equal("doc1 source");

            await env.writeDocument("/path/to/store2/subpath/to/doc2", "doc2 source");
            expect(docs["$/path/to/store2/subpath/to/doc2"]).to.equal("doc2 source");            
        });

        it("should throw an error if no store is defined for path", async () => {
            var env = new Environment({
                stores: {
                    "/path/to": subPath => `Document at /path/to${subPath}`,
                    "/path/to/store1": subPath => `Document at /path/to/store1${subPath}`,
                }
            });
            
            class ExceptionExpected extends Error {};
            try {
                await env.writeDocument("/unmapped-store/path/to/doc", "doc source");
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
                expect(e.message).to.equal("Store not defined for path /unmapped-store/path/to/doc");
            }            
        });
        
        it("should throw an error if the store doesn't define a `write` method", async () => {
            var env = new Environment({
                stores: {
                    "/path/to/store1": {},
                }
            });
            
            class ExceptionExpected extends Error {};
            try {
                await env.writeDocument("/path/to/store1/doc", "doc source");
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
                expect(e.message).to.equal("Write operation not defined for paths /path/to/store1/*");
            }
        });        

        it("should delegate to env.deleteDocument is the source is an empty string", async () => {
            var deleted = "";
            var env = new Environment({
                stores: {
                    "/path/to/store1": {delete: subPath => {deleted = "/path/to/store1"+subPath}},
                    "/path/to": {delete: subPath => {deleted = "$/path/to"+subPath}}
                }
            })
            
            await env.writeDocument("/path/to/store1/subpath/to/doc1", "");
            expect(deleted).to.equal("/path/to/store1/subpath/to/doc1");

            await env.writeDocument("/path/to/store2/subpath/to/doc2", "");
            expect(deleted).to.equal("$/path/to/store2/subpath/to/doc2");
        });        
    });
    
    describe("env.globals", () => {
        it("should contain the properties defined in config.globals", () => {
            var globals = {a:1,b:2};
            var env = new Environment({globals});
            expect(env.globals).to.deep.equal(globals);
        });
    });
});
