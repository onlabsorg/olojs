const FileLoader = require("@onlabsorg/olojs/lib/loaders/file-loader");

module.exports = {
    
    loaders: {
        "/": FileLoader(__dirname)
    },
    
}
