



module.exports = function (...keyValuePairs) {
    const args = {};
    for (let keyValuePair of keyValuePairs) {
        let [name, value] = keyValuePair.split("=");
        let number = Number(value);
        if (isNaN(number)) {
            args[name.trim()] = value.trim();
        } else {
            args[name.trim()] = number;
        }
    }
    return args;
}
