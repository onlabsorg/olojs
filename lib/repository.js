const path = require("path");
const fs = require("fs");


class Repository {
    
    constructor (rootPath) {
        this.rootPath = path.resolve(rootPath);
    }
    
    async init (options={}) {
        
        // Copy the template `olonv.js` script
        const olonvDestPath = this.resolvePath("olonv.js");
        if (isFile(olonvDestPath)) throw new Error("Repository already initialized");
        const olonvOrigPath = path.resolve(__dirname, "../repo-template/olonv.js");
        fs.copyFileSync(olonvOrigPath, olonvDestPath);
                
        // Copy the template `olors` directory
        const olorsDestPath = this.resolvePath("olors");
        const olorsOrigPath = path.resolve(__dirname, "../repo-template/olors");
        await copyDirectory(olorsOrigPath, olorsDestPath);
    }
    
    getEnvironment () {
        return require( this.resolvePath("olonv") );
    }
    
    getHttpServer () {
        const environment = this.getEnvironment();
        const HTTPServer = require("./http-server");
        return new HTTPServer(environment, environment.httpOptions);        
    }
    
    resolvePath (...paths) {
        return path.resolve(this.rootPath, ...paths);
    }     
}



module.exports = Repository;



// -----------------------------------------------------------------------------
//  Helper functions
// -----------------------------------------------------------------------------

function isFile (path) {
    try {
        let stat = fs.lstatSync(path);
        return stat.isFile();
    } catch (e) {
        // lstatSync throws an error if path doesn't exist
        return false;
    }    
}

function isDirectory (path) {
    try {
        let stat = fs.lstatSync(path);
        return stat.isDirectory();
    } catch (e) {
        // lstatSync throws an error if path doesn't exist
        return false;
    }    
}

function copyDirectory (origPath, destPath) {
    const ncp = require("ncp").ncp;
    return new Promise((resolve, reject) => {
        ncp(origPath, destPath, err => {
            if (err) reject(err); 
            else resolve();
        })
    });
}
