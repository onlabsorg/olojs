const expect = require("chai").expect;
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

    describe(`items = await store.list(path)`, () => {
        
        if (options.readAccessDenied) {

            it.skip("should always throw a `ReadPermissionDenied` error", async () => {
                try {
                    await store.list("/path/to/dir1");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(Store.ReadPermissionDeniedError);
                    expect(error.message).to.equal("Permission denied: READ /path/to/dir1");
                }
            });
        }

        else if (options.voidStore) {

            it("Should always return an empty array", async () => {

                // file-like path
                var items = await store.list(`/path/to/dir`);
                expect(items).to.deep.equal([]);

                // directory path
                var items = await store.list(`/path/to/dir/`);
                expect(items).to.deep.equal([]);

                // unresolved path
                var items = await store.list(`path/to/../to/dir`);
                expect(items).to.deep.equal([]);

                // non-existing path
                var items = await store.list(`/non/existing/dir/`);
                expect(items).to.deep.equal([]);
            });

        } else {

            it("should return the list of documents and directories contained in the given directory", async () => {
                var items = await store.list('/path/to');
                expect(items.sort()).to.deep.equal(['', 'dir/', 'doc1', 'doc2', 'doc3']);

                var items = await store.list('path/to/dir/');
                expect(items.sort()).to.deep.equal(['doc1', 'doc2', 'doc3']);
            });

            it("should return an empty array if the directory doesn't exist", async () => {
                var items = await store.list('/path/to/non-existing/dir/');
                expect(items.sort()).to.deep.equal([]);
            });
        }

    });

    describe("await store.write(path, source)", () => {

        if (options.writeAccessDenied) {

            it("should always throw a `ReadPermissionDenied` error", async () => {
                try {
                    await store.write("/path/to/doc1", "...");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(Store.WritePermissionDeniedError);
                    expect(error.message).to.equal("Permission denied: WRITE /path/to/doc1");
                }
            });
        }

        else if (options.voidStore || options.readOnly) {

            it("should always throw a `WriteOperationNotAllowed` error", async () => {
                try {
                    await store.write("/path/to/doc1", "source of doc 1");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(Store.WriteOperationNotAllowedError);
                    expect(error.message).to.equal("Operation not allowed: WRITE /path/to/doc1");
                }
            });

        } else {

            it("should change the source of the document maped to the given path", async () => {

                // file-like path
                expect(await store.read(`/path/to/doc1`)).to.equal("doc @ /path/to/doc1");
                await store.write(`/path/to/doc1`, "new doc @ /path/to/doc1");
                expect(await store.read(`/path/to/doc1`)).to.equal("new doc @ /path/to/doc1");

                //directory-like path
                expect(await store.read(`/path/to/`)).to.equal("doc @ /path/to/");
                await store.write(`/path/to/`, "new doc @ /path/to/");
                expect(await store.read(`/path/to/`)).to.equal("new doc @ /path/to/");
            });

            it("should create the document if it doesn't exist", async () => {
                expect(await store.read(`/path/to/doc4`)).to.equal("");
                await store.write(`/path/to/doc4`, "doc @ /path/to/doc4");
                expect(await store.read(`/path/to/doc4`)).to.equal("doc @ /path/to/doc4");
            });
        }
    });

    describe("await store.delete(path)", () => {

        if (options.writeAccessDenied) {

            it("should always throw a `ReadPermissionDenied` error", async () => {
                try {
                    await store.delete("/path/to/doc1");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(Store.WritePermissionDeniedError);
                    expect(error.message).to.equal("Permission denied: WRITE /path/to/doc1");
                }
            });
        }

        else if (options.voidStore || options.readOnly) {

            it("should always throw a `WriteOperationNotAllowed` error", async () => {
                try {
                    await store.delete("/path/to/doc1");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(Store.WriteOperationNotAllowedError);
                    expect(error.message).to.equal("Operation not allowed: WRITE /path/to/doc1");
                }
            });

        } else {

            it("should remove the file at path", async () => {
                expect(await store.read(`/path/to/doc1`)).to.not.equal("");
                await store.delete(`/path/to/doc1`);
                expect(await store.read(`/path/to/doc1`)).to.equal("");
            });

            it("should return silentrly if the file already doesn't exist", async () => {
                expect(await store.read(`/path/to/doc1`)).to.equal("");
                await store.delete(`/path/to/doc1`);
                expect(await store.read(`/path/to/doc1`)).to.equal("");
            });
        }
    });
    
    if (!options.voidStore && !options.readOnly && !options.readAccessDenied && !options.writeAccessDenied) {
        
        describe(`doc = store.createDocument(path, source)`, () => {
            
            describe('doc.store', () => {
                
                it("should contain a reference to the store that created the document", () => {
                    const doc = store.createDocument('/path/to/doc');
                    expect(doc.store).to.equal(store);
                });
            });
            
            describe('doc.path', () => {
                
                it("should contain the normalized path of the documet in the store", () => {
                    const doc = store.createDocument('path/to/../to/doc');
                    expect(doc.path).to.equal('/path/to/doc');
                });
            });
            
            describe('doc.source', () => {
                
                it("should contain the stringified source passed to the constructor", () => {
                    const doc = store.createDocument('/path/to/doc', {toString: () => 'doc @ /path/to/doc'});
                    expect(doc.source).to.equal('doc @ /path/to/doc');
                });            
                
                it("should default to an empty string if the source parameter is omitted", () => {
                    const doc = store.createDocument('/path/to/doc');
                    expect(doc.source).to.equal('');
                });            
            });
            
            describe('docns = doc.evaluate(context)', () => {
                
                it("should contained the compiled source function", async () => {
                    const doc = store.createDocument('/path/to/doc', '2*x=<% y:2*x %>');
                    expect(doc.evaluate).to.be.a("function");
                    const context = document.createContext({x:10});
                    const docns = await doc.evaluate(context);
                    expect(docns.y).to.equal(20);
                    expect(docns.__text__).to.equal('2*x=20');
                });            
            });
            
            describe('context = doc.createContext(...presets)', () => {
                
                it("should return a valid document context", () => {
                    const doc = store.createDocument('/path/to/doc1');
                    const context = doc.createContext();
                    const document_context = document.createContext();
                    for (let key in document_context) {
                        if (key !== "this") {
                            expect(context[key]).to.equal(document_context[key]);
                        }
                    }
                    expect(context.this).to.equal(context);
                });
                
                it("should contain the document path as `__path__`", () => {
                    const doc = store.createDocument('/path/to/doc1');
                    const context = doc.createContext();
                    expect(context.__path__).to.equal('/path/to/doc1');
                });
                
                it("should contain the document parent path as `__dirpath__`", () => {
                    const doc = store.createDocument('/path/to/doc1');
                    const context = doc.createContext();
                    expect(context.__dirpath__).to.equal('/path/to/');
                });
                
                it("should contain the passed namespaces properties", () => {
                    const doc = store.createDocument('/path/to/doc1');
                    const context = doc.createContext({x:10, y:20}, {y:30, z:40});
                    expect(context.x).to.equal(10);
                    expect(context.y).to.equal(30);
                    expect(context.z).to.equal(40);
                });            
                
                it("should contain the document load method as `import`", async () => {
                });

                describe('docns = await context.import(path)', () => {
                    
                    it("should be a function", () => {
                        const doc = store.createDocument('/path/to/doc1');
                        const context = doc.createContext();
                        expect(context.import).to.be.a("function");
                    });
                    
                    it("should return the namespace of the passed document", async () => {
                        await store.write('/path/to/doc1', "<% docnum = 1, doc2 = import '/path/to/doc2' %>doc1");
                        await store.write('/path/to/doc2', "<% docnum = 2 %>doc2");
                        
                        var doc = store.createDocument('/path/to/doc');
                        const doc1ns = await doc.createContext().import('/path/to/doc1');
                        expect(doc1ns.docnum).to.equal(1);
                        expect(doc1ns.__text__).to.equal("doc1");
                        expect(doc1ns.doc2.docnum).to.equal(2)
                        expect(doc1ns.doc2.__text__).to.equal('doc2')
                    });

                    it("should resolve paths relative to the document path", async () => {
                        await store.write('/path/to/doc1', "<% docnum = 1, doc2 = import 'doc2' %>doc1");
                        await store.write('/path/to/doc2', "<% docnum = 2 %>doc2");
                        
                        var doc = store.createDocument('/path/to/doc');
                        const doc1ns = await doc.createContext().import('../to/doc1');
                        expect(doc1ns.docnum).to.equal(1);
                        expect(doc1ns.__text__).to.equal("doc1");
                        expect(doc1ns.doc2.docnum).to.equal(2)
                        expect(doc1ns.doc2.__text__).to.equal('doc2')
                    });

                    it("should cache the documents", async () => {
                        await store.write('/path/to/doc1', "doc @ <% __path__ %><% doc2 = import 'doc2' %>");
                        await store.write('/path/to/doc2', "doc @ <% __path__ %>");

                        const xstore = Object.create(store);
                        xstore.count = 0;
                        xstore.read = path => {
                            xstore.count += 1;
                            return store.read(path);
                        }                        
                        var doc = xstore.createDocument('/path/to/doc');

                        var doc2ns = await doc.createContext().import('/path/to/doc2');
                        expect(xstore.count).to.equal(1);
                        expect(doc2ns.__text__).to.equal("doc @ /path/to/doc2");

                        var doc2ns = await doc.createContext().import('/path/to/doc2');
                        expect(xstore.count).to.equal(1);
                        expect(doc2ns.__text__).to.equal("doc @ /path/to/doc2");
                        
                        var doc1ns = await doc.createContext().import('/path/to/doc1');
                        expect(xstore.count).to.equal(2);
                        expect(doc1ns.__text__).to.equal("doc @ /path/to/doc1");
                        expect(doc1ns.doc2.__text__).to.equal('doc @ /path/to/doc2')
                    });
                });
            });
        }); 
        
        describe(`doc = await store.loadDocument(path)`, () => {
            
            it("shoudl return a document object having the source at the given path", async () => {
                const doc = await store.loadDocument('/path/to/doc3');
                expect(doc).to.be.instanceof(store.createDocument('').constructor);
                expect(doc.store).to.equal(store);
                expect(doc.path).to.equal('/path/to/doc3');
                expect(doc.source).to.equal('doc @ /path/to/doc3');
            });
        });
        
        describe(`doc = await store.loadDocument('/path/to/dir/.info')`, () => {
            
            it("shoudl return a document defining the 'item' name, containing the list of children of `/path/to/dir/`", async () => {
                const doc = await store.loadDocument('/path/to/.info');
                expect(doc).to.be.instanceof(store.createDocument('').constructor);
                expect(doc.source).to.equal("<% items = ['', 'dir/', 'doc1', 'doc2', 'doc3', 'doc4'] %>");
            });
        });
        
        describe(`doc = await store.evaluateDocument(path, ...presets)`, () => {
            
            it("should load and evaluate a document from the store", async () => {
                await store.write('/path/to/doc1', "<% docnum = 1, doc2 = import 'doc2' %>doc1");
                await store.write('/path/to/doc2', "<% docnum = 2 %>doc2");
                
                const doc1ns = await store.evaluateDocument('/path/to/doc1');
                expect(doc1ns.docnum).to.equal(1);
                expect(doc1ns.__text__).to.equal("doc1");
                expect(doc1ns.doc2.docnum).to.equal(2);
                expect(doc1ns.doc2.__text__).to.equal('doc2');            
            });
        });    
        
        describe(`doc = await store.evaluateDocument('/path/to/dir/.info')`, () => {
            
            it("shoudl return a namespace containing the 'item' name, containing the list of children of `/path/to/dir/`", async () => {
                const docns = await store.evaluateDocument('/path/to/.info');
                expect(docns.items).to.deep.equal(['', 'dir/', 'doc1', 'doc2', 'doc3', 'doc4']);
            });
        });        
    }
    
    describe("substore = store.SubStore(rootPath)", () => {
        
        it("should be a Store object", () => {
            const substore = store.SubStore('/path/to/dir');
            expect(substore).to.be.instanceof(Store);
        });
        
        describe("substore.read(path)", () => {

            it("should delegate to store.read(rootPath+path)", () => {
                const substore = store.SubStore('/path/to/./dir');
                store.read = path => `Called store.read with path ${path}`;
                expect(substore.read('/path/to/doc')).to.equal("Called store.read with path /path/to/dir/path/to/doc");
                delete store.read;
            });
        });
        
        describe("substore.write(path, source)", () => {

            it("should delegate to store.write(rootPath+path, source)", () => {
                const substore = store.SubStore('/path/to/./dir');
                store.write = (path, source) => `Called store.write with path ${path} and source ${source}`;
                expect(substore.write('/path/to/doc', "xxx")).to.equal("Called store.write with path /path/to/dir/path/to/doc and source xxx");
                delete store.write;                
            });
        });
        
        describe("substore.delete(path)", () => {

            it("should delegate to store.delete(rootPath+path)", () => {
                const substore = store.SubStore('/path/to/./dir');
                store.delete = path => `Called store.delete with path ${path}`;
                expect(substore.delete('/path/to/doc')).to.equal("Called store.delete with path /path/to/dir/path/to/doc");
                delete store.delete;
            });
        });
        
        describe("substore.SubStore(path)", () => {

            it("should delegate to store.SubStore(rootPath+path)", () => {
                const substore = store.SubStore('/path/to/./dir');
                store.SubStore = path => `Called store.SubStore with path ${path}`;
                expect(substore.SubStore('dir2')).to.equal("Called store.SubStore with path /path/to/dir/dir2");
                delete store.SubStore;
            });
        });
    });

    after(async () => {
        if (typeof options.destroy === 'function') {
            await options.destroy(store);
        }
    });
});
