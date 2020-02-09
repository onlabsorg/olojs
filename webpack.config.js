const path = require('path');

module.exports = {
        
    entry: "./lib/http/client.js",
    
    output: {
        filename: 'main.js',
        chunkFilename: 'bin/[name].js',
        path: path.resolve(__dirname, './lib/http/public')
    },    
}
