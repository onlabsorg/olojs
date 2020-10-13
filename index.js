
module.exports = {
    
    get expression      () {return require("./lib/expression")},
    get document        () {return require("./lib/document")},
    
    get Environment () {return require("./lib/environment")},
    
    protocols: {
        get file    () {return require('./lib/protocols/file')},
        get fs      () {return require('./lib/protocols/fs')},
        get http    () {return require('./lib/protocols/http')},
        get https   () {return require('./lib/protocols/https')},
        get null    () {return require('./lib/protocols/null')},
    },
    
    servers: {
        get http () {return require("./lib/servers/http")}
    }
};
