
exports.OperationNotAllowed = class extends Error {
    
    constructor (operation, path) {
        super(`Operation not allowed: ${operation} ${path}`);
    }
}


exports.PermissionDenied = class extends Error {
    
    constructor (operation, path) {
        super(`Permission denied: ${operation} ${path}`);
    }
}
