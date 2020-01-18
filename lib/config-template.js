exports.loaders = {};

const FileLoader = require("@onlabsorg/olojs/lib/loaders/file-loader");
exports.loaders["/"] = FileLoader(__dirname);
