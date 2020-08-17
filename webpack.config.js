const path = require('path');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const cssPlugin = new MiniCssExtractPlugin({
    filename: "[name].css",
    chunkFilename: "[id].css"
});

const cssRule = {
    test: /\.css$/,
    use: [ MiniCssExtractPlugin.loader, {loader:"css-loader"} ]
};

module.exports = {
        
    entry: "./src/olonv.js",
    
    output: {
        filename: 'olonv.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, './public')
    },  
    
    module: {
        rules: [ cssRule ]
    },

    plugins: [ cssPlugin ],        
}
