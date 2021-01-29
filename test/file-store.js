var expect = require("chai").expect;
var rimraf = require("rimraf");
var mkdirp = require("mkdirp");
var fs = require("fs");
var FileStore = require("../lib/file-store");

var ROOT_PATH = `${__dirname}/fs-store`;


describe("FileStore", () => {

    before(() => {
        initStore(ROOT_PATH);
    });

    describe("source = await fileStore.read(path)", () => {

        describe(`when a document path is passed`, () => {

            it("should return the document stored at the given path", async () => {
                var fileStore = new FileStore(ROOT_PATH);
                var doc = await fileStore.read(`/path/to/doc2`);
                expect(doc).to.equal("doc2 @ /path/to/");
            });

            it("should return an empty string if the path doesn't exist", async () => {
                var fileStore = new FileStore(ROOT_PATH);
                var doc = await fileStore.read(`/non/existing/doc`);
                expect(doc).to.equal("");
            });
        });

        describe(`when a directory path is passed`, () => {

            it("should return the content of the `.../.olo` document", async () => {
                var fileStore = new FileStore(ROOT_PATH);
                var doc = await fileStore.read(`/path/to/`);
                expect(doc).to.equal(".olo @ /path/to/")
            });

            it("should return an empty string if the .../.olo document doesn't exist", async () => {
                var fileStore = new FileStore(ROOT_PATH);
                var doc = await fileStore.read(`/non/existing/dir/index/`);
                expect(doc).to.equal("");
            });
        });
    });

    describe("entries = await fileStore.list(path)", () => {

        it("should return the arrays of the child names of passed path", async () => {
            var fileStore = new FileStore(ROOT_PATH);
            var items = await fileStore.list(`/`);
            expect(items.sort()).to.deep.equal(["doc1", "doc2", "doc3", "path/"]);
        });

        it("should discard files that are not .olo documents", async () => {
            var fileStore = new FileStore(ROOT_PATH);
            var items = await fileStore.list(`/path/to/`);
            expect(items.sort()).to.deep.equal(["", "dir/", "doc1", "doc2", "doc3"]);
        });

        it("should return an empty array if the directory doesn't exist", async () => {
            var fileStore = new FileStore(ROOT_PATH);
            var items = await fileStore.list(`/non/existing/dir/index/`);
            expect(items.sort()).to.deep.equal([]);
        });
    });

    describe("await fileStore.write(path, source)", () => {

        it("should change the source of the file at the given path", async () => {
            var fileStore = new FileStore(ROOT_PATH);
            expect(await fileStore.read(`/path/to/doc1`)).to.equal("doc1 @ /path/to/");
            await fileStore.write(`/path/to/doc1`, "new doc1 @ /path/to/");
            expect(await fileStore.read(`/path/to/doc1`)).to.equal("new doc1 @ /path/to/");
        });

        it("should update the `.olo` file when a directory path is given", async () => {
            var fileStore = new FileStore(ROOT_PATH);
            expect(await fileStore.read(`/path/to/`)).to.equal(".olo @ /path/to/");
            await fileStore.write(`/path/to/`, "new .olo @ /path/to/");
            expect(await fileStore.read(`/path/to/`)).to.equal("new .olo @ /path/to/");
        });

        it("should create the file it it doesn't exist", async () => {
            var fileStore = new FileStore(ROOT_PATH);
            expect(fs.existsSync(`${ROOT_PATH}/path/to/doc4.olo`)).to.be.false;
            expect(await fileStore.read(`/path/to/doc4`)).to.equal("");
            await fileStore.write(`/path/to/doc4`, "doc4 @ /path/to/");
            expect(fs.existsSync(`${ROOT_PATH}/path/to/doc4.olo`)).to.be.true;
            expect(await fileStore.read(`/path/to/doc4`)).to.equal("doc4 @ /path/to/");
        });

        it("should create the entire file path if it doesn't exist", async () => {
            var fileStore = new FileStore(ROOT_PATH);
            expect(fs.existsSync(`${ROOT_PATH}/x/`)).to.be.false;
            expect(fs.existsSync(`${ROOT_PATH}/x/y/`)).to.be.false;
            expect(fs.existsSync(`${ROOT_PATH}/x/y/doc.olo`)).to.be.false;
            expect(await fileStore.read(`/x/y/doc`)).to.equal("");
            await fileStore.write(`/x/y/doc`, "doc @ /x/y/");
            expect(fs.existsSync(`${ROOT_PATH}/x/`)).to.be.true;
            expect(fs.existsSync(`${ROOT_PATH}/x/y/`)).to.be.true;
            expect(fs.existsSync(`${ROOT_PATH}/x/y/doc.olo`)).to.be.true;
            expect(await fileStore.read(`/x/y/doc`)).to.equal("doc @ /x/y/");
        });
    });

    describe("await fileStore.delete(path)", () => {

        it("should remove the file at path", async () => {
            var fileStore = new FileStore(ROOT_PATH);
            expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.true;
            await fileStore.delete(`/path/to/doc1`);
            expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.false;
            expect(await fileStore.read(`/path/to/doc1`)).to.equal("");
        });

        it("should return silentrly if the file already doesn't exist", async () => {
            var fileStore = new FileStore(ROOT_PATH);
            expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.false;
            await fileStore.delete(`/path/to/doc1`);
            expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.false;
            expect(await fileStore.read(`/path/to/doc1`)).to.equal("");
        });
    });

    describe("await fileStore.deleteAll(path)", () => {

        it("should remove the directory at path", async () => {
            var fileStore = new FileStore(ROOT_PATH);
            expect(fs.existsSync(`${ROOT_PATH}/path/to/dir`)).to.be.true;
            expect(fs.statSync(`${ROOT_PATH}/path/to/dir`).isDirectory()).to.be.true;
            expect(await fileStore.read(`/path/to/dir/doc1`)).to.equal("doc1 @ /path/to/dir/");
            await fileStore.deleteAll(`/path/to/dir`);
            expect(fs.existsSync(`${ROOT_PATH}/path/to/dir`)).to.be.false;
            expect(await fileStore.read(`/path/to/dir/doc1`)).to.equal("");
        });

        it("should return silently if the directory already doesn't exist", async () => {
            var fileStore = new FileStore(ROOT_PATH);
            expect(fs.existsSync(`${ROOT_PATH}/path/to/dir`)).to.be.false;
            await fileStore.deleteAll(`/path/to/dir`);
            expect(fs.existsSync(`${ROOT_PATH}/path/to/dir`)).to.be.false;
            expect(await fileStore.read(`/path/to/dir/doc1`)).to.equal("");
        });
    });
});



