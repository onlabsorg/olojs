const Path = require("path");
const expression = require("./expression");
const Document = require("./document");
const globals = require("./globals");


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
        const docPath = Path.resolve("/", path);
        const [subPath, load] = this._matchLoader(Path.resolve("/",docPath));
        if (load === null) throw new Error(`Loader not defined for path ${docPath}`);
        return await load(subPath);
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


module.exports = Environment;
