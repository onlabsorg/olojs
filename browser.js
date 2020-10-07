
module.exports = {
    
    expression: require("./lib/expression"),
    document: require("./lib/document"),
    
    Environment: require("./lib/environment"),
    
    protocols: {
        "http":  require('./lib/protocols/http'),
        "https": require('./lib/protocols/https'),
        "null":  require('./lib/protocols/null'),
    },
};
