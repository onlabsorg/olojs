const expect = require("chai").expect;

const Environment = require("../lib/environment");
const document = require("../lib/document");


describe("env = new Environment(config)", () => {
    
    describe("env.globals", () => {
        it("should contain the properties defined in config.globals", () => {
            var globals = {a:1,b:2};
            var env = new Environment({globals});
            expect(env.globals).to.deep.equal(globals);
        });
    });

    describe("doc = await env.readDocument(path)", () => {
        
        it("should return the source mapped to the given path", async () => {
            var env = new Environment({
                paths: {
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
                paths: {
                    "ppp://path/to": subPath => `Document at ppp://path/to${subPath}`,
                    "ppp://path/to/store1": subPath => `Document at ppp://path/to/store1${subPath}`,
                    "ppp://": subPath => `Document at ppp:/${subPath}`,
                }
            });

            var doc = await env.readDocument("ppp://path/to/store1/path/to/doc1");
            expect(doc).to.equal("Document at ppp://path/to/store1/path/to/doc1");
                        
            var doc = await env.readDocument("ppp://path/to/store2/path/to/doc2");
            expect(doc).to.equal("Document at ppp://path/to/store2/path/to/doc2");

            var doc = await env.readDocument("ppp://path_to/doc");
            expect(doc).to.equal("Document at ppp://path_to/doc");
        });
        
        it("should work also when the loader is defined as `read` method of the store", async () => {
            var env = new Environment({
                paths: {
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
                paths: {
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
                expect(e.message).to.equal("Handler not defined for path /unmapped-store/path/to/doc");
            }
        });
        
        it("should throw an error if the store doesn't define a `read` method", async () => {
            var env = new Environment({
                paths: {
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
                paths: {
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
                paths: {
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
                paths: {
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
                expect(e.message).to.equal("Handler not defined for path /unmapped-store/path/to/doc");
            }
        });
        
        it("should throw an error if the store doesn't define a `delete` method", async () => {
            var env = new Environment({
                paths: {
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
                paths: {
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
                paths: {
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
                expect(e.message).to.equal("Handler not defined for path /unmapped-store/path/to/doc");
            }            
        });
        
        it("should throw an error if the store doesn't define a `write` method", async () => {
            var env = new Environment({
                paths: {
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
                paths: {
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
    
    describe("env.parseDocument(dource)", () => {
        
        it("should call document.parse", () => {
            var documentParse = document.parse;
            var env = new Environment();
            
            var sourceArg, self;
            document.parse = function (source) {
                sourceArg = source;
                self = this;
                return "called";
            }
            
            const retval = env.parseDocument("source 1");
            expect(retval).to.equal("called");
            expect(sourceArg).to.equal("source 1");
            expect(self).to.equal(document);
            
            document.parse = documentParse;
        });
    }); 

    describe("env.stringifyDocumentExpression(value)", () => {
        
        it("should call document.expression.stringify", () => {
            var documentStringify = document.expression.stringify;
            var env = new Environment();
            
            var valueArg, self;
            document.expression.stringify = function (value) {
                valueArg = value;
                self = this;
                return "called";
            }
            
            const retval = env.stringifyDocumentExpression("value 1");
            expect(retval).to.equal("called");
            expect(valueArg).to.equal("value 1");
            expect(self).to.equal(document.expression);
            
            document.expression.stringify = documentStringify;
        });
    }); 
    
    describe("env.createContext(path, presets)", () => {
        
        it("should return a document context", () => {
            var env = new Environment();
            var envContext = env.createContext();
            var docContext = document.createContext();
            expect(Object.getPrototypeOf(Object.getPrototypeOf(envContext))).to.deep.equal(docContext);
        });
        
        it("should return a context containing all the names in `env.globals`", () => {
            var globals = {a:111, b:222, c:333};
            var env = new Environment({globals});
            var context = env.createContext();
            for (let key in globals) {
                expect(context[key]).to.equal(globals[key]);
                expect(context.hasOwnProperty(key)).to.be.false;
            }
        });
        
        it("should return a context mapping the document path to the own name `__path__`", () => {
            var path = "/path/to/doc";
            var env = new Environment();
            var context = env.createContext(path);
            expect(context.__path__).to.equal(path);
            expect(context.hasOwnProperty("__path__")).to.be.true;
        });
        
        it("should return a context having all the presets as own names", () => {
            var presets = {a:111, b:222, c:333};
            var env = new Environment();
            var context = env.createContext("/path/to/doc", presets);
            for (let key in presets) {
                expect(context[key]).to.equal(presets[key]);
                expect(context.hasOwnProperty(key)).to.be.true;
            }            
        });
        
        it("should contain the an `import` function, decorating the `env.load` method with relative path resolutions", async () => {
            var env = new Environment();
            
            var pathArg, argnsArg, self;
            env.load = function (path, argns) {
                pathArg = String(path);
                argnsArg = argns;
                self = this;
                return "called";
            }

            var context = env.createContext("/path/to/a");
            expect(context.import).to.be.a("function");
            
            const retval = await context.import("./b/c", 10);
            expect(retval).to.equal("called");
            expect(pathArg).to.equal("/path/to/b/c");
            expect(argnsArg).to.equal(10);
            expect(self).to.equal(env);
        });
    });
    
    describe("env.load(path, argns)", () => {
        
        it("should return the return value of the `load` handler mapped to the given path", async () => {
            var env = new Environment({
                paths: {
                    "/path/to": {load: subPath => `Resource at /path/to${subPath}`},
                    "/path/to/store1": {load: subPath => `Resource at /path/to/store1${subPath}`},
                }
            });
            
            var res = await env.load("/path/to/store1/path/to/doc1");
            expect(res).to.equal("Resource at /path/to/store1/path/to/doc1");
                        
            var res = await env.load("/path/to/store2/path/to/doc2");
            expect(res).to.equal("Resource at /path/to/store2/path/to/doc2");
        });
        
        it("should throw an error if no store is defined for the given path", async () => {
            var env = new Environment({
                paths: {
                    "/path/to": subPath => `Document at /path/to${subPath}`,
                    "/path/to/store1": subPath => `Document at /path/to/store1${subPath}`,
                }
            });
            
            class ExceptionExpected extends Error {};
            try {
                await env.load("/unmapped-store/path/to/doc");
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
                expect(e.message).to.equal("Handler not defined for path /unmapped-store/path/to/doc");
            }
        });

        it("should evaluate and return the namespace of the olo-document mapped to path if the `load` handler is not defined", async () => {
            var env = new Environment({
                paths: {
                    "/path/to": subPath => `<% p = __path__ %> <% sp = "${subPath}" %> <% x = argns.x %>`,
                }
            });
            var ns = await env.load("/path/to/a/doc", {x:10});
            expect(ns.p).to.equal("/path/to/a/doc");
            expect(ns.sp).to.equal("/a/doc");
            expect(ns.x).to.equal(10);
        });

        it("should throw an error if neither `read` nor `load` are defined", async () => {
            var env = new Environment({
                paths: {
                    "/path/to/store1": {},
                }
            });
            
            class ExceptionExpected extends Error {};
            try {
                await env.load("/path/to/store1/doc");
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
                expect(e.message).to.equal("Read operation not defined for paths /path/to/store1/*");
            }
        });
    });
});
