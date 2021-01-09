var expect = require("chai").expect;
var document = require('../lib/document');
var Store = require("../lib/store");


describe("Store", () => {
    
    describe("source = await store.read(path)", () => {
        
        describe(`when a document path is passed`, () => {
            it("should always return an empty string", async () => {
                var store = new Store();
                expect(await store.read("/pathh/to/doc1")).to.equal("");
                expect(await store.read("/pathh/to/doc2")).to.equal("");
                expect(await store.read("/pathh/to/../to/doc3/../doc4")).to.equal("");
            });
        });

        describe(`when a directory path is passed`, () => {            
            it("should always return an empty string", async () => {
                var store = new Store();
                expect(await store.read("/pathh/to/dir1/")).to.equal("");
                expect(await store.read("/pathh/to/dir2/")).to.equal("");
                expect(await store.read("/pathh/to/../to/doc3/../dir4/")).to.equal("");
            });
        });
    });        
    
    describe("entries = await store.list(path)", () => {
        it("should return an empty array", async () => {
            var store = new Store();
            expect(await store.list("/pathh/to/dir1/")).to.deep.equal([]);
            expect(await store.list("/pathh/to/dir2/")).to.deep.equal([]);
            expect(await store.list("/pathh/to/../to/doc3/../dir4/")).to.deep.equal([]);            
        });
    });

    describe("await store.write(path, source)", () => {
        it("should throw a `WriteOperationNotAllowed` error", async () => {
            var store = new Store();
            try {
                await store.write("/path/to/doc1", "source of doc 1");
                throw new Error("Id didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(Store.WriteOperationNotAllowedError);
                expect(error.message).to.equal("Operation not allowed: WRITE /path/to/doc1");
            }
        });
    });        

    describe("await store.delete(path)", () => {
        it("should throw an `OperationNotAllowed` error", async () => {
            var store = new Store();
            try {
                await store.delete("/path/to/doc1");
                throw new Error("Id didn't throw");
            } catch (error) {
                expect(error).to.be.instanceof(Store.WriteOperationNotAllowedError);
                expect(error.message).to.equal("Operation not allowed: WRITE /path/to/doc1");
            }
        });
    }); 
    
    describe('Store.parseId', () => {
        
        it("should return {path, argns}", () => {
            var pid = Store.parseId('/path/to/doc?x=1;y=2&s=abc;bool');
            expect(pid).to.deep.equal({
                path:   '/path/to/doc',
                argns:  {x:1, y:2, s:"abc", bool:true},
            });
        });
        
        it("should default to `/` if the path is missing", () => {
            expect(Store.parseId('?x=1;y=2&s=abc;bool')).to.deep.equal({
                path:  '/',
                argns:  {x:1, y:2, s:"abc", bool:true},
            });
        });

        it("should report an empty argns if the query part is missing", () => {
            expect(Store.parseId('/path/to/doc')).to.deep.equal({
                path:   '/path/to/doc',
                argns:  {},
            });
            expect(Store.parseId('/path/to/doc?')).to.deep.equal({
                path:   '/path/to/doc',
                argns:  {},
            });
        });

        it("should normalize the path", () => {
            expect(Store.parseId('/path/to/../doc?x=1;y=2&s=abc;bool')).to.deep.equal({
                path:   '/path/doc',
                argns:  {x:1, y:2, s:"abc", bool:true},
            });
            expect(Store.parseId('/../path/to/doc?x=1;y=2&s=abc;bool')).to.deep.equal({
                path:   '/path/to/doc',
                argns:  {x:1, y:2, s:"abc", bool:true},
            });
            expect(Store.parseId('path/to/doc?x=1;y=2&s=abc;bool')).to.deep.equal({
                path:   '/path/to/doc',
                argns:  {x:1, y:2, s:"abc", bool:true},
            });
            expect(Store.parseId('../path/to/doc?x=1;y=2&s=abc;bool')).to.deep.equal({
                path:   '/path/to/doc',
                argns:  {x:1, y:2, s:"abc", bool:true},
            });
        });
    });

    describe('doc = await store.load(docId)', () => {

        it("should return an object", async () => {
            const store = new Store();
            var doc = await store.load("/path/to/doc");
            expect(doc).to.be.an("object");
        });
        
        describe('doc.path', () => {
            
            it("should contain the path part of the document id, wthout query string", async () => {
                const store = new Store();
                var doc = await store.load("/path/to/doc");
                expect(doc.path).to.equal("/path/to/doc");
            });
        });

        describe('doc.source', () => {
            
            it("should contain the source returned by `store.read(path)`", async () => {
                const store = new Store();
                store.read = path => `doc @ ${path}`;                
                var doc = await store.load("/path/to/doc");
                expect(doc.source).to.equal("doc @ /path/to/doc");
            });
        });

        describe('docns = await doc.evaluate(context)', () => {
            
            it("should evaluate the document source in the passed context", async () => {
                const store = new Store();
                store.read = path => `path = <% p: "${path}" %>`;                
                var doc = await store.load("/path/to/doc");
                var context = document.createContext();
                var docns = await doc.evaluate(context);
                expect(docns.p).to.equal("/path/to/doc");
                expect(await context.str(docns)).to.equal("path = /path/to/doc");
            });
        });

        describe('context = doc.createContext(...namespaces)', () => {
            
            it("should return a document context", async () => {
                const store = new Store();
                var doc = await store.load("/path/to/doc");
                var context = doc.createContext();                
                var docContext = document.createContext();
                for (let name in docContext) {
                    expect(context[name]).to.equal(docContext[name]);
                }
            });
            
            it("should include all the names in the passed namespaces", async () => {
                const store = new Store();
                var doc = await store.load("/path/to/doc");
                var context = doc.createContext({x:10, y:20}, {y:30, z:40});                
                expect(context.x).to.equal(10);                    
                expect(context.y).to.equal(30);                    
                expect(context.z).to.equal(40);                    
            });
            
            describe("context.__path__", () => {
                it("should contain doc.path", async () => {
                    const store = new Store();
                    var doc = await store.load("/path/to/doc");
                    var context = doc.createContext();                
                    expect(context.__path__).to.equal(doc.path);
                });
            });
            
            describe("context.argns", () => {
                it("should contain the key-value pairs passed via the query string", async () => {
                    const store = new Store();
                    var doc = await store.load("/path/to/doc?x=1;y=2&s=abc;bool");
                    var context = doc.createContext();                
                    expect(context.argns).to.deep.equal({x:1, y:2, s:"abc", bool:true});
                });
            });
            
            describe("docns = context.import(id)", () => {
                
                it("should be a function", async () => {
                    const store = new Store();
                    var doc = await store.load("/path/to/doc");
                    var context = doc.createContext();
                    expect(context.import).to.be.a("function");                        
                });
                
                it("should return the namespace of the document mapped to the passed id", async () => {
                    const store = new Store();
                    store.read = path => `<% p = "${path}" %>`

                    var doc0 = await store.load("/path/to/doc?x=10");
                    var context = doc0.createContext();
                    
                    var doc1_ns = await context.import('/path/to/doc1');
                    expect(doc1_ns.p).to.equal('/path/to/doc1');
                    expect(doc1_ns.argns.x).to.be.undefined;

                    var doc1_ns = await context.import('/path/to/doc1?x=20');
                    expect(doc1_ns.p).to.equal('/path/to/doc1');
                    expect(doc1_ns.argns.x).to.equal(20);
                });
                
                it("should resolve ids relative to doc.path", async () => {
                    const store = new Store();
                    store.read = path => `<% p = "${path}" %>`
                    var doc0 = await store.load("/path/to/doc?x=10");
                    var ctx = doc0.createContext();
                    
                    expect((await ctx.import('doc1')).p).to.equal('/path/to/doc1');       
                    expect((await ctx.import('../doc2')).p).to.equal('/path/doc2');       
                    expect((await ctx.import('../doc2?x=20')).argns.x).to.equal(20);       
                    expect((await ctx.import('../doc2')).argns.x).to.be.undefined;       
                });
                
                it("should cache the documents and load them only once", async () => {
                    var count = 0;
                    const store = new Store();
                    store.read = path => {
                        count += 1;
                        return `doc @ ${path}`;
                    }
                    var doc = await store.load("/path/to/doc");                    
                    expect(count).to.equal(1);
                    expect(doc.source).to.equal("doc @ /path/to/doc");

                    var ctx = doc.createContext();
                    
                    var ns = await ctx.import("/path/to/doc");
                    expect(count).to.equal(1);
                    
                    var ns = await ctx.import("/path/to/doc?x=10");
                    expect(count).to.equal(1);
                    
                    var ns = await ctx.import("/path/to/doc2");
                    expect(count).to.equal(2);

                    var ns = await ctx.import("/path/to/doc2");
                    expect(count).to.equal(2);
                });
            });
        });        
    });       
});    
