const BrowserEnvironment = require("./browser-environment");
const Router = require("../lib/stores/router");
const HTTPStore = require("../lib/stores/http-store");

window.olonv = new BrowserEnvironment({
    store: new Router({
        "/": new HTTPStore(`${location.origin}/olors`),
        "/http": new HTTPStore("http:/"),
        "/https": new HTTPStore("https:/"),
    })
});
