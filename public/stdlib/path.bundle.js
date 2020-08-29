(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["/stdlib/path"],{

/***/ "./lib/expression/stdlib/path.js":
/*!***************************************!*\
  !*** ./lib/expression/stdlib/path.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const pathlib = __webpack_require__(/*! path */ \"./node_modules/path-browserify/index.js\");\n\nmodule.exports = {\n    getBaseName: pathlib.basename,\n    getDirName: pathlib.dirname,\n    getExtName: pathlib.extname,\n    normalize: pathlib.normalize,\n    resolve: (...paths) => pathlib.resolve(\"/\", ...paths)\n};\n\n\n//# sourceURL=webpack:///./lib/expression/stdlib/path.js?");

/***/ })

}]);