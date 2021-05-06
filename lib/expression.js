const swan = require('@onlabsorg/swan-js');

swan.defineModule("markdown" , () => import(/* webpackChunkName: "swan_modules/markdown" */     "./swan_modules/markdown.js"));

module.exports = swan;
