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
        
        this.development = config.development;
        
        this._cache = new Map();
    }
    
    _matchLoader (docPath) {
        for (let [path, loader] of this.loaders.entries()) {
            if (docPath.indexOf(path) === 0) {
                let subPath = Path.resolve("/", docPath.slice(path.length));
                return [subPath, loader];
            }
        }        
        return ["", null];
    }
    
    async fetch (path) {
        var fullPath, subPath, load;
        if (isHttpUrl(path)) {
            fullPath = subPath = path;
            load = HTTPLoader.fetch.bind(HTTPLoader);
        } else {
            fullPath = Path.resolve("/", path);
            [subPath, load] = this._matchLoader(fullPath);
            if (load === null) throw new Error(`Loader not defined for path ${fullPath}`);            
        }
        if (!this._cache.has(fullPath)) {
            this._cache.set(fullPath, await load(subPath));
        }
        return this._cache.get(fullPath);
    }
    
    async load (path) {
        const docPath = Path.resolve("/", path);
        const source = await this.fetch(docPath);
        const locals = {
            path: docPath,
        }
        return new this.constructor.Document(source, locals, this.globals);
    }
    
    async importBin (path) {
        return require("./stdlib" + Path.resolve("/", path));        
    }
    
    async require (path) {
        return await this.importBin(path);
    }

    static get Document () {
        return Document;
    }
}

function isHttpUrl (path) {
    return (path.slice(0,7) === "http://" && path.length > 7) ||
           (path.slice(0,8) === "https://" && path.length > 8);
}

module.exports = Environment;
