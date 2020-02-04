const BaseEnvironment = require("./base-environment");

class Environment extends BaseEnvironment {
        
    static async _importBin (path) {
        return require("./stdlib"+path);
    }
}

module.exports = Environment;
