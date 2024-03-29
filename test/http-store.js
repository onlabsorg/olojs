const {expect} = require('chai');

const express = require("express");
const bodyParser = require("body-parser");

const describeStore = require('./describe-store');
const MemoryStore = require('../lib/stores/memory-store');
const HTTPStore = require('../lib/stores/http-store');


describeStore('HTTPStore', {
    
    async create (documents) {
        const backend = new MemoryStore(documents);
        const app = express();

        app.get("/private/*", (req, res, next) => {
            res.status(403).send();
        });

        app.put("/private/*", (req, res, next) => {
            res.status(403).send();
        });

        app.delete("/private/*", (req, res, next) => {
            res.status(403).send();
        });

        app.get("/unallowed/*", (req, res, next) => {
            res.status(405).send();
        });

        app.put("/unallowed/*", (req, res, next) => {
            res.status(405).send();
        });

        app.delete("/unallowed/*", (req, res, next) => {
            res.status(405).send();
        });

        app.get("*", async (req, res, next) => {
            res.status(200).send(await backend.read(req.path));
        });

        app.delete("*", async (req, res, next) => {
            await backend.delete(req.path);
            res.status(200).send();
        });

        app.use(bodyParser.text({
            type: "text/*"
        }));

        app.put("*", async (req, res, next) => {
            await backend.write(req.path, req.body);
            res.status(200).send();
        });

        return new Promise((resolve, reject) => {
            this.server = app.listen(8020, error => {
                if (error) reject(error);
                else resolve(new HTTPStore('http://localhost:8020'));
            });
        });
    },

    privatePath: "/private",

    unallowedPath: "/unallowed",
    
    async destroy (store) {
        await this.server.close();
    }
});


describe("HTTPStore - with custom headers", () => {
    var server, TestHeader;
    
    before((done) => {
        const app = express();
        
        app.all("/echo-hdr/*", (req, res, next) => {
           TestHeader = req.get('Test');
           res.status(200).send();
       })
               
        server = app.listen(8020, done);
    });
    
    it("should add the options.headers to each GET requst", async () => {
        var customHeaders = {
            Test: "test GET header"
        };
        var httpStore = new HTTPStore("http://localhost:8020", {headers:customHeaders});
        TestHeader = null;
        await httpStore.read('/echo-hdr/path/to/doc');
        expect(TestHeader).to.equal(customHeaders.Test);
    });

    it("should add the returns value options.headers called with 'path' parameters, if a function", async () => {
        var customHeaders = path => ({
            Test: `test GET ${path}`
        });
        var httpStore = new HTTPStore("http://localhost:8020", {headers:customHeaders});
        TestHeader = null;
        await httpStore.read('/echo-hdr/path/to/doc');
        expect(TestHeader).to.equal("test GET /echo-hdr/path/to/doc");
    });

    after(() => {
        server.close();
    });
});


describe("HTTPStore - with custom extension", () => {
    var server, lastRequest;
    
    before((done) => {
        const app = express();
        
        app.all("/*", (req, res, next) => {
            lastRequest = `${req.method} ${req.path}`;
            res.status(200).send("[]");
        })
               
        server = app.listen(8020, done);
    });
    
    it("should add the extension to each `read` requst", async () => {
        var httpStore = new HTTPStore("http://localhost:8020", {extension:".olo"});
        await httpStore.read('/path/to/doc');
        expect(lastRequest).to.equal("GET /path/to/doc.olo");

        var httpStore = new HTTPStore("http://localhost:8020", {extension:"olo"});
        await httpStore.read('/path/to/doc');
        expect(lastRequest).to.equal("GET /path/to/doc.olo");
    });

    after(() => {
        server.close();
    });
});
