const Path = require("path");

exports.load = path => require("./stdlib" + Path.resolve("/", path));
