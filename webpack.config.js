const path = require('path');

module.exports = {
        
    entry: "./src/browser-environment.js",
    
    output: {
        filename: 'browser-environment.js',
        path: path.resolve(__dirname, 'dist')
    },    
}
