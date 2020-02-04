const path = require('path');

module.exports = {
        
    entry: "./lib/package/http-client-src/main.js",
    
    output: {
        filename: '[name].js',
        chunkFilename: 'bin/[name].js',
        path: path.resolve(__dirname, './lib/package/http-client')
    },    
}
