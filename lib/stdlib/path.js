const pathlib = require("path");

module.exports = {
    getBaseName: pathlib.basename,
    getDirName: path => pathlib.dirname(path) + "/",
    getExtName: pathlib.extname,
    format: pathlib.format,
    parse: pathlib.parse,
    join: pathlib.join,
    normalize: pathlib.normalize,
    resolve: (...paths) => pathlib.resolve("/", ...paths)
};
