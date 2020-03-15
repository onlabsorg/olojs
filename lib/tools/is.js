
exports.object = x => typeof x === "object" && x !== null & !Array.isArray(x);

exports.string = x => typeof x === "string";

exports.function = x => typeof x === "function";
