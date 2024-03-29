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
const bodyParser = require("body-parser");
const cors = require('cors');

const Store = require('../stores/store');



/**
 *  HTTPServer.createServer: Store -> http.Server
 *  ----------------------------------------------------------------------------
 *  Creates a HTTP Server that mounts a `store middleware` at `/`.
 *
 *  ```js
 *  server = HTTPServer.createServer(store);
 *  server.listen(8010);
 *  ```
 */
function createServer (store) {
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
 *  - The `GET` handler, on any other error will respond with the status code 500.
 *
 *  - On `PUT /paht/to/doc` it will modify the document via `store.write("/path/to/doc", body)`.
 *  - The `PUT` handler, on store's `WritePermissionDeniedError` will
 *    respond with the status code 403.
 *  - The `PUT` handler, on store's `WriteOperationNotAllowedError` will
 *    respond with the status code 405.
 *  - The `PUT` handler, on any other error will respond with the status code 500.
 *
 *  - On `DELETE /paht/to/doc` it will remove the document via `store.delete("/path/to/doc")`.
 *  - The `DELETE` handler, on store's `WritePermissionDeniedError` will
 *    respond with the status code 403.
 *  - The `DELETE` handler, on store's `WriteOperationNotAllowedError` will
 *    respond with the status code 405.
 *  - The `DELETE` handler, on any other error will respond with the status code 500.
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

    // Handle an olo-document DELETE request
    router.delete("*", async (req, res, next) => {
        try {
            await store.delete(req.path);
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







module.exports = {createServer, createMiddleware};
