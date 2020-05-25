/**
 *  # BrowserEnvironment class
 *
 *  This class extends the [Environment](./environment.md) class in order to
 *  create and olojs environment suitable for browsers.
 */

const Environment = require("../lib/environment");
const document = require("../lib/document");
const HTTPStore = require("../lib/stores/http-store");
const parseParams = require("../lib/tools/parameters-parser");
const Router = require("../lib/stores/router");


class BrowserEnvironment extends Environment {


    /**
     *  ### new BrowserEnvironment(origin, headers)
     *  This environment creates three stores:
     *  - `/`: backed by the http store under `origin`
     *  - `http://`: generic http reader
     *  - `https://`: generic https reader
     *  The root http reader `/` adds the passed headers to every request
     *  
     *  The environment globals contain a `require` function that loads the
     *  [olojs standard library](./stdlib.md) modules.
     */
    constructor (origin, headers={}) {
        super({
            globals: {
                $renderError (error) {
                    console.error(error);
                    return `<span style="color:red; font-weight:bold">${error.message}</span>`;
                },
                require: modulePath => modules[modulePath]()
            },
            store: new Router({
                "/":        new HTTPStore(origin, {headers}),
                "http://":  HTTPStore.createReader("http://"),
                "https://": HTTPStore.createReader("https://"),
            })
        })
    }
}


module.exports = BrowserEnvironment;



const modules = {
    "math"     : () => import(/* webpackChunkName: "/bin/math" */     "../lib/stdlib/math"),
    "markdown" : () => import(/* webpackChunkName: "/bin/markdown" */ "../lib/stdlib/markdown"),
    "html"     : () => import(/* webpackChunkName: "/bin/html" */     "../lib/stdlib/html"),
    "path"     : () => import(/* webpackChunkName: "/bin/path" */     "../lib/stdlib/path"),
}
