
const pathlib = require("path");
const express = require("express");
const bodyParser = require('body-parser');
const Store = require('./store');



/**
 *  StoreMiddleware
 *  ============================================================================
 *  Creates an express middleware that exposes a RESTFul API to interact with an
 *  olojs environment via HTTP.
 *  
 *  ```js
 *  middleware = olojs.servers.http.Middleware(environment)
 *  expressApp.use(mountPath, middleware);
 *  ```
 *
 *  - On `GET /env/paht/to/doc` requsts accepting `text/*`, it will respond with 
 *    the source of the document loaded via `environment.readDocument("/path/to/doc")`.
 *  - On `GET /env/paht/to/doc` requsts accepting `application/json`, it will 
 *    respond with the JSON-serialized array returned by 
 *    `environment.listEntries("/path/to/doc")`.
 *  - On `GET /env/paht/to/doc` requsts accepting neither `text/*` nor
 *    `application/json`, it will respond with a `415` error code.
 *  - On `PUT /env/paht/to/doc` requsts it will execute the 
 *    `environment.writeDocument("/path/to/doc", body)` method.
 *  - On `DELETE /env/paht/to/doc` requsts it will execute the 
 *    `environment.deleteDocument("/path/to/doc", body)` method.
 */
module.exports = function (store) {
    const router = express.Router();
    
    // Handle an olo-document GET request
    router.get("*", async (req, res, next) => {
        try {
            if (req.accepts("text/*")) {
                let source = await store.get(req.path);
                res.status(200).send(String(source));
            } else if (req.accepts("application.json")) {
                let entries = await store.list(req.path);
                res.status(200).json(entries);
            } else {
                res.status(415).send(`Unsupported media types: ${req.get("Accept")}`);
            }
        } catch (error) {            
            if (error instanceof Store.PermissionDeniedError) {
                res.status(403).send(error.message);
            } else if (error instanceof Store.OperationNotAllowedError) {
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
            if (error instanceof Store.PermissionDeniedError) {
                res.status(403).send(error.message);
            } else if (error instanceof Store.OperationNotAllowedError) {
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
            await store.set(req.path, req.body);
            res.status(200).send();
        } catch (error) {        
            if (error instanceof Store.PermissionDeniedError) {
                res.status(403).send(error.message);
            } else if (error instanceof Store.OperationNotAllowedError) {
                res.status(405).send(error.message);                
            } else {
                res.status(500).send(error.message);
            }
        }        
    });    
    
    return router;
}
