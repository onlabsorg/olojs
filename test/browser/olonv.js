const Environment = olojs.require("environment/backend-environment");
const FSStore     = olojs.require("environment/fs-store");
const HTTPStore   = olojs.require("environment/http-store");

module.exports = new Environment({
    
    // path handlers
    paths: {
        "/"        : FSStore.createReader(__dirname + "/docs"),
        "http://"  : HTTPStore.createReader("http://"),
        "https://" : HTTPStore.createReader("http://"),
    },
    
    // global names available to all the documents
    globals: {
        'require': modulePath => olojs.require(`environment/stdlib/${modulePath}`)
    },
    
    // true if the loaded document are not cached
    nocache: false,
});
