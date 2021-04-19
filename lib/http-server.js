/**
 *  HTTPServer - module
 *  ============================================================================
 *  The `HTTPServer` module contains functions for creating HTTP servers exposing
 *  a RESTful interface to a `Store` object. It also allows to serve the documents
 *  as HTML pages.
 *  
 *  ```js
 *  olojs = require('@onlabsorg/olojs');
 *  HTTServer = olojs.HTTPServer;
 *  ```
 */

const pathlib = require('path');
const express = require("express");
const http = require("http");
const bodyParser = require('body-parser');
const Store = require('./store');


 
 
/**
 *  HTTPServer.StoreMiddleware - function
 *  ----------------------------------------------------------------------------
 *  Creates an express middleware that exposes a RESTFul API to interact with an
 *  olojs store via HTTP.
 *
 *  ```js
 *  middleware = HTTPServer.StoreMiddleware(store)
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
 *  - On `DELETE /paht/to/doc` requests accepting a `text/directory` MimeType, 
 *    it will execute the `store.deleteAll("/path/to/doc")` method.
 *  - The `GET` handler, on store's `ReadPermissionDeniedError` will
 *    respond with the status code 403
 *  - The `GET` handler, on store's `ReadOperationNotAllowedError` will
 *    respond with the status code 405
 *  - The `PUT` and `DLETE` handlers, on store's `WritePermissionDeniedError`
 *    will respond with the status code 403
 *  - The `PUT` and `DELETE` handlers, on store's `WriteOperationNotAllowedError`
 *    will respond with the status code 405
 */
exports.StoreMiddleware = function (store) {
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
 *  HTTPServer.ViewerMiddleware - function
 *  ----------------------------------------------------------------------------
 *  Creates an express middleware that serves an olojs document viewer app.
 *  
 *  ```js
 *  middleware = HTTPServer.ViewerMiddleware(store)
 *  expressApp.use(mountPath, middleware);
 *  ```
 *  
 *  - `store` is the store containing the documents to be served
 *  - `middleware` is the express middleware that servers the viewer app on
 *    `GET /` requests.
 *  
 *  The viewer app, in the browsers, will load the document with id defined by 
 *  the URL fragment (e.g. `/#/path/to/doc`), evaluate it, render it, sanitize 
 *  it and inject it in the DOM.
 */
exports.ViewerMiddleware = function (store) {
    const router = express.Router();
    const publicPath = pathlib.join(__dirname, "../browser");
    
    router.use('/docs', this.StoreMiddleware(store));
        
    router.use( express.static(publicPath) );

    return router;
}



/**
 *  HTTPServer.createServer - function
 *  ----------------------------------------------------------------------------
 *  This function takes an olojs Store as input and returns a HTTP server that 
 *  mounts a `StoreMiddleware` on `/docs` and a `ViewerMiddleware` at `/`.
 *  
 *  ```js
 *  server = HTTPServer.createServer(store)
 *  ```
 *  
 *  - `store` is the olojs `Store` instance that will be served via the 
 *    `StoreMiddleware`
 *  - `server` is the HTTP server that serves the store on `/docs/path/to/doc`
 *    requests and the viewer on `/#/path/to/doc` requests
 */
exports.createServer = function (store, options={}) {
    const app = express();    
    app.use('/', this.ViewerMiddleware(store));
    return http.createServer(app);
}

