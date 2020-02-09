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
        this._stores.set(normalizeStorePath(path), normalizeStore(store));
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
    
    async fetch (path) {
        const fullPath = resolvePath(path);
        return await this._fetch(fullPath);
    }
    
    async _fetch (fullPath, match=null) {
        if (this.cache && this.cache.has(fullPath)) {
            return this.cache.get(fullPath);
        }

        let {store, subPath} = match || this._matchStore(fullPath);
        const source = await store.fetch(subPath);
        this._updateCache(fullPath, source);
        
        return source;        
    }
    
    async load (path) {
        const fullPath = resolvePath(path);
        let match = this._matchStore(fullPath);
        if (match.store.load) {
            const doc = await match.store.load(match.subPath);
            return doc;
        }
        
        const source = await this._fetch(fullPath, match);
        const locals = {
            PATH: fullPath,
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
        return {
            fetch: async path => String(await store(path))
        };
    }
    
    if (typeof store !== "object" || store === null || Array.isArray(store)) {
        return {};
    }
    
    const nStore = Object.create(store);
    if (typeof nStore.fetch === "function") {
        nStore.fetch = async path => String(await store.fetch(path));
    } else {
        nStore.fetch = path => "";
    }
    if (typeof nStore.load !== "function") {
        nStore.load = null;
    }
    return nStore;
}


function resolvePath (path) {
    if (path.slice(-1) === "/") path += "index";
    return matchURL(path) ? path : Path.join("/", path);
}


module.exports = Environment;
