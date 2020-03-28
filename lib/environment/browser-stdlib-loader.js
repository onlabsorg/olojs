const modules = {
    "/math"     : () => import(/* webpackChunkName: "/bin/math" */     "./stdlib/math"),
    "/markdown" : () => import(/* webpackChunkName: "/bin/markdown" */ "./stdlib/markdown"),
    "/html"     : () => import(/* webpackChunkName: "/bin/html" */     "./stdlib/html"),
    "/path"     : () => import(/* webpackChunkName: "/bin/path" */     "./stdlib/path"),
}

const Path = require("path");

module.exports = {
    load: async function (path) {
        const fullPath = Path.resolve("/", path);
        const importFn = modules[fullPath];
        return await importFn();
    }
}
