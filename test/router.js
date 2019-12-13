const expect = require("chai").expect;

const expression = require("../lib/expression");
const document = require("../lib/document");
const DocId = require("../lib/doc-id");
const Router = require("../lib/router");


describe("Router", () => {
    
    describe("Router.prototype.addReadHandler(path1, handler) / Router.prototype.read(path2)", () => {
        
        it("should delegate to the first handler matching `path2`", async () => {
            var router = new Router();
            router.addReadHandler("/base/path/1", async (subPath) => `This is the doc at: ${subPath}`)
                  .addReadHandler("/base/path/2/", async (subPath) => `This is the doc at: ${subPath}`)
                  .addReadHandler("/base_path", async (subPath) => `This is the doc at: ${subPath}`);
            expect(await router.read("/base/path/1/to/doc1")).to.equal("This is the doc at: /to/doc1");
            expect(await router.read("/base/path/2/to/doc2")).to.equal("This is the doc at: /to/doc2");
            expect(await router.read("/base_path/to/doc3")).to.equal("This is the doc at: /to/doc3");
        });
        
        it("should delegate to the next matching handler if the current matching handler returns NEXT", async () => {
            var router = new Router();
            router.addReadHandler("/base/path", async (subPath, NEXT) => subPath === "/skip" ? NEXT : `This is the doc at: ${subPath}`)
                  .addReadHandler("/base/", async (subPath, NEXT) => subPath === "/skip" ? NEXT : `This is the doc at: ${subPath}`)
                  .addReadHandler("/", async (subPath, NEXT) => `This is the doc at: ${subPath}`);
            expect(await router.read("/base/path/to/doc1")).to.equal("This is the doc at: /to/doc1");
            expect(await router.read("/base/path/skip")).to.equal("This is the doc at: /path/skip");
            expect(await router.read("/base/skip")).to.equal("This is the doc at: /base/skip");
        });
        
        it("should return an empty string if no match is found", async () => {
            var router = new Router();
            router.addReadHandler("/base/path/1", async (subPath) => `This is the doc at: ${subPath}`)
                  .addReadHandler("/base/path/2/", async (subPath) => `This is the doc at: ${subPath}`)
                  .addReadHandler("/base_path", async (subPath) => `This is the doc at: ${subPath}`);
            expect(await router.read("/base/path/3/to/doc")).to.equal("");
        });
    });

    describe("Router.prototype.addWriteHandler(path1, handler) / Router.prototype.write(path2, source)", () => {
        
        it("should delegate to the first handler matching `path2`", async () => {
            var router = new Router();
            router.addWriteHandler("/base/path/1", async (subPath, source) => `Updated doc at: ${subPath}, with source "${source}"`)
                  .addWriteHandler("/base/path/2/", async (subPath, source) => `Updated doc at: ${subPath}, with source "${source}"`)
                  .addWriteHandler("/base_path", async (subPath, source) => `Updated doc at: ${subPath}, with source "${source}"`);
            expect(await router.write("/base/path/1/to/doc1", "aaa")).to.equal('Updated doc at: /to/doc1, with source "aaa"');
            expect(await router.write("/base/path/2/to/doc2", "bbb")).to.equal('Updated doc at: /to/doc2, with source "bbb"');
            expect(await router.write("/base_path/to/doc3", "ccc")).to.equal('Updated doc at: /to/doc3, with source "ccc"');
        });
        
        it("should delegate to the next matching handler if the current matching handler returns NEXT", async () => {
            var router = new Router();
            router.addWriteHandler("/base/path", async (subPath, source, NEXT) => subPath === "/skip" ? NEXT : `Updated doc at: ${subPath}, with source "${source}"`)
                  .addWriteHandler("/base/", async (subPath, source, NEXT) => subPath === "/skip" ? NEXT : `Updated doc at: ${subPath}, with source "${source}"`)
                  .addWriteHandler("/", async (subPath, source, NEXT) => subPath === "/skip" ? NEXT : `Updated doc at: ${subPath}, with source "${source}"`);
            expect(await router.write("/base/path/to/doc1", "aaa")).to.equal('Updated doc at: /to/doc1, with source "aaa"');
            expect(await router.write("/base/path/skip", "bbb")).to.equal('Updated doc at: /path/skip, with source "bbb"');
            expect(await router.write("/base/skip", "ccc")).to.equal('Updated doc at: /base/skip, with source "ccc"');
        });
        
        it("should throw an error if no match is found", async () => {
            var router = new Router();
            router.addReadHandler("/base/path/1", async (subPath) => `This is the doc at: ${subPath}`)
                  .addReadHandler("/base/path/2/", async (subPath) => `This is the doc at: ${subPath}`)
                  .addReadHandler("/base_path", async (subPath) => `This is the doc at: ${subPath}`);
            class DidNotThrow extends Error {}
            try {
                await router.write("/base/path/3/to/doc", "aaa");
                throw new DidNotThrow();
            } catch (e) {
                expect(e).to.not.be.instanceof(DidNotThrow);
                expect(e.message).to.equal("Write operation not defined on path /base/path/3/to/doc");
            }
            
        });
    });

    describe("Router.prototype.addDeleteHandler(path1, handler) / Router.prototype.delete(path2)", () => {
        
        it("should delegate to the first handler matching `path2`", async () => {
            var router = new Router();
            router.addDeleteHandler("/base/path/1", async (subPath) => `Deleted doc at: ${subPath}`)
                  .addDeleteHandler("/base/path/2/", async (subPath) => `Deleted doc at: ${subPath}`)
                  .addDeleteHandler("/base_path", async (subPath) => `Deleted doc at: ${subPath}`);
            expect(await router.delete("/base/path/1/to/doc1")).to.equal("Deleted doc at: /to/doc1");
            expect(await router.delete("/base/path/2/to/doc2")).to.equal("Deleted doc at: /to/doc2");
            expect(await router.delete("/base_path/to/doc3")).to.equal("Deleted doc at: /to/doc3");
        });
        
        it("should delegate to the next matching handler if the current matching handler returns NEXT", async () => {
            var router = new Router();
            router.addDeleteHandler("/base/path", async (subPath, NEXT) => subPath === "/skip" ? NEXT : `Deleted doc at: ${subPath}`)
                  .addDeleteHandler("/base/", async (subPath, NEXT) => subPath === "/skip" ? NEXT : `Deleted doc at: ${subPath}`)
                  .addDeleteHandler("/", async (subPath, NEXT) => `Deleted doc at: ${subPath}`);
            expect(await router.delete("/base/path/to/doc1")).to.equal("Deleted doc at: /to/doc1");
            expect(await router.delete("/base/path/skip")).to.equal("Deleted doc at: /path/skip");
            expect(await router.delete("/base/skip")).to.equal("Deleted doc at: /base/skip");
        });
        
        it("should throw an error if no match is found", async () => {
            var router = new Router();
            router.addDeleteHandler("/base/path/1", async (subPath) => `Deleted doc at: ${subPath}`)
                  .addDeleteHandler("/base/path/2/", async (subPath) => `Deleted doc at: ${subPath}`)
                  .addDeleteHandler("/base_path", async (subPath) => `Deleted doc at: ${subPath}`);
            class DidNotThrow extends Error {}
            try {
                await router.delete("/base/path/3/to/doc", "aaa");
                throw new DidNotThrow();
            } catch (e) {
                expect(e).to.not.be.instanceof(DidNotThrow);
                expect(e.message).to.equal("Delete operation not defined on path /base/path/3/to/doc");
            }
            
        });
    });
    
    describe("Router.prototype.mount(path, handlers)", () => {
        
        it("should delegate to handlers.read for read operations matching the mount path", async () => {
            var router = new Router();
            router.mount("/base/path/1",  {read: async (subPath) => `This is the doc at: ${subPath}`})
                  .mount("/base/path/2/", {read: async (subPath) => `This is the doc at: ${subPath}`})
                  .mount("/base_path",    {read: async (subPath) => `This is the doc at: ${subPath}`});
            expect(await router.read("/base/path/1/to/doc1")).to.equal("This is the doc at: /to/doc1");
            expect(await router.read("/base/path/2/to/doc2")).to.equal("This is the doc at: /to/doc2");
            expect(await router.read("/base_path/to/doc3")).to.equal("This is the doc at: /to/doc3");
        });        

        it("should delegate to handlers.write for write operations matching the mount path", async () => {
            var router = new Router();
            router.mount("/base/path/1",  {write: async (subPath, source) => `Updated doc at: ${subPath}, with source "${source}"`})
                  .mount("/base/path/2/", {write: async (subPath, source) => `Updated doc at: ${subPath}, with source "${source}"`})
                  .mount("/base_path",    {write: async (subPath, source) => `Updated doc at: ${subPath}, with source "${source}"`});
            expect(await router.write("/base/path/1/to/doc1", "aaa")).to.equal('Updated doc at: /to/doc1, with source "aaa"');
            expect(await router.write("/base/path/2/to/doc2", "bbb")).to.equal('Updated doc at: /to/doc2, with source "bbb"');
            expect(await router.write("/base_path/to/doc3", "ccc")).to.equal('Updated doc at: /to/doc3, with source "ccc"');
        });        

        it("should delegate to handlers.delete for delete operations matching the mount path", async () => {
            var router = new Router();
            router.mount("/base/path/1",  {"delete": async (subPath) => `Deleted doc at: ${subPath}`})
                  .mount("/base/path/2/", {"delete": async (subPath) => `Deleted doc at: ${subPath}`})
                  .mount("/base_path",    {"delete": async (subPath) => `Deleted doc at: ${subPath}`});
            expect(await router.delete("/base/path/1/to/doc1")).to.equal("Deleted doc at: /to/doc1");
            expect(await router.delete("/base/path/2/to/doc2")).to.equal("Deleted doc at: /to/doc2");
            expect(await router.delete("/base_path/to/doc3")).to.equal("Deleted doc at: /to/doc3");
        });        
    });
    
    describe("doc = Router.prototype.load(id)", () => {
        
        it("should return a document object", async () => {
            var router = new Router();
            router.addReadHandler("test://store/", async (subPath) => `Document at: ${subPath}`);
            var doc = await router.load("test://store/path/to/doc");
            expect(doc.source).to.equal("Document at: /path/to/doc");
            expect(doc.id).to.be.instanceof(DocId);
            expect(String(doc.id)).to.equal("test://store/path/to/doc");
        });
        
        describe("context = doc.createContext(globals)", () => {
            
            it("should create an expression context containing the names defined in `globals`", async () => {
                var router = new Router();
                router.addReadHandler("test://store/", async (subPath) => `Document at: ${subPath}`);
                var doc = await router.load("test://store/path/to/doc");
                var ctx = doc.createContext({a:1, b:2});                
                expect(await expression.evaluate("a+b", ctx)).to.equal(3);
            });

            it("should create an expression context containing the document id as namespace", async () => {
                var router = new Router();
                router.addReadHandler("test://store/", async (subPath) => `Document at: ${subPath}`);
                var doc = await router.load("test://store/path/to/doc");
                var ctx = doc.createContext();                
                expect(await expression.evaluate("id.path", ctx)).to.equal("/path/to/doc");
            });

            it("should create an expression context containing the `import(id)` function", async () => {
                var router = new Router();
                router.addReadHandler("test://store/", async (subPath) => `<%p = "${subPath}"%>`);
                var doc = await router.load("test://store/path/to/doc1");
                var ctx = doc.createContext();                
                expect(await expression.evaluate("import('./doc2').p", ctx)).to.equal("/path/to/doc2");
            });
        });
        
        describe("content = await doc.render(context)", () => {
            
            it("should return the rendered content of the document", async () => {
                var router = new Router();
                router.addReadHandler("test://store/", async (subPath) => `<%description%> <%p = "${subPath}"%><%p%>`);
                var doc = await router.load("test://store/path/to/doc");
                var context = doc.createContext({description: "Document path:"});             
                var content = await doc.render(context);
                expect(content).to.be.instanceof(document.Content);
                expect(content.get("p")).to.equal("/path/to/doc");
                expect(String(content)).to.equal("Document path: /path/to/doc");
            });
        });
        
        describe("doc.source = newSource", () => {
            
            it("should modify the document source", async () => {
                var router = new Router();
                router.addReadHandler("test://store/", async (subPath) => `Content1`);
                
                var doc = await router.load("test://store/path/to/doc");
                var context = doc.createContext({description: "Document path:"});             
                var content = await doc.render(context);
                expect(String(content)).to.equal("Content1");
                
                doc.source = "Content2";
                var content = await doc.render(context);
                expect(String(content)).to.equal("Content2");
            });
        });
        
        describe("await doc.save()", () => {
            
            it("should call the write method of the parent router, passing the doc id as path and the doc source", async () => {
                var router = new Router();
                router.mount("test://store/", {
                    read: async (subPath) => `Document at: ${subPath}`,
                    write: async (subPath, source) => `Set ${subPath} = ${source}`
                });
                var doc = await router.load("test://store/path/to/doc");
                doc.source = "sss";
                expect(await doc.save()).to.equal("Set /path/to/doc = sss");
            });
        });

        describe("await doc.delete()", () => {
            
            it("should call the delete method of the parent router, passing the doc id as path", async () => {
                var router = new Router();
                router.mount("test://store/", {
                    read: async (subPath) => `Document at: ${subPath}`,
                    delete: async (subPath, source) => `Del ${subPath}`
                });
                var doc = await router.load("test://store/path/to/doc");
                expect(await doc.delete()).to.equal("Del /path/to/doc");                
            });
            
            it("should set to '' the document source", async () => {
                var router = new Router();
                router.mount("test://store/", {
                    read: async (subPath) => `Document at: ${subPath}`,
                    delete: async (subPath, source) => `Del ${subPath}`
                });
                var doc = await router.load("test://store/path/to/doc");
                await doc.delete();
                expect(doc.source).to.equal("");
            });
        });
    });
});