async function initStore (rootPath) {
    rimraf.sync(`${rootPath}`);
    mkdirp.sync(`${rootPath}/path/to`);
    fs.writeFileSync(`${rootPath}/doc1.olo`, "doc1 @ /", 'utf8');
    fs.writeFileSync(`${rootPath}/doc2.olo`, "doc2 @ /", 'utf8');
    fs.writeFileSync(`${rootPath}/doc3.olo`, "doc3 @ /", 'utf8');
    fs.writeFileSync(`${rootPath}/path/to/.olo`, ".olo @ /path/to/", 'utf8');
    fs.writeFileSync(`${rootPath}/path/to/doc1.olo`, "doc1 @ /path/to/", 'utf8');
    fs.writeFileSync(`${rootPath}/path/to/doc2.olo`, "doc2 @ /path/to/", 'utf8');
    fs.writeFileSync(`${rootPath}/path/to/doc3.olo`, "doc3 @ /path/to/", 'utf8');
    mkdirp.sync(`${rootPath}/path/to/dir`);
    mkdirp.sync(`${rootPath}/path/to/dir/sub-dir`);
    fs.writeFileSync(`${rootPath}/path/to/dir/doc1.olo`, "doc1 @ /path/to/dir/", 'utf8');
    fs.writeFileSync(`${rootPath}/path/to/dir/doc2.olo`, "doc2 @ /path/to/dir/", 'utf8');
    fs.writeFileSync(`${rootPath}/path/to/dir/doc3.olo`, "doc3 @ /path/to/dir/", 'utf8');
}
