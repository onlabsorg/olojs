const stdlib = {
    "/math"     : () => import(/* webpackChunkName: "/bin/math" */     "./stdlib/math"),
    "/markdown" : () => import(/* webpackChunkName: "/bin/markdown" */ "./stdlib/markdown"),
    "/html"     : () => import(/* webpackChunkName: "/bin/html" */     "./stdlib/html"),
    "/path"     : () => import(/* webpackChunkName: "/bin/path" */     "./stdlib/path"),
}

const Document = require("../document");

class BinaryDocument extends Document {
    
    constructor (path) {
        super("Binary document", {}, {});
        this.path = path;
    }
    
    async evaluate (params={}) {
        return {
            namespace: await stdlib[this.path](),
            render: () => this.source
        }
    }
}

exports.read = path => new BinaryDocument(path);
