(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["/bin/html"],{

/***/ "./lib/stdlib/modules/html.js":
/*!************************************!*\
  !*** ./lib/stdlib/modules/html.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("\nconst expression = __webpack_require__(/*! ../../expression */ \"./lib/expression.js\");\n\nasync function createElement (tagName, attributes={}, ...childElements) {\n    var html = `<${tagName}`;\n    for (let attrName in attributes) {\n        let attrValue = await expression.stringify(attributes[attrName]);\n        html += ` ${attrName}=\"${attrValue}\"`\n    }\n    html += \">\";\n    html += childElements.join(\"\");\n    html += `</${tagName}>`;\n    return html;\n}\n\nexports.__apply__ = createElement;\n\n\n//# sourceURL=webpack:///./lib/stdlib/modules/html.js?");

/***/ })

}]);