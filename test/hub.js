const expect = require("chai").expect;

const expression = require("../lib/expression");
const Store = require("../lib/store");
const Hub = require("../lib/hub");

async function expectToThrow (testFn, message) {
    class DidNotThrow extends Error {};
    try {
        await testFn();
        throw new DidNotThrow()
    } catch (e) {
        expect(e).to.not.be.instanceof(DidNotThrow);
        expect(e.message).to.equal(message);
    }
}


describe("Hub", () => {
    
    describe("hub = new Hub()", () => {
        
        it("should be a Store instance", () => {});
    });
    
    describe("hub.mount(storeURI, store)", () => {
        
        it("should bind the given store to the given root uri and delegate read/write operation to that store for every sub-uri", async () => {
            var hub = new Hub();
            
            hub.mount("test1://store.1/docs", Object.assign(new Store(), {
                read : docPath => `Store1 document with path ${docPath}`,
                write: (docPath, source) => `Store1 document with path ${docPath}, changed to "${source}"`
            }));
            
            hub.mount("test2://store.2/docs", Object.assign(new Store(), {
                read : docPath => `Store2 document with path ${docPath}`,
                write: (docPath, source) => `Store2 document with path ${docPath}, changed to "${source}"`
            }));
            
            var doc1 = await hub.read("test1://store.1/docs/path/to/doc1");
            expect(doc1).to.equal("Store1 document with path /path/to/doc1");

            var retval1 = await hub.write("test1://store.1/docs/path/to/doc1", "content 1");
            expect(retval1).to.equal(`Store1 document with path /path/to/doc1, changed to "content 1"`);

            var doc2 = await hub.read("test2://store.2/docs/path/to/doc2");
            expect(doc2).to.equal("Store2 document with path /path/to/doc2");
            
            var retval2 = await hub.write("test2://store.2/docs/path/to/doc2", "content 2");
            expect(retval2).to.equal(`Store2 document with path /path/to/doc2, changed to "content 2"`);
        });
        
        it("should throw an error when trying to mount other than a Store instance", async () => {
            var hub = new Hub();
            expect(() => hub.mount("test://store/", {})).to.throw("Not a valid store");
        });
        
        it("should throw an error when trying to read or write to a non-registered uri", async () => {
            var hub = new Hub();
            hub.mount("test1://store.1/docs", new Store());
            hub.mount("test2://store.2/docs", new Store());
            await expectToThrow(() => hub.read("test3://store.3/docs/path/to/doc"), "Unknown store uri: test3://store.3/docs/path/to/doc");
            await expectToThrow(() => hub.write("test3://store.3/docs/path/to/doc"), "Unknown store uri: test3://store.3/docs/path/to/doc");
        });
    });
    
    describe("doc = await hub.load(uri)", () => {
        
        it("should be an instance of Store.Document and Hub.Document", async () => {
            var hub = new Hub();
            hub.mount("test://store", Object.assign(new Store(), {
                read : docPath => `Store document with path ${docPath}`,
                write: (docPath, source) => `Store document with path ${docPath}, changed to "${source}"`
            }));
            var doc = await hub.load("test://store/path/to/doc");
            expect(doc).to.be.instanceof(Store.Document);
            expect(doc).to.be.instanceof(Hub.Document);
        });
        
        describe("doc.id", () => {
            
            it("should be an instance of Store.DocId and Hub.DocId", async () => {
                var hub = new Hub();
                hub.mount("test://store", Object.assign(new Store(), {
                    read : docPath => `Store document with path ${docPath}`,
                    write: (docPath, source) => `Store document with path ${docPath}, changed to "${source}"`
                }));
                var doc = await hub.load("test://store/path/to/doc");                
                expect(doc.id).to.be.instanceof(Store.DocId);
                expect(doc.id).to.be.instanceof(Hub.DocId);
            });
            
            it("should contain all the document uri parts as properties", async () => {
                var hub = new Hub();
                hub.mount("http://uid:pwd@host.name:8080", Object.assign(new Store(), {
                    read : docPath => `Store document with path ${docPath}`,
                    write: (docPath, source) => `Store document with path ${docPath}, changed to "${source}"`
                }));
                var doc = await hub.load("http://uid:pwd@host.name:8080/path/to/doc?x=10&s=abc#frag");                
                expect(doc.id.scheme).to.equal("http");
                expect(doc.id.userinfo).to.equal("uid:pwd");
                expect(doc.id.host).to.equal("host.name");
                expect(doc.id.port).to.equal(8080);
                expect(doc.id.path).to.equal("/path/to/doc");
                expect(doc.id.query).to.deep.equal({s:"abc", x:10});
                expect(doc.id.fragment).to.equal("frag");
                expect(doc.id.authority).to.equal("//uid:pwd@host.name:8080")
                expect(doc.id.root).to.equal("http://uid:pwd@host.name:8080")
                expect(doc.id.uri).to.equal("http://uid:pwd@host.name:8080/path/to/doc?s=abc&x=10#frag")                
            });
            
            it("should stringify to the uri without query and fragment", async () => {
                var hub = new Hub();
                hub.mount("http://uid:pwd@host.name:8080", Object.assign(new Store(), {
                    read : docPath => `Store document with path ${docPath}`,
                    write: (docPath, source) => `Store document with path ${docPath}, changed to "${source}"`
                }));
                var doc = await hub.load("http://uid:pwd@host.name:8080/path/to/doc?x=10&s=abc#frag");                                
                expect(String(doc.id)).to.equal("http://uid:pwd@host.name:8080/path/to/doc")
            });
            
            it("should contain a `resolve` method resolving sub-uri's", async () => {
                var hub = new Hub();
                hub.mount("http://host.name", Object.assign(new Store(), {
                    read : docPath => `Store document with path ${docPath}`,
                    write: (docPath, source) => `Store document with path ${docPath}, changed to "${source}"`
                }));
                var doc = await hub.load("http://host.name/path/to/doc?x=10&s=abc#frag");                                
                expect(doc.id.resolve("doc2")).to.equal("http://host.name/path/to/doc2");
                expect(doc.id.resolve("./doc2")).to.equal("http://host.name/path/to/doc2");
                expect(doc.id.resolve("../to_doc2")).to.equal("http://host.name/path/to_doc2");
                expect(doc.id.resolve("../../../../doc2")).to.equal("http://host.name/doc2");
                expect(doc.id.resolve("/doc2")).to.equal("http://host.name/doc2");                
            });
        });
        
        describe("doc context", () => {
            
            it("should contain an `ID` namespace extended with uri-specific names", async () => {
                var hub = new Hub();
                hub.mount("http://uid:pwd@host.name:8080", Object.assign(new Store(), {
                    read : docPath => `Store document with path ${docPath}`,
                    write: (docPath, source) => `Store document with path ${docPath}, changed to "${source}"`
                }));
                var doc = await hub.load("http://uid:pwd@host.name:8080/path/to/doc?x=10&s=abc#frag");                
                var ctx = doc.createContext();
                expect(await expression.evaluate("ID.scheme", ctx)).to.equal("http");
                expect(await expression.evaluate("ID.userinfo", ctx)).to.equal("uid:pwd");
                expect(await expression.evaluate("ID.host", ctx)).to.equal("host.name");
                expect(await expression.evaluate("ID.port", ctx)).to.equal(8080);
                expect(await expression.evaluate("ID.path", ctx)).to.equal("/path/to/doc");
                expect(await expression.evaluate("ID.query", ctx)).to.deep.equal({s:"abc", x:10});
                expect(await expression.evaluate("ID.fragment", ctx)).to.equal("frag");
                expect(await expression.evaluate("ID.authority", ctx)).to.equal("//uid:pwd@host.name:8080")
                expect(await expression.evaluate("ID.root", ctx)).to.equal("http://uid:pwd@host.name:8080")
            });
            
            it("should contain an `import` function bound to the hub, allowing for importing from uri's", async () => {
                var hub = new Hub();
                hub.mount("http://host.name", Object.assign(new Store(), {
                    read : docPath => `Store document with path <% p="${docPath}" %><% p %>"`,
                    write: (docPath, source) => `Store document with path ${docPath}, changed to "${source}"`
                }));
                var doc = await hub.load("http://host.name/path/to/doc?x=10&s=abc#frag");                                
                var ctx = doc.createContext();
                expect(await expression.evaluate("import('doc2').p", ctx)).to.equal("/path/to/doc2");
                expect(await expression.evaluate("import('./doc2').p", ctx)).to.equal("/path/to/doc2");
                expect(await expression.evaluate("import('../to_doc2').p", ctx)).to.equal("/path/to_doc2");
                expect(await expression.evaluate("import('../../../../../doc2').p", ctx)).to.equal("/doc2");
                expect(await expression.evaluate("import('/doc2').p", ctx)).to.equal("/doc2");
            });  
            
            it("should contain the doc store globals", async () => {
                var hub = new Hub();
                hub.mount("http://store1", Object.assign(new Store({globalName:"store1 global value"}), {
                    read : docPath => `Store1 document with path ${docPath}`,
                    write: (docPath, source) => `Store1 document with path ${docPath}, changed to "${source}"`
                }));
                hub.mount("http://store2", Object.assign(new Store({globalName:"store2 global value"}), {
                    read : docPath => `Store2 document with path ${docPath}`,
                    write: (docPath, source) => `Store2 document with path ${docPath}, changed to "${source}"`
                }));
                
                var doc1 = await hub.load("http://store1/path/to/doc");                
                expect(doc1.createContext().globalName).to.equal("store1 global value");

                var doc2 = await hub.load("http://store2/path/to/doc");                
                expect(doc2.createContext().globalName).to.equal("store2 global value");
            });          
        });
    });
});
