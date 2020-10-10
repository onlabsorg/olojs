

exports.OperationNotAllowed = class extends Error {
    
    constructor (operation, uri) {
        super(`Operation not allowed: ${operation} ${uri}`);
    }
}


exports.PermissionDenied = class extends Error {
    
    constructor (operation, uri) {
        super(`Permission denied: ${operation} ${uri}`);
    }
}
