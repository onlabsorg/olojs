const path = require('path');

module.exports = {
        
    entry: "./src/environment-http-client.js",
    
    output: {
        filename: 'environment-http-client.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, './public')
    },    
}
