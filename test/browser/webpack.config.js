const path = require('path');

module.exports = {
        
    entry: path.resolve(__dirname, "./index.js"),
    
    output: {
        filename: 'browser.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, './public')
    },  
    
    resolve: {
        fallback: {
            "path": require.resolve('path-browserify')
        }
    }
}
