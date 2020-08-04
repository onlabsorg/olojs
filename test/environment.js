const expect = require("chai").expect;

const Environment = require("../lib/environment");
const document = require("../lib/document");
const Router = require("../lib/stores/router");


describe("env = new Environment(config)", () => {
    
    describe("env.globals", () => {
        
        it("should contain the properties defined in config.globals", () => {
            var globals = {a:1,b:2};
            var env = new Environment({
                store: {read:()=>{}},
                globals: globals,
            });
            expect(env.globals).to.deep.equal(globals);
        });
    });

    describe("doc = await env.readDocument(path)", () => {
        
        it("should return the source mapped to the given path", async () => {
            var env = new Environment({
                store: {
                    read: subPath => `Document at ${subPath}`,
                }
            });
            
            var doc = await env.readDocument("/path/to/doc1");
            expect(doc).to.equal("Document at /path/to/doc1");
        });
                
        it("should cache the loaded documents", async () => {
            var store = new Map();
            store.set("/path/to/doc1", "document 1");
            store.set("/path/to/doc2", "document 2");
            var env = new Environment({
                store: {
                    read: subPath => store.get(subPath),
                }
            });
            expect((await env.readDocument("/path/to/doc1"))).to.equal("document 1")
            store.set("/path/to/doc1", "document 1 modified");
            expect((await env.readDocument("/path/to/doc1"))).to.equal("document 1")
        });
    });
    
    describe("await env.deleteDocument(path)", () => {
        
        it("should call the store.delete method", async () => {
            var deleted = "";
            var env = new Environment({
                store: {
                    read: path => "",
                    delete: path => {deleted = path}
                }
            })
            
            await env.deleteDocument("/path/to/doc1");
            expect(deleted).to.equal("/path/to/doc1");
        });
        
        it("should throw an error if the store doesn't define a `delete` method", async () => {
            var env = new Environment({
                store: {read: path => ""}
            });
            
            class ExceptionExpected extends Error {};
            try {
                await env.deleteDocument("/path/to/doc");
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
                expect(e.message).to.equal("Delete operation not defined");
            }
        });        
    });
    
    describe("await env.writeDocument(path, source)", () => {
        
        it("should call the store.write method", async () => {
            var docs = {};
            var env = new Environment({
                store: {
                    read: path => "",
                    write: (subPath, source) => {docs[subPath] = source},
                }
            })
            
            await env.writeDocument("/path/to/doc1", "doc1 source");
            expect(docs["/path/to/doc1"]).to.equal("doc1 source");
        });

        it("should throw an error if the store doesn't define a `write` method", async () => {
            var env = new Environment({
                store: {
                    read: path => {}
                }
            });
            
            class ExceptionExpected extends Error {};
            try {
                await env.writeDocument("/path/to/doc", "doc source");
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
                expect(e.message).to.equal("Write operation not defined");
            }
        });        

        it("should delegate to env.deleteDocument is the source is an empty string", async () => {
            var deleted = "";
            var env = new Environment({
                store: {
                    read: path => "",
                    delete: subPath => {deleted = subPath},
                }
            })
            
            await env.writeDocument("/path/to/doc1", "");
            expect(deleted).to.equal("/path/to/doc1");
        });        
    });   
    
    describe("env.parseDocument(dource)", () => {
        
        it("should call document.parse", () => {
            var documentParse = document.parse;
            var env = new Environment({store:{read:()=>{}}});
            
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

    describe("env.render(value)", () => {
        
        it("should call document.render", () => {
            var documentRender = document.render;
            var env = new Environment({store:{read:()=>{}}});
            
            var valueArg, self;
            document.render = function (value) {
                valueArg = value;
                self = this;
                return "called";
            }
            
            const retval = env.render("value 1");
            expect(retval).to.equal("called");
            expect(valueArg).to.equal("value 1");
            expect(self).to.equal(document);
            
            document.render = documentRender;
        });
    }); 
    
    describe("env.createContext(path, presets)", () => {
        
        it("should return a document context", () => {
            var env = new Environment({store:{read:()=>{}}});
            var envContext = env.createContext();
            var docContext = document.createContext();
            var proto = o => Object.getPrototypeOf(o);
            expect(proto(proto(proto(envContext)))).to.deep.equal(docContext);
        });
        
        it("should return a context containing all the names in `env.globals`", () => {
            var globals = {a:111, b:222, c:333};
            var env = new Environment({store:{read:()=>{}}, globals});
            var context = env.createContext();
            for (let key in globals) {
                expect(context[key]).to.equal(globals[key]);
                expect(context.hasOwnProperty(key)).to.be.false;
            }
        });
        
        it("should return a context mapping the document path to the own name `__path__`", () => {
            var path = "/path/to/doc";
            var env = new Environment({store:{read:()=>{}}});
            var context = env.createContext(path);
            expect(context.__path__).to.equal(path);
            expect(context.hasOwnProperty("__path__")).to.be.true;
        });
        
        it("should return a context having all the presets as own names", () => {
            var presets = {a:111, b:222, c:333};
            var env = new Environment({store:{read:()=>{}}});
            var context = env.createContext("/path/to/doc", presets);
            for (let key in presets) {
                expect(context[key]).to.equal(presets[key]);
                expect(context.hasOwnProperty(key)).to.be.true;
            }            
        });
        
        it("should contain the `import` function, decorating the `env.loadDocument` method with relative path resolutions", async () => {
            var env = new Environment({store:{read:()=>{}}});
            
            var pathArg, presetsArg, self;
            env.loadDocument = function (path, presets) {
                pathArg = String(path);
                presetsArg = presets;
                self = this;
                return "called";
            }

            var context = env.createContext("/path/to/a");
            expect(context.import).to.be.a("function");
            
            const retval = await context.import("./b/c", 10);
            expect(retval).to.equal("called");
            expect(pathArg).to.equal("/path/to/b/c");
            expect(presetsArg).to.equal(10);
            expect(self).to.equal(env);
        });
        
        it("should contain the `require` function, loading the stdlib modules", async () => {
            var env = new Environment({store:{read:()=>{}}});
            var context = env.createContext();
            expect(await context.require("math")).to.equal(require("../lib/stdlib/modules/math"));
        });
    });
    
    describe("env.loadDocument(path, presets)", () => {
        
        it("should evaluate and return the namespace of the olo-document mapped to path", async () => {
            var env = new Environment({
                store: {
                    read: path => `<% p = __path__ %> <% sp = "${path}" %> <% y = 2*x %>`,
                }
            });
            var ns = await env.loadDocument("/path/to/a/doc", {x:10});
            expect(ns.p).to.equal("/path/to/a/doc");
            expect(ns.sp).to.equal("/path/to/a/doc");
            expect(ns.x).to.equal(10);
            expect(ns.y).to.equal(20);
        });
    });

    describe("env.renderDocument(path, presets)", () => {
        
        it("should evaluate and return the stringified namespace of the olo-document mapped to path", async () => {
            var env = new Environment({
                store: {
                    read: subPath => `x is <% x %>`,
                }
            });
            var text = await env.renderDocument("/path/to/a/doc", {x:10});
            expect(text).to.equal("x is 10");
        });
    });
});
