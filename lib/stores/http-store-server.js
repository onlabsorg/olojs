const express = require("express");
const bodyParser = require("body-parser");
const MIME_TYPE = "application/x-olo-document";


function allowReadOnly (req) {
    return req.method === 'GET';
}


function HTTPStoreServer (backend, allow=allowReadOnly) {
    const router = express.Router();
    
    router.use( bodyParser.text({type:MIME_TYPE}) );
    
    // read document request
    router.get(`*`, async (req, res, next) => {       
        
        if (req.get('Content-Type') !== MIME_TYPE) {
            next();
            return;
        }
        
        if (!allow(req)) {
            res.status(403).send();                
            return;
        }
        
        try {
            let source = await backend.read(req.path);
            res.status(200).send(source);            
        } catch (error) {
            res.status(500).send(error.message);
        }
    });
    
    // write document request
    router.put(`*`, async (req, res, next) => { 
        
        if (req.get('Content-Type') !== MIME_TYPE) {
            next();
            return;
        }
        
        if (!allow(req)) {
            res.status(403).send();                
            return;
        }        
        
        try {
            await backend.write(req.path, req.body);
            res.status(200).send("Updated!");
        } catch (error) {
            res.status(500).send(error.message);
        }        
    });
    
    // delete document request
    router.delete('*', async (req, res, next) => {

        if (req.get('Content-Type') !== MIME_TYPE) {
            next();
            return;
        }
        
        if (!allow(req)) {
            res.status(403).send();                
            return;
        }                
                
        try {
            await backend.delete(req.path);
            res.status(200).send("Deleted!");
        } catch (error) {
            res.status(500).send(error.message);
        }        
    });

    return router;
}




module.exports = HTTPStoreServer;
