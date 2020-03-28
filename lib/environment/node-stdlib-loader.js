const Path = require("path");

module.exports = {
    load: function (path) {
        const fullPath = Path.resolve("/", path);
        return require(`./stdlib${fullPath}`);
    }
}
