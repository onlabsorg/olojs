

class AccessPermissionError extends Error {}


class ReadPermissionError extends AccessPermissionError {
    constructor (docId, path) {
        super(`Read permission denied on document path '${docId}/${String(path)}'`);
    }
}

class WritePermissionError extends AccessPermissionError {
    constructor (docId, path) {
        super(`Write permission denied on document path '${docId}/${String(path)}'`);
    }
}

class DocumentClosedError extends AccessPermissionError {
    constructor (docId) {
        super(`The document '${docId}' is not open.`);
    }
}



exports.AccessPermissionError = AccessPermissionError;
exports.ReadPermissionError = ReadPermissionError;
exports.WritePermissionError = WritePermissionError;
exports.DocumentClosedError = DocumentClosedError;