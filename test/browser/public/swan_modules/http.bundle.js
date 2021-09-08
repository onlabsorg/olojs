/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunk"] = self["webpackChunk"] || []).push([["swan_modules/http"],{

/***/ "../../node_modules/@onlabsorg/swan-js/lib/modules/http.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/@onlabsorg/swan-js/lib/modules/http.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("/**\n *  http - swan stdlib module\n *  ============================================================================\n *  The http library exposes methods to use the HTTP protocol.\n */\n\n__webpack_require__(/*! isomorphic-fetch */ \"../../node_modules/isomorphic-fetch/fetch-npm-browserify.js\");\n\nmodule.exports = swan => ({\n\n    /**\n     *  http.get - asynchronous function\n     *  ----------------------------------------------------------------------------\n     *  Sends an HTTP GET request to the given URL and returns the response body as\n     *  text. In case of error, it throws the HTTP status code (in js) or returns\n     *  an Undefined value (in swan).\n     *  ```\n     *  text = await http.get(url, options)\n     *  ```\n     *  - `url` is the URL of the resource to be fetched\n     *  - `options` is the second parameter of the JavaScript\n     *    [fetch](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch)\n     *    function.\n     */\n    async get (url, options={}) {\n        ensureString(url);\n        options = Object(options);\n        options.method = \"get\";\n\n        const response = await fetch(url, options);\n        if (!response.ok) throw new Error(response.status);\n        return await response.text();\n    },\n});\n\n\nfunction ensureString (string) {\n    if (typeof string !== \"string\") throw new Error(\"String type expected\");\n}\n\n\n//# sourceURL=webpack:///../../node_modules/@onlabsorg/swan-js/lib/modules/http.js?");

/***/ })

}]);