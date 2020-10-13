var expect = require("chai").expect;
var document = require("../lib/document");
var Path = require("path");
var rimraf = require("rimraf");
var mkdirp = require("mkdirp");
var fs = require("fs");
var protocolErrors = require("../lib/protocols/.errors");

var ROOT_PATH = `${__dirname}/fs-store`;



describe("protocols", () => {
    
    describe("file:", () => {
        var fileProtocol = require("../lib/protocols/file");
        
        before(() => {
            initStore(ROOT_PATH);
        });
        
        describe("source = await file.get(path)", () => {
            
            describe(`when a document path is passed`, () => {
                
                it("should return the document stored at the given path", async () => {
                    var doc = await fileProtocol.get(`${ROOT_PATH}/path/to/doc2`);
                    expect(doc).to.be.equal("doc2 @ /path/to/");
                });

                it("should return an empty string if the path doesn't exist", async () => {
                    var doc = await fileProtocol.get(`${ROOT_PATH}/non/existing/doc`);
                    expect(doc).to.equal("");            
                });
            });

            describe(`when a directory path is passed`, () => {
                
                it("should return the content of the `.../.olo` document", async () => {
                    var doc = await fileProtocol.get(`${ROOT_PATH}/path/to/`);
                    expect(doc).to.equal(".olo @ /path/to/")
                });

                it("should return an empty string if the .../.olo document doesn't exist", async () => {
                    var doc = await fileProtocol.get(`${ROOT_PATH}/non/existing/dir/index/`);
                    expect(doc).to.equal("");            
                });
            });    
        });        

        describe("await file.set(path, source)", () => {
            
            it("should change the source of the file at the given path", async () => {
                expect(await fileProtocol.get(`${ROOT_PATH}/path/to/doc1`)).to.equal("doc1 @ /path/to/");
                await fileProtocol.set(`${ROOT_PATH}/path/to/doc1`, "new doc1 @ /path/to/");
                expect(await fileProtocol.get(`${ROOT_PATH}/path/to/doc1`)).to.equal("new doc1 @ /path/to/");
            });
            
            it("should update the `.olo` file when a directory path is given", async () => {
                expect(await fileProtocol.get(`${ROOT_PATH}/path/to/`)).to.equal(".olo @ /path/to/");
                await fileProtocol.set(`${ROOT_PATH}/path/to/`, "new .olo @ /path/to/");
                expect(await fileProtocol.get(`${ROOT_PATH}/path/to/`)).to.equal("new .olo @ /path/to/");
            });
            
            it("should create the file it it doesn't exist", async () => {
                expect(fs.existsSync(`${ROOT_PATH}/path/to/doc4.olo`)).to.be.false;
                expect(await fileProtocol.get(`${ROOT_PATH}/path/to/doc4`)).to.equal("");
                await fileProtocol.set(`${ROOT_PATH}/path/to/doc4`, "doc4 @ /path/to/");
                expect(fs.existsSync(`${ROOT_PATH}/path/to/doc4.olo`)).to.be.true;
                expect(await fileProtocol.get(`${ROOT_PATH}/path/to/doc4`)).to.equal("doc4 @ /path/to/");
            });
            
            it("should create the entire file path if it doesn't exist", async () => {
                expect(fs.existsSync(`${ROOT_PATH}/x/`)).to.be.false;
                expect(fs.existsSync(`${ROOT_PATH}/x/y/`)).to.be.false;
                expect(fs.existsSync(`${ROOT_PATH}/x/y/doc.olo`)).to.be.false;
                expect(await fileProtocol.get(`${ROOT_PATH}/x/y/doc`)).to.equal("");
                await fileProtocol.set(`${ROOT_PATH}/x/y/doc`, "doc @ /x/y/");
                expect(fs.existsSync(`${ROOT_PATH}/x/`)).to.be.true;
                expect(fs.existsSync(`${ROOT_PATH}/x/y/`)).to.be.true;
                expect(fs.existsSync(`${ROOT_PATH}/x/y/doc.olo`)).to.be.true;
                expect(await fileProtocol.get(`${ROOT_PATH}/x/y/doc`)).to.equal("doc @ /x/y/");
            });
        });

        describe("await file.delete(path)", () => {
            
            it("should remove the file at path", async () => {
                expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.true;
                await fileProtocol.delete(`${ROOT_PATH}/path/to/doc1`);
                expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.false;
                expect(await fileProtocol.get(`${ROOT_PATH}/path/to/doc1`)).to.equal("");
            });

            it("should return silentrly if the file already doesn't exist", async () => {
                expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.false;
                await fileProtocol.delete(`${ROOT_PATH}/path/to/doc1`);
                expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.false;
                expect(await fileProtocol.get(`${ROOT_PATH}/path/to/doc1`)).to.equal("");
            });
        });
    });
    
    describe("fs:", () => {
        var fsProtocol = require("../lib/protocols/fs");
        
        before(() => {
            initStore(ROOT_PATH);
            fs.writeFileSync(`${ROOT_PATH}/path/to/file.txt`, "file.txt @ /path/to/", 'utf8');
            fs.mkdirSync(`${ROOT_PATH}/path/to/dir`);
        });
        
        describe("source = await fs.get(path)", () => {
            
            describe(`when a document path is passed`, () => {
                
                it("should return the document stored at the given path", async () => {
                    var doc = await fsProtocol.get(`${ROOT_PATH}/path/to/doc2`);
                    expect(doc).to.be.equal("doc2 @ /path/to/");
                });

                it("should return an empty string if the path doesn't exist", async () => {
                    var doc = await fsProtocol.get(`${ROOT_PATH}/non/existing/doc`);
                    expect(doc).to.equal("");            
                });
            });

            describe(`when a directory path is passed`, () => {
                
                it("should return the a document containing the `children` list of the directory child-item names", async () => {
                    var doc = await fsProtocol.get(`${ROOT_PATH}/`);
                    var docns = await document.parse(doc)(document.createContext());
                    expect(docns.children.sort()).to.deep.equal(["doc1", "doc2", "doc3", "path/"]);
                });
                
                it("should discard files that are not .olo documents", async () => {
                    var doc = await fsProtocol.get(`${ROOT_PATH}/path/to/`);
                    var docns = await document.parse(doc)(document.createContext());
                    expect(docns.children.sort()).to.deep.equal(["", "dir/", "doc1", "doc2", "doc3"]);
                });

                it("should return an empty `children` list if the directory doesn't exist", async () => {
                    var doc = await fsProtocol.get(`${ROOT_PATH}/non/existing/dir/index/`);
                    var docns = await document.parse(doc)(document.createContext());
                    expect(docns.children.sort()).to.deep.equal([]);
                });
            });    
        });        

        describe("await fs.set(path, source)", () => {
            
            it("should change the source of the file at the given path", async () => {
                expect(await fsProtocol.get(`${ROOT_PATH}/path/to/doc1`)).to.equal("doc1 @ /path/to/");
                await fsProtocol.set(`${ROOT_PATH}/path/to/doc1`, "new doc1 @ /path/to/");
                expect(await fsProtocol.get(`${ROOT_PATH}/path/to/doc1`)).to.equal("new doc1 @ /path/to/");
            });
            
            it("should throw an OperationNotAllowed error when a directory path is given", async () => {
                try {
                    await fsProtocol.set(`${ROOT_PATH}/path/to/`, "new .olo @ /path/to/");
                    throw new Error("It did not throw");
                } catch (error) {
                    expect(error).to.be.instanceof(protocolErrors.OperationNotAllowed);
                    expect(error.message).to.equal(`Operation not allowed: SET fs:${ROOT_PATH}/path/to/`);
                }
            });
            
            it("should create the file it it doesn't exist", async () => {
                expect(fs.existsSync(`${ROOT_PATH}/path/to/doc4.olo`)).to.be.false;
                expect(await fsProtocol.get(`${ROOT_PATH}/path/to/doc4`)).to.equal("");
                await fsProtocol.set(`${ROOT_PATH}/path/to/doc4`, "doc4 @ /path/to/");
                expect(fs.existsSync(`${ROOT_PATH}/path/to/doc4.olo`)).to.be.true;
                expect(await fsProtocol.get(`${ROOT_PATH}/path/to/doc4`)).to.equal("doc4 @ /path/to/");
            });
            
            it("should create the entire file path if it doesn't exist", async () => {
                expect(fs.existsSync(`${ROOT_PATH}/x/`)).to.be.false;
                expect(fs.existsSync(`${ROOT_PATH}/x/y/`)).to.be.false;
                expect(fs.existsSync(`${ROOT_PATH}/x/y/doc.olo`)).to.be.false;
                expect(await fsProtocol.get(`${ROOT_PATH}/x/y/doc`)).to.equal("");
                await fsProtocol.set(`${ROOT_PATH}/x/y/doc`, "doc @ /x/y/");
                expect(fs.existsSync(`${ROOT_PATH}/x/`)).to.be.true;
                expect(fs.existsSync(`${ROOT_PATH}/x/y/`)).to.be.true;
                expect(fs.existsSync(`${ROOT_PATH}/x/y/doc.olo`)).to.be.true;
                expect(await fsProtocol.get(`${ROOT_PATH}/x/y/doc`)).to.equal("doc @ /x/y/");
            });
        });

        describe("await fs.delete(path)", () => {
            
            it("should remove the file at path", async () => {
                expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.true;
                await fsProtocol.delete(`${ROOT_PATH}/path/to/doc1`);
                expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.false;
                expect(await fsProtocol.get(`${ROOT_PATH}/path/to/doc1`)).to.equal("");
            });

            it("should return silentrly if the file already doesn't exist", async () => {
                expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.false;
                await fsProtocol.delete(`${ROOT_PATH}/path/to/doc1`);
                expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.false;
                expect(await fsProtocol.get(`${ROOT_PATH}/path/to/doc1`)).to.equal("");
            });
            
            it("should throw an OperationNotAllowed error when a directory path is given", async () => {
                try {
                    await fsProtocol.delete(`${ROOT_PATH}/path/to/`, "new .olo @ /path/to/");
                    throw new Error("It did not throw");
                } catch (error) {
                    expect(error).to.be.instanceof(protocolErrors.OperationNotAllowed);
                    expect(error.message).to.equal(`Operation not allowed: DELETE fs:${ROOT_PATH}/path/to/`);
                }
            });
        });
    });

    describe("http:", () => {
        var server, httpProtocol = require("../lib/protocols/http");
        var fileProtocol = require("../lib/protocols/file");
        
        before((done) => {
            initStore(ROOT_PATH);
            
            var express = require("express");
            var bodyParser = require("body-parser");
            var app = express();
            app.all( "/private/*", (req, res, next) => {
                res.status(403).send(`Permission denied for access to document at ${req.path}`);
            });      
            app.all( "/hidden/*", (req, res, next) => {
                res.status(405).send(`Operation not define for document at ${req.path}`);
            });                        
            app.all( "/error/*", (req, res, next) => {
                res.status(500).send(`An error occurred while retrieving the document at ${req.path}`);
            });
            app.delete( "*", async (req, res, next) => {
                await fileProtocol.delete(`${ROOT_PATH}${req.path}`);
                res.status(200).send();
            });
            app.use(bodyParser.text({
                type: "text/*"
            }));    
            app.put( "*", async (req, res, next) => {
                await fileProtocol.set(`${ROOT_PATH}${req.path}`, req.body);
                res.status(200).send();
            });
            app.use( express.static(ROOT_PATH) );
            server = app.listen(8010, done);
        });
        
        describe("source = await http.get(path)", () => {
            
            it("should return the content of the files fetched via HTTP", async () => {
                var doc = await httpProtocol.get("/localhost:8010/path/to/doc2.olo");
                expect(doc).to.be.equal("doc2 @ /path/to/");            
            });
            
            it("should throw a PermissionDenied error if the respose status is 403", async () => {
                class NoError extends Error {};
                try {
                    await httpProtocol.get("/localhost:8010/private/path/to/doc");
                    throw new NoError();
                } catch (error) {
                    expect(error).to.be.instanceof(protocolErrors.PermissionDenied);
                    expect(error.message).to.equal("Permission denied: GET http://localhost:8010/private/path/to/doc");
                }
            });

            it("should return an empty string if the respose status is 404", async () => {
                var doc = await httpProtocol.get("/localhost:8010/path/to/non/existing/file");
                expect(doc).to.equal("");
            });

            it("should throw an OperationNotAllowed error if the respose status is 405", async () => {
                class NoError extends Error {};
                try {
                    await httpProtocol.get("/localhost:8010/hidden/path/to/doc");
                    throw new NoError();
                } catch (error) {
                    expect(error).to.be.instanceof(protocolErrors.OperationNotAllowed);
                    expect(error.message).to.equal("Operation not allowed: GET http://localhost:8010/hidden/path/to/doc");
                }
            });

            it("should throw an error if the response code is not 2xx", async () => {
                class NoError extends Error {};
                try {
                    await httpProtocol.get("/localhost:8010/error/path/to/doc");
                    throw new NoError();
                } catch (error) {
                    expect(error).to.not.be.instanceof(NoError);
                    expect(error.message).to.equal("An error occurred while retrieving the document at /error/path/to/doc");
                }
            });
        });        
        
        describe("await http.set(path, source)", () => {
            
            it("should change the source of the file at the given http url", async () => {
                expect(await fileProtocol.get(`${ROOT_PATH}/path/to/doc1`)).to.equal("doc1 @ /path/to/");
                await httpProtocol.set(`/localhost:8010/path/to/doc1`, "new doc1 @ /path/to/");
                expect(await fileProtocol.get(`${ROOT_PATH}/path/to/doc1`)).to.equal("new doc1 @ /path/to/");
            });
            
            it("should throw a PermissionDenied error if the respose status is 403", async () => {
                class NoError extends Error {};
                try {
                    await httpProtocol.set("/localhost:8010/private/path/to/doc");
                    throw new NoError();
                } catch (error) {
                    expect(error).to.be.instanceof(protocolErrors.PermissionDenied);
                    expect(error.message).to.equal("Permission denied: SET http://localhost:8010/private/path/to/doc");
                }
            });

            it("should throw an OperationNotAllowed error if the respose status is 405", async () => {
                class NoError extends Error {};
                try {
                    await httpProtocol.set("/localhost:8010/hidden/path/to/doc");
                    throw new NoError();
                } catch (error) {
                    expect(error).to.be.instanceof(protocolErrors.OperationNotAllowed);
                    expect(error.message).to.equal("Operation not allowed: SET http://localhost:8010/hidden/path/to/doc");
                }
            });

            it("should throw an error if the response code is not 2xx", async () => {
                class NoError extends Error {};
                try {
                    await httpProtocol.set("/localhost:8010/error/path/to/doc");
                    throw new NoError();
                } catch (error) {
                    expect(error).to.not.be.instanceof(NoError);
                    expect(error.message).to.equal("An error occurred while retrieving the document at /error/path/to/doc");
                }
            });
        });
        
        describe("await http.delete(path)", () => {
            
            it("should remove the file at the given url path", async () => {
                expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.true;
                await httpProtocol.delete(`/localhost:8010/path/to/doc1`);
                expect(fs.existsSync(`${ROOT_PATH}/path/to/doc1.olo`)).to.be.false;
                expect(await fileProtocol.get(`${ROOT_PATH}/path/to/doc1`)).to.equal("");
            });
            
            it("should throw a PermissionDenied error if the respose status is 403", async () => {
                class NoError extends Error {};
                try {
                    await httpProtocol.delete("/localhost:8010/private/path/to/doc");
                    throw new NoError();
                } catch (error) {
                    expect(error).to.be.instanceof(protocolErrors.PermissionDenied);
                    expect(error.message).to.equal("Permission denied: DELETE http://localhost:8010/private/path/to/doc");
                }
            });

            it("should throw an OperationNotAllowed error if the respose status is 405", async () => {
                class NoError extends Error {};
                try {
                    await httpProtocol.delete("/localhost:8010/hidden/path/to/doc");
                    throw new NoError();
                } catch (error) {
                    expect(error).to.be.instanceof(protocolErrors.OperationNotAllowed);
                    expect(error.message).to.equal("Operation not allowed: DELETE http://localhost:8010/hidden/path/to/doc");
                }
            });

            it("should throw an error if the response code is not 2xx", async () => {
                class NoError extends Error {};
                try {
                    await httpProtocol.delete("/localhost:8010/error/path/to/doc");
                    throw new NoError();
                } catch (error) {
                    expect(error).to.not.be.instanceof(NoError);
                    expect(error.message).to.equal("An error occurred while retrieving the document at /error/path/to/doc");
                }
            });
        });

        after(() => {
            server.close();
        });
    });
    
    describe("null:", () => {
        var noneProtocol = require("../lib/protocols/null");
        
        describe("source = none.get(path)", () => {
            
            describe(`when a document path is passed`, () => {
                it("should always return an empty string", async () => {
                    expect(await noneProtocol.get("/pathh/to/doc1")).to.equal("");
                    expect(await noneProtocol.get("/pathh/to/doc2")).to.equal("");
                    expect(await noneProtocol.get("/pathh/to/../to/doc3/../doc4")).to.equal("");
                });
            });

            describe(`when a directory path is passed`, () => {            
                it("should always return an empty string", async () => {
                    expect(await noneProtocol.get("/pathh/to/dir1/")).to.equal("");
                    expect(await noneProtocol.get("/pathh/to/dir2/")).to.equal("");
                    expect(await noneProtocol.get("/pathh/to/../to/doc3/../dir4/")).to.equal("");
                });
            });
        });        

        describe("none.set(path, source)", () => {
            it("should throw an `OperationNotAllowed` error", async () => {
                try {
                    await noneProtocol.set("/path/to/doc1", "source of doc 1");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(protocolErrors.OperationNotAllowed);
                    expect(error.message).to.equal("Operation not allowed: SET null:/path/to/doc1");
                }
            });
        });        

        describe("none.delete(path)", () => {
            it("should throw an `OperationNotAllowed` error", async () => {
                try {
                    await noneProtocol.delete("/path/to/doc1");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error).to.be.instanceof(protocolErrors.OperationNotAllowed);
                    expect(error.message).to.equal("Operation not allowed: DELETE null:/path/to/doc1");
                }
            });
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
