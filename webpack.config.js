const path = require('path');

module.exports = {
        
    entry: "./src/olo.js",
    
    output: {
        filename: 'olo.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, './public')
    },    
}
