const swan = require('@onlabsorg/swan-js');

swan.defineModule("markdown" , () => import(/* webpackChunkName: "/stdlib/markdown" */     "./stdlib/markdown.js"));

module.exports = swan;
