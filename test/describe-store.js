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
            "/path/to/doc7": "doc @ <% path : '/path/to/doc7' %>",
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

    describe("evaluate = store.parse(source)", () => {

        it("should return a function", () => {
            const evaluate = store.parse(`<%a=10%><%b=a+10%>a + b = <%a+b%>`);
            expect(evaluate).to.be.a("function");
        });

        describe("(await evaluate(context)).data", () => {

            it("should be an object", async () => {
                const evaluate = store.parse("");
                const context = document.createContext();
                const {data} = await evaluate(context);
                expect(data).to.be.an("object");
            });

            it("should contain all the names defined in the swan expressions", async () => {
                const evaluate = store.parse(`<%a=10%><%b=a+10%>`);
                const context = document.createContext({});
                const {data} = await evaluate(context);
                expect(data.a).to.equal(10);
                expect(data.b).to.equal(20);
            });
        });

        describe("(await evaluate(context)).text", () => {

            it("should be string obtained replacing the swan expressions with their stringified return value", async () => {
                const evaluate = store.parse(`<%a=10%><%b=a+10%>a + b = <%a+b%>`);
                const context = document.createContext();
                const {text} = await evaluate(context);
                expect(text).to.equal("a + b = 30");
            });

            it("should decorate the rendered text with the `__render__` function if it exists", async () => {
                var evaluate = store.parse(`<% __render__ = text -> text + "!" %>Hello World`);
                var context = document.createContext();
                var {text} = await evaluate(context);
                expect(text).to.equal("Hello World!");

                var evaluate = store.parse(`<% __render__ = text -> {__str__: ns -> text + "!!"} %>Hello World`);
                var {text} = await evaluate(context);
                expect(text).to.equal("Hello World!!");
            });
        });
    });

    describe("context = store.createContext(docPath, ...namespaces)", () => {

        it("should be a document context", () => {
            const document_context = document.createContext();
            const context = store.createContext('/path/to/doc1');
            for (let key in document_context) {
                if (key !== "this") {
                    expect(context[key]).to.equal(document_context[key]);
                }
            }
            expect(context.this).to.equal(context);
        })

        it("should contain the document path as '__path__'", () => {
            const context = store.createContext('/path/to/doc1');
            expect(context.__path__).to.equal('/path/to/doc1');
        });

        it("should contain the document directory path as '__dirpath__'", () => {
            const context = store.createContext('/path/to/doc1');
            expect(context.__dirpath__).to.equal('/path/to');
        });

        it("should contain the passed namespaces properties", () => {
            const context = store.createContext('/path/to/doc1', {x:10, y:20}, {y:30, z:40});
            expect(context.x).to.equal(10);
            expect(context.y).to.equal(30);
            expect(context.z).to.equal(40);
        });

        it("should contain an 'import' function", () => {
            const context = store.createContext('/path/to/doc1');
            expect(context.import).to.be.a("function");
        });

        if (!(options.readAccessDenied || options.writeAccessDenied || options.voidStore || options.readOnly)) {
            describe("context.import", () => {

                it("should return the namespace of the passed document", async () => {
                    await store.write('/path/to/doc1', "<% docnum = 1 %>doc1");
                    await store.write('/path/to/doc2', "<% docnum = 2 %>doc2");

                    const ctx1 = store.createContext('/path/to/doc1');
                    const doc2_ns = await ctx1.import('/path/to/doc2');
                    expect(doc2_ns.docnum).to.equal(2);
                    expect(await ctx1.str(doc2_ns)).to.equal("doc2");

                    const eval3 = store.parse("<% doc1 = import './doc1' %>");
                    const ctx3 = store.createContext('/path/to/doc3');
                    const data3 = (await eval3(ctx3)).data;
                    expect(data3.doc1.docnum).to.equal(1);
                });

                it("should resolve relative ids", async () => {
                    await store.write('/path/to/doc1', "<% docnum = 1 %>");
                    await store.write('/path/to/doc2', "<% docnum = 2 %>");
                    await store.write('/path/to/doc3', "<% docnum = 3 %>");

                    const ctx1 = store.createContext('/path/to/doc1');

                    const doc2_ns = await ctx1.import('doc2');
                    expect(doc2_ns.docnum).to.equal(2);

                    const doc3_ns = await ctx1.import('./doc3');
                    expect(doc3_ns.docnum).to.equal(3);
                });

                it("should cache the documents", async () => {
                    var count;
                    store.read = path => {
                        count += 1;
                        return `doc @ ${path}<% p = __path__ %>`;
                    }

                    const ctx = store.createContext('/path/to/doc');
                    count = 0;

                    var ns = await ctx.import("/path/to/doc1");
                    expect(count).to.equal(1);
                    expect(ns.p).to.equal("/path/to/doc1");

                    var ns = await ctx.import("/path/to/doc1");
                    expect(count).to.equal(1);
                    expect(ns.p).to.equal("/path/to/doc1");

                    var ns = await ctx.import("/path/to/doc2");
                    expect(count).to.equal(2);
                    expect(ns.p).to.equal("/path/to/doc2");

                    var ns = await ctx.import("/path/to/doc2");
                    expect(count).to.equal(2);
                    expect(ns.p).to.equal("/path/to/doc2");

                    store.read = path => {
                        count += 1;
                        return `doc @ ${path}<% p = __path__ %><% doc2 = import '/path/to/doc2' %>`;
                    }

                    var ns = await ctx.import("/path/to/doc3");
                    expect(count).to.equal(3);
                    expect(ns.p).to.equal("/path/to/doc3");
                    expect(ns.doc2.__path__).to.equal("/path/to/doc2");

                    delete store.read;
                });
            });
        }
    });
    
    describe("await store.load(docPath, ...namespaces)", () => {

        if (options.readAccessDenied) {

            it("should always throw a `ReadPermissionDenied` error", async () => {
                try {
                    await store.load("/path/to/doc1");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(Store.ReadPermissionDeniedError);
                    expect(error.message).to.equal("Permission denied: READ /path/to/doc1");
                }
            });
        }

        else if (options.voidStore) {

            it("Should always return an empty document", async () => {
                var doc = await store.load(`/path/to/doc7`);
                expect(doc.source).to.equal("");
                expect(doc.text).to.equal("");
            });

        } else {

            it("should return an object containing the document source as 'source' property", async () => {
                var doc = await store.load(`/path/to/doc7`);
                expect(doc.source).to.equal("doc @ <% path : '/path/to/doc7' %>");
            });

            it("should return an object containing the document context as 'context' property", async () => {
                var doc = await store.load(`/path/to/doc7`);
                const document_context = document.createContext();
                for (let key in document_context) {
                    if (key !== "this") {
                        expect(doc.context[key]).to.equal(document_context[key]);
                    }
                }
                expect(document_context.this).to.equal(document_context);
                expect(doc.context.__path__).to.equal(`/path/to/doc7`)
            });
            
            it("should return an object containing the document namespace as 'data' property", async () => {
                var doc = await store.load(`/path/to/doc7`);
                expect(doc.data.path).to.equal('/path/to/doc7');
            });

            it("should return an object containing the rendered document as 'text' property", async () => {
                var doc = await store.load(`/path/to/doc7`);
                expect(doc.text).to.equal('doc @ /path/to/doc7');                
            });
            
            it("should return an object containing the document evaluator as 'evaluate' property", async () => {
                var doc = await store.load(`/path/to/doc7`);
                var {data, text} = await doc.evaluate(doc.context);
                expect(text).to.equal(doc.text);                
                expect(data).to.deep.equal(doc.data);                
            });
        }        
    });
    
    describe("substore = store.subStore(rootPath)", () => {
        
        it("should be a Store object", () => {
            const substore = store.subStore('/path/to/dir');
            expect(substore).to.be.instanceof(Store);
        });
        
        describe("substore.read(path)", () => {

            it("should delegate to store.read(rootPath+path)", () => {
                const substore = store.subStore('/path/to/./dir');
                store.read = path => `Called store.read with path ${path}`;
                expect(substore.read('/path/to/doc')).to.equal("Called store.read with path /path/to/dir/path/to/doc");
                delete store.read;
            });
        });
        
        describe("substore.write(path, source)", () => {

            it("should delegate to store.write(rootPath+path, source)", () => {
                const substore = store.subStore('/path/to/./dir');
                store.write = (path, source) => `Called store.write with path ${path} and source ${source}`;
                expect(substore.write('/path/to/doc', "xxx")).to.equal("Called store.write with path /path/to/dir/path/to/doc and source xxx");
                delete store.write;                
            });
        });
        
        describe("substore.delete(path)", () => {

            it("should delegate to store.delete(rootPath+path)", () => {
                const substore = store.subStore('/path/to/./dir');
                store.delete = path => `Called store.delete with path ${path}`;
                expect(substore.delete('/path/to/doc')).to.equal("Called store.delete with path /path/to/dir/path/to/doc");
                delete store.delete;
            });
        });
        
        describe("substore.subStore(path)", () => {

            it("should delegate to store.subStore(rootPath+path)", () => {
                const substore = store.subStore('/path/to/./dir');
                store.subStore = path => `Called store.subStore with path ${path}`;
                expect(substore.subStore('dir2')).to.equal("Called store.subStore with path /path/to/dir/dir2");
                delete store.subStore;
            });
        });
    });

    after(async () => {
        if (typeof options.destroy === 'function') {
            await options.destroy(store);
        }
    });
});
