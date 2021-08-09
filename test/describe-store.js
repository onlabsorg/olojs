const expect = require("chai").expect;
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

    describe("entries = await store.list(path)", () => {
        
        if (options.readAccessDenied) {
            
            it("should always throw a `ReadPermissionDenied` error", async () => {
                try {
                    await store.list("/path/to/doc1");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(Store.ReadPermissionDeniedError);
                    expect(error.message).to.equal("Permission denied: READ /path/to/doc1");
                }
            });
        }
        
        else if (options.voidStore) {
                        
            it("should always return an empty array", async () => {

                var items = await store.list(`/`);
                expect(items.sort()).to.deep.equal([]);

                var items = await store.list(`/path/to/`);
                expect(items.sort()).to.deep.equal([]);
                
                var items = await store.list(`/non/existing/dir/index/`);
                expect(items.sort()).to.deep.equal([]);
            });

        } else {

            it("should return the arrays of the child names of passed path", async () => {
                var items = await store.list(`/`);
                expect(items.sort()).to.deep.equal(["doc1", "doc2", "doc3", "path/"]);

                var items = await store.list(`/path/to/`);
                expect(items.sort()).to.deep.equal(["", "dir/", "doc1", "doc2", "doc3"]);
            });

            it("should return an empty array if the directory doesn't exist", async () => {
                var items = await store.list(`/non/existing/dir/index/`);
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
    
    describe("await store.deleteAll(path)", () => {
        
        if (options.writeAccessDenied) {
            
            it("should always throw a `ReadPermissionDenied` error", async () => {
                try {
                    await store.deleteAll("/path/to/dir");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(Store.WritePermissionDeniedError);
                    expect(error.message).to.equal("Permission denied: WRITE /path/to/dir");
                }
            });
        }
        
        else if (options.voidStore || options.readOnly) {
                        
            it("should always throw a `WriteOperationNotAllowed` error", async () => {
                try {
                    await store.deleteAll("/path/to/");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(Store.WriteOperationNotAllowedError);
                    expect(error.message).to.equal("Operation not allowed: WRITE /path/to/");
                }
            });

        } else {

            it("should remove all the documents under the given directory path", async () => {
                expect(await store.read(`/path/to/dir/doc1`)).to.equal("doc @ /path/to/dir/doc1");
                expect(await store.read(`/path/to/dir/doc2`)).to.equal("doc @ /path/to/dir/doc2");
                expect(await store.read(`/path/to/dir/doc3`)).to.equal("doc @ /path/to/dir/doc3");
                expect((await store.list(`/path/to/dir`)).sort()).to.deep.equal(['doc1', 'doc2', 'doc3']);
                
                await store.deleteAll(`/path/to/dir`);

                expect(await store.read(`/path/to/dir/doc1`)).to.equal("");
                expect(await store.read(`/path/to/dir/doc2`)).to.equal("");
                expect(await store.read(`/path/to/dir/doc3`)).to.equal("");
                expect(await store.list(`/path/to/dir`)).to.deep.equal([]);
            });

            it("should return silently if the directory already doesn't exist", async () => {
                expect(await store.read(`/path/to/dir/doc1`)).to.equal("");
                expect(await store.read(`/path/to/dir/doc2`)).to.equal("");
                expect(await store.read(`/path/to/dir/doc3`)).to.equal("");
                expect(await store.list(`/path/to/dir`)).to.deep.equal([]);
                
                await store.deleteAll(`/path/to/dir`);

                expect(await store.read(`/path/to/dir/doc1`)).to.equal("");
                expect(await store.read(`/path/to/dir/doc2`)).to.equal("");
                expect(await store.read(`/path/to/dir/doc3`)).to.equal("");
                expect(await store.list(`/path/to/dir`)).to.deep.equal([]);
            });
        }
    });
    
    after(async () => {
        if (typeof options.destroy === 'function') {
            await options.destroy(store);
        }
    });
});





