const Environment = olojs.require("environment/backend-environment");
const FSStore     = olojs.require("stores/fs-store");
const HTTPStore   = olojs.require("stores/http-store");
const Router      = olojs.require("stores/router");

module.exports = new Environment({
    
    // path handlers
    store: new Router({
        "/"        : FSStore.createReader(__dirname + "/docs"),
        "http://"  : HTTPStore.createReader("http://"),
        "https://" : HTTPStore.createReader("http://"),
    }),
    
    // global names available to all the documents
    globals: {},
    
    // true if the loaded document are not cached
    nocache: false,
});
