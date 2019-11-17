const Path = require('path');
const fs = require("fs");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const errors = require('../errors');


const FILE_EXTENSION = ".olo";
const EMPTY_RESOURCE = "";


class FSBackend {
    
    constructor (rootPath) {
        this.rootPath = Path.normalize(rootPath);
    }
    
    get (path) {
        return new Promise((resolve, reject) => {
            const fullPath = this._resolvePath(path);
            if (!fs.existsSync(fullPath)) resolve("");
            else fs.readFile(fullPath, {encoding:'utf8'}, (err, content) => {
                if (err) reject(err);
                else resolve(content);
            });                        
        });                          
    }
    
    async list (path) {
        const fullPath = this._resolvePath(path);
        const files = await this._readdir(fullPath);
        const paths = [];
        for (let name of files) {
            const stat = fs.lstatSync(fullPath+name);
            if (stat.isDirectory()) {
                let subPaths = await this.list(path+name+"/");
                for (let subPath of subPaths) paths.push(`${name}/${subPath}`);
            } else if (stat.isFile() && matchDocumentName(name)) {    
                paths.push( name.slice(0, -FILE_EXTENSION.length) );
            }
        }
        return paths;
    }
    
    put (path, body) {
        const parentPath = Path.join("/", path, "..") + "/";
        const fullParentPath = this._resolvePath(parentPath);
        if (!fs.existsSync(fullParentPath)) {
            mkdirp.sync(fullParentPath);
        }

        const fullPath = this._resolvePath(path);
        return new Promise((resolve, reject) => {
            fs.writeFile(fullPath, body, {encoding:'utf8'}, (err) => {
                if (err) reject(err);
                else resolve();
            });            
        });                
    }
    
    delete (path) {
        const fullPath = this._resolvePath(path);
        if (!fs.existsSync(fullPath)) return;

        return new Promise((resolve, reject) => {
            rimraf(fullPath, (err) => {
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
        if (matchDirPath(path)) {
            return Path.join(this.rootPath, Path.join("/", path));
        } else {
            return Path.join(this.rootPath, Path.join("/", path)) + FILE_EXTENSION;            
        }
    }
}


function matchDirPath (path) {
    return path.substr(-1) === "/";
}

function matchDocumentName (name) {
    return name.slice(-FILE_EXTENSION.length) === FILE_EXTENSION;
}


module.exports = FSBackend;
