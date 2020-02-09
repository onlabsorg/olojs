
const stdlib = {
    "/math"     : () => import(/* webpackChunkName: "math" */     "./stdlib/math"),
    "/markdown" : () => import(/* webpackChunkName: "markdown" */ "./stdlib/markdown"),
    "/html"     : () => import(/* webpackChunkName: "html" */     "./stdlib/html"),
}

exports.load = path => stdlib[path]();
