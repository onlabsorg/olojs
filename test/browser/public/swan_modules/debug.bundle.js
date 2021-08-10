/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunk"] = self["webpackChunk"] || []).push([["swan_modules/debug"],{

/***/ "../../node_modules/@onlabsorg/swan-js/lib/modules/debug.js":
/*!******************************************************************!*\
  !*** ../../node_modules/@onlabsorg/swan-js/lib/modules/debug.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("/**\n *  debug - swan stdlib module\n *  ============================================================================\n *  The debug module provides functions for debugging swan code.\n */\n\n\n/**\n *  debug.log - function\n *  ----------------------------------------------------------------------------\n *  The log function writes the passed item to the javascript console.\n */\nvar logCount = 0;\nexports.log = async function (...items) {\n    const context = this;\n    const value = context.$Tuple(...items).normalize();\n    \n    logCount++;\n    console.log(`Log ${logCount}:`, value);\n    return `[[Log ${logCount}]]`;\n}\n\n\n\n/**\n *  debug.inspect - function\n *  ----------------------------------------------------------------------------\n *  The inspect function returns a `descriptor` namespace containing detailed\n *  information about the passed item.\n */\nconst inspect = exports.inspect = async function (...items) {\n    const context = this;\n    \n    const value = context.$Tuple(...items).normalize();\n    \n    if (value instanceof context.$Tuple) return {\n        type: \"Tuple\",\n        data: Array.from(await value.mapAsync(item => inspect.call(context, item)))\n    }\n    \n    if (value instanceof Error) return {\n        type: \"Error\",\n        data: value,\n    }\n\n    const type = await context.type(value);\n    \n    switch (type) {\n        \n        case \"Undefined\":\n            return {\n                type: type, \n                data: Array.from(await value.args.mapAsync(arg => inspect.call(context, arg)))\n            };\n            \n        case \"List\":\n            return {type, data: await Promise.all(value.map(item => inspect.call(context, item)))};\n            \n        case \"Namespace\":\n            return {type, data: await mapObject(value, item => inspect.call(context, item))};\n            \n        default:\n            return {type, data: value};\n    }\n}\n\nasync function mapObject (obj, map) {\n    const newObj = {};\n    for (let key in obj) {\n        newObj[key] = await map(obj[key]);\n    }\n    return newObj;\n}\n\n\n//# sourceURL=webpack:///../../node_modules/@onlabsorg/swan-js/lib/modules/debug.js?");

/***/ })

}]);