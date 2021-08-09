const path = require('path');

module.exports = {
        
    entry: "./src/index.js",
    
    output: {
        filename: 'olo.js',
        chunkFilename: '[name].js',
        path: path.resolve(__dirname, './dist')
    },  
    
    resolve: {
        fallback: {
            "fs": false,
            "path": false,
            "http": false,
            "https": false,
        }
    }
}
