var isObjectLike = require("lodash/isObjectLike");
var isPlainObject = require("lodash/isPlainObject");
var isArray = require("lodash/isArray");
var isString = require("lodash/isString");
var isBoolean = require("lodash/isBoolean");
var isNumber = require("lodash/isNumber");
var isInteger = require("lodash/isInteger");
var toInteger = require("lodash/toInteger");
var isEqual = require("lodash/isEqual");
var cloneDeep = require("lodash/cloneDeep");

var URL = require("url");

var uuid = require("uuid");



var utils = {}

utils.isObjectLike = isObjectLike
utils.isPlainObject = isPlainObject;
utils.isArray = isArray;
utils.isString = isString;
utils.isBoolean = isBoolean;
utils.isNumber = isNumber;
utils.isInteger = isInteger;
utils.toInteger = toInteger;
utils.isEqual = isEqual;
utils.clone = cloneDeep;

utils.uuid1 = uuid.v1;
utils.uuid4 = uuid.v4;


utils.parseURL = function (urlString) {
    var url = URL.parse(urlString);
    url.pathArray = url.pathname ? url.pathname.split("/").slice(1) : [];
    return url;
}


/*  This function calculate the deep differences between two values
 *  and returns an array of operations to be applied to oldVal to
 *  make it equal to newVal:
 *
 *  [
 *      ...
 *      {
 *          type: "set" or "insert" or "remove",
 *          path: ['path','to','changed','key'],
 *          value: ...
 *      }
 *      ...
 *  ]
 */
utils.diff = function (oldVal, newVal) {

    if (isString(newVal) && isString(oldVal)) 
        return stringDiff(oldVal,newVal);

    if (isArray(newVal) && isArray(oldVal))
        return arrayDiff(oldVal,newVal);

    if (isObjectLike(newVal) && isObjectLike(oldVal))
        return objectDiff(oldVal,newVal);

    if (newVal !== undefined && oldVal === undefined)
        return [{type:"insert", path:[], value:newVal}];

    if (newVal === undefined && oldVal !== undefined)
        return [{type:"remove", path:[], value:oldVal}];

    if (newVal !== oldVal)
        return [{type:"set", path:[], value:newVal}];

    return [];
}


function stringDiff (oldStr, newStr) {

    var changes = [];

    if (oldStr !== newStr) {

        // Count the common characters at the beginning of the two strings
        var commonStart = 0;
        while (oldStr.charAt(commonStart) === newStr.charAt(commonStart)) {
            commonStart++;
        }

        // Count the common characters at the end of the two strings
        var commonEnd = 0;
        while (oldStr.charAt(oldStr.length - 1 - commonEnd) === newStr.charAt(newStr.length - 1 - commonEnd) &&
                commonEnd + commonStart < oldStr.length && commonEnd + commonStart < newStr.length) {
            commonEnd++;
        }

        // Compute the removed sub-string
        if (oldStr.length !== commonStart + commonEnd) {
            changes.push({
                type: "remove",
                path: [commonStart],
                value: oldStr.slice(commonStart, oldStr.length - commonEnd),
            });
        }

        // Compute the added sub-string
        if (newStr.length !== commonStart + commonEnd) {
            changes.push({
                type: "insert",
                path: [commonStart],
                value: newStr.slice(commonStart, newStr.length - commonEnd)
            });
        }
    }

    return changes;
}


function arrayDiff (oldArr, newArr) {
    return objectDiff(oldArr,newArr);
}


function objectDiff (oldObj, newObj) {
    var changes = [];

    for (let key in newObj) {
        let subChanges = utils.diff(oldObj[key], newObj[key]);
        for (let subChange of subChanges) {
            subChange.path = [key].concat(subChange.path);
        }
        changes = changes.concat(subChanges);
    }

    for (let key in oldObj) {
        if (newObj[key] === undefined) {
            changes.push({
                type: "remove",
                path: [key],
                value: oldObj[key],
            });
        }
    }

    return changes;
}



module.exports = utils;
