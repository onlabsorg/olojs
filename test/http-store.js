const expect = require("chai").expect;

var HTTPStore = require("../lib/stores/http-store");
var FSStore = require("../lib/stores/fs-store");

var express = require("express");

var initStore = require("./init-fs-store");
var ROOT_PATH = `${__dirname}/fs-store`;

var port = 8888;

var testStore = require("./store");

describe("http_store = new HTTPStore(url, options)", () => {
    var server, store;
    
    before(async () => {
        var fsStore = new FSStore(ROOT_PATH);
        server = await startServer(fsStore, port);
    });
    
    testStore(async function (content) {
        await initStore(ROOT_PATH, content);
        store = new HTTPStore(`http://localhost:${port}`, {
            decorateHttpRequest (request) {
                if (request.url === `http://localhost:${port}/decorator-test`) {
                    request.headers.set("throw", `Decorated ${request.method} request received`);
                }
                return request;
            }
        });
        return store;
    });

    describe("access control errors", () => {
        
        it("should throw HTTPStore.ReadAccessDeniedError on 403 GET responses", async () => {
            try {
                await store.read("/private/path/to/doc");
                throw new Error("it didn't throw")
            } catch (error) {
                expect(error).to.be.instanceof(HTTPStore.ReadAccessDeniedError);
            } 
        });

        it("should throw HTTPStore.WriteAccessDeniedError on 403 PUT responses", async () => {
            try {
                await store.write("/private/path/to/doc", "xxx");
                throw new Error("it didn't throw")
            } catch (error) {
                expect(error).to.be.instanceof(HTTPStore.WriteAccessDeniedError);
            } 
        });

        it("should throw HTTPStore.WriteAccessDeniedError on 403 DELETE responses", async () => {
            try {
                await store.delete("/private/path/to/doc");
                throw new Error("it didn't throw")
            } catch (error) {
                expect(error).to.be.instanceof(HTTPStore.WriteAccessDeniedError);
            } 
        });
    });
    
    describe("options.decorateHttpRequest", () => {
        
        it("should decorate the HTTP GET requests", async () => {
            try {
                await store.read("/decorator-test");
                throw new Error("it didn't throw")
            } catch (error) {
                expect(error.message).to.equal("Decorated get request received");
            } 
        });

        it("should decorate the HTTP PUT requests", async () => {
            try {
                await store.write("/decorator-test", "...");
                throw new Error("it didn't throw")
            } catch (error) {
                expect(error.message).to.equal("Decorated put request received");
            } 
        });

        it("should decorate the HTTP DELETE requests", async () => {
            try {
                await store.delete("/decorator-test");
                throw new Error("it didn't throw")
            } catch (error) {
                expect(error.message).to.equal("Decorated delete request received");
            } 
        });
    });
    
    
    after(async () => {
        await server.close();
    });
});


async function startServer (store, port) {
    var express = require("express");
    var bodyParser = require('body-parser');
    var router = express();
    
    router.all("*", async (req, res, next) => {
        let errorMessage = req.get("throw");
        if (errorMessage) {
            res.status(500).send(errorMessage);
        } else {
            next();
        }
    });

    router.get("*", async (req, res, next) => {
        if (req.path.slice(0,9) === "/private/") {
            return res.status(403).send();
        }
        let source = await store.read(req.path);
        res.status(200).send(source);
    });    
    
    // delete document request
    router.delete(`*`, async (req, res, next) => {
        if (req.path.slice(0,9) === "/private/") {
            return res.status(403).send();
        }
        try {
            await store.delete(req.path, req.body);
            res.status(200).send("Deleted!");            
        } catch (error) {            
            res.status(500).send(error.message);
        }        
    });    
    

    // write document request
    router.use(bodyParser.text({
        type: "text/olo"
    }));    

    router.put(`*`, async (req, res, next) => { 
        if (req.path.slice(0,9) === "/private/") {
            return res.status(403).send();
        }
        try {
            await store.write(req.path, req.body);
            res.status(200).send("Updated!");            
        } catch (error) {
            res.status(500).send(error.message);
        }        
    });    

    return new Promise((resolve, reject) => {
        var server = router.listen(port, () => {
            resolve(server);
        });
    });        
}
