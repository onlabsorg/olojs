const FileLoader = require("../lib/loaders/file-loader");
const Path = require("path");



module.exports = {
    
    loaders: {
        "/docs": FileLoader(Path.resolve(__dirname, "./docs"))
    },
}
