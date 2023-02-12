const swan = require('@onlabsorg/swan-js');

const Lexer = require('@onlabsorg/swan-js/lib/lexer');
Lexer.matchIdentifier = identifier => /^[a-z_A-Z]+[a-z_A-Z0-9]*$/.test(identifier);

exports.modules = require('@onlabsorg/swan-js/lib/modules');
exports.modules.markdown = () => import(/* webpackChunkName: "swan_modules/markdown" */ "./swan_modules/markdown.js");

exports.parse = function (source) {
    try {
        return swan.parse(source);
    } catch (error) {
        return () => new swan.types.Undefined("Syntax", error);
    }
}

exports.createContext = swan.createContext;

exports.types = swan.types;
