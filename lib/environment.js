const Path = require("path");
const expression = require("./expression");
const Document = require("./document");


class Environment {
    
    constructor (config) {
        this.globals = Object.assign({$env:this}, Object(config.globals), {
            import: async function (path, args={}) {
                if (path.slice(0,5) === "/bin/" && path.length > 4) {
                    return await this.$env.importBin(path.slice(4));
                }    
                const docPath = resolveRelativePath(this.path, path);
                const doc = await this.$env.load(docPath);
                return await doc.evaluate({args: args});
            }
        });
        
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


function resolveRelativePath (basePath, subPath) {
    if (subPath[0] === "/") return subPath;
    const lastSlashPos = basePath.lastIndexOf("/");
    if (lastSlashPos === -1) return Path.resolve("/", subPath);
    return Path.resolve("/", basePath.slice(0,lastSlashPos), subPath);
}


module.exports = Environment;
