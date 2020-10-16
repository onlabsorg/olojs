
module.exports = {
    
    get expression      () {return require("./lib/expression")},
    get document        () {return require("./lib/document")},
    
    get Environment () {return require("./lib/environment")},
    
    stores: {
        get File    () {return require('./lib/stores/file')},
        get FS      () {return require('./lib/stores/fs')},
        get HTTP    () {return require('./lib/stores/http')},
        get Null    () {return require('./lib/stores/null')},
    },
    
    servers: {
        get http () {return require("./lib/servers/http")}
    }
};
