const pathlib = require("path");
const http = require("http");
const express = require("express");
const bodyParser = require('body-parser');
const Store = require('./store');



/**
 *  HTTPServer.createMiddleware - function
 *  ============================================================================
 *  Creates an express middleware that exposes a RESTFul API to interact with an
 *  olojs store via HTTP.
 *
 *  ```js
 *  middleware = HTTPServer.createMiddleware(store)
 *  expressApp.use(mountPath, middleware);
 *  ```
 *
 *  - On `GET /paht/to/doc` requests accepting `text/*`, it will respond with
 *    the source of the document loaded via `store.read("/path/to/doc")`.
 *  - On `GET /paht/to/doc` requests accepting `application/json`, it will
 *    respond with the JSON-serialized array returned by
 *    `store.list("/path/to/doc")`.
 *  - On `GET /paht/to/doc` requests accepting neither `text/*` nor
 *    `application/json`, it will respond with a `415` error code.
 *  - On `PUT /paht/to/doc` requests it will execute the
 *    `store.write("/path/to/doc", body)` method.
 *  - On `DELETE /paht/to/doc` requests it will execute the
 *    `store.delete("/path/to/doc")` method.
 *  - The `GET` handler, on store's `ReadPermissionDeniedError` will
 *    respond with the status code 403
 *  - The `GET` handler, on store's `ReadOperationNotAllowedError` will
 *    respond with the status code 405
 *  - The `PUT` and `DLETE` handlers, on store's `WritePermissionDeniedError`
 *    will respond with the status code 403
 *  - The `PUT` and `DELETE` handlers, on store's `WriteOperationNotAllowedError`
 *    will respond with the status code 405
 */
exports.createMiddleware = function (store) {
    const router = express.Router();

    // Handle an olo-document GET request
    router.get("*", async (req, res, next) => {
        try {
            if (req.accepts("text/*")) {
                let source = await store.read(req.path);
                res.status(200).send(String(source));
            } else if (req.accepts("application.json")) {
                let entries = await store.list(req.path);
                res.status(200).json(entries);
            } else {
                res.status(415).send(`Unsupported media types: ${req.get("Accept")}`);
            }
        } catch (error) {
            if (error instanceof Store.ReadPermissionDeniedError) {
                res.status(403).send(error.message);
            } else if (error instanceof Store.ReadOperationNotAllowedError) {
                res.status(405).send(error.message);
            } else {
                res.status(500).send(error.message);
            }
        }
    });

    // Handle an olo-document DELETE request
    router.delete("*", async (req, res, next) => {
        try {
            if (req.get('Content-Type') === "text/directory") {
                await store.deleteAll(req.path);
            } else {
                await store.delete(req.path);
            }
            res.status(200).send();
        } catch (error) {
            if (error instanceof Store.WritePermissionDeniedError) {
                res.status(403).send(error.message);
            } else if (error instanceof Store.WriteOperationNotAllowedError) {
                res.status(405).send(error.message);
            } else {
                res.status(500).send(error.message);
            }
        }
    });

    // Parse the olo-document request text body
    router.use(bodyParser.text({
        type: "text/*"
    }));

    // Handle an olo-document PUT request
    router.put("*", async (req, res, next) => {
        try {
            await store.write(req.path, req.body);
            res.status(200).send();
        } catch (error) {
            if (error instanceof Store.WritePermissionDeniedError) {
                res.status(403).send(error.message);
            } else if (error instanceof Store.WriteOperationNotAllowedError) {
                res.status(405).send(error.message);
            } else {
                res.status(500).send(error.message);
            }
        }
    });

    return router;
}



/**
 *  HTTPStore.createServer - function
 *  ============================================================================
 *  Functions that creates an http server exposing an olojs environment via HTTP.
 *
 *  ```js
 *  server = HTTPServer.createServer(store, options)
 *  server.listen(8010, callback);
 *  ```
 *
 *  - `store` is any valid [olojs.Store](./store.md) instance
 *  - `options.before` is an express middleware to be mounted on `/` before
 *    the store middleware
 *  - `options.storeRoute` define the route on which the store middleware
 *    returned by `HTTPStore.createMiddleware(store)` will be mounted.
 *    It defaults to `/docs`.
 *  - `options.after` is an express middleware to be mounted on `/` after
 *    the store middleware
 *  - `options.publicPath` indicates the location of the public path, which is
 *    useful if you want to create your own web UI for rendering the documents
 *  - `server` is a nodejs http.Server instance
 *
 *  The request handling sequence is as follows:
 *
 *  1. On any `/*` request, it will delegate to the `options.before` middleware,
 *     if it exists.
 *  2. On any `/docs/*` request, it will delegate to the middleware created via
 *     `HTTPStore.createMiddleware(store)`. The mounting route `/docs` can be
 *     customized via the `options.storeRoute` parameter.
 *  3. On any `/*` request, it will delegate to the `options.after` middleware,
 *     if it exists.
 *  4. On `GET /` requests it will serve the resources from `options.publicPath`,
 *     defaulting to `@onalbsorg/olojs/public` which contains a single page
 *     application that loads and renders the document mapped to the url hash.
 */
exports.createServer = (store, options={}) => {
    const app = express();

    // For debug:
    // app.all('*', (req, res, next) => {
    //     console.log(`@HTTPServer: ${req.method} ${req.path}`);
    //     next();
    // });

    // Custom middleware to be run before the store middleware
    if (isFunction(options, 'before')) {
        app.use('/', options.before);
    }

    // Routes the document requests
    const storeRoute = getProp(options, 'storeRoute') || '/docs';
    app.use(storeRoute, this.createMiddleware(store) );

    // Custom middleware to be run after the store middleware
    if (isFunction(options, 'after')) {
        app.use('/', options.after);
    }

    // Serves static files
    const publicPath = getProp(options, "publicPath") || pathlib.join(__dirname, "../public");
    app.use( express.static(publicPath) );

    // Returns the http.Server
    return http.createServer(app);
}


// -----------------------------------------------------------------------------
//  SUPPORT FUNCTIONS
// -----------------------------------------------------------------------------

const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);
const getProp = (obj, key) => isObject(obj) ? obj[key] || null : null;
const isFunction = (obj, key) => isObject(obj) && typeof obj[key] === "function";
