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
        
        app.delete("*", async (req, res, next) => {
            try {
                if (req.get('Content-Type') === `text/directory`) {
                    await backend.deleteAll(req.path);
                } else {
                    await backend.delete(req.path);
                }
                res.status(200).send();
            } catch (e) {
                res.status(500).send(e.message);
            }
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
    
    async destroy (store) {
        await this.server.close();
    }
});


describeStore('HTTPStore - read only', {
    
    readOnly: true,
    
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
        
        app.delete("*", async (req, res, next) => {
            res.status(405).send(`Operation not define for document at ${req.path}`);
        });
        
        app.put("*", async (req, res, next) => {
            res.status(405).send(`Operation not define for document at ${req.path}`);
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
        
        app.delete("*", async (req, res, next) => {
            res.status(405).send(`Operation not define for document at ${req.path}`);
        });
        
        app.put("*", async (req, res, next) => {
            res.status(405).send(`Operation not define for document at ${req.path}`);
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
    writeAccessDenied: true,
    
    async create (documents) {
        const backend = new MemoryStore(documents);
        const app = express();
        
        app.get("*", async (req, res, next) => {
            res.status(403).send(`Permission denied to access document at ${req.path}`);
        });
        
        app.delete("*", async (req, res, next) => {
            res.status(403).send(`Permission denied to access document at ${req.path}`);
        });
        
        app.put("*", async (req, res, next) => {
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

    it("should add the options.headers to each SET requst", async () => {
        var customHeaders = {
            Test: "test SET header"
        };
        var httpStore = new HTTPStore("http://localhost:8020", {headers:customHeaders});
        TestHeader = null;
        await httpStore.write('/echo-hdr/path/to/doc', "...");
        expect(TestHeader).to.equal(customHeaders.Test);
    });

    it("should add the options.headers to each DELETE requst", async () => {
        var customHeaders = {
            Test: "test DELETE header"
        };
        var httpStore = new HTTPStore("http://localhost:8020", {headers:customHeaders});
        TestHeader = null;
        await httpStore.delete('/echo-hdr/path/to/doc');
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

    it("should not add the extension to any `list` request", async () => {
        var httpStore = new HTTPStore("http://localhost:8020", {extension:".olo"});
        await httpStore.list('/path/to/doc');
        expect(lastRequest).to.equal("GET /path/to/doc");
    });

    it("should add the extendsion to each `write` request", async () => {
        var httpStore = new HTTPStore("http://localhost:8020", {extension:".olo"});
        await httpStore.write('/path/to/doc', "...");
        expect(lastRequest).to.equal("PUT /path/to/doc.olo");
    });

    it("should add the extension to each `delete` request", async () => {
        var httpStore = new HTTPStore("http://localhost:8020", {extension:".olo"});
        await httpStore.delete('/path/to/doc');
        expect(lastRequest).to.equal("DELETE /path/to/doc.olo");
    });
    
    it("should not add the extension to any `deleteAll` request", async () => {
        var httpStore = new HTTPStore("http://localhost:8020", {extension:".olo"});
        await httpStore.deleteAll('/path/to/doc');
        expect(lastRequest).to.equal("DELETE /path/to/doc");
    });

    after(() => {
        server.close();
    });
});
