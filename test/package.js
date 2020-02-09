var expect = require("chai").expect;

var Package = require("../lib/package");
var HTTPStore = require("../lib/stores/http-store");
var fs = require("fs");
var Path = require("path");
var rimraf = require("rimraf");
var rootPath = Path.resolve(__dirname, "./package");



describe("package = new Package(rootPath)", () => {
    
    describe("package.init()", () => {
        
        before((done) => {
            rimraf(rootPath, (err) => {
                if (err) done(err);
                else {
                    fs.mkdirSync(rootPath);
                    done();
                }
            })            
        });
        
        it("should create the olojs-config.js file in the rootPath", async () => {
            var package = new Package(rootPath);
            await package.init();
            var configTemplate = package._getConfigTemplate();
            var configFile = fs.readFileSync(package.configPath, "utf8");
            expect(configFile).to.equal(configTemplate);
        });

        it("should throw an error if the config file already exists", async () => {
            var package = new Package(rootPath);
            try {
                await package.init();
                throw new Error("it didn't throw");
            } catch (e) {
                expect(e.message).to.equal("Package already initialized");
            }
        });
    });
    
    describe("package.render(path) - async function", () => {
        
        it("should return the rendered document at path", async () => {
            var source = `<% x=10 %><% y=20 %>x + y = <% x+y %>`;
            fs.writeFileSync(rootPath+"/doc1.olo", source, "utf8");
            var package = new Package(rootPath);
            var rendering = await package.render("/doc1");
            expect(rendering).to.equal("x + y = 30");
        });
        
        it("should correctly evaluate `import` functions", async () => {
            var source = `doc1.x = <%import("./doc1").x%>`;
            fs.writeFileSync(rootPath+"/doc2.olo", source, "utf8");
            var package = new Package(rootPath);
            var rendering = await package.render("/doc2");
            expect(rendering).to.equal("doc1.x = 10");            
        });
        
        it("should correctly evaluate parameters", async () => {
            var source = `argv.x = <%argv.x%>`;
            fs.writeFileSync(rootPath+"/doc3.olo", source, "utf8");
            var package = new Package(rootPath);
            var rendering = await package.render("/doc3", {x:30});
            expect(rendering).to.equal("argv.x = 30");                        
        });
        
        it("should post-render the document based on the `__render__` function", async () => {
            var source = `<% __render__ = text -> "Hello " + text %>World!`;
            fs.writeFileSync(rootPath+"/doc4.olo", source, "utf8");
            var package = new Package(rootPath);
            var rendering = await package.render("/doc4");
            expect(rendering).to.equal("Hello World!");
        });
    });
    
    describe("package.serve(port)", () => {
        
        it("should serve the olodocument at path on GET path request with Content-Type = 'text/olo'", async () => {
            var docSource = `doc5 source`;
            fs.writeFileSync(rootPath+"/doc5.olo", docSource, "utf8");
            var package = new Package(rootPath);
            var server = await package.serve(8999);
            var fetchedSource = await (new HTTPStore("http://localhost:8999")).read("/doc5");
            expect(fetchedSource).to.equal(docSource);
            await server.close();
        });
        
        it("should return the single page app HTML file when requesting a .html resource", async () => {
            var package = new Package(rootPath);
            var server = await package.serve(8999);
            var fetchedResource = await (new HTTPStore("http://localhost:8999")).read("/doc5.html");
            var htmlTemplate = fs.readFileSync(Path.resolve(__dirname, "../lib/http/public/index.html"), "utf8");
            expect(fetchedResource).to.equal(htmlTemplate);
            await server.close();
        });
    });
});
