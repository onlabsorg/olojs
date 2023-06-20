const expect = require("chai").expect;
const swan = require('../lib/expression');
const document = require('../lib/document');
const Store = require('../lib/store');


module.exports = (description, options={}) => describe(description, () => {
    var store;

    before(async () => {
        store = await options.create({
            "/doc1": "doc @ /doc1",
            "/doc2": "doc @ /doc2",
            "/doc3": "doc @ /doc3",
            "/path/to/": "doc @ /path/to/",
            "/path/to/doc1": "doc @ /path/to/doc1",
            "/path/to/doc2": "doc @ /path/to/doc2",
            "/path/to/doc3": "doc @ /path/to/doc3",
            "/path/to/dir/doc1": "doc @ /path/to/dir/doc1",
            "/path/to/dir/doc2": "doc @ /path/to/dir/doc2",
            "/path/to/dir/doc3": "doc @ /path/to/dir/doc3",
            "exp/doc1": "2*x=<% y:2*x %>",
            "exp/doc2": "<% docnum = 2, doc3 = import '/exp/doc3' %>doc2",
            "exp/doc3": "<% docnum = 3 %>doc3",
            "exp/doc4": "<% import 'doc3', import './doc3', import '/exp/doc2'%>doc4"
        });
    })

    describe("source = await store.read(path)", () => {

        if (options.readAccessDenied) {

            it("should always throw a `ReadPermissionDenied` error", async () => {
                try {
                    await store.read("/path/to/doc1");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(Store.ReadPermissionDeniedError);
                    expect(error.message).to.equal("Permission denied: READ /path/to/doc1");
                }
            });
        }

        else if (options.voidStore) {

            it("Should always return an empty document", async () => {
                // file path
                var doc = await store.read(`/path/to/doc1`);
                expect(doc).to.equal("");

                // directory path
                var doc = await store.read(`/path/to/`);
                expect(doc).to.equal("")

                // non-existing path
                var doc = await store.read(`path/to/../to/doc2`);
                expect(doc).to.equal("")

                // non-existing path
                var doc = await store.read(`/non/existing/doc`);
                expect(doc).to.equal("");
            });

        } else {

            it("should return the document stored at the normalized given path", async () => {

                // file path
                var doc = await store.read(`/path/to/doc1`);
                expect(doc).to.equal("doc @ /path/to/doc1");

                // directory path
                var doc = await store.read(`/path/to/`);
                expect(doc).to.equal("doc @ /path/to/")

                // non-normalized path
                var doc = await store.read(`path/to/../to/doc2`);
                expect(doc).to.equal("doc @ /path/to/doc2")
            });

            it("should return an empty string if the path doesn't exist", async () => {
                var doc = await store.read(`/non/existing/doc`);
                expect(doc).to.equal("");
            });
        }
    });

    if (!options.voidStore && !options.readOnly && !options.readAccessDenied && !options.writeAccessDenied) {
        
        describe(`doc = await store.loadDocument(path)`, () => {
            
            describe('doc.path', () => {

                it("should contain the normalized path of the documet in the store", async () => {
                    const doc = await store.loadDocument('path/to/x/../doc3');
                    expect(doc.path).to.equal('/path/to/doc3');
                });
            });

            describe('doc.source', () => {

                it("should contain the stringified source passed to the constructor", async () => {
                    const doc = await store.loadDocument('path/to/x/../doc3');
                    expect(doc.source).to.equal('doc @ /path/to/doc3');
                });

                it("should default to an empty string if the source parameter is omitted", async () => {
                    const doc = await store.loadDocument('path/to/non/existing/doc');
                    expect(doc.source).to.equal('');
                });
            });

            describe('docns = doc.evaluate(context)', () => {

                it("should contained the compiled source function", async () => {
                    const doc = await store.loadDocument('/exp/doc1');
                    expect(doc.evaluate).to.be.a("function");
                    const context = document.createContext({x:10});
                    const docns = await doc.evaluate(context);
                    expect(docns.y).to.equal(20);
                    expect(docns.__text__).to.equal('2*x=20');
                });
            });

            describe('context = doc.createContext(...presets)', () => {

                it("should return a valid document context", async () => {
                    const doc = await store.loadDocument('path/to/x/../doc3');
                    const context = doc.createContext();
                    const document_context = document.createContext();
                    for (let key in document_context) {
                        if (key !== "this") {
                            expect(context[key]).to.equal(document_context[key]);
                        }
                    }
                    expect(swan.types.unwrap(context.this)).to.equal(context);
                });

                it("should contain the document as `__doc__`", async () => {
                    const doc = await store.loadDocument('path/to/x/../doc3');
                    const context = doc.createContext();
                    expect(context.__doc__).to.equal(doc);
                });

                it("should contain the document store as `__store__`", async () => {
                    const doc = await store.loadDocument('path/to/x/../doc3');
                    const context = doc.createContext();
                    expect(context.__store__).to.equal(store);
                });

                it("should contain the passed namespaces properties", async () => {
                    const doc = await store.loadDocument('path/to/x/../doc3');
                    const context = doc.createContext({x:10, y:20}, {y:30, z:40});
                    expect(context.x).to.equal(10);
                    expect(context.y).to.equal(30);
                    expect(context.z).to.equal(40);
                });

                describe('context.import', () => {

                    it("should be a function", async () => {
                        const doc = await store.loadDocument('path/to/x/../doc3');
                        const context = doc.createContext();
                        expect(context.import).to.be.a("function");
                    });

                    it("should return the namespace of the passed document", async () => {
                        const doc = await store.loadDocument('path/to/x/../doc3');
                        const doc2ns = await doc.createContext().import('/exp/doc2');
                        expect(doc2ns.docnum).to.equal(2);
                        expect(doc2ns.__text__).to.equal("doc2");
                        expect(doc2ns.doc3.docnum).to.equal(3)
                        expect(doc2ns.doc3.__text__).to.equal('doc3')
                    });

                    it("should resolve paths relative to the document path", async () => {
                        const doc = await store.loadDocument('/exp/doc1');
                        const doc2ns = await doc.createContext().import('./doc2');
                        expect(doc2ns.docnum).to.equal(2);
                        expect(doc2ns.__text__).to.equal("doc2");
                        expect(doc2ns.doc3.docnum).to.equal(3)
                        expect(doc2ns.doc3.__text__).to.equal('doc3')
                    });

                    it("should cache the documents", async () => {
                        const xstore = Object.create(store);
                        xstore.loaded = [];
                        xstore.read = function (path) {
                            xstore.loaded.push(store.normalizePath(path))
                            return store.read(path);
                        }

                        const doc4 = await xstore.loadDocument('/exp/doc4');
                        const doc4ns = await doc4.evaluate(doc4.createContext());
                        expect(xstore.loaded).to.deep.equal(['/exp/doc4', '/exp/doc3', '/exp/doc2'])
                    });
                });
            });
        });
        
        describe(`doc = await store.evaluateDocument(path, ...presets)`, () => {
            
            it("should load and evaluate a document from the store", async () => {
                const doc2ns = await store.evaluateDocument('/exp/doc2');
                expect(doc2ns.docnum).to.equal(2);
                expect(doc2ns.__text__).to.equal("doc2");
                expect(doc2ns.doc3.docnum).to.equal(3)
                expect(doc2ns.doc3.__text__).to.equal('doc3')
            });
        });    
    }
    
    describe("substore = store.createSubStore(rootPath)", () => {
        
        it("should be a Store object", () => {
            const substore = store.createSubStore('/path/to/dir');
            expect(substore).to.be.instanceof(Store);
        });
        
        describe("substore.read(path)", () => {

            it("should delegate to store.read(rootPath+path)", () => {
                const substore = store.createSubStore('/path/to/./dir');
                store.read = path => `Called store.read with path ${path}`;
                expect(substore.read('/path/to/doc')).to.equal("Called store.read with path /path/to/dir/path/to/doc");
                delete store.read;
            });
        });

        describe("substore.createSubStore(path)", () => {

            it("should delegate to store.createSubStore(rootPath+path)", () => {
                const substore = store.createSubStore('/path/to/./dir');
                store.createSubStore = path => `Called store.createSubStore with path ${path}`;
                expect(substore.createSubStore('dir2')).to.equal("Called store.createSubStore with path /path/to/dir/dir2");
                delete store.createSubStore;
            });
        });
    });

    after(async () => {
        if (typeof options.destroy === 'function') {
            await options.destroy(store);
        }
    });
});
