(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["swan_modules/markdown"],{

/***/ "../../lib/swan_modules/markdown.js":
/*!******************************************************************!*\
  !*** /home/marcello/mdb/Code/olojs/lib/swan_modules/markdown.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/**\n *  markdown - olojs expression stdlib module\n *  ============================================================================\n *  This module contains functions to render the `markdown` markup format.\n */\n\nconst marked = __webpack_require__(/*! marked */ \"../../node_modules/marked/src/marked.js\");\n\n/**\n *  markdown - function\n *  ----------------------------------------------------------------------------\n *  Takes a markdown text as input and returns the corresponding HTML text.\n *  ```\n *  html_text = markdown(md_text)\n *  ```\n *  For example, the function `markdown('*bold*')` returns `<p><em>bold</em></p>`.\n */\nexports.__apply__ = text => marked(text);\n\n\n//# sourceURL=webpack:////home/marcello/mdb/Code/olojs/lib/swan_modules/markdown.js?");

/***/ })

}]);