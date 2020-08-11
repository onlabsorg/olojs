const modules = {
    "math"     : () => import(/* webpackChunkName: "/stdlib/math" */     "./stdlib/math.js"),
    "markdown" : () => import(/* webpackChunkName: "/stdlib/markdown" */ "./stdlib/markdown.js"),
    "path"     : () => import(/* webpackChunkName: "/stdlib/path" */     "./stdlib/path.js"),
}

module.exports = async function (modulePath) {
    const module = await modules[modulePath]();
    return module.default;
}
