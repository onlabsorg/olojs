const expect = require("chai").expect;
const Store = require('../lib/stores/store');
const MemoryStore = require('../lib/stores/memory-store');
const SubStore = require('../lib/stores/sub-store');




describe("subStore = new SubStore(rootStore, rootPath)", () => {

    it("should be a Store object", () => {
        const rootStore = new MemoryStore();
        const subStore = new SubStore(rootStore, '/path/to/dir');
        expect(subStore).to.be.instanceof(Store);
    });

    describe("subStore.read(path)", () => {

        it("should delegate to rootStore.read(rootPath+path)", async () => {
            const rootStore = new MemoryStore({
                '/path/to/dir/path/to/doc1': "doc1",
                '/path/to/dir/path/to/doc2': "doc2",
                '/path/to/dir/path/to/doc3': "doc3",
            });
            const subStore = new SubStore(rootStore, '/path/to/./dir');
            expect(await subStore.read('/path/to/doc1')).to.equal("doc1");
        });
    });

    describe("subStore.write(path, source)", () => {

        it("should delegate to rootStore.write(rootPath+path, source)", async () => {
            const rootStore = new MemoryStore({
                '/path/to/dir/path/to/doc1': "doc1",
                '/path/to/dir/path/to/doc2': "doc2",
                '/path/to/dir/path/to/doc3': "doc3",
            });
            const subStore = new SubStore(rootStore, '/path/to/./dir');

            expect(await subStore.read('/path/to/doc1')).to.equal("doc1");
            await subStore.write('/path/to/doc1', "xxx1")
            expect(await subStore.read('/path/to/doc1')).to.equal("xxx1");
            expect(await rootStore.read('/path/to/dir/path/to/doc1')).to.equal("xxx1");
        });
    });

    describe("subStore.delete(path)", () => {

        it("should delegate to rootStore.delete(rootPath+path)", async () => {
            const rootStore = new MemoryStore({
                '/path/to/dir/path/to/doc1': "doc1",
                '/path/to/dir/path/to/doc2': "doc2",
                '/path/to/dir/path/to/doc3': "doc3",
            });
            const subStore = new SubStore(rootStore, '/path/to/./dir');

            expect(await subStore.read('/path/to/doc1')).to.equal("doc1");
            await subStore.delete('/path/to/doc1')
            expect(await subStore.read('/path/to/doc1')).to.equal("");
            expect(await rootStore.read('/path/to/dir/path/to/doc1')).to.equal("");
        });
    });
});
