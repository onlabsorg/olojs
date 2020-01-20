const Path = require("path");
const fs = require("fs");

global.__olojspath = Path.resolve(__dirname, "..");


class Package {
    
    constructor (rootPath) {
        this.rootPath = rootPath;
    }
    
    get configPath () {
        return Path.resolve(this.rootPath, "./olojs-config.js");
    }
    
    _getConfigTemplate () {
        if (!this._configTemplate) {
            this._configTemplate = fs.readFileSync(Path.resolve(__dirname, "./package/config-template.js"), "utf8");
        }
        return this._configTemplate;
    }
    
    async init () {
        if (fs.existsSync(this.configPath)) {
            throw new Error("Package already initialized");
        }
        let configFile = this._getConfigTemplate();
        fs.writeFileSync(this.configPath, configFile, "utf8");
    }

    getEnvironment () {
        const Environment = require("../lib/environment");
        const config = require(this.configPath);
        return new Environment(config);    
    }
    
    async render (path, argv={}) {
        const env = this.getEnvironment();
        const doc = await env.load(path);
        return await doc.render({argv});
    }

    serve (port=8010) {
        const HTTPServer = require("./package/http-server");
        const express = require("express");
        const app = express();
        const env = this.getEnvironment();
        app.use("/", HTTPServer(env));
        app.use( express.static(this.rootPath) );
        return new Promise((resolve, reject) => {
            const server = app.listen(port, () => {
                resolve(server);
            });
        });        
    }    
}


module.exports = Package;
