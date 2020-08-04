const modules = {
    "math"     : () => import(/* webpackChunkName: "/stdlib/math" */     "./modules/math.js"),
    "markdown" : () => import(/* webpackChunkName: "/stdlib/markdown" */ "./modules/markdown.js"),
    "path"     : () => import(/* webpackChunkName: "/stdlib/path" */     "./modules/path.js"),
}

module.exports = async function (modulePath) {
    const module = await modules[modulePath]();
    return module.default;
}
