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
        
        const document = require("./lib/document");
        const environmentScriptTemplate = this.constructor.getEnvironmentScriptTemplate();
        const context = document.createContext(templateVars);
        const environmentScript = await document.render(await document.parse(environmentScriptTemplate)(context));
        fs.writeFileSync(environmentScriptPath, environmentScript, "utf8");
        for (let dir of dirs) await this._createDir(dir);
    }

    async render (localDocPath, argns={}) {
        const document = require("./lib/document");
        const env = this.getEnvironment();
        const doc = await document.load(env, localDocPath);
        const docNS = await doc.evaluate({argns});
        return await document.render(docNS);
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
