

class AccessPermissionError extends Error {}


class ReadPermissionError extends AccessPermissionError {
    constructor (collection, docId) {
        super(`Read permission denied on document '${collection}/${docId}'`);
    }
}

class WritePermissionError extends AccessPermissionError {
    constructor (collection, docId) {
        super(`Write permission denied on document '${collection}/${docId}'`);
    }
}

class DocumentClosedError extends AccessPermissionError {
    constructor (collection, docId) {
        super(`The document '${collection}/${docId}' is not open.`);
    }
}



exports.AccessPermissionError = AccessPermissionError;
exports.ReadPermissionError = ReadPermissionError;
exports.WritePermissionError = WritePermissionError;
exports.DocumentClosedError = DocumentClosedError;
