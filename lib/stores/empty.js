const errors = require('./store-errors');
const pathlib = require('path');
const isDirectory = path => path.slice(-1) === '/';


class EmptyStore {
    
    async get (path) {
        return "";
    }
    
    async list (path) {
        return [];
    }

    async set (path, source) {
        throw new errors.OperationNotAllowed('SET', this.normalizePath(path));
    }
    
    async delete (path, source) {
        throw new errors.OperationNotAllowed('DELETE', this.normalizePath(path));
    }
    
    normalizePath (path) {
        return pathlib.normalize(`/${path}`);
    }
}


module.exports = EmptyStore;
