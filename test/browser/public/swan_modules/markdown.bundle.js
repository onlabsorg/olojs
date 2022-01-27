/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunk"] = self["webpackChunk"] || []).push([["swan_modules/markdown"],{

/***/ "../../lib/swan_modules/markdown.js":
/*!******************************************!*\
  !*** ../../lib/swan_modules/markdown.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("/**\n *  markdown - olojs expression stdlib module\n *  ============================================================================\n *  This module contains functions to render the `markdown` markup format.\n */\n\nconst marked = __webpack_require__(/*! marked */ \"../../node_modules/marked/src/marked.js\");\n\n/**\n *  markdown - function\n *  ----------------------------------------------------------------------------\n *  Takes a markdown text as input and returns the corresponding HTML text.\n *  ```\n *  html_text = markdown(md_text)\n *  ```\n *  For example, the function `markdown('*bold*')` returns `<p><em>bold</em></p>`.\n */\nmodule.exports = types => text => marked(text);\n\n\n//# sourceURL=webpack:///../../lib/swan_modules/markdown.js?");

/***/ })

}]);