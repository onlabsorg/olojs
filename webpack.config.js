const path = require('path');

module.exports = {
        
    entry: "./browser.js",
    
    output: {
        filename: 'olo.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, './browser')
    },  
}
