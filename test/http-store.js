const {expect} = require('chai');

const express = require("express");
const bodyParser = require("body-parser");

const describeStore = require('./describe-store');
const MemoryStore = require('../lib/memory-store');
const HTTPStore = require('../lib/http-store');


describeStore('HTTPStore', {
    
    async create (documents) {
        const backend = new MemoryStore(documents);
        const app = express();
        
        app.get("*", async (req, res, next) => {
            if (req.accepts('application/json')) {
                res.status(200).json(await backend.list(req.path));
            } else {
                res.status(200).send(await backend.read(req.path))
            }
        });
        
        return new Promise((resolve, reject) => {
            this.server = app.listen(8020, error => {
                if (error) reject(error);
                else resolve(new HTTPStore('http://localhost:8020'));
            });
        });
    },
    
    async destroy (store) {
        await this.server.close();
    }
});


describeStore('HTTPStore - void', {
    
    voidStore: true,
    
    async create (documents) {
        const backend = new MemoryStore(documents);
        const app = express();
        
        app.get("*", async (req, res, next) => {
            res.status(404).send(`This store is empty`);
        });

        return new Promise((resolve, reject) => {
            this.server = app.listen(8020, error => {
                if (error) reject(error);
                else resolve(new HTTPStore('http://localhost:8020'));
            });
        });
    },
    
    async destroy (store) {
        await this.server.close();
    }
});


describeStore('HTTPStore - access denied', {
    
    readAccessDenied: true,

    async create (documents) {
        const backend = new MemoryStore(documents);
        const app = express();
        
        app.get("*", async (req, res, next) => {
            res.status(403).send(`Permission denied to access document at ${req.path}`);
        });

        return new Promise((resolve, reject) => {
            this.server = app.listen(8020, error => {
                if (error) reject(error);
                else resolve(new HTTPStore('http://localhost:8020'));
            });
        });
    },
    
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
