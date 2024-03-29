const expect = require("chai").expect;
const swan = require('../lib/expression');
const document = require('../lib/document');
const Store = require('../lib/stores/store');


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

        if (options.privatePath) {

            it("should always throw a `ReadPermissionDeniedError` on read requests of private documents", async () => {
                try {
                    await store.read(`${options.privatePath}/path/to/doc1`);
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(Store.ReadPermissionDeniedError);
                    expect(error.message).to.equal(`Permission denied: READ ${options.privatePath}/path/to/doc1`);
                }
            });
        }

        if (options.unallowedPath) {

            it("should always throw a `ReadOperationNotAllowedError` on read requests of private documents", async () => {
                try {
                    await store.read(`${options.unallowedPath}/path/to/doc1`);
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(Store.ReadOperationNotAllowedError);
                    expect(error.message).to.equal(`Operation not allowed: READ ${options.unallowedPath}/path/to/doc1`);
                }
            });
        }
    });

    describe(`await store.write(path, source)`, () => {

        it("should modify the source of the document at the given path", async () => {
            var doc = await store.read(`/path/to/doc1`);
            expect(doc).to.equal("doc @ /path/to/doc1");

            const newSource = "New source 1";
            await store.write(`path/to/./doc1`, newSource)
            var doc = await store.read(`/path/to/doc1`);
            expect(doc).to.equal(newSource);
        });

        it("should create the document if it doesn't exist", async () => {
            var doc = await store.read(`/path/to/new/doc1`);
            expect(doc).to.equal("");

            const newSource = "doc @ /path/to/new/doc1";
            await store.write(`path/to/./new/doc1`, newSource)
            var doc = await store.read(`/path/to/new/doc1`);
            expect(doc).to.equal(newSource);
        });

        if (options.privatePath) {

            it("should always throw a `WritePermissionDeniedError` on write requests of private documents", async () => {
                try {
                    await store.write(`${options.privatePath}/path/to/doc1`, "xxx");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(Store.WritePermissionDeniedError);
                    expect(error.message).to.equal(`Permission denied: WRITE ${options.privatePath}/path/to/doc1`);
                }
            });
        }

        if (options.unallowedPath) {

            it("should always throw a `WriteOperationNotAllowedError` on write requests of private documents", async () => {
                try {
                    await store.write(`${options.unallowedPath}/path/to/doc1`,"xxx");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(Store.WriteOperationNotAllowedError);
                    expect(error.message).to.equal(`Operation not allowed: WRITE ${options.unallowedPath}/path/to/doc1`);
                }
            });
        }
    });

    describe(`await store.delete(path)`, () => {

        it("should remove the document at the given path", async () => {
            var doc = await store.read(`/path/to/doc2`);
            expect(doc).to.equal("doc @ /path/to/doc2");

            await store.delete(`path/to/./doc2`)
            var doc = await store.read(`/path/to/doc2`);
            expect(doc).to.equal("");
        });

        it("should do nothing if the document alread does not extist", async () => {
            var doc = await store.read(`/path/to/doc9`);
            expect(doc).to.equal("");

            await store.delete(`path/to/./doc9`)
            var doc = await store.read(`/path/to/doc9`);
            expect(doc).to.equal("");
        });

        if (options.privatePath) {

            it("should always throw a `WritePermissionDeniedError` on delete requests of private documents", async () => {
                try {
                    await store.delete(`${options.privatePath}/path/to/doc1`);
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(Store.WritePermissionDeniedError);
                    expect(error.message).to.equal(`Permission denied: WRITE ${options.privatePath}/path/to/doc1`);
                }
            });
        }

        if (options.unallowedPath) {

            it("should always throw a `WriteOperationNotAllowedError` on delete requests of private documents", async () => {
                try {
                    await store.delete(`${options.unallowedPath}/path/to/doc1`);
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(Store.WriteOperationNotAllowedError);
                    expect(error.message).to.equal(`Operation not allowed: WRITE ${options.unallowedPath}/path/to/doc1`);
                }
            });
        }
    });

    after(async () => {
        if (typeof options.destroy === 'function') {
            await options.destroy(store);
        }
    });
});
