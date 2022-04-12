const swan = require('@onlabsorg/swan-js');
const swan_types = require('@onlabsorg/swan-js/lib/types');

const Lexer = require('@onlabsorg/swan-js/lib/lexer');
Lexer.matchIdentifier = identifier => /^[a-z_A-Z]+[a-z_A-Z0-9]*$/.test(identifier);

const swan_modules = require('@onlabsorg/swan-js/lib/modules');
swan_modules.markdown = () => import(/* webpackChunkName: "swan_modules/markdown" */ "./swan_modules/markdown.js");

exports.parse = function (source) {
    try {
        return swan.parse(source);
    } catch (error) {
        return () => new swan_types.Undefined("Syntax", error);
    }
}

exports.createContext = swan.createContext;
