(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["swan_modules/json"],{

/***/ "./node_modules/@onlabsorg/swan-js/lib/modules/json.js":
/*!*************************************************************!*\
  !*** ./node_modules/@onlabsorg/swan-js/lib/modules/json.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/**\n *  json - swan stdlib module\n *  ============================================================================\n *  This module contains function to work with the json data format.\n */\n\n\n/**\n *  json.parse - function\n *  ----------------------------------------------------------------------------\n *  Takes a json-formatted text as input and returns a namespace. The keys not\n *  matching the swan naming system will be ignored.\n *  ```\n *  ns = json.parse(jsonStr)\n *  ```\n */\nexports.parse = text => JSON.parse(text);\n\n\n/**\n *  json.stringify - function\n *  ----------------------------------------------------------------------------\n *  Takes a number as input and returns a stringify function:\n *\n *  ```\n *  stringifyFn = json.stringify(n)\n *  ```\n *\n *  - `n` is the number of indentation spaces to be used in the serialization\n *  - `stringifyFn` is a function that takes a namespace as input and returns\n *    its json-string representation.\n *\n *  ```\n *  jsonStr = stringifyFn(namespace)\n *  ```\n */\nexports.stringify = spaces => object => JSON.stringify(object, null, spaces);\n\n\n//# sourceURL=webpack:///./node_modules/@onlabsorg/swan-js/lib/modules/json.js?");

/***/ })

}]);