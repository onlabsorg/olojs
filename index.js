
module.exports = {
    
    get expression      () {return require("./lib/expression")},
    get document        () {return require("./lib/document")},
    
    get Environment     () {return require("./lib/environment")},
    
    stores: {
        get Empty   () {return require('./lib/stores/empty')},
        get Memory  () {return require('./lib/stores/memory')},
        get File    () {return require('./lib/stores/file')},
        get FS      () {return require('./lib/stores/fs')},
        get HTTP    () {return require('./lib/stores/http')},
        get Router  () {return require('./lib/stores/router')},
    },
    
    servers: {
        get http () {return require("./lib/servers/http")}
    }
};
