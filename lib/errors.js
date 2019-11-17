

class AccessDenied extends Error {
    constructor (operation, path) {
        super(`${operation} access denied on path '${path}'`);
    }
}

exports.ReadAccessDenied = class extends AccessDenied {
    constructor (path) {
        super('Read', path);
    }
}

exports.WriteAccessDenied = class extends AccessDenied {
    constructor (path) {
        super('Write', path);
    }
}

exports.OperationNotAllowed = class extends Error {
    constructor (operation, path) {
        super(`${operation} operation not allowed on path '${path}'`);
    }
}
exports.WriteOperationNotAllowed = class extends exports.OperationNotAllowed {
    constructor (path) {
        super("Write", path);
    }
}

exports.UnknownStore = class extends Error {
    constructor (uri) {
        super(`Unknown store for ${uri}`);
    }
}

exports.RuntimeError = class extends Error {}
