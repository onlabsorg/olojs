exports.loaders = {};

const FileLoader = require("../../lib/loaders/file-loader");
exports.loaders["/"] = FileLoader(__dirname);
