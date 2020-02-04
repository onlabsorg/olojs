const Path = require("path");
const expression = require("./expression");
const Document = require("./document");
const globals = require("./globals");
const HTTPLoader = require("./loaders/http-loader");


class Environment {
    
    constructor (config) {
        this.globals = Object.assign({$env:this}, globals);
        
        this.loaders = new Map();
        const paths = Object.keys(config.loaders).sort().reverse();
        for (let path of paths) {
            let loader = config.loaders[path]
            if (typeof loader === "function") {
                if (path.slice(-1) !== "/") path += "/";
                this.loaders.set(path, loader);
            }            
        }
        
        this.cache = config.nocache ? null : new Map();
    }
    
    _matchLoader (docPath) {
        for (let [path, loader] of this.loaders.entries()) {
            if (docPath.indexOf(path) === 0) {
                let subPath = Path.join("/", docPath.slice(path.length));
                return [subPath, loader];
            }
        }        
        return ["", null];
    }
    
    async fetch (path) {
        const fullPath = resolvePath(path);
        
        if (this.cache && this.cache.has(fullPath)) {
            return this.cache.get(fullPath);
        }

        var load, subPath;
        if (isHttpUrl(path)) {
            subPath = fullPath;
            load = HTTPLoader.fetch.bind(HTTPLoader);
        } else {
            [subPath, load] = this._matchLoader(fullPath);
            if (load === null) throw new Error(`Loader not defined for path ${fullPath}`);            
        }
        
        const source = await load(subPath);
        if (this.cache) this.cache.set(fullPath, source);
        
        return source;
    }
    
    async load (path) {
        const docPath = resolvePath(path);
        const source = await this.fetch(docPath);
        const locals = {
            PATH: docPath,
        }
        return new this.constructor.Document(source, locals, this.globals);
    }
    
    async importBin (path) {
        path = resolvePath(path);
        if (isHttpUrl(path)) throw new Error("Can't import binaries from an HTTP URL");
        return await this.constructor._importBin(path);        
    }
    
    async require (path) {
        return await this.importBin(path);
    }

    static get Document () {
        return Document;
    }
    
    static async _importBin (path) {}
}

function resolvePath (path) {
    if (path.slice(-1) === "/") path += "index";
    if (isHttpUrl(path)) return path;
    return Path.join("/", path);
}

function isHttpUrl (path) {
    return (path.slice(0,7) === "http://" && path.length > 7) ||
           (path.slice(0,8) === "https://" && path.length > 8);
}

module.exports = Environment;
