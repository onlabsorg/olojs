/**
 *  HTTPServer - module
 *  ============================================================================
 *  The `HTTPServer` module contains functions for serving olojs documents over
 *  the internet..
 */

const pathlib = require('path');
const fs = require('fs');
const http = require('http');
const express = require("express");
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
const StoreMiddleware = exports.StoreMiddleware = function (store) {
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
 *  HTTPServer.StoreServer - function
 *  ----------------------------------------------------------------------------
 *  Creates a HTTP Server that mounts a `StoreMiddleware` at `/`.
 *  
 *  ```js
 *  server = HTTPServer.StoreServer(store);
 *  selrver.listen(8010);
 *  ```
 */
exports.StoreServer = store => {
    const app = express();
    app.use('/', StoreMiddleware(store));
    return http.createServer(app);
}





/**
 *  HTTPServer.ViewerMiddleware - function
 *  ----------------------------------------------------------------------------
 *  Creates an express middleware that serves an olojs document viewer app.
 *  
 *  ```js
 *  middleware = HTTPServer.ViewerMiddleware(storeURL);
 *  expressApp.use(mountPath, middleware);
 *  ```
 *  
 *  - `storeURL` is the url of a store served over HTTP (e.g. via a StoreServer)
 *  - `middleware` is the express middleware that servers the viewer app on
 *    `GET /` requests.
 *  
 *  The viewer app, in the browsers, will load the document with id defined by 
 *  the URL fragment (e.g. `/#/path/to/doc`), evaluate it, render it, sanitize 
 *  it and inject it in the DOM.
 */
const ViewerMiddleware = exports.ViewerMiddleware = function (storeURL) {
    const publicPath = pathlib.join(__dirname, '../dist');
    const viewerPage = fs.readFileSync(`${publicPath}/viewer.html`, 'utf8')
        .replace("{{store-url}}", storeURL);
    const serveViewerPage = (req, res, next) => {
        res.status(200).send(viewerPage);
    }
        
    const router = express.Router();
    router.get('/', serveViewerPage);
    router.get('/viewer.html', serveViewerPage);
    router.use('/', express.static(publicPath));
    return router;
}



/**
 *  HTTPServer.ViewerServer - function
 *  ----------------------------------------------------------------------------
 *  Creates a HTTP Server that mounts a `ViewerMiddleware` at `/` and the given
 *  store at `/docs`.
 *  
 *  ```js
 *  server = HTTPServer.ViewerServer(store);
 *  selrver.listen(8010);
 *  ```
 */
exports.ViewerServer = store => {
    const app = express();
    app.use('/docs', StoreMiddleware(store));
    app.use('/', ViewerMiddleware('/docs'));
    return http.createServer(app);
}

