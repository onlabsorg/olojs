
module.exports = {
    
    get expression      () {return require("./lib/expression")},
    get document        () {return require("./lib/document")},
    
    get Environment () {return require("./lib/environment")},
    
    stores: {
        get Null    () {return require('./lib/stores/null')},
        get Memory  () {return require('./lib/stores/memory')},
        get File    () {return require('./lib/stores/file')},
        get FS      () {return require('./lib/stores/fs')},
        get HTTP    () {return require('./lib/stores/http')},
    },
    
    servers: {
        get http () {return require("./lib/servers/http")}
    }
};
