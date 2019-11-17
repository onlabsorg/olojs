
const Path = require("path");


class FlatBackend {
    
    constructor (map) {
        this._map = map;
    }
    
    async get (path) {
        path = Path.join("/", path);
        return await this._map.get(path) || "";        
    }
    
    async list (path) {
        path = Path.join("/", path);
        const mapKeys = await this._map.keys();
        const subPaths = [];
        
        if (path.slice(-1) !== "/") path += "/";
        for (let fullPath of mapKeys) {
            if (fullPath.indexOf(path) === 0) {
                let subPath = fullPath.slice(path.length);
                subPaths.push(subPath);
            }
        }
        
        return subPaths;
    }
    
    async put (path, body) {
        path = Path.join("/", path);
        await this._map.set(path, body);
    }
    
    async delete (path) {
        await this._map.delete(path);                    
    }
}


module.exports = FlatBackend;
