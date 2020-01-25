const Path = require("path");

module.exports = {
    
    "import": async function (path, argv={}) {
        if (path.slice(0,5) === "/bin/" && path.length > 4) {
            return await this.$env.importBin(path.slice(4));
        }    
        const docPath = resolveRelativePath(this.PATH, path);
        const doc = await this.$env.load(docPath);
        return await doc.evaluate({argv: argv});
    }
};

function resolveRelativePath (basePath, subPath) {
    if (subPath[0] === "/") return subPath;
    const lastSlashPos = basePath.lastIndexOf("/");
    if (lastSlashPos === -1) return Path.resolve("/", subPath);
    return Path.resolve("/", basePath.slice(0,lastSlashPos), subPath);
}
