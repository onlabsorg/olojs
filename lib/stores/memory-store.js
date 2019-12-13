
class MemoryStore {
    
    constructor () {
        this._map = new Map();
    }
    
    read (path) {
        return this._map.get(path) || "";
    }
    
    write (path, source) {
        return this._map.set(path, String(source));
    }
    
    delete (path) {
        return this._map.delete(path);
    }
}


module.exports = MemoryStore;
