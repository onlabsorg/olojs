const Path = require("path");

module.exports = {
    getBaseName: Path.basename,
    getDirName: path => Path.dirname + "/",
    getExtName: Path.extname,
    format: Path.format,
    parse: Path.parse,
    join: Path.join,
    normalize: Path.normalize,
    resolve: (...paths) => Path.resolve("/", ...paths)
};
