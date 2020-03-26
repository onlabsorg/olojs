const pathlib = require("path");

class Path {
    
    constructor (path) {
        const urlMatch = matchURL(path);
        if (urlMatch) {
            this._rootURL = urlMatch[1].slice(-1) === "/" ? urlMatch[1].slice(0,-1) : urlMatch[1];
            this._path = urlMatch[2] ? pathlib.join("/", urlMatch[2]) : "/";
        } else {
            this._rootURL = "";
            this._path = pathlib.join("/", String(path));
        }
    }
    
    resolve (subPath) {
        if (typeof subPath !== "string") {
            throw new Error("Path.resolve exprexts a string as argument");
        }
        
        if (subPath[0] === "/") {
            return new Path(this._rootURL + subPath);
        }

        if (matchURL(subPath)) {
            return new Path(subPath);
        }

        if (this._path.slice(-1) === "/") {
            var fullPath = pathlib.resolve(this._path, subPath);
        } else {
            var fullPath = pathlib.resolve(this._path, "..", subPath);            
        }
        return new Path(this._rootURL + fullPath);
    }
    
    getSubPath (path) {
        let parentPath = String(this);
        let childPath = String(Path.from(path));
        if (childPath === parentPath) return "/";
        if (parentPath.slice(-1) !== "/") parentPath += "/";
        return childPath.indexOf(parentPath) === 0 ? childPath.slice(parentPath.length-1) : "";
    }
    
    toString () {
        return this._rootURL + this._path;
    }
    
    static from (path) {
        return (path instanceof Path) ? path : new Path(path);
    }
}

function matchURL (path) {
    return String(path).match(/^(\w+\:\/\/[\w\.\:]*)(\/.*)?$/);
}

module.exports = Path;
