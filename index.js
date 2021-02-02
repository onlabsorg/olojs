
module.exports = {

    get expression  () {return require("./lib/expression")},
    get document    () {return require("./lib/document")},

    get Store       () {return require('./lib/store')},
    get MemoryStore () {return require('./lib/memory-store')},
    get FileStore   () {return require('./lib/file-store')},
    get HTTPStore   () {return require('./lib/http-store')},
    get Router      () {return require('./lib/router')},

    get HTTPServer  () {return require("./lib/http-server")},
};
