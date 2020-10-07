var expect = require("chai").expect;
var document = require("../lib/document");
var Path = require("path");
var rimraf = require("rimraf");
var mkdirp = require("mkdirp");
var fs = require("fs");

var ROOT_PATH = `${__dirname}/fs-store`;



describe("protocols", () => {
    
    describe("file:", () => {
        var fetchFile = require("../lib/protocols/file");
        
        describe(`when a document path is passed`, () => {
            
            it("should return the document stored at the given path", async () => {
                var doc = await fetchFile(`${ROOT_PATH}/path/to/doc2`);
                expect(doc).to.be.equal("doc2 @ /path/to/\n");
            });

            it("should return an empty string if the path doesn't exist", async () => {
                var doc = await fetchFile(`${ROOT_PATH}/non/existing/doc`);
                expect(doc).to.equal("");            
            });
        });

        describe(`when a directory path is passed`, () => {
            
            it("should return the content of the `.../.olo` document", async () => {
                var doc = await fetchFile(`${ROOT_PATH}/path/to/`);
                expect(doc).to.equal(".olo @ /path/to/\n")
            });

            it("should return an empty string if the .../.olo document doesn't exist", async () => {
                var doc = await fetchFile(`${ROOT_PATH}/non/existing/dir/index/`);
                expect(doc).to.equal("");            
            });
        });    
        
        describe(`when multiple paths are passed`, () => {
            
            it("should merge the paths together", async () => {
                var doc = await fetchFile(`${ROOT_PATH}/path/to/doc2`, "../..", "./../doc1");
                expect(doc).to.be.equal("doc1 @ /\n");                
            });
        });
    });
    
    describe("http:", () => {
        var server, fetchHTTP = require("../lib/protocols/http");
        
        before((done) => {
            var express = require("express");
            var app = express();
            app.get( "/error/*", (req, res, next) => {
                res.status(500).send(`An error occurred while retrieving the document at ${req.path}`);
            });
            app.use( express.static(ROOT_PATH) );
            server = app.listen(8010, done);
        });
        
        it("should return the content of the files fetched via HTTP", async () => {
            var doc = await fetchHTTP("/localhost:8010/path/to/doc2.olo");
            expect(doc).to.be.equal("doc2 @ /path/to/\n");            
        });
        
        it("should return an empty string if the respose status is 404", async () => {
            var doc = await fetchHTTP("/localhost:8010/path/to/non/existing/file");
            expect(doc).to.equal("");
        });

        it("should throw an error if the response code is not 2xx", async () => {
            class NoError extends Error {};
            try {
                await fetchHTTP("/localhost:8010/error/path/to/doc");
                throw new NoError();
            } catch (error) {
                expect(error).to.not.be.instanceof(NoError);
                expect(error.message).to.equal("An error occurred while retrieving the document at /error/path/to/doc");
            }
        });
        
        after(() => {
            server.close();
        });
    });
    
    describe("null:", () => {
        var fetchNone = require("../lib/protocols/null");
        
        describe(`when a document path is passed`, () => {
            it("should always return an empty string", async () => {
                expect(await fetchNone("/pathh/to/doc1")).to.equal("");
                expect(await fetchNone("/pathh/to/doc2")).to.equal("");
                expect(await fetchNone("/pathh/to", "../to/doc3", "../doc4")).to.equal("");
            });
        });

        describe(`when a directory path is passed`, () => {            
            it("should always return an empty string", async () => {
                expect(await fetchNone("/pathh/to/dir1/")).to.equal("");
                expect(await fetchNone("/pathh/to/dir2/")).to.equal("");
                expect(await fetchNone("/pathh/to/", "../to/doc3", "../doc4")).to.equal("");
            });
        });
    });    
});



async function initStore (rootPath, content) {
    
    // clear the store
    await new Promise((resolve, reject) => {
        rimraf(`${rootPath}`, (err) => {
            if (err) reject(err);
            else resolve();
        })
    });
    
    fs.mkdirSync(rootPath);
    
    // document creation routine
    var createDoc = (fullPath, content) => {
        var ppath = Path.parse(fullPath);
        if (!fs.existsSync(ppath.dir+"/")) {
            mkdirp.sync(ppath.dir+"/");
        }
        return new Promise((resolve, reject) => {
            fs.writeFile(fullPath+".olo", content, {encoding:'utf8'}, (err) => {
                if (err) reject(err);
                else resolve();
            });            
        });                        
    }
    
    // create all the listed documents
    for (let path in content) {
        let fullPath = `${rootPath}${path}`;
        await createDoc(fullPath, content[path]);
    }    
}
