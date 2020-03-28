(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["/bin/path"],{

/***/ "./lib/environment/stdlib/path.js":
/*!****************************************!*\
  !*** ./lib/environment/stdlib/path.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const Path = __webpack_require__(/*! path */ \"./node_modules/path-browserify/index.js\");\n\nmodule.exports = {\n    getBaseName: Path.basename,\n    getDirName: path => Path.dirname(path) + \"/\",\n    getExtName: Path.extname,\n    format: Path.format,\n    parse: Path.parse,\n    join: Path.join,\n    normalize: Path.normalize,\n    resolve: (...paths) => Path.resolve(\"/\", ...paths)\n};\n\n\n//# sourceURL=webpack:///./lib/environment/stdlib/path.js?");

/***/ })

}]);