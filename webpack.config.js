const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
        
    entry: "./src/olo.js",
    
    output: {
        filename: 'olo.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, './public')
    },  
    
    plugins: [ new MiniCssExtractPlugin({filename: 'olo-viewer.css'}) ],
    
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
        ],
    },
}
