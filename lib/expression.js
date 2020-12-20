const swan = require('@onlabsorg/swan-js');

exports.parse = swan.parse;

const expression_globals = {};
exports.createContext = (...namespaces) => swan.createContext(expression_globals, ...namespaces);

// Swan internals exposed to javascript
exports.stringify = swan.F.str;
exports.apply = (f, ...args) => swan.O.apply(f, swan.T.createTuple(...args));
exports.isValidName = swan.T.isName;
exports.createTuple = swan.T.createTuple;
