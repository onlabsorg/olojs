/**
 *  # BackendEnvironment class
 *  This class extends the [Environment](./environment.md) class by adding
 *  HTTP server functionalities.
 *
 *  This backend matches the requirements of the `olonv.js` local environment
 *  configuration script; therefore it is used by default as its return value.
 */

const express = require("express");
const bodyParser = require("body-parser");
const afs = require("../tools/afs");
const Path = require("path");
const Environment = require("../environment");


class BackendEnvironment extends Environment {
    
    /**
     *  ### new BackendEnvironment(config)
     *  Besides the properties required by the `Environment` constructor, this
     *  `config` object should also contain:
     *  - `config.publicPath`: the path containing the `index.html` served to browsers on `GET /` requests
     *  - `config.allow`: a function that takes an epress request object as input and returns 
     *    a boolean to allow (true) or deny (false) the request
     */
    constructor (config={}) {
        config = Object.create(config);
        if (!isFunction(config.allow)) config.allow = req => true;
        if (!isString(config.publicPath)) config.publicPath = Path.resolve(__dirname, "../../public");
        super(config);
    }
    
    
    /**
     *  ### BackendEnvironment.prototype.loadDocument(path, presets)
     *  Maps paths like `/bin/module-path` to stdlib javascript modules.
     *  For any other path, delegates to the parten environment.
     */
    //  async loadDocument (path, presets={}) {
    //      in case of `/bin/...` path, the parent environment will call this
    //      static method `_loadModule`
    //  }
    
    
    // This middleware is used by the `serve` method.
    // It is defined as a separate method to allow further extension of this
    // class.
    createMiddleware (router) {
        if (!router) router = express.Router();
        
        // handle an olo-document GET request
        router.get("*", async (req, res, next) => {
            if (req.get("Accept") !== "text/olo") return next();
            
            if (!this.allow(req)) return res.status(403).send();
            
            try {
                let doc = await this.readDocument(req.path);
                res.status(200).send(doc);
                
            } catch (error) {            
                res.status(500).send(error.message);
            }        
        });
        
        // handle an olo-document DELETE request
        router.delete(`*`, async (req, res, next) => {
            if (req.get("Accept") !== "text/olo") return next();
            
            if (!this.allow(req)) return res.status(403).send();        

            try {
                await this.deleteDocument(req.path);
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
            
            if (!this.allow(req)) return res.status(403).send();
            
            try {
                await this.writeDocument(req.path, req.body);
                res.status(200).send("Updated!");
                
            } catch (error) {
                res.status(500).send(error.message);
            }        
        });

        return router;
    }
    
    
    /**
     *  ### BackendEnvironment.prototype.serve(port)
     *  Create an HTTP server that behaves as follows:
     *  - on `GET *` requests accepting only `text/olo` media, sends the result of `this.readDocument(path)`
     *  - on `PUT *` requests accepting only `text/olo` media, calls `this.writeDocument(path, body)`
     *  - on `DELETE *` requests accepting only `text/olo` media, calls `this.deleteDocument(path)`
     *  - on each operation accepting only `text/olo` media, sends 403 if `this.allow(req)` returns false
     *  - on `GET /` requests sends the `index.html` file contained in `this.publicPath`
     */
    async serve (port) {
        const indexPage = await afs.readFile(Path.resolve(this.publicPath, "index.html"));
        return await new Promise((resolve, reject) => {
            const app = express();
            app.use( this.createMiddleware() );
            app.get("/", (req, res, next) => res.status(200).send(indexPage));
            app.use( express.static(this.publicPath) );
            const server = app.listen(port, () => {
                resolve(server);
            });
        });        
    }
    
    
    //  this handles the _loadDocument("/bin/modulePath") calls
    static _loadModule (modulePath) {
        return require(`./stdlib${modulePath}`);
    }
}

module.exports = BackendEnvironment;


//------
//  SERVICE FUNCTIONS
//------

const isString = x => typeof x === "string";

const isFunction = x => typeof x === "function";
