const Environment = require(__olojspath + "/lib/environment/backend-environment");
const FSStore     = require(__olojspath + "/lib/environment/fs-store");
const HTTPStore   = require(__olojspath + "/lib/environment/http-store");
const BinHandler  = require(__olojspath + "/lib/environment/bin-handler");

module.exports = new Environment({
    
    // path handlers
    paths: {
        "/"        : FSStore.createReader(__dirname + "/docs"),
        "/bin"     : require(`${__olojspath}/lib/stdlib/node-bin-handler`),
        "http://"  : HTTPStore.createReader("http://"),
        "https://" : HTTPStore.createReader("http://"),
    },
    
    // global names available to all the documents
    globals: {},
    
    // true if the loaded document are not cached
    nocache: false,
});
