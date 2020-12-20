var expect = require("chai").expect;
var document = require('../lib/document');
var Loader = require('../lib/loader');


describe('Loader', () => {
    
    describe('Loader.parseId', () => {
        
        it("should return {storeName, path, query}", () => {
            var pid = Loader.parseId('http://username@hostname:1234/path/to/doc?query-str#fragment-str');
            expect(pid).to.deep.equal({
                storeName:  'http',
                path:       '//username@hostname:1234/path/to/doc',
                query:      'query-str',
            });
        });
        
        it("should default to `Loader.DEFAULT_STORE_NAME` if the store name is missing", () => {
            expect(Loader.parseId('//username@hostname:1234/path/to/doc?query-str#fragment-str')).to.deep.equal({
                storeName:  Loader.DEFAULT_STORE_NAME,
                path:       '//username@hostname:1234/path/to/doc',
                query:      'query-str',
            });
        });

        it("should default to `/` if the path is missing", () => {
            expect(Loader.parseId('ppp:?query-str#fragment-str')).to.deep.equal({
                storeName:  'ppp',
                path:       '/',
                query:      'query-str',
            });
        });

        it("should report an empty string query if the query part is missing", () => {
            expect(Loader.parseId('ppp://username@hostname:1234/path/to/doc#fragment-str')).to.deep.equal({
                storeName:  'ppp',
                path:       '//username@hostname:1234/path/to/doc',
                query:      '',
            });
            expect(Loader.parseId('ppp://username@hostname:1234/path/to/doc?#fragment-str')).to.deep.equal({
                storeName:  'ppp',
                path:       '//username@hostname:1234/path/to/doc',
                query:      '',
            });
        });

        it("should detect any type of partial authority", () => {
            expect(Loader.parseId('http://hostname:1234/path/to/doc?query-str#fragment-str')).to.deep.equal({
                storeName:  'http',
                path:       '//hostname:1234/path/to/doc',
                query:      'query-str',
            });
            expect(Loader.parseId('http://username@:1234/path/to/doc?query-str#fragment-str')).to.deep.equal({
                storeName:  'http',
                path:       '//username@:1234/path/to/doc',
                query:      'query-str',
            });
            expect(Loader.parseId('http://username@hostname/path/to/doc?query-str#fragment-str')).to.deep.equal({
                storeName:  'http',
                path:       '//username@hostname/path/to/doc',
                query:      'query-str',
            });
            expect(Loader.parseId('http://username@/path/to/doc?query-str#fragment-str')).to.deep.equal({
                storeName:  'http',
                path:       '//username@/path/to/doc',
                query:      'query-str',
            });
            expect(Loader.parseId('http://hostname/path/to/doc?query-str#fragment-str')).to.deep.equal({
                storeName:  'http',
                path:       '//hostname/path/to/doc',
                query:      'query-str',
            });
            expect(Loader.parseId('http://:1234/path/to/doc?query-str#fragment-str')).to.deep.equal({
                storeName:  'http',
                path:       '//:1234/path/to/doc',
                query:      'query-str',
            });
        });   
        
        it("should normalize the path", () => {
            expect(Loader.parseId('http://username@hostname:1234/path/to/../doc?query-str#fragment-str')).to.deep.equal({
                storeName:  'http',
                path:       '//username@hostname:1234/path/doc',
                query:      'query-str',
            });
            expect(Loader.parseId('http://username@hostname:1234/../path/to/doc?query-str#fragment-str')).to.deep.equal({
                storeName:  'http',
                path:       '//username@hostname:1234/path/to/doc',
                query:      'query-str',
            });
            expect(Loader.parseId('http:path/to/doc?query-str#fragment-str')).to.deep.equal({
                storeName:  'http',
                path:       '/path/to/doc',
                query:      'query-str',
            });
            expect(Loader.parseId('http:../path/to/doc?query-str#fragment-str')).to.deep.equal({
                storeName:  'http',
                path:       '/path/to/doc',
                query:      'query-str',
            });
        });

        it("should unescape the id components", () => {
            expect(Loader.parseId('http://user[%20]name@ho[%20]stname:1234/path/to/[%20]doc?query[%20]str#frag[%20]ment-str')).to.deep.equal({
                storeName:  'http',
                path:       '//user[ ]name@ho[ ]stname:1234/path/to/[ ]doc',
                query:      'query[ ]str',
            });
        });             
    });

    describe("argns = Loader.parseQuery(query)", () => {
        
        it("should return an object containing all the key=value pairs of the query", () => {
            expect(Loader.parseQuery("x=10&y=20&s=abc")).to.deep.equal({x:10, y:20, s:"abc"});
            expect(Loader.parseQuery("x=10;y=20;s=abc")).to.deep.equal({x:10, y:20, s:"abc"});
            expect(Loader.parseQuery("x=10&y=20;s=abc")).to.deep.equal({x:10, y:20, s:"abc"});
        });

        it("should assign `true` to keys without a value", () => {
            expect(Loader.parseQuery("x=10&y=20;bool")).to.deep.equal({x:10, y:20, bool:true});
        });
    });
    
    describe("load = Loader(stores)", () => {
        
        it("should return a function", () => {
            var load = Loader({});
            expect(load).to.be.a("function");
        });
        
        describe('doc = await load(docId)', () => {
            
            it("should return an object", async () => {
                var load = Loader({});
                var doc = await load("/path/to/doc");
                expect(doc).to.be.an("object");
            });
            
            it("should throw a Loader.UnknownStoreError if the id store name is not defined", async () => {
                var load = Loader({});
                try {
                    var doc = await load("ppp:/path/to/doc");
                    throw new Error("It did not throw");
                } catch (error) {
                    expect(error).to.be.instanceof(Loader.UnknownStoreError);
                    expect(error.message).to.equal(`Unknown store name: ppp`);
                }
            });
            
            describe('doc.id', () => {
                
                it("should contain the partial document id, wthout query string", async () => {
                    var load = Loader({
                        st1: {get: path => `doc @ st1:${path}`}
                    });
                    var doc = await load("st1:/path/to/doc?x=10;y=20");
                    expect(doc.id).to.equal("st1:/path/to/doc");
                });

                it("should default to the Loader.DEFAULT_STORE_NAME if the scheme is missing", async () => {
                    var load = Loader({
                        home: {get: path => `doc @ home:${path}`}
                    });
                    var doc = await load("/path/to/doc?x=10;y=20");
                    expect(doc.id).to.equal("home:/path/to/doc");
                });
            });

            describe('doc.source', () => {
                
                it("should contain the source returned by the matching store", async () => {
                    var load = Loader({
                        st1: {get: path => `doc @ st1:${path}`},
                        st2: {get: path => `doc @ st2:${path}`}
                    });
                    
                    var doc = await load("st1:/path/to/doc");
                    expect(doc.source).to.equal("doc @ st1:/path/to/doc");

                    var doc = await load("st2:/path/to/doc");
                    expect(doc.source).to.equal("doc @ st2:/path/to/doc");
                });

                it("should default to the Loader.DEFAULT_STORE_NAME if the scheme is missing", async () => {
                    var load = Loader({
                        home: {get: path => `doc @ home:${path}`}
                    });
                    var doc = await load("/path/to/doc?x=10;y=20");
                    expect(doc.source).to.equal("doc @ home:/path/to/doc");
                });
            });

            describe('docns = await doc.evaluate(context)', () => {
                
                it("should evaluate the document source in the passed context", async () => {
                    var load = Loader({
                        home: {get: path => `<% p = "${path}" %>`}
                    });
                    var doc = await load("/path/to/doc");
                    var docns = await doc.evaluate(document.createContext());
                    expect(docns.p).to.equal("/path/to/doc");
                });
            });

            describe('context = doc.createContext(...namespaces)', () => {
                
                it("should return a document context", async () => {
                    var load = Loader({
                        home: {get: path => `<% p = "${path}" %>`}
                    });
                    
                    var doc = await load("/path/to/doc");
                    var context = doc.createContext();
                    
                    var docContext = document.createContext();
                    for (let name in docContext) {
                        expect(context[name]).to.equal(docContext[name]);
                    }
                });
                
                it("should include all the names in the passed namespaces", async () => {
                    var load = Loader({
                        home: {get: path => `<% p = "${path}" %>`}
                    });
                    
                    var doc = await load("/path/to/doc");
                    var context = doc.createContext({x:10, y:20}, {y:30, z:40});
                    
                    expect(context.x).to.equal(10);                    
                    expect(context.y).to.equal(30);                    
                    expect(context.z).to.equal(40);                    
                });
                
                describe("context.__id__", () => {
                    it("should contain doc.id", async () => {
                        var load = Loader({
                            home: {get: path => `<% p = "${path}" %>`}
                        });                        
                        var doc = await load("/path/to/doc");
                        var context = doc.createContext({x:10, y:20}, {y:30, z:40});
                        expect(context.__id__).to.equal(doc.id);
                    });
                });
                
                describe("context.__load__", () => {
                    it("should contain document loader", async () => {
                        var load = Loader({
                            home: {get: path => `<% p = "${path}" %>`}
                        });                        
                        var doc = await load("/path/to/doc");
                        var context = doc.createContext();
                        expect(context.__load__).to.equal(load);
                    });
                });
                
                describe("context.argns", () => {
                    it("should contain the key-value pairs passed via the query string", async () => {
                        var load = Loader({
                            home: {get: path => `<% p = "${path}" %>`}
                        });                        
                        var doc = await load("/path/to/doc?x=10;y=20&z=30;bool");
                        var context = doc.createContext();
                        expect(context.argns).to.deep.equal({x:10, y:20, z:30, bool:true});
                    });
                });
                
                describe("docns = context.import(id)", () => {
                    
                    it("should be a function", async () => {
                        var load = Loader({
                            home: {get: path => `<% p = "${path}" %>`}
                        });                        
                        var doc = await load("/path/to/doc");
                        var context = doc.createContext();
                        expect(context.import).to.be.a("function");                        
                    });
                    
                    it("should return the namespace of the document mapped to the passed id", async () => {
                        var load = Loader({
                            st1: {get: path => `<% p1 = "st1:${path}" %>`},
                            st2: {get: path => `<% p2 = "st2:${path}" %>`}
                        });                        
                        var doc0 = await load("st1:/path/to/doc?x=10");
                        var context = doc0.createContext();
                        
                        var doc1_ns = await context.import('st2:/path/to/doc1');
                        expect(doc1_ns.p2).to.equal('st2:/path/to/doc1');
                        expect(doc1_ns.argns.x).to.be.undefined;

                        var doc1_ns = await context.import('st2:/path/to/doc1?x=20');
                        expect(doc1_ns.p2).to.equal('st2:/path/to/doc1');
                        expect(doc1_ns.argns.x).to.equal(20);

                        var doc2_ns = await context.import('st1:/path/to/doc2');
                        expect(doc2_ns.p1).to.equal('st1:/path/to/doc2');
                        expect(doc2_ns.argns.x).to.be.undefined;

                        var doc2_ns = await context.import('st1:/path/to/doc2?x=20');
                        expect(doc2_ns.p1).to.equal('st1:/path/to/doc2');
                        expect(doc2_ns.argns.x).to.equal(20);
                    });
                    
                    it("should resolve ids relative to doc.id", async () => {
                        var load = Loader({
                            home: {get: path => `<% p = "home:${path}" %>`},
                            st1:  {get: path => `<% p = "st1:${path}" %>`}
                        });     
                                           
                        var doc = await load("/path/to/doc?x=10");
                        var ctx = doc.createContext();                        
                        expect((await ctx.import('doc1')).p).to.equal('home:/path/to/doc1');       
                        expect((await ctx.import('../doc2')).p).to.equal('home:/path/doc2');       
                        expect((await ctx.import('../doc2?x=20')).argns.x).to.equal(20);       
                        expect((await ctx.import('../doc2')).argns.x).to.be.undefined;       

                        var doc = await load("st1:/path/to/doc?x=10");
                        var ctx = doc.createContext();                        
                        expect((await ctx.import('doc1')).p).to.equal('st1:/path/to/doc1');       
                        expect((await ctx.import('../doc2')).p).to.equal('st1:/path/doc2');       
                        expect((await ctx.import('/doc3')).p).to.equal('st1:/doc3');       
                        expect((await ctx.import('../doc2?x=20')).argns.x).to.equal(20);       
                        expect((await ctx.import('../doc2')).argns.x).to.be.undefined;       
                    });
                });
            });
        });
        
        describe("loader cache", () => {
            it("should cache the documents and load them only once", async () => {
                var count = 0;
                var load = Loader({
                    st1: {
                        get (path) {
                            count += 1;
                            return `doc @ st1:${path}`;
                        }
                    }
                });
                
                var doc = await load("st1:/path/to/doc");
                expect(count).to.equal(1);
                expect(doc.source).to.equal("doc @ st1:/path/to/doc");
                
                var doc = await load("st1:/path/to/doc?x=10");
                expect(count).to.equal(1);
                expect(doc.source).to.equal("doc @ st1:/path/to/doc");
                
                var doc = await load("st1:/path/to/doc2");
                expect(count).to.equal(2);
                expect(doc.source).to.equal("doc @ st1:/path/to/doc2");
            });
        });
    });
});
