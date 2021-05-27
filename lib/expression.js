const swan = require('@onlabsorg/swan-js');

const Lexer = require('@onlabsorg/swan-js/lib/lexer');
Lexer.matchIdentifier = identifier => /^[a-z_A-Z]+[a-z_A-Z0-9]*$/.test(identifier);

swan.defineModule("markdown" , () => import(/* webpackChunkName: "swan_modules/markdown" */     "./swan_modules/markdown.js"));

module.exports = swan;
