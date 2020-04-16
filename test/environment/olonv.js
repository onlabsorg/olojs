const Environment = olojs.require("environment");
const FSStore     = olojs.require("stores/fs-store");
const HTTPStore   = olojs.require("stores/http-store");
const HTTPServer  = olojs.require("http-server");
const Router      = olojs.require("stores/router");

module.exports = new Environment({
    
    // path handlers
    store: new Router({
        "/"        : FSStore.createReader(__dirname + "/docs"),
        "http://"  : HTTPStore.createReader("http://"),
        "https://" : HTTPStore.createReader("http://"),
    }),
    
    // global names available to all the documents
    globals: {
        require: modulePath => olojs.require(`stdlib/${modulePath}`)
    },
    
    // true if the loaded document are not cached
    nocache: false,
    
    // a function that starts serving this environment over HTTP
    // it takes a port as input and returns a server object as output
    serve: HTTPServer()
});
