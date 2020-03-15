const Environment = require(__olojspath + "/lib/environment/backend-environment");
const FSStore     = require(__olojspath + "/lib/environment/fs-store");
const HTTPStore   = require(__olojspath + "/lib/environment/http-store");

module.exports = new Environment({
    
    stores: {
        "/"        : FSStore.createReader(__dirname + "/docs"),
        "http://"  : HTTPStore.createReader("http://"),
        "https://" : HTTPStore.createReader("http://")
    },
    
    globals: {
        "require" : require(__olojspath + "/lib/stdlib/node-require")
    }
});
