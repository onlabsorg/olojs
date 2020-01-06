const Path = require('path');
const fs = require("fs");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");

const Store = require("../store");

const EMPTY_RESOURCE = "";


class FSStore extends Store {
    
    constructor (rootPath) {
        super();
        this.rootPath = Path.normalize(rootPath);
    }
    
    read (path) {
        return new Promise((resolve, reject) => {
            const fullPath = this._resolvePath(path);
            if (!fs.existsSync(fullPath)) resolve("");
            else fs.readFile(fullPath, {encoding:'utf8'}, (err, content) => {
                if (err) reject(err);
                else resolve(content);
            });                        
        });                          
    }
    
    write (path, body) {
        const parentPath = Path.join("/", path, "..") + "/";
        const fullParentPath = this._resolvePath(parentPath);
        if (!fs.existsSync(fullParentPath)) {
            mkdirp.sync(fullParentPath);
        }

        const fullPath = this._resolvePath(path);
        
        if (body === "") return new Promise((resolve, reject) => {
            rimraf(fullPath, (err) => {
                if (err) reject(err);
                else resolve();
            });            
        });                     

        else return new Promise((resolve, reject) => {
            fs.writeFile(fullPath, body, {encoding:'utf8'}, (err) => {
                if (err) reject(err);
                else resolve();
            });            
        });                
    }

    _readdir (fullPath) {
        return new Promise((resolve, reject) => {
            fs.readdir(fullPath, (err, files) => {
                if (err) resolve([]);
                else resolve(files);
            });
        });                                  
    }
    
    _resolvePath (path) {
        return Path.join(this.rootPath, Path.join("/", path));
    }
}


module.exports = FSStore;
