var expect = require("chai").expect;
var fs = require("fs");
var pathlib = require("path");
var document = require("../lib/document");
var Environment = require("../lib/environment");
var HTTPServer = require("../lib/servers/http");
require("isomorphic-fetch");

describe("HTTPServer", () => {
    
    describe("Default HTTP server", () => {
        var store, env, server;
        
        before((done) => {
            store = new Map();
            env = Environment({
                protocols: {
                    home: (...paths) => store.get(pathlib.join('/', ...paths)) || "" ,
                },
                routes: {
                    '/': "home:/"
                }
            });
            server = HTTPServer(env);
            server.listen(8888, done);
        });            
        
        describe("HTTP GET /env/*", () => {
            
            it("should return the document source mapped to path by the passed loader", async () => {
                var docPath = "/path/to/doc1";
                var docSource = "document source ...";
                store.set(docPath, docSource);
                
                var response = await fetch(`http://localhost:8888/env${docPath}`, {
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
                var indexHTMLPage = fs.readFileSync(pathlib.resolve(__dirname, "../public/index.html"), "utf8");
                var response = await fetch(`http://localhost:8888/`);
                expect(response.status).to.equal(200);
                expect(await response.text()).to.equal(indexHTMLPage);           
            });
            
            it("should return files from the public path for non `/env/*` GET requests", async () => {
                var indexHTMLPage = fs.readFileSync(pathlib.resolve(__dirname, "../public/index.html"), "utf8");
                var response = await fetch(`http://localhost:8888/index.html`);
                expect(response.status).to.equal(200);
                expect(await response.text()).to.equal(indexHTMLPage);                
            });
        });
        
        after((done) => {
            server.close(done);
        });        
    });
    
    describe("HTTPServer with custom `options.publicPath` path", () => {
        var store, env, server, customPublicPath;
        
        before((done) => {
            customPublicPath = pathlib.resolve(__dirname, "./public");

            store = new Map();
            env = Environment({
                protocols: {
                    home: (...paths) => store.get(pathlib.join('/', ...paths)) || "" ,
                },
                routes: {
                    '/': "home:/"
                }
            });
            server = HTTPServer(env, {
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
