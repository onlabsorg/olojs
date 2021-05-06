(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["swan_modules/list"],{

/***/ "../../node_modules/@onlabsorg/swan-js/lib/modules/list.js":
/*!*****************************************************************************************!*\
  !*** /home/marcello/mdb/Code/olojs/node_modules/@onlabsorg/swan-js/lib/modules/list.js ***!
  \*****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/**\n *  list - swan stdlib module\n *  ============================================================================\n *  This modules contains functions to manipulate swan lists.\n */\n\n\n/**\n *  list.find - function\n *  ----------------------------------------------------------------------------\n *  Returns the index of the fists occurrence of an item inside a list. It\n *  returns -1 if the given item is not contained in the list.\n *  ```\n *  index = list.find(lst, item)\n *  ```\n */\nexports.find = function (list, item) {\n    ensureList(list);\n    return list.indexOf(item);\n}\n\n\n/**\n *  list.rfind - function\n *  ----------------------------------------------------------------------------\n *  Returns the index of the last occurrence of an item inside a list. It\n *  returns -1 if the given item is not contained in the list.\n *  ```\n *  index = list.rfind(lst, item)\n *  ```\n */\nexports.rfind = function (list, item) {\n    ensureList(list);\n    return list.lastIndexOf(item);\n}\n\n\n/**\n *  list.join - function\n *  ----------------------------------------------------------------------------\n *  Given a list of strings, returns the string obtained by concatenating\n *  all the item, optionally with an interposed separator.\n *  ```\n *  str = list.join(strList, separator)\n *  ```\n */\nexports.join = function (list, separator=\"\") {\n    ensureList(list);\n    for (let item of list) ensureString(item);\n    ensureString(separator);\n    return list.join(separator);\n}\n\n\n/**\n *  list.reverse - function\n *  ----------------------------------------------------------------------------\n *  Returns a list containing all the item of a given list, but in reversed\n *  oredr.\n *  ```\n *  rList = list.reverse(lst)\n *  ```\n */\nexports.reverse = function (list) {\n    ensureList(list);\n    const rlist = [];\n    for (let i=list.length-1; i>=0; i--) {\n        rlist.push(list[i]);\n    }\n    return rlist;\n}\n\n\n/**\n *  list.slice - function\n *  ----------------------------------------------------------------------------\n *  Returns the portion of a given list, between a startIndex (included) and\n *  an endIndex (not included). Negative indexes are computed from the end\n *  of the list.\n *  ```\n *  subList = list.slice(lst, startIndex, endIndex)\n *  ```\n *  If `endIndex` is omitted, it slices up to the end of `lst`.\n */\nexports.slice = function (list, startIndex, endIndex) {\n    ensureList(list);\n    ensureNumber(startIndex);\n    if (endIndex !== undefined) ensureNumber(endIndex);\n    return list.slice(startIndex, endIndex);\n}\n\n\n\nfunction ensureList (list) {\n    if (!Array.isArray(list)) throw new Error(\"List type expected\");\n}\n\nfunction ensureString (string) {\n    if (typeof string !== \"string\") throw new Error(\"String type expected\");\n}\n\nfunction ensureNumber (number) {\n    if (Number.isNaN(number)) throw new Error(\"Number type expected\");\n}\n\n\n//# sourceURL=webpack:////home/marcello/mdb/Code/olojs/node_modules/@onlabsorg/swan-js/lib/modules/list.js?");

/***/ })

}]);