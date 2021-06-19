const path = require('path');

module.exports = {
        
    entry: "./src/index.js",
    
    output: {
        filename: 'olo.js',
        chunkFilename: '[name].js',
        path: path.resolve(__dirname, './dist')
    },  
}
