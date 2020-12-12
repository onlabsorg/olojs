(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["/stdlib/list"],{

/***/ "../[ ] swan-js/lib/stdlib/http.js":
/*!*****************************************!*\
  !*** ../[ ] swan-js/lib/stdlib/http.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! isomorphic-fetch */ \"../[ ] swan-js/node_modules/isomorphic-fetch/fetch-npm-browserify.js\");\n\n\nexports.get = async function (url, options={}) {\n    ensureString(url);\n    options = Object(options);\n    options.method = \"get\";\n    \n    const response = await fetch(url, options);\n    if (!response.ok) throw new Error(response.status);\n    return await response.text();\n}\n\n\nfunction ensureString (string) {\n    if (typeof string !== \"string\") throw new Error(\"String type expected\");\n}\n\n\n//# sourceURL=webpack:///../%5B_%5D_swan-js/lib/stdlib/http.js?");

/***/ }),

/***/ "../[ ] swan-js/lib/stdlib/list.js":
/*!*****************************************!*\
  !*** ../[ ] swan-js/lib/stdlib/list.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("\nexports.find = function (list, item) {\n    ensureList(list);\n    return list.indexOf(item);\n}\n\nexports.rfind = function (list, item) {\n    ensureList(list);\n    return list.lastIndexOf(item);\n}\n\nexports.join = function (list, separator=\"\") {\n    ensureList(list);\n    for (let item of list) ensureString(item);\n    ensureString(separator);\n    return list.join(separator);\n}\n\nexports.reverse = function (list) {\n    ensureList(list);\n    const rlist = [];\n    for (let i=list.length-1; i>=0; i--) {\n        rlist.push(list[i]);\n    }\n    return rlist;\n}\n\nexports.slice = function (list, startIndex, endIndex) {\n    ensureList(list);\n    ensureNumber(startIndex);\n    if (endIndex !== undefined) ensureNumber(endIndex);\n    return list.slice(startIndex, endIndex);\n}\n\n\nfunction ensureList (list) {\n    if (!Array.isArray(list)) throw new Error(\"List type expected\");\n}\n\nfunction ensureString (string) {\n    if (typeof string !== \"string\") throw new Error(\"String type expected\");\n}\n\nfunction ensureNumber (number) {\n    if (Number.isNaN(number)) throw new Error(\"Number type expected\");\n}\n\n\n//# sourceURL=webpack:///../%5B_%5D_swan-js/lib/stdlib/list.js?");

/***/ })

}]);