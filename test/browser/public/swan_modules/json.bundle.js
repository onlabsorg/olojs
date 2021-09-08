/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunk"] = self["webpackChunk"] || []).push([["swan_modules/json"],{

/***/ "../../node_modules/@onlabsorg/swan-js/lib/modules/dict.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/@onlabsorg/swan-js/lib/modules/dict.js ***!
  \*****************************************************************/
/***/ ((module) => {

eval("/**\n *  dict - swan stdlib module\n *  ============================================================================\n *  The swan standard associative array library.\n */\n\n\n\nmodule.exports = swan => ({    \n    create : (...entries) => createDict(swan, ...entries),\n    merge  : (...dicts) => mergeDicts(swan, ...dicts),\n});\n\n\n\n/**\n *  dict.\\_\\_apply\\_\\_ - asynchronous function\n *  ----------------------------------------------------------------------------\n *  Creates a dictionary given a tuple of `[key, value]` pairs.\n *  \n *  ```js\n *  d = dict.__apply__(['x',10], ['y',20], ['z',30])\n *  ```\n *  \n *  The returned namespace contains the following items:\n *  \n *  - `d.size` - number : the number of entries contained in the dictionary\n *  - `d.has(key)` - function : returns true if `key` is contained in the dictionary\n *  - `d.get(key)` - function : returns the value mapped to `key`\n *  - `d.keys()` - function : returns the tuple of `keys` contained in the dicionary\n *  - `d.values()` - function : returns the tuple of `values` contained in the dicionary\n *  - `d.entries()` - function : returns the tuple of `[key, value]` pairs\n *    contained in the dictionary\n */\nfunction createDict (swan, ...entries) {\n    const context = this;\n    \n    const map = new Map();\n    for (let [key, value] of entries) {\n        map.set(key, value);\n    }\n    \n    return {\n        size    : map.size,\n        has     : key => map.has(key),\n        get     : key => map.get(key) || null,\n        keys    : () => swan.Tuple(...map.keys()),\n        values  : () => swan.Tuple(...map.values()),\n        entries : () => swan.Tuple(...map.entries()),\n    }\n}\n\n\n/**\n *  dict.merge - asynchronous function\n *  ----------------------------------------------------------------------------\n *  Merges two or more dictionaries together and returns a new dictionary.\n *  \n *  ```js\n *  d = dict.merge(\n *      dict.__apply__(['a',10], ['b',20]),\n *      dict.__apply__(['c',30], ['d',40]),\n *      dict.__apply__(['e',40], ['f',60]) )\n *  ``` \n *  \n *  The entries of the dictionary in the above example are \n *  `(['a',10], ['b',20], ['c',30], ['d',40], ['e',40], ['f',60])`\n */\nfunction mergeDicts (swan, ...dicts) {\n    const entries = [];\n    \n    for (let dict of dicts) {\n        for (let entry of dict.entries()) {\n            entries.push(entry);\n        }\n    }\n    \n    return createDict(swan, ...entries);\n}\n\n\n//# sourceURL=webpack:///../../node_modules/@onlabsorg/swan-js/lib/modules/dict.js?");

/***/ }),

/***/ "../../node_modules/@onlabsorg/swan-js/lib/modules/json.js":
/*!*****************************************************************!*\
  !*** ../../node_modules/@onlabsorg/swan-js/lib/modules/json.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("/**\n *  json - swan stdlib module\n *  ============================================================================\n *  This module contains function to work with the json data format.\n */\n\n\nmodule.exports = swan => ({\n\n    /**\n     *  json.parse - function\n     *  ----------------------------------------------------------------------------\n     *  Takes a json-formatted text as input and returns a swan dictionary.\n     *  \n     *  ```\n     *  dictObj = json.parse(jsonStr)\n     *  ```\n     */\n    parse (text) {\n        const jsonObj = JSON.parse(text);\n\n        const dict = __webpack_require__(/*! ./dict */ \"../../node_modules/@onlabsorg/swan-js/lib/modules/dict.js\")(swan);\n        return dict.create(...Object.entries(jsonObj));\n    },\n\n\n    /**\n     *  json.stringify - function\n     *  ----------------------------------------------------------------------------\n     *  Takes a number as input and returns a stringify function:\n     *\n     *  ```\n     *  stringifyFn = json.stringify(n)\n     *  ```\n     *\n     *  - `n` is the number of indentation spaces to be used in the serialization\n     *  - `stringifyFn` is a function that takes a swan dictionary as input and \n     *    returns its json-string representation.\n     *\n     *  ```\n     *  jsonStr = stringifyFn(dictObj)\n     *  ```\n     */\n    stringify: spaces => dictObj => {\n        const jsonObj = {};\n        for (let key of dictObj.keys()) {\n            jsonObj[key] = dictObj.get(key);\n        }\n        return JSON.stringify(jsonObj, null, spaces);\n    }\n    \n});\n\n\n//# sourceURL=webpack:///../../node_modules/@onlabsorg/swan-js/lib/modules/json.js?");

/***/ })

}]);