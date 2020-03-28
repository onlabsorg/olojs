const Path = require("path");
const fs = require("fs");


class OloJS {
    
    constructor (rootPath) {
        this.rootPath = Path.resolve("/", rootPath);
    }
    
    getEnvironmentScriptPath () {
        return Path.resolve(this.rootPath, "./olonv.js");
    }

    getEnvironment () {
        const environmentScriptPath = this.getEnvironmentScriptPath();
        global.__olojspath = __dirname;
        const env = require(environmentScriptPath);
        delete global.__olojspath;
        return env;
    }

    async init (templateVars={}, dirs=["docs"]) {
        const environmentScriptPath = this.getEnvironmentScriptPath();
        if (fs.existsSync(environmentScriptPath)) {
            throw new Error("Environment already initialized");
        }
        
        // create a new environment script
        const document = require("./lib/document");
        const environmentScriptTemplate = this.constructor.getEnvironmentScriptTemplate();
        const context = document.createContext(templateVars);
        const environmentScript = await document.expression.stringify(await document.parse(environmentScriptTemplate)(context));
        
        // write the environment script on disc
        fs.writeFileSync(environmentScriptPath, environmentScript, "utf8");
        
        // create folders
        for (let dir of dirs) {
            await this._createDir(dir);
        }
    }

    async render (docPath, argns={}) {
        const document = require("./lib/document");
        const env = this.getEnvironment();
        const doc = await env.load(docPath, argns);
        return await document.expression.stringify(doc);
    }

    async serve (port=8010) {
        const env = this.getEnvironment();
        return await env.serve(port);
    }    
    
    _createDir (dirPath) {
        return new Promise((resolve, reject) => {
            dirPath = Path.resolve(this.rootPath, dirPath);
            if (!fs.existsSync(dirPath)) {
                fs.mkdir(dirPath, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            }            
        });
    }

    static getVersion () {
        const npmPackage = JSON.parse( fs.readFileSync(`${__dirname}/package.json`, 'utf8') );
        return npmPackage.version;    
    }
    
    static getEnvironmentScriptTemplate () {
        return fs.readFileSync(Path.resolve(__dirname, "./templates/olonv.js"), "utf8");
    }
}

module.exports = OloJS;
