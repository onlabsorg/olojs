const modules = {
    "/math"     : () => import(/* webpackChunkName: "/bin/math" */     "./modules/math"),
    "/markdown" : () => import(/* webpackChunkName: "/bin/markdown" */ "./modules/markdown"),
    "/html"     : () => import(/* webpackChunkName: "/bin/html" */     "./modules/html"),
    "/path"     : () => import(/* webpackChunkName: "/bin/path" */     "./modules/path"),
}

const Path = require("path");
module.exports = async path => (await modules[Path.resolve("/", path)]()).default;
