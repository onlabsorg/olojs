const Path = require("path");

module.exports = {
    
    "import": async function (path, argv={}) {
        const docPath = resolveRelativePath(this.PATH, path);
        const doc = await this.$env.load(docPath);
        if (doc instanceof this.$env.constructor.Document) {
            return await doc.evaluate({argv: argv});            
        } else {
            return doc;
        }
    }
};

function resolveRelativePath (basePath, subPath) {
    if (subPath[0] === "/") return subPath;
    const lastSlashPos = basePath.lastIndexOf("/");
    if (lastSlashPos === -1) return Path.resolve("/", subPath);
    return Path.resolve("/", basePath.slice(0,lastSlashPos), subPath);
}
