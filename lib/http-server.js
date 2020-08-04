// =============================================================================
//  This module exports a function that returns nodejs `http.Server` instance,
//  serving an olojs Environment via a RESTful API.
// =============================================================================

const fs = require("fs");
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const Path = require("path");


function HTTPServer (environment, options={}) {
    const app = express();
    
    // Run the pre-processing middleware
    if (typeof options.before === "function") {
        app.use(options.before);
    }
        
    // Routes the requests accepting `text/olo`
    app.use( createEnvironmentMiddleware(environment) );

    // Runs the post-processign middleware
    if (typeof options.after === "function") {
        app.use(options.after);
    }    
    
    // Serves static files
    const publicPath = options.publicPath || Path.resolve(__dirname, "../public");
    app.use( express.static(publicPath) );
    
    // Returns the http.Server
    return http.createServer(app);
}



function createEnvironmentMiddleware (environment) {
    const router = express.Router();
    
    // Handle an olo-document GET request
    router.get("*", async (req, res, next) => {
        if (!isOloDocumentRequest(req)) return next();
                
        try {
            let doc = await environment.readDocument(req.path);
            res.status(200).send(doc);
            
        } catch (error) {            
            res.status(500).send(error.message);
        }        
    });
    
    // Handle an olo-document DELETE request
    router.delete(`*`, async (req, res, next) => {
        if (!isOloDocumentRequest(req)) return next();

        try {
            await environment.deleteDocument(req.path);
            res.status(200).send("Deleted!");            
            
        } catch (error) {            
            console.log(error);
            res.status(500).send(error.message);
        }        
    });    
    
    // Parse the olo-document request text body
    router.use(bodyParser.text({
        type: "text/olo"
    }));    

    // Handle an olo-document PUT request
    router.put(`*`, async (req, res, next) => { 
        if (!isOloDocumentRequest(req)) return next();
        
        try {
            await environment.writeDocument(req.path, req.body);
            res.status(200).send("Updated!");
            
        } catch (error) {
            res.status(500).send(error.message);
        }        
    });
    
    return router;
}



function isOloDocumentRequest (req) {
    return req.get("Accept") === "text/olo";
}


module.exports = HTTPServer;
