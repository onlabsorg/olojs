
const Store = require("../store");

class MemoryStore extends Store {
    
    constructor (globals={}) {
        super(globals);
        this._map = new Map();
    }
    
    read (path) {
        return this._map.get(path) || "";
    }
    
    write (path, source) {
        if (source === "") {
            return this._map.delete(path);
        } else {
            return this._map.set(path, String(source));
        }
    }
}


module.exports = MemoryStore;
