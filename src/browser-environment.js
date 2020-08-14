const Environment = require("../lib/environment");
const Router = require("../lib/stores/router");
const HTTPStore = require("../lib/stores/http-store");

module.exports = new Environment({
    store: new Router({
        "/": new HTTPStore(`${location.origin}/olors`),
        "/http": new HTTPStore("http:/"),
        "/https": new HTTPStore("https:/"),
    }),
    globals: {
        $renderError (error) {
            return `<span class="runtime-error">${error.message}</span>`;
        }        
    }
})
