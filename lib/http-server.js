/**
 *  HTTPServer - module
 *  ============================================================================
 *  The `HTTPServer` module contains functions for serving olojs documents over
 *  HTTP.
 */

const pathlib = require('path');
const fs = require('fs');
const http = require('http');
const express = require("express");
const cors = require('cors');
const Store = require('./store');


/**
 *  HTTPServer.create: Store -> http.Server
 *  ----------------------------------------------------------------------------
 *  Creates a HTTP Server that mounts a `store middleware` at `/`.
 *
 *  ```js
 *  server = HTTPServer.create(store);
 *  server.listen(8010);
 *  ```
 */
function create (store) {
    const app = express();
    app.use('/', createMiddleware(store));
    return http.createServer(app);
}



/**
 *  HTTPServer.createMiddleware: Store -> express.Router
 *  ----------------------------------------------------------------------------
 *  Creates an express middleware that exposes a RESTFul API to interact with an
 *  olojs store via HTTP.
 *
 *  ```js
 *  middleware = HTTPServer.createMiddleware(store);
 *  expressApp.use(mountPath, middleware);
 *  ```
 *
 *  - On `GET /paht/to/doc` requests accepting `text/*`, it will respond with
 *    the source of the document loaded via `store.read("/path/to/doc")`.
 *  - On `GET /paht/to/doc` requests accepting other than `text/*` it will
 *    respond with a `415` error code.
 *  - The `GET` handler, on store's `ReadPermissionDeniedError` will
 *    respond with the status code 403.
 *  - The `GET` handler, on store's `ReadOperationNotAllowedError` will
 *    respond with the status code 405.
 */
function createMiddleware (store) {
    const router = express.Router();
    
    // Enable complex CORS
    router.options("*", cors());

    // Handle an olo-document GET request
    router.get("*", cors(), async (req, res, next) => {
        try {
            if (req.accepts("text/*")) {
                let source = await store.read(req.path);
                res.status(200).send(String(source));
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

    return router;
}







module.exports = {create, createMiddleware};
