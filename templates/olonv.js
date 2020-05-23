const Environment = require("@onlabsorg/olojs/lib/environment");

const Router      = require("@onlabsorg/olojs/lib/stores/router");
const FSStore     = require("@onlabsorg/olojs/lib/stores/fs-store");
const HTTPStore   = require("@onlabsorg/olojs/lib/stores/http-store");

const HTTPServer  = require("@onlabsorg/olojs/lib/http-server");



module.exports = new Environment({
    
    // path handlers
    store: new Router({
        "/"        : FSStore.createReader(__dirname + "/documents"),
        "http://"  : HTTPStore.createReader("http://"),
        "https://" : HTTPStore.createReader("https://"),
    }),
    
    // global names available to all the documents
    globals: {
        require: modulePath => require(`@onlabsorg/olojs/lib/stdlib/${modulePath}`)
    },
    
    // true if the loaded document are not cached
    nocache: false,
    
    // a function that starts serving this environment over HTTP
    // it takes a port as input and returns a server object as output
    serve: HTTPServer()
});
