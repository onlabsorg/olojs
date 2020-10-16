
module.exports = {
    
    expression: require("./lib/expression"),
    document: require("./lib/document"),
    
    Environment: require("./lib/environment"),
    
    stores: {
        "Null":   require('./lib/stores/null'),
        "Memory": require('./lib/stores/memory'),
        "HTTP":  require('./lib/stores/http'),
    },
};
