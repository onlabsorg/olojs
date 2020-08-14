
const path = require("path");

const FSStore = require("@onlabsorg/olojs/lib/stores/fs-store");
const HTTPStore = require("@onlabsorg/olojs/lib/stores/http-store");
const Router = require("@onlabsorg/olojs/lib/stores/router");

const Environment = require("@onlabsorg/olojs/lib/environment");

const environment = new Environment({
    
    store: new Router({
        "/": new FSStore(path.resolve(__dirname, "olors")),
        "/http": new HTTPStore("http:/"),
        "/https": new HTTPStore("https:/")
    }),
    
    globals: {},
    
    nocache: true
});

environment.httpOptions = {};

module.exports = environment;
