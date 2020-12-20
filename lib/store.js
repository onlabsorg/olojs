const pathlib = require('path');
const isDirectory = path => path.slice(-1) === '/';


class Store {
    
    async get (path) {
        return "";
    }
    
    async list (path) {
        return [];
    }

    async set (path, source) {
        throw new this.constructor.OperationNotAllowedError('SET', this.normalizePath(path));
    }
    
    async delete (path, source) {
        throw new this.constructor.OperationNotAllowedError('DELETE', this.normalizePath(path));
    }
    
    normalizePath (path) {
        return pathlib.normalize(`/${path}`);
    }
}


Store.OperationNotAllowedError = class extends Error {
    
    constructor (operation, path) {
        super(`Operation not allowed: ${operation} ${path}`);
    }
}


Store.PermissionDeniedError = class extends Error {
    
    constructor (operation, path) {
        super(`Permission denied: ${operation} ${path}`);
    }
}


module.exports = Store;
