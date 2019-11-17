const express = require("express");
const bodyParser = require("body-parser");
const errors = require("../errors");
const mimeTypes = require("./http-backend-mimetypes");


function allowReadOnly (req) {
    return req.method === 'GET';
}


function HTTPStoreServer (backend, allow=allowReadOnly) {
    const router = express.Router();
    
    router.use( bodyParser.text({type:mimeTypes.DOCUMENT}) );
    router.use( bodyParser.text({type:mimeTypes.CONTAINER}) );
    
    // read document request
    router.get(`*`, async (req, res, next) => {       
        const mimeType = req.get('Content-Type');
        
        if (mimeType === mimeTypes.DOCUMENT  && req.path.slice(-1) !== "/") {
            if (!allow(req)) {
                res.status(403).send();                
                return;
            }
            
            try {
                let data = await backend.get(req.path);
                res.status(200).json(data);
                
            } catch (error) {
                if (error instanceof errors.ReadAccessDenied) {
                    res.status(403).send(error.message);                
                } else {
                    res.status(500).send(error.message);
                }
            }
        }
    
        else if (mimeType === mimeTypes.CONTAINER && req.path.slice(-1) === "/") {
            if (!allow(req)) {
                res.status(403).send();                
                return;
            }
            
            try {
                let data = await backend.list(req.path);
                res.status(200).json(data);
                
            } catch (error) {
                if (error instanceof errors.ReadAccessDenied) {
                    res.status(403).send(error.message);                
                } else {
                    res.status(500).send(error.message);
                }
            }            
        }
        
        else {
            next();
        }
    });
    
    // write document request
    router.put(`*`, async (req, res, next) => { 
        
        if (req.get('Content-Type') !== mimeTypes.DOCUMENT) {
            next();
            return;
        }
        
        if (!allow(req)) {
            res.status(403).send();                
            return;
        }        
        
        try {
            await backend.put(req.path, req.body);
            res.status(200).send("Updated!");
            
        } catch (error) {
            
            if (error instanceof errors.WriteAccessDenied) {
                res.status(403).send(error.message);
                
            } else if (error instanceof errors.WriteOperationNotAllowed) {
                res.status(405).send(error.message);            
                
            } else {
                res.status(500).send(error.message);
            }
        }        
    });
    
    // delete document request
    router.delete('*', async (req, res, next) => {
        const mimeType = req.get('Content-Type');
        if (mimeType !== mimeTypes.DOCUMENT && mimeType !== mimeTypes.CONTAINER) {
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
            
            if (error instanceof errors.WriteAccessDenied) {
                res.status(403).send(errors.message);
                
            } else {
                res.status(500).send(error.message);
            }
        }        
    });

    return router;
}




module.exports = HTTPStoreServer;
