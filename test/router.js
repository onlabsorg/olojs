const expect = require("chai").expect;

const Router = require("../lib/stores/router");


describe("router = new Router(routes)", () => {
    
    describe("doc = await router.read(path)", () => {
        
        it("should delegate to the proper sub-store", async () => {
            var router = new Router({
                "/path/to": subPath => `Document at /path/to${subPath}`,
                "/path/to/store1": subPath => `Document at /path/to/store1${subPath}`,
            })            

            var doc = await router.read("/path/to/store1/path/to/doc1");
            expect(doc).to.equal("Document at /path/to/store1/path/to/doc1");
                        
            var doc = await router.read("/path/to/store2/path/to/doc2");
            expect(doc).to.equal("Document at /path/to/store2/path/to/doc2");
        });
        
        it("should work with URL-like paths `protocol://path/to/`", async () => {
            var router = new Router({
                "ppp://path/to": subPath => `Document at ppp://path/to${subPath}`,
                "ppp://path/to/store1": subPath => `Document at ppp://path/to/store1${subPath}`,
                "ppp://": subPath => `Document at ppp:/${subPath}`,
            })            

            var doc = await router.read("ppp://path/to/store1/path/to/doc1");
            expect(doc).to.equal("Document at ppp://path/to/store1/path/to/doc1");
                        
            var doc = await router.read("ppp://path/to/store2/path/to/doc2");
            expect(doc).to.equal("Document at ppp://path/to/store2/path/to/doc2");

            var doc = await router.read("ppp://path_to/doc");
            expect(doc).to.equal("Document at ppp://path_to/doc");
        });
        
        it("should work also when the loader is defined as `read` method of the store", async () => {
            var router = new Router({
                "/path/to": {read: subPath => `Document at /path/to${subPath}`},
                "/path/to/store1": {read: subPath => `Document at /path/to/store1${subPath}`},
                "ppp://path/to": {read: subPath => `Document at ppp://path/to${subPath}`},
                "ppp://path/to/store1": {read: subPath => `Document at ppp://path/to/store1${subPath}`},
            });
            
            var doc = await router.read("/path/to/store1/path/to/doc1");
            expect(doc).to.equal("Document at /path/to/store1/path/to/doc1");
                        
            var doc = await router.read("/path/to/store2/path/to/doc2");
            expect(doc).to.equal("Document at /path/to/store2/path/to/doc2");

            var doc = await router.read("ppp://path/to/store1/path/to/doc1");
            expect(doc).to.equal("Document at ppp://path/to/store1/path/to/doc1");
                        
            var doc = await router.read("ppp://path/to/store2/path/to/doc2");
            expect(doc).to.equal("Document at ppp://path/to/store2/path/to/doc2");
        });

        it("should throw an error if no store is defined for the given path", async () => {
            var router = new Router({
                "/path/to": subPath => `Document at /path/to${subPath}`,
                "/path/to/store1": subPath => `Document at /path/to/store1${subPath}`,
            });
            
            class ExceptionExpected extends Error {};
            try {
                await router.read("/unmapped-store/path/to/doc");
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
                expect(e.message).to.equal("Handler not defined for path /unmapped-store/path/to/doc");
            }
        });
        
        it("should throw an error if the store doesn't define a `read` method", async () => {
            var router = new Router({
                "/path/to/store1": {},
            });
            
            class ExceptionExpected extends Error {};
            try {
                await router.read("/path/to/store1/doc");
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
                expect(e.message).to.equal("Read operation not defined for paths /path/to/store1/*");
            }
        });
    });
    
    describe("await router.delete(path)", () => {
        
        it("should call the proper store.delete method", async () => {
            var deleted = "";
            var router = new Router({
                "/path/to/store1": {delete: subPath => {deleted = "/path/to/store1"+subPath}},
                "/path/to": {delete: subPath => {deleted = "$/path/to"+subPath}}
            })
            
            await router.delete("/path/to/store1/subpath/to/doc1");
            expect(deleted).to.equal("/path/to/store1/subpath/to/doc1");

            await router.delete("/path/to/store2/subpath/to/doc2");
            expect(deleted).to.equal("$/path/to/store2/subpath/to/doc2");
        });

        it("should throw an error if no store is defined for the given path", async () => {
            var router = new Router({
                "/path/to": subPath => `Document at /path/to${subPath}`,
                "/path/to/store1": subPath => `Document at /path/to/store1${subPath}`,
            });
            
            class ExceptionExpected extends Error {};
            try {
                await router.delete("/unmapped-store/path/to/doc");
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
                expect(e.message).to.equal("Handler not defined for path /unmapped-store/path/to/doc");
            }
        });
        
        it("should throw an error if the store doesn't define a `delete` method", async () => {
            var router = new Router({
                "/path/to/store1": {},
            })
            
            class ExceptionExpected extends Error {};
            try {
                await router.delete("/path/to/store1/doc");
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
                expect(e.message).to.equal("Delete operation not defined for path /path/to/store1/doc");
            }
        });        
    });
    
    describe("await router.write(path, source)", () => {
        
        it("should call the proper store.write method", async () => {
            var docs = {};
            var router = new Router({
                "/path/to/store1": {write: (subPath, source) => {docs["/path/to/store1"+subPath] = source}},
                "/path/to": {write: (subPath, source) => {docs["$/path/to"+subPath] = source}}
            })
            
            await router.write("/path/to/store1/subpath/to/doc1", "doc1 source");
            expect(docs["/path/to/store1/subpath/to/doc1"]).to.equal("doc1 source");

            await router.write("/path/to/store2/subpath/to/doc2", "doc2 source");
            expect(docs["$/path/to/store2/subpath/to/doc2"]).to.equal("doc2 source");            
        });

        it("should throw an error if no store is defined for path", async () => {
            var router = new Router({
                "/path/to": subPath => `Document at /path/to${subPath}`,
                "/path/to/store1": subPath => `Document at /path/to/store1${subPath}`,
            })
            
            class ExceptionExpected extends Error {};
            try {
                await router.write("/unmapped-store/path/to/doc", "doc source");
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
                expect(e.message).to.equal("Handler not defined for path /unmapped-store/path/to/doc");
            }            
        });
        
        it("should throw an error if the store doesn't define a `write` method", async () => {
            var router = new Router({
                "/path/to/store1": {},
            });
            
            class ExceptionExpected extends Error {};
            try {
                await router.write("/path/to/store1/doc", "doc source");
                throw new ExceptionExpected();
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
                expect(e.message).to.equal("Write operation not defined for path /path/to/store1/doc");
            }
        });        
    });       
});
