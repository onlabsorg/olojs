const Path = require("path");
const expression = require("./expression");
const Document = require("./document");
const globals = require("./environment-globals");


class Environment {
    
    constructor (config) {
        this.globals = Object.assign({$env:this}, globals);
        
        this._stores = new Map();
        for (let path in config.stores) {
            this.mount(path, config.stores[path]);
        }
        
        this.cache = config.nocache ? null : new Map();
        
        this.config = config;
    }
    
    mount (path, store) {   
        path = normalizeStorePath(path);
        store = normalizeStore(store);
        if (store === null) throw new Error(`Invalid store maped to path ${path}`);
        this._stores.set(path, store);
    }
    
    _matchStore (docPath) {
        const match = {
            subPath: "",
            store: null
        }
        for (let [path, store] of this._stores.entries()) {
            if (docPath.indexOf(path) === 0) {
                let subPath = Path.join("/", docPath.slice(path.length));
                if (match.subPath === "" || subPath.length < match.subPath.length) {
                    match.subPath = subPath;
                    match.store = store;
                }
            }
        }   
        
        if (match.store === null) throw new Error(`Loader not defined for path ${docPath}`);
        return match;
    }
    
    async _read (path) {
        const fullPath = resolvePath(path);
        if (this.cache && this.cache.has(fullPath)) {
            return this.cache.get(fullPath);
        }
        let {store, subPath} = this._matchStore(fullPath);
        const data = await store.read(subPath);
        this._updateCache(fullPath, data);
        return data;
    }
    
    async fetch (path) {
        const data = await this._read(path);
        return data instanceof Document ? data.source : String(data);
    }
    
    async load (path) {
        const data = await this._read(path);
        if (data instanceof Document) return data;
        
        const source = String(data);
        const locals = {
            PATH: resolvePath(path),
        }
        return new this.constructor.Document(source, locals, this.globals);
    }
    
    _updateCache (path, source) {
        const fullPath = resolvePath(path);
        if (this.cache) {
            if (source === "") this.cache.delete(fullPath);
            else this.cache.set(fullPath, source);        
        }
    }

    static get Document () {
        return Document;
    }
}


function normalizeStorePath (path) {
    const urlMatch = matchURL(path);
    if (urlMatch) {
        let protocol = urlMatch[1];
        let path = Path.resolve("/", urlMatch[2]);
        return protocol + path;
    } else {
        return Path.resolve("/", path);
    }
}


function matchURL (url) {
    return url.match(/^(\w+\:\/)(\/.*)$/);
}


function normalizeStore (store) {
    if (typeof store === "function") {
        return {read:store};
    }
    
    if (typeof store === "object" && store !== null && typeof store.read === "function") {
        return store;
    }

    return null;
}


function resolvePath (path) {
    if (path.slice(-1) === "/") path += "index";
    return matchURL(path) ? path : Path.join("/", path);
}


module.exports = Environment;
