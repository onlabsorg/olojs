

const pathlib = require("path");
const http = require("http");
const express = require("express");
const bodyParser = require('body-parser');
const storeErrors = require("../stores/store-errors");


/**
 *  olojs.servers.http
 *  ============================================================================
 *  Functions that creates an http server exposing an olojs environment via HTTP.
 *  
 *  ```js
 *  server = olojs.servers.http(environment, options)
 *  server.listen(8010, callback);
 *  ```
 *
 *  - `environment` is a valid olojs environment.
 *  - `options.publicPath` indicates the location of the public path, which is 
 *    useful if you want to create your own web UI for rendering the documents
 *  - `server` is a nodejs http.Server instance
 *    
 *  On `GET /env/paht/to/doc` requsts it will respond with the source of the 
 *  document loaded via `environment.readDocument("/path/to/doc")`.
 *    
 *  On `GET /` requsts it will respond with a single page application that 
 *  loads and fetches the document mapped to the hash.
 *  
 *  On `PUT /env/paht/to/doc` requsts it will execute the 
 *  `environment.writeDocument("/path/to/doc", body)` method.
 *  
 *  On `DELETE /env/paht/to/doc` requsts it will execute the 
 *  `environment.deleteDocument("/path/to/doc", body)` method.
 */
const HTTPServer = (environment, options={}) => {
    const app = express();
    
    // For debug:
    // app.all('*', (req, res, next) => {
    //     console.log(`@olojs.http.server: ${req.method} ${req.path}`);
    //     next();
    // });
    
    // Routes the environment requests
    app.use('/env', HTTPServer.Middleware(environment) );
    
    // Serves static files
    const publicPath = getProp(options, "publicPath") || pathlib.join(__dirname, "../../public");
    app.use( express.static(publicPath) );
    
    // Returns the http.Server
    return http.createServer(app);
}



/**
 *  olojs.servers.http.Middleware
 *  ============================================================================
 *  Creates an express middleware that exposes a RESTFul API to interact with an
 *  olojs environment via HTTP.
 *  
 *  ```js
 *  middleware = olojs.servers.http.Middleware(environment)
 *  expressApp.use(mountPath, middleware);
 *  ```
 *
 *  - On `GET /env/paht/to/doc` requsts it will respond with the source of the 
 *    document loaded via `environment.readDocument("/path/to/doc")`.
 *  - On `PUT /env/paht/to/doc` requsts it will execute the 
 *    `environment.writeDocument("/path/to/doc", body)` method.
 *  - On `DELETE /env/paht/to/doc` requsts it will execute the 
 *    `environment.deleteDocument("/path/to/doc", body)` method.
 */
HTTPServer.Middleware = function (environment) {
    const router = express.Router();
    
    // Handle an olo-document GET request
    router.get("*", async (req, res, next) => {
        try {
            let doc = await environment.readDocument(req.path);
            res.status(200).send(doc.source);
            
        } catch (error) {            
            if (error instanceof storeErrors.PermissionDenied) {
                res.status(403).send(error.message);
            } else if (error instanceof storeErrors.OperationNotAllowed) {
                res.status(405).send(error.message);                
            } else {
                res.status(500).send(error.message);
            }
        }        
    });

    // Handle an olo-document DELETE request
    router.delete("*", async (req, res, next) => {
        try {
            await environment.deleteDocument(req.path);
            res.status(200).send();
        } catch (error) {        
            if (error instanceof storeErrors.PermissionDenied) {
                res.status(403).send(error.message);
            } else if (error instanceof storeErrors.OperationNotAllowed) {
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
            await environment.writeDocument(req.path, req.body);
            res.status(200).send();
        } catch (error) {        
            if (error instanceof storeErrors.PermissionDenied) {
                res.status(403).send(error.message);
            } else if (error instanceof storeErrors.OperationNotAllowed) {
                res.status(405).send(error.message);                
            } else {
                res.status(500).send(error.message);
            }
        }        
    });    
    
    return router;
}


module.exports = HTTPServer;



// -----------------------------------------------------------------------------
//  SUPPORT FUNCTIONS
// -----------------------------------------------------------------------------

const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);
const getProp = (obj, key) => isObject(obj) ? obj[key] || null : null;
