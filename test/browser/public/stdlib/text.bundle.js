(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["/stdlib/text"],{

/***/ "../../node_modules/@onlabsorg/swan-js/lib/stdlib/text.js":
/*!****************************************************************************************!*\
  !*** /home/marcello/mdb/Code/olojs/node_modules/@onlabsorg/swan-js/lib/stdlib/text.js ***!
  \****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/**\n *  text - swan stdlib module\n *  ============================================================================\n *  This module contains functions to manupulate strings of text.\n */\n\n\n/**\n *  text.find - function\n *  ----------------------------------------------------------------------------\n *  Returns the index of the first occurrence of a sub-string inside a given\n *  string. It returns -1 if the sub-string is not contained in the given string.\n *  ```\n *  index = text.find(str, subStr)\n *  ```\n */\nexports.find = function (str, subStr) {\n    ensureString(str);\n    ensureString(subStr);\n    return str.indexOf(subStr);\n}\n\n\n/**\n *  text.rfind - function\n *  ----------------------------------------------------------------------------\n *  Returns the index of the last occurrence of a sub-string inside a given\n *  string. It returns -1 if the sub-string is not contained in the given string.\n *  ```\n *  index = text.rfind(str, subStr)\n *  ```\n */\nexports.rfind = function (str, subStr) {\n    ensureString(str);\n    ensureString(subStr);\n    return str.lastIndexOf(subStr);\n}\n\n\n/**\n *  text.lower - function\n *  ----------------------------------------------------------------------------\n *  Returns the lower-case transformation of a given string.\n *  ```\n *  loStr = text.lower(str)\n *  ```\n */\nexports.lower = function (str) {\n    ensureString(str);\n    return str.toLowerCase();\n}\n\n\n\n/**\n *  text.upper - function\n *  ----------------------------------------------------------------------------\n *  Returns the upper-case transformation of a given string.\n *  ```\n *  upStr = text.upper(str)\n *  ```\n */\nexports.upper = function (str) {\n    ensureString(str);\n    return str.toUpperCase();\n}\n\n\n/**\n *  text.char - function\n *  ----------------------------------------------------------------------------\n *  Returns a string given the numeric code of its characters.\n *  ```\n *  str = text.char(ch1, ch2, ch3, ...)\n *  ```\n */\nexports.char = function (...charCodes) {\n    for (let charCode of charCodes) ensureNumber(charCode);\n    return String.fromCharCode(...charCodes);\n}\n\n\n/**\n *  text.code - function\n *  ----------------------------------------------------------------------------\n *  Returns the list of the numeric codes of the characters composing a string.\n *  ```\n *  cList = text.code(str)\n *  ```\n */\nexports.code = function (str) {\n    ensureString(str);\n    return Array.from(str).map(c => c.charCodeAt(0));\n}\n\n\n/**\n *  text.slice - function\n *  ----------------------------------------------------------------------------\n *  Given a string, returns the sub-string between a start index and an end index.\n *  ```\n *  subStr = text.slice(str, startIndex, endIndex)\n *  ```\n *  - The character at the end index is not included in the sub-string\n *  - Negative indexes are assumed to be relative to the end of the sting\n *  - If the end index is missing, it slices up to the and of the string\n */\nexports.slice = function (str, firstIndex, lastIndex) {\n    ensureString(str);\n    ensureNumber(firstIndex);\n    if (lastIndex !== undefined) ensureNumber(lastIndex);\n    return str.slice(firstIndex, lastIndex);\n}\n\n\n/**\n *  text.split - function\n *  ----------------------------------------------------------------------------\n *  Given a string and a separato, returns the list of the strings between the\n *  separator.\n *  ```\n *  subStr = text.split(str, separator)\n *  ```\n */\nexports.split = function (str, divider) {\n    ensureString(str);\n    ensureString(divider);\n    return str.split(divider);\n}\n\n\n\n/**\n *  text.replace - function\n *  ----------------------------------------------------------------------------\n *  Given a string `s`, it returns a new string obtained by replacing all the\n *  occurrencies of a `searchStr` with a `replacementStr`.\n *  ```\n *  rStr = text.replace(s, searchStr, replacentStr)\n *  ```\n */\nexports.replace = (str, subStr, newSubStr) => {\n    ensureString(str);\n    ensureString(subStr);\n    ensureString(newSubStr);\n    while (str.indexOf(subStr) !== -1) {\n        str = str.replace(subStr, newSubStr);\n    }\n    return str;\n}\n\n\n/**\n *  text.trim - function\n *  ----------------------------------------------------------------------------\n *  Given a string `s`, returns a new string obtained by replacing both the\n *  leading and trailing spaces.\n *  ```\n *  ts = text.trim(s)\n *  ```\n */\nexports.trim = (str) => {\n    ensureString(str);\n    return str.trim();\n}\n\n\n/**\n *  text.trimStart - function\n *  ----------------------------------------------------------------------------\n *  Given a string `s`, returns a new string obtained by replacing the leading\n *  spaces.\n *  ```\n *  ts = text.trimStart(s)\n *  ```\n */\nexports.trimStart = (str) => {\n    ensureString(str);\n    return str.trimStart();\n}\n\n\n/**\n *  text.trimEnd - function\n *  ----------------------------------------------------------------------------\n *  Given a string `s`, returns a new string obtained by replacing the trailing\n *  spaces.\n *  ```\n *  ts = text.trimEnd(s)\n *  ```\n */\nexports.trimEnd = (str) => {\n    ensureString(str);\n    return str.trimEnd();\n}\n\n\n\nfunction ensureString (string) {\n    if (typeof string !== \"string\") throw new Error(\"String type expected\");\n}\n\nfunction ensureNumber (number) {\n    if (Number.isNaN(number)) throw new Error(\"Number type expected\");\n}\n\n\n//# sourceURL=webpack:////home/marcello/mdb/Code/olojs/node_modules/@onlabsorg/swan-js/lib/stdlib/text.js?");

/***/ })

}]);