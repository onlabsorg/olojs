

class AccessPermissionError extends Error {}


class ReadPermissionError extends AccessPermissionError {
    constructor (docId) {
        super(`Read permission denied on document '${docId}'`);
    }
}

class WritePermissionError extends AccessPermissionError {
    constructor (docId) {
        super(`Write permission denied on document '${docId}'`);
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
