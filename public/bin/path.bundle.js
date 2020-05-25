(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["/bin/path"],{

/***/ "./lib/stdlib/path.js":
/*!****************************!*\
  !*** ./lib/stdlib/path.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const pathlib = __webpack_require__(/*! path */ \"./node_modules/path-browserify/index.js\");\n\nmodule.exports = {\n    getBaseName: pathlib.basename,\n    getDirName: path => pathlib.dirname(path) + \"/\",\n    getExtName: pathlib.extname,\n    format: pathlib.format,\n    parse: pathlib.parse,\n    join: pathlib.join,\n    normalize: pathlib.normalize,\n    resolve: (...paths) => pathlib.resolve(\"/\", ...paths)\n};\n\n\n//# sourceURL=webpack:///./lib/stdlib/path.js?");

/***/ })

}]);