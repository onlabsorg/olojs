
const pathlib = require("path");
const http = require("http");
const express = require("express");


const HTTPServer = (environment, options={}) => {
    const app = express();
    
    // Routes the environment requests
    app.use('/env', HTTPServer.Middleware(environment) );
    
    // Serves static files
    const publicPath = options.publicPath || pathlib.join(__dirname, "../../public");
    app.use( express.static(publicPath) );
    
    // Returns the http.Server
    return http.createServer(app);
}


HTTPServer.Middleware = function (environment) {
    const router = express.Router();
    
    // Handle an olo-document GET request
    router.get("*", async (req, res, next) => {
        try {
            let doc = await environment.loadDocument(req.path);
            res.status(200).send(doc.source);
            
        } catch (error) {            
            res.status(500).send(error.message);
        }        
    });

    return router;
}


module.exports = HTTPServer;
