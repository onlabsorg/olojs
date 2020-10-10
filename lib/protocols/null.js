const errors = require('./.errors');
const pathlib = require('path');


// Maps an empty string to every possible path
exports.get = path => "";

exports.set = (path, source) => {
    throw new errors.OperationNotAllowed('SET', "null:"+pathlib.join('/', path));
}

exports.delete = path => {
    throw new errors.OperationNotAllowed('DELETE', "null:"+pathlib.join('/', path));
}
