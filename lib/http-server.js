const express = require("express");
const bodyParser = require("body-parser");
const afs = require("./tools/afs");
const Path = require("path");


/**
 *  ### new BackendEnvironment(config)
 *  Besides the properties required by the `Environment` constructor, this
 *  `config` object should also contain:
 *  - `config.publicPath`: the path containing the `index.html` served to browsers on `GET /` requests
 *  - `config.allow`: a function that takes an epress request object as input and returns 
 *    a boolean to allow (true) or deny (false) the request
 */
/**
 *  ### BackendEnvironment.prototype.serve(port)
 *  Create an HTTP server that behaves as follows:
 *  - on `GET *` requests accepting only `text/olo` media, sends the result of `this.readDocument(path)`
 *  - on `PUT *` requests accepting only `text/olo` media, calls `this.writeDocument(path, body)`
 *  - on `DELETE *` requests accepting only `text/olo` media, calls `this.deleteDocument(path)`
 *  - on each operation accepting only `text/olo` media, sends 403 if `this.allow(req)` returns false
 *  - on `GET /` requests sends the `index.html` file contained in `this.publicPath`
 */
module.exports = (options={}) => async function (port) {
    const environment = options.environment || this;
    const router = options.router || express.Router();
    const allow = options.allow || (req => true);
    const publicPath = options.publicPath || Path.resolve(__dirname, "../public");
    
    const indexPage = await afs.readFile(Path.resolve(publicPath, "index.html"));            

    // handle an olo-document GET request
    router.get("*", async (req, res, next) => {
        if (req.get("Accept") !== "text/olo") return next();
        
        if (!(await allow(req))) return res.status(403).send();
        
        try {
            let doc = await environment.readDocument(req.path);
            res.status(200).send(doc);
            
        } catch (error) {            
            res.status(500).send(error.message);
        }        
    });
    
    // handle an olo-document DELETE request
    router.delete(`*`, async (req, res, next) => {
        if (req.get("Accept") !== "text/olo") return next();
        
        if (!(await allow(req))) return res.status(403).send();        

        try {
            await environment.deleteDocument(req.path);
            res.status(200).send("Deleted!");            
            
        } catch (error) {            
            console.log(error);
            res.status(500).send(error.message);
        }        
    });    
    
    // parse the olo-document request text body
    router.use(bodyParser.text({
        type: "text/olo"
    }));    

    // handle an olo-document PUT request
    router.put(`*`, async (req, res, next) => { 
        if (req.get("Accept") !== "text/olo") return next();
        
        if (!(await allow(req))) return res.status(403).send();
        
        try {
            await environment.writeDocument(req.path, req.body);
            res.status(200).send("Updated!");
            
        } catch (error) {
            res.status(500).send(error.message);
        }        
    });

    const app = express();
    app.use(router);
    app.get("/", (req, res, next) => res.status(200).send(indexPage));
    app.use( express.static(publicPath) );
    return await listen(app, port);
}



const listen = (app, port) => new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
        resolve(server);
    });
})
