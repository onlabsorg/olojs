const path = require('path');

module.exports = {
        
    entry: "./index.js",
    
    output: {
        filename: 'browser.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, './public')
    },  
    
    resolve: {
        fallback: {
            "path": require.resolve('path-browserify'),
        }
    }
}
