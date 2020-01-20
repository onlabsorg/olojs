exports.loaders = {};

const FileLoader = require(__olojspath + "/lib/loaders/file-loader");
exports.loaders["/"] = FileLoader(__dirname);
