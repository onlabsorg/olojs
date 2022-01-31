
const olo = module.exports = {};

olo.expression = require("./lib/expression");

olo.document = require("./lib/document");

olo.Store = require('./lib/store');
olo.MemoryStore = require('./lib/memory-store');
olo.FileStore = require('./lib/file-store');
olo.HTTPStore = require('./lib/http-store');
olo.Router = require('./lib/router');


olo.Hub = class extends require('./lib/hub') {
    
    constructor (homeStore) {
        super(homeStore, new olo.FileStore('/'))
    }
}

olo.HTTPServer = require('./lib/http-server');


