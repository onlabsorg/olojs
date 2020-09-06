var expect = require("chai").expect;
var fs = require("fs");
var Path = require("path");
var Environment = require("../lib/environment");
var Router = require("../lib/stores/router");
var HTTPServer = require("../lib/http-server");
require("isomorphic-fetch");

describe("HTTPServer", () => {
    
    describe("Default HTTP server", () => {
        var environment, server;
        
        before((done) => {
            var store = createMemoryStore({
                "/path/to/doc1": "doc1 source"
            });
            environment = new Environment({store});
            server = HTTPServer(environment);
            server.listen(8888, done);
        });            
        
        describe("HTTP GET /olocs/*", () => {
            
            it("should return the document source at path from the passed environment", async () => {
                var docPath = "/path/to/doc1";
                var docSource = "document source ...";
                await environment.writeDocument(docPath, docSource);
                
                var response = await fetch(`http://localhost:8888/olocs${docPath}`, {
                    method: 'get',
                    headers: {
                        'Accept': 'text/*'
                    },
                });
                expect(response.status).to.equal(200);
                expect(await response.text()).to.equal(docSource);
            });
        });
            
        describe("HTTP GET /*", async () => {
            
            it("should return the default index.html page if the path is '/'", async () => {
                var indexHTMLPage = fs.readFileSync(Path.resolve(__dirname, "../public/index.html"), "utf8");
                var response = await fetch(`http://localhost:8888/`);
                expect(response.status).to.equal(200);
                expect(await response.text()).to.equal(indexHTMLPage);           
            });
            
            it("should return files from the public path for non-text/olo GET requests", async () => {
                var indexHTMLPage = fs.readFileSync(Path.resolve(__dirname, "../public/index.html"), "utf8");
                var response = await fetch(`http://localhost:8888/index.html`);
                expect(response.status).to.equal(200);
                expect(await response.text()).to.equal(indexHTMLPage);                
            });
        });
        
        describe("HTTP PUT /olocs/*", () => {

            it("should set the document source at path equal to the body", async () => {
                var docPath = "/path/to/doc1";
                var newSource = "new doc1 source";
                var response = await fetch(`http://localhost:8888/olocs/${docPath}`, {
                    method: 'put',
                    headers: {
                        'Accept': 'text/olo',
                        'Content-Type': 'text/olo'
                    },
                    body: newSource
                });
                expect(response.status).to.equal(200);
                expect(await environment.readDocument(docPath)).to.equal(newSource);
            });
        });

        describe("HTTP DELETE /olocs/*", () => {
    
            it("should remove the document at path", async () => {
                var docPath = "/path/to/doc1";
                
                await environment.writeDocument(docPath, "some text ...");
                expect(await environment.readDocument(docPath)).to.equal("some text ...");
                
                var response = await fetch(`http://localhost:8888/olocs/${docPath}`, {
                    method: 'delete',
                    headers: {
                        'Accept': 'text/olo'
                    }
                });
                expect(response.status).to.equal(200);
                expect(await environment.readDocument(docPath)).to.equal("");
            });                        
        });

        after((done) => {
            server.close(done);
        });        
    });
    
    describe("HTTPServer with custom `options.before` middleware", () => {        
        var environment, server;
        
        before((done) => {
            var store = createMemoryStore({
                "/path/to/doc1": "doc1 source"
            });
            environment = new Environment({store});
            server = HTTPServer(environment, {
                before: (req, res, next) => {
                    res.status(200).send("before middleware executed");
                }
            });
            server.listen(8888, done);
        });            

        it("should execute before handling the `text/olo` requests", async () => {
            var docPath = "/path/to/doc1";
            var docSource = "document source ...";
            await environment.writeDocument(docPath, docSource);
            
            var response = await fetch(`http://localhost:8888/olocs/${docPath}`, {
                method: 'get',
                headers: {
                    'Accept': 'text/olo'
                },
            });
            expect(response.status).to.equal(200);
            expect(await response.text()).to.equal("before middleware executed");            
        });

        after((done) => {
            server.close(done);
        });        
    });

    describe("HTTPServer with custom `options.after` middleware", () => {
        var environment, server;
        
        before((done) => {
            var store = createMemoryStore({
                "/path/to/doc1": "doc1 source"
            });
            environment = new Environment({store});
            server = HTTPServer(environment, {
                after: (req, res, next) => {
                    res.status(200).send("after middleware executed");
                }
            });
            server.listen(8888, done);
        });            

        it("should execute after handling the `text/olo` requests", async () => {
            
            // GET `text/olo` executes before options.after
            var docPath = "/path/to/doc1";
            var docSource = "document source ...";
            await environment.writeDocument(docPath, docSource);
            var response = await fetch(`http://localhost:8888/olocs/${docPath}`, {
                method: 'get',
                headers: {
                    'Accept': 'text/olo'
                },
            });
            expect(response.status).to.equal(200);
            expect(await response.text()).to.equal(docSource);
            
            // GET other content doesn't execute because options.after executes first
            var response = await fetch(`http://localhost:8888/`);
            expect(response.status).to.equal(200);
            expect(await response.text()).to.equal("after middleware executed");           
        });

        after((done) => {
            server.close(done);
        });                
    });

    describe("HTTPServer with custom `options.publicPath` path", () => {
        var environment, server, customPublicPath;
        
        before((done) => {
            customPublicPath = Path.resolve(__dirname, "./public");

            var store = createMemoryStore({
                "/path/to/doc1": "doc1 source"
            });
            environment = new Environment({store});
            server = HTTPServer(environment, {
                publicPath: customPublicPath
            });
            server.listen(8888, done);
        });                    
        
        it("should return the custom index.html page if the path is '/'", async () => {
            var customIndexPage = "<p>custom html document page</p>";
            fs.writeFileSync(customPublicPath+"/index.html", customIndexPage, "utf8");

            var response = await fetch(`http://localhost:8888/`);
            expect(response.status).to.equal(200);
            expect(await response.text()).to.equal(customIndexPage);                
        });

        it("should return files from the public path for non-text/olo GET requests", async () => {
            var file1_content = "content of file 1";
            fs.writeFileSync(customPublicPath+"/file1.txt", file1_content, "utf8");
            
            var response = await fetch(`http://localhost:8888/file1.txt`);
            expect(response.status).to.equal(200);
            expect(await response.text()).to.equal(file1_content);                
        });

        after((done) => {
            server.close(done);
        });        
    });
});



// -----------------------------------------------------------------------------
//  Helper Functions
// -----------------------------------------------------------------------------

function createMemoryStore (docs) {
    var store = new Map();
    for (let path in docs) store.set(path, docs[path]);
    return {
        read: path => store.get(path) || "",
        write: (path, source) => store.set(path, String(source)),
        delete: path => store.delete(path)
    }
}
