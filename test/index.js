var expect = require("chai").expect;

var OloJS = require("../index");
var HTTPStore = require("../lib/stores/http-store");
var fs = require("fs");
var afs = require("../lib/tools/afs");
var Path = require("path");
var rimraf = require("rimraf");
var rootPath = Path.resolve(__dirname, "./environment");



describe("olojs = new OloJS(rootPath)", () => {
    
    describe("olojs.init()", () => {
        
        before((done) => {
            rimraf(rootPath, (err) => {
                if (err) done(err);
                else {
                    fs.mkdirSync(rootPath);
                    done();
                }
            })            
        });
        
        it("should create the olonv.js file in the rootPath", async () => {
            var olojs = new OloJS(rootPath);
            await olojs.init();
            var configTemplate = await OloJS.getEnvironmentScriptTemplate();
            var configFile = fs.readFileSync(olojs.getEnvironmentScriptPath(), "utf8");
            expect(configFile).to.equal(configTemplate);
        });

        it("should throw an error if the config file already exists", async () => {
            var olojs = new OloJS(rootPath);
            try {
                await olojs.init();
                throw new Error("it didn't throw");
            } catch (e) {
                expect(e.message).to.equal("Environment already initialized");
            }
        });
    });
    
    describe("olojs.render(path) - async function", () => {
        
        it("should return the rendered document at path", async () => {
            var source = `<% x=10 %><% y=20 %>x + y = <% x+y %>`;
            await afs.writeFile(rootPath+"/docs/doc1.olo", source);
            var olojs = new OloJS(rootPath);
            var rendering = await olojs.render("/doc1");
            expect(rendering).to.equal("x + y = 30");
        });
        
        it("should correctly evaluate `import` functions", async () => {
            await afs.writeFile(rootPath+"/docs/doc1.olo", `<% x=10 %>`);
            await afs.writeFile(rootPath+"/docs/doc2.olo", `doc1.x = <%import("./doc1").x%>`);
            var olojs = new OloJS(rootPath);
            var rendering = await olojs.render("/doc2");
            expect(rendering).to.equal("doc1.x = 10");            
        });
        
        it("should correctly evaluate parameters", async () => {
            await afs.writeFile(rootPath+"/docs/doc3.olo", `argns.x = <%argns.x%>`);
            var olojs = new OloJS(rootPath);
            var rendering = await olojs.render("/doc3", {x:30});
            expect(rendering).to.equal("argns.x = 30");                        
        });
        
        it("should post-render the document based on the `__render__` function", async () => {
            await afs.writeFile(rootPath+"/docs/doc4.olo", `<% __render__ = text -> "Hello " + text %>World!`);
            var olojs = new OloJS(rootPath);
            var rendering = await olojs.render("/doc4");
            expect(rendering).to.equal("Hello World!");
        });
    });
    
    describe("olojs.serve(port)", () => {
        var olojs, server, client;
        
        before(async () => {
            olojs = new OloJS(rootPath);
            server = await olojs.serve(8999);            
            client = new HTTPStore("http://localhost:8999");
        });
        
        it("should serve the olodocument at path on GET path request with Content-Type = 'text/olo'", async () => {
            var docSource = `doc5 source`;
            await afs.writeFile(rootPath+"/docs/doc5.olo", docSource);
            var fetchedSource = await client.read("/doc5");
            expect(fetchedSource).to.equal(docSource);
        });
        
        it("should return the single page app HTML file in GET '/' requests", async () => {
            var response = await fetch("http://localhost:8999");
            expect(response.status).to.equal(200);
            var htmlPage = await afs.readFile(Path.resolve(__dirname, "../public/index.html"));
            expect(await response.text()).to.equal(htmlPage)
        });
        
        after(async () => {
            await server.close();
        });
    });
});
