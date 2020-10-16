const errors = require('./store-errors');
const pathlib = require('path');

class NullStore {
    
    async get (path) {
        return "";
    }
    
    async set (path, source) {
        throw new errors.OperationNotAllowed('SET', pathlib.normalize(`/${path}`));
    }
    
    async delete (path, source) {
        throw new errors.OperationNotAllowed('DELETE', pathlib.normalize(`/${path}`));
    }
}


module.exports = NullStore;
