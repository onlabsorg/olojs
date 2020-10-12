
var expect = require("chai").expect;
const Path = require('path');

var expression = require("../lib/expression");
var document = require("../lib/document");
var Environment = require("../lib/environment");



describe("Environment class", () => {
    
    describe("doc = environment.createDocument(source, presets)", () => {
        
        it("should return an object", async () => {
            var env = Environment();
            var doc = env.createDocument("source", {});
            expect(doc).to.be.an("object");
        });
        
        describe("doc.source", () => {
            
            it("should contain the document source", () => {
                var env = Environment();
                var source = "this is the document source";
                var doc = env.createDocument(source);
                expect(doc.source).to.equal(source);
                
            });
        });
        
        describe("doc.evaluate", () => {
            
            it("should contain the function returned by document.parse(doc.source)", async () => {
                var env = Environment();
                var doc = env.createDocument("<% y = 2*x %>");
                expect(doc.evaluate).to.be.a("function");
                
                var context = document.createContext({x:10});
                var docNS = await doc.evaluate(context);
                expect(docNS.y).to.equal(20);
            });
            
            it("should return always the same function (parse only once)", async () => {
                var env = Environment();
                var doc = env.createDocument("...");
                expect(doc.evaluate).to.equal(doc.evaluate);
            });
        });
        
        describe("context = doc.createContext(...namespace)", () => {
            
            it("should return a context", async () => {
                var env = Environment();
                var doc = env.createDocument("...");
                var docContext = doc.createContext();

                var rootContext = Object.getPrototypeOf(document.expression.createContext());
                expect(rootContext.isPrototypeOf(docContext)).to.be.true;
            });
            
            it("should contain the names contained in the passed namespaces", async () => {
                var env = Environment();
                var doc = env.createDocument("...");
                var context = doc.createContext({x:10, y:20}, {y:30});
                expect(context.x).to.equal(10);
                expect(context.y).to.equal(30);
            });
            
            it("should contain the names contained in the `presets` namespace passed to `createDocument`", async () => {
                var env = Environment();
                var doc = env.createDocument("...", {x:10, y:20});
                var context = doc.createContext({x:10, y:20}, {y:30});
                var context = doc.createContext({y:21, z:31});
                expect(context.x).to.equal(10);
                expect(context.y).to.equal(20);
                expect(context.z).to.equal(31);
            });

            it("should contain the names contained in the `globals` namespaces passed to the environment constructor", async () => {
                var env = Environment({
                    globals: {x:10, y:20}
                });
                var doc = env.createDocument("...");
                var context = doc.createContext({y:30});
                expect(context.x).to.equal(10);
                expect(context.y).to.equal(30);
            });

        });        
    });
    
    describe("environment.render", () => {
        it("should delegate to `document.render`", () => {
            var render = document.render;
            document.render = value => [value];
            var env = Environment();
            expect(env.render(10)).to.deep.equal([10]);
            expect(env.render({x:1})).to.deep.equal([{x:1}]);
            document.render = render;
        });
    });
    
    describe("doc = await environment.readDocument([scheme:][//host][/path/to/doc])", () => {
        
        describe("doc.source", () => {
            
            it("should contain the source returned by the `scheme` handler with `//host/path/to/doc` as argument", async () => {
                var env = Environment({
                    protocols: {
                        ppp: {get: path => `Doc source @ ppp:${Path.join('/',path)}`}
                    }
                });
                var doc = await env.readDocument(`ppp:/path/to/doc`);
                expect(doc.source).to.equal("Doc source @ ppp:/path/to/doc");
            });

            it("should fall-back to the route shortcuts if no `scheme` is given", async () => {
                var env = Environment({
                    protocols: {
                        ppp: {get: path => `Doc source @ ppp:${Path.join('/',path)}`}
                    },
                    routes: {
                        "/": "ppp:/root",
                        "/mydocs": "ppp:/path/to/my/documents"
                    }
                });
                
                var doc = await env.readDocument(`/path/to/doc`);
                expect(doc.source).to.equal("Doc source @ ppp:/root/path/to/doc");
                
                var doc = await env.readDocument(`/mydocs/doc1`);
                expect(doc.source).to.equal("Doc source @ ppp:/path/to/my/documents/doc1");
            });
            
            it("should be an empty string if no protocol nor route match is found", async () => {
                var env = Environment({
                    protocols: {
                        ppp: {get: path => `Doc source @ ppp:${Path.join('/',path)}`}
                    },
                    routes: {
                        "/mydocs": "ppp:/path/to/my/documents"
                    }
                });
                
                var doc = await env.readDocument(`xxx:/path/to/doc`);
                expect(doc.source).to.equal("");
                
                var doc = await env.readDocument(`/path/to/doc1`);
                expect(doc.source).to.equal("");
            });
        });
        
        describe("doc.URI", () => {
            it("should return the full document URI", async () => {
                var env = Environment({
                    protocols: {
                        ppp: {get: path => `Doc source @ ppp:${Path.join('/',path)}`}
                    },
                    routes: {
                        "/": "ppp:/root/route"
                    }
                });
                
                var doc = await env.readDocument(`ppp:/path/to/doc`);
                expect(doc.URI).to.equal("ppp:/path/to/doc");                

                var doc = await env.readDocument(`ppp:/path/to/dir/`);
                expect(doc.URI).to.equal("ppp:/path/to/dir/");                

                var doc = await env.readDocument(`/path/to/doc`);
                expect(doc.URI).to.equal("/path/to/doc");                
            });
        });
        
        describe("context = doc.createContext()", () => {
            
            it("should contain the own property `import` mapping to a function", async () => {
                var env = Environment({
                    protocols: {
                        ppp: {get: path => `Doc source @ ppp:${Path.join('/',path)}`}
                    }
                });
                var doc = await env.readDocument(`ppp:/path/to/doc`);
                var context = doc.createContext();
                expect(context.import).to.be.a("function");
            });
            
            describe("docNS = context.import(uri, ...namespaces)", () => {
                
                it("should load, evaluate and return the namespace of the olo-document mapped to `uri`", async () => {
                    var env = Environment({
                        protocols: {
                            ppp: {get: path => `<% u = "ppp:${Path.join('/',path)}" %>`}
                        }
                    });
                    var doc1 = await env.readDocument(`ppp:/path/to/doc1`);
                    var context1 = doc1.createContext();
                    var doc2_ns = await context1.import("ppp:/path/to/doc2");
                    expect(doc2_ns.u).to.equal("ppp:/path/to/doc2");
                });                    
                
                it("should resolve `uri` relative to the calling document URI", async () => {
                    var env = Environment({
                        protocols: {
                            ppp: {get: path => `<% u = "ppp:${Path.join('/',path)}" %>`}
                        }
                    });
                    var doc1 = await env.readDocument(`ppp:/path/to/doc1`);
                    var context1 = doc1.createContext();
                    
                    var doc2_ns = await context1.import("./doc2");
                    expect(doc2_ns.u).to.equal("ppp:/path/to/doc2");

                    var doc3_ns = await context1.import("../to_doc3");
                    expect(doc3_ns.u).to.equal("ppp:/path/to_doc3");

                    var doc4_ns = await context1.import("/path_to/doc4");
                    expect(doc4_ns.u).to.equal("ppp:/path_to/doc4");
                });
                
                it("should evaluate the loaded document in a context containing the passed namespaces", async () => {
                    var env = Environment({
                        protocols: {
                            ppp: {get: path => `<% u = "ppp:${Path.join('/',path)}/" + leaf %>`}
                        }
                    });
                    var doc1 = await env.readDocument(`ppp:/path/to/doc1`);
                    var context1 = doc1.createContext();
                    
                    var doc2_ns = await context1.import("ppp:/path/to/doc2", {leaf:"leaf2"});
                    expect(doc2_ns.u).to.equal("ppp:/path/to/doc2/leaf2");
                });
                
                it("should cache the imported documents", async () => {
                    var counter = 0;

                    var env = Environment({
                        protocols: {
                            ppp: {get: path => {
                                counter += 1;
                                return `<% u = "ppp:${Path.join('/',path)}" %>`;
                            }}
                        }
                    });

                    var doc1 = await env.readDocument(`ppp:/path/to/doc1`);
                    var context1 = doc1.createContext();
                    expect(counter).to.equal(1);

                    var doc2_NS = await context1.import("/path/to/doc2");
                    expect(counter).to.equal(2);
                    
                    var doc2_NS = await context1.import("/path/to/doc2");
                    expect(counter).to.equal(2);
                    
                    var doc3_NS = await context1.import("/path/to/doc3");
                    expect(counter).to.equal(3);
                    
                    // valid also for the parent document itself
                    var doc4_NS = await context1.import("./doc1");
                    expect(counter).to.equal(3);                   
                    expect(doc4_NS.u).to.equal(doc1.URI);

                    var doc5_NS = await context1.import(doc1.URI);
                    expect(counter).to.equal(3);                   
                    expect(doc5_NS.u).to.equal(doc1.URI);
                });
            });        
        });        
    });
    
    describe("await environment.writeDocument([scheme:][//host][/path/to/doc], source)", () => {
        
        it("should call the matching handler's set method", async () => {
            var handlerPath, handlerSource;
            
            var env = Environment({
                protocols: {
                    ppp: {set: (path, source) => {
                        handlerPath = path;
                        handlerSource = source;
                    }},
                },
                routes: {
                    '/': "ppp:/root/dir"
                }
            });
            
            await env.writeDocument("ppp:/path/to/doc", "doc source");            
            expect(handlerPath).to.equal("/path/to/doc");
            expect(handlerSource).to.equal("doc source");

            await env.writeDocument("/path/to/doc", "doc source 2");            
            expect(handlerPath).to.equal("/root/dir/path/to/doc");
            expect(handlerSource).to.equal("doc source 2");
        });
    });

    describe("await environment.deleteDocument([scheme:][//host][/path/to/doc], options)", () => {
        
        it("should call the matching handler's delete method", async () => {
            var handlerPath;
            
            var env = Environment({
                protocols: {
                    ppp: {delete: (path) => {
                        handlerPath = path;
                    }},
                },
                routes: {
                    '/': "ppp:/root/dir"
                }
            });
            
            await env.deleteDocument("ppp:/path/to/doc");            
            expect(handlerPath).to.equal("/path/to/doc");

            await env.deleteDocument("/path/to/doc");            
            expect(handlerPath).to.equal("/root/dir/path/to/doc");
        });
    });
});
