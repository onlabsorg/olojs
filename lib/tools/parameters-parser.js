
const expression = require("../expression");


module.exports = function (...keyValuePairs) {
    const args = {};
    for (let keyValuePair of keyValuePairs) {
        const separatorIndex = keyValuePair.indexOf("=");
        if (separatorIndex === -1) {
            let name = keyValuePair.trim();
            if (expression.isValidName(name)) args[name] = null;
        } else {
            name = keyValuePair.slice(0, separatorIndex).trim();
            if (expression.isValidName(name)) {
                let string = keyValuePair.slice(separatorIndex+1).trim();
                let number = Number(string);
                args[name] = isNaN(number) ? string : number;
            }
        }
    }
    return args;
}
