var express = require("express");
const bodyParser = require('body-parser');


module.exports = async function (store, port) {
    var router = express();

    router.get("*", async (req, res, next) => {
        if (req.get("Accept") !== "text/olo") return next();
        if (req.path.slice(0,9) === "/private/") {
            return res.status(403).send();
        }
        let source = await store.read(req.path);
        res.status(200).send(source);
    });    
    
    // delete document request
    router.delete(`*`, async (req, res, next) => {
        if (req.get("Accept") !== "text/olo") return next();
        if (req.path.slice(0,9) === "/private/") {
            return res.status(403).send();
        }
        try {
            await store.delete(req.path, req.body);
            res.status(200).send("Deleted!");            
        } catch (error) {            
            res.status(500).send(error.message);
        }        
    });    
    

    // write document request
    router.use(bodyParser.text({
        type: "text/olo"
    }));    

    router.put(`*`, async (req, res, next) => { 
        if (req.get("Accept") !== "text/olo") return next();
        if (req.path.slice(0,9) === "/private/") {
            return res.status(403).send();
        }
        try {
            await store.write(req.path, req.body);
            res.status(200).send("Updated!");            
        } catch (error) {
            res.status(500).send(error.message);
        }        
    });    
    
    router.post(`*`, async (req, res, next) => { 
        if (req.get("Accept") !== "text/olo") return next();
        if (req.path.slice(0,9) === "/private/") {
            return res.status(403).send();
        }
        try {
            await store.append(req.path, req.body);
            res.status(200).send("Posted!");            
        } catch (error) {
            res.status(500).send(error.message);
        }        
    });    

    return await listen(router, port);
}

function listen (router, port) {
    return new Promise((resolve, reject) => {
        var server = router.listen(port, () => {
            resolve(server);
        });
    });        
}
