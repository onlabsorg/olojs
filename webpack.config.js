const path = require('path');

module.exports = {
        
    entry: "./browser.js",
    
    output: {
        filename: 'olo.js',
        chunkFilename: '[name].js',
        path: path.resolve(__dirname, './browser')
    },  
}
