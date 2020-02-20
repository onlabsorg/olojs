const Path = require("path");

module.exports = {
    
    "import": async function (path, argv={}) {
        const docPath = resolveRelativePath(this.__path__, path);
        const doc = await this.$env.load(docPath);
        const content = await doc.evaluate({argv: argv});
        return content.namespace;
    }
};

function resolveRelativePath (basePath, subPath) {
    if (subPath[0] === "/") return subPath;
    const lastSlashPos = basePath.lastIndexOf("/");
    if (lastSlashPos === -1) return Path.resolve("/", subPath);
    return Path.resolve("/", basePath.slice(0,lastSlashPos), subPath);
}
