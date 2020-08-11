

exports.find = (str, subStr) => str.indexOf(subStr);
exports.rfind = (str, subStr) => str.lastIndexOf(subStr);

exports.lower = (str) => str.toLowerCase();
exports.upper = (str) => str.toUpperCase();

exports.char = (...charCodes) => String.fromCharCode(...charCodes);
exports.code = (str) => Array.from(str).map(c => c.charCodeAt(0));

exports.slice = (str, firstIndex, lastIndex) => str.slice(firstIndex, lastIndex);

exports.split = (str, divider) => str.split(divider);

exports.replace = (str, subStr, newSubStr) => str.replace(subStr, newSubStr);
