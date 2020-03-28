const Environment = require(`${__olojspath}/lib/environment/backend-environment`);
const FSStore     = require(`${__olojspath}/lib/environment/fs-store`);
const HTTPStore   = require(`${__olojspath}/lib/environment/http-store`);
const binLoader   = require(`${__olojspath}/lib/environment/node-stdlib-loader`);

module.exports = new Environment({
    
    // path handlers
    paths: {
        "/"        : FSStore.createReader(__dirname + "/docs"),
        "/bin"     : binLoader,
        "http://"  : HTTPStore.createReader("http://"),
        "https://" : HTTPStore.createReader("http://"),
    },
    
    // global names available to all the documents
    globals: {},
    
    // true if the loaded document are not cached
    nocache: false,
});
