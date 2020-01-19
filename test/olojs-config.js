exports.loaders = {};

const Path = require("path");
const FileLoader = require("../lib/loaders/file-loader");
exports.loaders["/docs"] = FileLoader(Path.resolve(__dirname, "./docs"));
