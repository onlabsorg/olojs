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
        
    entry: "./src/olo.js",
    
    output: {
        filename: 'olo.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, './public')
    },  
    
    module: {
        rules: [ cssRule ]
    },

    plugins: [ cssPlugin ],        
}
