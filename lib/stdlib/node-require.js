const Path = require("path");

module.exports = path => require("./modules" + Path.resolve("/", path));
