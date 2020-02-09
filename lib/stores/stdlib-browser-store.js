const stdlib = {
    "/math"     : () => import(/* webpackChunkName: "math" */     "./stdlib/math"),
    "/markdown" : () => import(/* webpackChunkName: "markdown" */ "./stdlib/markdown"),
    "/html"     : () => import(/* webpackChunkName: "html" */     "./stdlib/html"),
}

const Document = require("../document");

class BinaryDocument extends Document {
    
    constructor (path) {
        super("Binary document", {}, {});
        this.path = path;
    }
    
    async evaluate (params={}) {
        return await stdlib[this.path]();
    }
}

exports.read = path => new BinaryDocument(path);
