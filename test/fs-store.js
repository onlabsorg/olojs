var expect = require("chai").expect;
var document = require("../lib/document");
var rimraf = require("rimraf");
var mkdirp = require("mkdirp");
var fs = require("fs");
var errors = require("../lib/stores/store-errors");
var FSStore = require("../lib/stores/fs");

var ROOT_PATH = `${__dirname}/fs-store`;





describe("FSStore", () => {
    var fsStore = new FSStore(ROOT_PATH);
    
    before(() => {
        initStore(ROOT_PATH);
        fs.writeFileSync(`${ROOT_PATH}/path/to/file.txt`, "file.txt @ /path/to/", 'utf8');
        fs.mkdirSync(`${ROOT_PATH}/path/to/dir`);
    });
    
    describe("source = await fs.get(path)", () => {
        
        describe(`when a document path is passed`, () => {
            
            it("should return the document stored at the given path", async () => {
                var doc = await fsStore.get(`/path/to/doc2`);
                expect(doc).to.be.equal("doc2 @ /path/to/");
            });

            it("should return an empty string if the path doesn't exist", async () => {
                var doc = await fsStore.get(`/non/existing/doc`);
                expect(doc).to.equal("");            
            });
        });

        describe(`when a directory path is passed`, () => {
            
            it("should return the a document containing the `children` list of the directory child-item names", async () => {
                var doc = await fsStore.get(`/`);
                var docns = await document.parse(doc)(document.createContext());
                expect(docns.children.sort()).to.deep.equal(["doc1", "doc2", "doc3", "path/"]);
            });
            
            it("should discard files that are not .olo documents", async () => {
                var doc = await fsStore.get(`/path/to/`);
                var docns = await document.parse(doc)(document.createContext());
                expect(docns.children.sort()).to.deep.equal(["", "dir/", "doc1", "doc2", "doc3"]);
            });

            it("should return an empty `children` list if the directory doesn't exist", async () => {
                var doc = await fsStore.get(`/non/existing/dir/index/`);
                var docns = await document.parse(doc)(document.createContext());
                expect(docns.children.sort()).to.deep.equal([]);
            });
        });    
    });        

    describe("await fs.set(path, source)", () => {
        
        it("should change the source of the file at the given path", async () => {
            expect(await fsStore.get(`/path/to/doc1`)).to.equal("doc1 @ /path/to/");
            await fsStore.set(`/path/to/doc1`, "new doc1 @ /path/to/");
            expect(await fsStore.get(`/path/to/doc1`)).to.equal("new doc1 @ /path/to/");
        });
        
        it("should throw an OperationNotAllowed error when a directory path is given", async () => {
            try {
                await fsStore.set(`/path/to/`, "new .olo @ /path/to/");
                throw new Error("It did not throw");
            } catch (error) {
                expect(error).to.be.instanceof(errors.OperationNotAllowed);
                expect(error.message).to.equal(`Operation not allowed: SET /path/to/`);
            }
        });
        
        it("should create the file it it doesn't exist", async () => {
            expect(fs.existsSync(`${ROOT_PATH}/path/to/doc4.olo`)).to.be.false;
            expect(await fsStore.get(`/path/to/doc4`)).to.equal("");
            await fsStore.set(`/path/to/doc4`, "doc4 @ /path/to/");
            expect(fs.existsSync(`${ROOT_PATH}/path/to/doc4.olo`)).to.be.true;
            expect(await fsStore.get(`/path/to/doc4`)).to.equal("doc4 @ /path/to/");
        });
        
        it("should create the entire file path if it doesn't exist", async () => {
            expect(fs.existsSync(`${ROOT_PATH}/x/`)).to.be.false;
            expect(fs.existsSync(`${ROOT_PATH}/x/y/`)).to.be.false;
            expect(fs.existsSync(`${ROOT_PATH}/x/y/doc.olo`)).to.be.false;
            expect(await fsStore.get(`/x/y/doc`)).to.equal("");
            await fsStore.set(`/x/y/doc`, "doc @ /x/y/");
            expect(fs.existsSync(`${ROOT_PATH}/x/`)).to.be.true;
            expect(fs.existsSync(`${ROOT_PATH}/x/y/`)).to.be.true;
            expect(fs.existsSync(`${ROOT_PATH}/x/y/doc.olo`)).to.be.true;
            expect(await fsStore.get(`/x/y/doc`)).to.equal("doc @ /x/y/");
        });
    });

    describe("await fs.delete(path)", () => {
        
        it("should remove the file at path", async () => {
            expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.true;
            await fsStore.delete(`/path/to/doc1`);
            expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.false;
            expect(await fsStore.get(`/path/to/doc1`)).to.equal("");
        });

        it("should return silentrly if the file already doesn't exist", async () => {
            expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.false;
            await fsStore.delete(`/path/to/doc1`);
            expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.false;
            expect(await fsStore.get(`/path/to/doc1`)).to.equal("");
        });
        
        it("should remove the entire directory if the path ends with a '/'", async () => {
            await fsStore.delete(`/path/to/`, "new .olo @ /path/to/");
            expect(fs.existsSync(`${ROOT_PATH}/path/to/`)).to.be.false;
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
}
