const Path = require("path");
const Document = require("../document");

class BinaryDocument extends Document {
    
    constructor (module) {
        super("Binary document", module, {});
    }
    
    evaluate (params={}) {
        return {
            namespace: this.locals,
            render: () => this.source
        };
    }
}

exports.read = function (path) {
    const jsModule = require("./stdlib" + Path.resolve("/", path));
    return new BinaryDocument(jsModule);
}
