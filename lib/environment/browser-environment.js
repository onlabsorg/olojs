/**
 *  # BrowserEnvironment class
 *
 *  This class extends the [Environment](./environment.md) class in order to
 *  create and olojs environment suitable for browsers.
 */

const Environment = require("../environment");
const document = require("../document");
const HTTPStore = require("./http-store");
const binLoader = require("./browser-stdlib-loader");
const parseParams = require("../tools/parameters-parser");
const DOMPurify = require("dompurify");    


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
                }
            },
            paths: {
                "/":        new HTTPStore(origin, {headers}),
                "/bin":     binLoader,
                "http://":  HTTPStore.createReader("http://"),
                "https://": HTTPStore.createReader("https://"),
            }
        })
    }
    
    /**
     *  ### BackendEnvironment.prototype.loadDocument(path, presets)
     *  Maps paths like `/bin/module-path` to stdlib javascript modules.
     *  For any other path, delegates to the parten environment.
     */
    async loadDocument (path, presets={}) {
        const docPath = Path.join("/", String(path));
        if (docPath.slice(0,5) === "/bin/") {
            let modulePath = docPath.slice(4);
            return await modules[modulePath]();
        }
        return await super.loadDocument(path, presets);
    }
        
    /**
     *  ### BrowserEnvironment.stringifyDocumentExpression(value)
     *  This method stringifies and sanitizes an expression value.
     */
    async stringifyDocumentExpression (value) {
        const html = await stringifyDocumentExpression(value);
        return DOMPurify.sanitize(html);
    }
    
    /**
     *  ### BrowserEnvironment.parseURI(uri)
     *  Given an uri in the form `path?var1=val1&var2=val2&...`, returns
     *  a the path and the parameters namespace as a pair [docPath, argns]
     */
    parseURI (uri) {
        let [docPath, args] = uri.split("?");
        let argns = args ? parseParams(...args.split("&")) : {};
        return [docPath, argns];
    }
}


module.exports = BrowserEnvironment;



const modules = {
    "/math"     : () => import(/* webpackChunkName: "/bin/math" */     "./stdlib/math"),
    "/markdown" : () => import(/* webpackChunkName: "/bin/markdown" */ "./stdlib/markdown"),
    "/html"     : () => import(/* webpackChunkName: "/bin/html" */     "./stdlib/html"),
    "/path"     : () => import(/* webpackChunkName: "/bin/path" */     "./stdlib/path"),
}
