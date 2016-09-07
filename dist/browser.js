(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

exports.deep = require("./lib/deep");
exports.Path = exports.deep.Path;
exports.Change = exports.deep.Change;

exports.observable = require("./lib/observable");
exports.Observable = exports.observable.Observable;
exports.Subscription = exports.observable.Subscription;

},{"./lib/deep":2,"./lib/observable":3}],2:[function(require,module,exports){
/*!
 *  MIT License
 * 
 *  Copyright (c) 2016 Marcello Del Buono (m.delbuono@gmail.com)
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */



/**
 *  # Module `olojs.deep`
 *
 *  This module provides classes and function for deep manipulation of
 *  objects and arrays.
 *
 */





/*!
 *  Module symbols.
 */
var $equal = Symbol("olojs.deep.$equal");   // if present, the method obj1[$equal](obj2) will be called by equal(obj1, obj2)
var $copy = Symbol("olojs.deep.$copy");     // if present, the method obj1[$copy]() will be called by copy(obj1)
var $change = Symbol("olojs.deep.$change"); // if present, the method obj[$change](key,oldVal,newVal) will be called by change.apply(obj)
var $diff = Symbol("olojs.deep.$diff");     // if present, the method obj1[$diff](obj2) will be called by diff(obj1, obj2)





/*!
 *  Type detection utilities.
 */

function isObject (val) {
    return Object.prototype.toString.call(val) === "[object Object]";
}

function isArray (val) {
    return Object.prototype.toString.call(val) === "[object Array]";
}

function isString (val) {
    return Object.prototype.toString.call(val) === "[object String]";
}

function isInteger (val) {
    return Object.prototype.toString.call(val) === "[object Number]" && Number.isInteger(val);
}





/**
 *  ## class Path
 *
 *  A Path object represents a sequence of object keys (same concept of direcory path).
 *  It is implemented as an array of names and numbers.
 *
 *      ['path',3,'to','target']
 *
 *  The Path constructor accepts a variable number of arguments. Each of them can be:
 *      * a path represented as a string (e.g. `"a[3].b.c"`)
 *      * a path represented as an array (e.g. `['a',3,'b','c']`)
 *      * another Path object  
 *
 *  Example:
 *  
 *  ```js
 *  new Path('a', 'b', 'c')                 // -> ['a','b','c']
 *  new Path('a.b', 'c.d.e')                // -> ['a','b','c','d','e']
 *  new Path('a', 'b.c.d', ['e','f','g'])   // -> ['a','b','c','d','e','f','g']
 *  new Path('a', 'b.c', ['d[8].e.f','g'])  // -> ['a','b','c','d',8,'e','f','g']
 *  ```
 */
class Path extends Array {

    constructor (...subPaths) {

        super();

        for (let subPath of subPaths) {

            // Transform each subPath in an array of keys

            if (Array.isArray(subPath) || subPath instanceof Path) {
                subPath = new Path(...subPath);

            } else if (typeof subPath === "string" && subPath !== "") {
                subPath = subPath.replace(/\[\d+\]/g, index => "." + index).split(".");

            } else if (isInteger(subPath)) {
                subPath = [subPath];

            } else {
                subPath = [];

            }


            // Append each key of the subPath to this path

            for (let item of subPath) {
                if (/^\[\d+\]$/.test(item)) {
                    item = Number(item.substr(1, item.length-2));
                }
                if (item !== "") {
                    this.push(item);    
                }
            }
        }
    }


    /**
     *  ### Path.prototype.slice(begin, end)
     *
     *  It works as Array.prototype.slice, with the only difference that the
     *  return value is a Path object.
     */
    slice (begin, end) {
        return new Path(Array.from(this).slice(begin, end));
    }


    /**
     *  ### Path.prototype.lookup(obj)
     *
     *  Takes an object or arry as parameter and returns the value of the
     *  object property at the deep path or undefined if no match can be found.
     *  
     *  Example:  
     *  
     *  ```js
     *  var obj = {a:[10,{b:2}]}
     *  query(obj, "a[1].b")        // -> obj.a[1].b -> 2
     *  query(obj, ['a',1,'b'])     // -> obj.a[1].b -> 2
     *  query(obj, ['a[1]','b'])    // -> obj.a[1].b -> 2
     *  query(obj, "a.x")           // -> undefined
     *  query(obj, "a.1.b")         // -> undefined, because obj.a is an Array
     *  ```
     */
    lookup (obj) {

        if (this.length === 0) return obj;

        if (!isObject(obj) && !isArray(obj)) return undefined;

        var value = obj;
        for (let key of this) {

            if ((isObject(value) && isString(key)) ||
                (isArray(value) && isInteger(key))) {

                value = value[key];

            } else {

                return undefined;

            }
        }
        return value;
    }


    /**
     *  ### Path.prototype.toString()
     *  
     *  Retruns the string represtnatation of the path.
     *  
     *  ```js
     *  String(Path('a','b','c'))       // -> "a.b.c"
     *  String(Path('a','b',1,'c'))     // -> "a.b[1].c"
     *  ```
     */
    toString () {

        var pathStr = "";

        for (let key of this) {

            if (isInteger(key)) {
                pathStr = pathStr + "[" + key + "]";

            } else if (pathStr === "") {
                pathStr = key;

            } else {
                pathStr = pathStr + "." + key;

            }
        }

        return pathStr;
    }


    /*!
     *  deep.copy(path) will result in calling this method
     */
    [$copy] () {
        return Array.from(this);
    }
}





/**
 *  ## function equal(obj1, obj2)
 *
 *  Compares the two objects and returns true if they are deeply equal.
 *  If obj1 has the symbol `deep.$equal`, `equal(obj1, obj2)` will return 
 *  `obj1[deep.$equal](obj2)`.
 *
 *  Example:  
 *  
 *  ```js
 *  equal({a:1,b:[1,2,3]}, {a:1,b:[1,2,3]})     // -> true
 *  equal({a:1,b:[1,2,3]}, {a:1,b:[1,2,4]})     // -> false
 *
 *  equal([1,2,3], [1,2,3])                     // -> true
 *  equal([1,2,3], [1,2,{}])                    // -> false
 *  
 *  // It works also with primitive values, although you don't wanna use it this way
 *  equal(1, 1)             // -> true
 *  equal(1, 2)             // -> false
 *  equal("abc", "abc")     // -> true
 *  equal("abc", "def")     // -> false
 *  ``` 
 */
function equal (obj1, obj2) {

    if (obj1 === obj2) {
        return true;
    }

    if (typeof obj1 === "object" && obj1 !== null && typeof obj1[$equal] === "function") {
        return obj1[$equal](obj2);
    }

    if (isObject(obj1) && isObject(obj2)) {
        for (let key in obj1) if (!equal(obj1[key], obj2[key])) return false
        for (let key in obj2) if (!(key in obj1)) return false
        return true;
    }

    if (isArray(obj1) && isArray(obj2)) {
        if (obj1.length !== obj2.length) return false;
        for (let i=0; i<obj1.length; i++) if (!equal(obj1[i], obj2[i])) return false;
        return true;
    }

    return false;
}



/**
 *  ## function copy(obj)
 *
 *  Creates and returns a deep copy of the given object.
 *  If `obj` has the symbol `deep.$copy`, `copy()` will return `obj[deep.$copy]()`.
 *  
 *  Example
 *  
 *  ```js
 *  var obj1 = {a:1, b:2, c:[3,4,5]};
 *  var obj2 = copy(obj1);
 *  equal(obj1, obj2)           // -> true
 *  obj1 === obj2               // -> false
 *  ```
 */
function copy (obj) {

    if (typeof obj === "object" && obj !== null && typeof obj[$copy] === "function") {
        return obj[$copy]();
    }

    if (isObject(obj)) {
        let clone = {}
        for (let key in obj) {
            clone[key] = copy(obj[key]);
        }
        return clone;
    }

    else if (isArray(obj)) {
        let clone = [];
        for (let item of obj) {
            clone.push(copy(item));
        }
        return clone;
    }

    else {
        return obj;
    }
}



/**
 *  ## class Change 
 *
 *      var change = new Change(path, oldValue, newValue)  
 *
 *  This object represents an athomic change in an object or an array. 
 *  A change is defined by three properties: 
 *      * `path`: the [Path][] of the property/item that changes
 *      * `old` : the value of the property/item before change
 *      * `new` : the value of the property/item after change
 *
 *  If both `old` and `new` are defined, the change represents a `set` operation.
 *  If only `old` is defined, the change represents a `delete` operation.
 *  If only `new` is defined, the change represents an `insert` operation.
 *
 *  ### Properties
 *  * `change.path` : the [Path][] that changes.
 *  * `change.old`  : the value befor change. If this is undefined, the change is an `insert` operation.
 *  * `change.old`  : the value after change. If this is undefined, the change is a `delete` operation.
 */
class Change {

    constructor (path=[], oldVal=undefined, newVal=undefined) {
        this.path = new Path(path);
        if (oldVal !== undefined) this.old = oldVal;
        if (newVal !== undefined) this.new = newVal;
    }


    /**
     *  ### Change.prototype.apply(obj)
     *
     *  Changes the obj according to this change specification and returns the applied
     *  change or null in case of failure.
     *
     *  In order to succeed, the following conditions must be matched:
     *
     *      * the obj value before change must be deeply equal to the change.old property
     *      * the Path change.path must exist in obj
     *  
     *  Example:
     *
     *  ```js
     *  var obj = {a:1, b:2, c:[3,4,5]};
     *
     *  (new Change(['a'],1,10)).apply(obj)         // results in obj.a = 10
     *  (new Change(['d'],undefined,6)).apply(obj)  // results in obj.d = 6
     *  (new Change(['a'],1)).apply(obj)            // results in deletes obj.a
     *  (new Change(['a'],2,10)).apply(obj)         // fails because obj.a !== 2
     *
     *  (new Change(['c',0],3,30)).apply(obj)           // results in obj.c[0] = 30
     *  (new Change(['c',1],4)).apply(obj)              // results in obj.c.splice(1,1)
     *  (new Change(['c',1],undefined,4)).apply(obj)    // results in obj.c.splice(1,0,4)
     *  (new Change(['c','1'],4,40)).apply(obj)         // fails because '1' means object key, not array index
     *  ```
     *
     */
    apply (obj) {
        var parent = this.path.slice(0,-1).lookup(obj);
        var key = this.path[this.path.length-1];

        if (typeof parent === "object" && parent !== null && typeof parent[$change] === "function") {
            return parent[$change](key, this.old, this.new);
        }

        var objectChange = isString(key) && isObject(parent);
        var arrayChange  = isInteger(key)  && isArray(parent);

        var remove = 'old' in this;
        var insert = 'new' in this;

        if (objectChange && remove && insert) {
            if (!equal(this.old, parent[key])) return null;
            if (equal(this.new, parent[key])) return null;
            parent[key] = this.new;
        }

        else if (objectChange && !remove && insert) {
            if (parent[key] !== undefined) return null;
            if (this.new === undefined) return null;
            parent[key] = this.new;
        }

        else if (objectChange && remove && !insert) {
            if (!equal(this.old, parent[key])) return null;
            if (parent[key] === undefined) return null;
            delete parent[key];
        }

        else if (arrayChange && remove && insert) {
            if (!equal(this.old, parent[key])) return null;
            if (equal(this.new, parent[key])) return null;
            parent[key] = this.new;
        }

        else if (arrayChange && !remove && insert) {
            if (key < 0 || parent.length < key) return null;
            if (this.new === undefined) return null;
            parent.splice(key, 0, this.new);
        }

        else if (arrayChange && remove && !insert) {
            if (key < 0 || parent.length < key) return null;
            if (parent[key] === undefined) return null;
            parent.splice(key, 1);
        }

        else {
            return null;     
        }

        return this;        
    }


    /**
     *  @method Change.prototype.SubChange(path)
     *
     *  Generates a new equivalent change object that applies to a subpath. 
     *  For example: `change` applied to `obj` produces the same resuts as `change.SubChange("a.b")`
     *  applied to `obj.a.b`.
     *
     *  Example:
     *
     *  ```js
     *  var obj = {a: {b: { c: 1 }}};
     *  var change = new Change('a.b.c', 1, 10);
     *  var subChange = change.SubChange('a.b');    // -> new Change('c', 1, 10)
     *  ```
     */
    SubChange (path) {
        path = new Path(path);

        if (this.path.length >= path.length &&
                equal(this.path.slice(0,path.length), path)) {

            let subPath = this.path.slice(path.length);
            return new Change(subPath, this.old, this.new);
        }

        else if (this.path.length < path.length &&
                    equal(this.path, path.slice(0,this.path.length))) {

            let subPath = path.slice(this.path.length);
            return new Change([], subPath.lookup(this.old), subPath.lookup(this.new));
        }

        else {
            return null;
        }
    }


    /*!
     *  deep.copy(change) will result in calling this method
     */
    [$copy] () {
        return {
            path: copy(this.path),
            old : copy(this.old),
            new : copy(this.new)
        }
    }
}



/**
 *  ## function diff(oldObj, newObj)
 *
 *  Compares oldObj and newObj and returns the array of [Change][] objects that need to be
 *  applied to oldObj to make it deeply equal to newObj.
 *  If oldObj has the symbol `deep.$diff`, `diff()` will return `oldObj[deep.$diff](newObj)`.
 *
 */
function diff (oldObj, newObj) {
    var changes = [];

    if (oldObj === newObj) {
        return [];
    }

    if (typeof oldObj === "object" && oldObj !== null & typeof oldObj[$diff] === "function") {
        return oldObj[$diff](newObj);
    }

    // /* String diff is not implemented yet */
    // else if (typeof newObj === "string" && typeof oldObj === "string") {
    //     return stringDiff(oldObj,newObj);
    // }

    else if (isArray(newObj) && isArray(oldObj)) {
        return arrayDiff(oldObj,newObj);
    }

    else if (isObject(newObj) && isObject(oldObj)) {
        return objectDiff(oldObj,newObj);
    }

    else {
        return [new Change([], oldObj, newObj)];
    }
}



/*!
 *  This function calculates the deep differences between two objects:
 *  it recursively compares the properties of oldObj and newObj and
 *  returns the array of [Change][] objects that need to be applied to oldObj
 *  in order to make it deeply equal to newObj.
 */
function objectDiff (oldObj, newObj) {
    var changes = [];

    // process the keys of oldObj that are different from newObj
    for (let key in oldObj) {
        let subChanges = diff(oldObj[key], newObj[key]);
        for (let subChange of subChanges) {
            subChange.path = new Path(key, subChange.path);
            changes.push(subChange);
        }
    }

    // process the keys of newObj that are not contained in oldObj
    for (let key in newObj) {
        if (oldObj[key] === undefined) {
            changes.push(new Change(key, undefined, newObj[key]));
        }
    }

    return changes;
}



/*!
 *  This function calculates the deep differences between two arrays:
 *  it counts the first n=commonStart items which are the same
 *  and the last n=commonEnd items which are te same.
 *  It recursively compares the items in between and
 *  returns the array of change objects that need to be applied to oldArr
 *  in order to make it deeply equal to newArr.
 */
function arrayDiff (oldArr, newArr) {
    if (equal(oldArr, newArr)) return [];

    var changes = [];

    // Count the common items at the beginning of the two arrays
    var commonStart = 0;
    while (equal(oldArr[commonStart], newArr[commonStart])) {
        commonStart++;
    }

    // Count the common items at the end of the two arrays
    var commonEnd = 0;
    while (equal(oldArr[oldArr.length-1-commonEnd], newArr[newArr.length-1-commonEnd]) &&
            commonEnd + commonStart < oldArr.length && 
            commonEnd + commonStart < newArr.length) {
        commonEnd++;
    }

    // Compute the sub-array to be removed
    var oldItems = oldArr.slice(commonStart, oldArr.length-commonEnd);

    // Compute the sub-array to be added
    var newItems = newArr.slice(commonStart, newArr.length-commonEnd);

    // Compute the athomic changes
    for (let i=0; i<Math.max(oldItems.length, newItems.length); i++) {
        let subChanges = diff(oldItems[i], newItems[i]);
        for (let subChange of subChanges) if (subChange !== null) {
            subChange.path = new Path(commonStart+i, subChange.path);
            changes.push(subChange);
        }
    }
    
    return changes;
};



/*!
 *  This function calculate the differences between two strings:
 *  it counts the first n=commonStart characters which are the same
 *  and the last n=commonEnd characters which are te same.
 *  Returns a change objecta telling what to delete from and what to
 *  add to oldStr to make it equal to newStr.
 */
function stringDiff (oldStr,newStr) {

    if (oldStr === newStr) return null;

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
    var oldSubString = "";
    if (oldStr.length !== commonStart + commonEnd) {
        oldSubString = oldStr.slice(commonStart, oldStr.length - commonEnd);
    }

    // Compute the added sub-string
    var newSubString = ""
    if (newStr.length !== commonStart + commonEnd) {
        newSubString = newStr.slice(commonStart, newStr.length - commonEnd);
    }

    return [new Change(commonStart, oldSubString, newSubString)];
}





/**
 *  ## function assign(dest, orig)
 *
 *  Applies to `dest` the minimum number of changes required to make it deeply equal `orig`.
 *  After running this function successfully: `equal(dest,orig)` will return true.
 *  
 *  Returns the array of applied [changes][Change].
 */
function assign (dest, orig) {
    var changes = diff(dest, orig);
    if (changes.length === 1 && changes[0].path.length === 0) {
        throw new TypeError();
    }

    var appliedChanges = [];
    for (let change of changes) {
        let appliedChange = change.apply(dest);
        appliedChanges.push(appliedChange);
    }
    return appliedChanges;
}





/*!
 *  Module exports
 */

exports.Path = Path;

exports.equal = equal;
exports.$equal = $equal;

exports.copy = copy;
exports.$copy = $copy;

exports.Change = Change;
exports.$change = $change;

exports.diff = diff;
exports.$diff = $diff;

exports.assign = assign;




// DOCUMENTATION LINKS

/**
 *  [Path]: #class-path
 *  [Change]: #class-change
 *  [equal]: #function-equalobj1-obj2
 *  [copy]: #function-copyobj
 *  [diff]: #function-diffoldobj-newobj
 *  [assign]: #function-assigndest-orig

 *  [olojs.observable]: ./docs/observable.md
 *  [ObservableObject]: ./docs/observable.md#class-observableobject
 *  [ObservableArray]: ./docs/observable.md#class-observablearray
 *  [Observable]: ./docs/observable.md#function-observableobj
 *  [Subscription]: ./docs/observable.md#class-subscription

 *  [olojs.remote]: ./docs/remote.md
 *  [Hub]: ./docs/remote.md#class-hub
 */
},{}],3:[function(require,module,exports){
/*!
 *  MIT License
 * 
 *  Copyright (c) 2016 Marcello Del Buono (m.delbuono@gmail.com)
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */



/**
 *  # Module `olojs.observable`
 *
 *  This module provides classes that produce observable object instances.
 *
 *  An observable object intercepts all the change attempts and
 *  1) allows to autorize or deny them,
 *  2) notifies the changes through registered callbacks.
 *
 */



/*!
 *  Imports
 */
var deep = require("./deep");
var Path = deep.Path;
var Change = deep.Change;

var proxy = require("./proxy");
var ProxyObject = proxy.ProxyObject;



/*!
 *  Symbol used as keys of the ObservableObject properties and methods
 *  Using symbols avoids conflicts with user defined properties.
 */
var $data = Symbol("olojs.observable.$data");
var $parents = Symbol("olojs.observable.$parents");
var $callbacks = Symbol("olojs.observable.$callbacks");

var $dispatch = Symbol("olojs.observable.$dispatch");
var $subscribe = Symbol("olojs.observable.$subscribe");
var $unsubscribe = Symbol("olojs.observable.$unsubscribe");

var $auth = Symbol("olojs.observable.$auth");



/**
 *  ##class ObservableObject
 *
 *  This class generates a proxy to a generic javascript object that intercepts
 *  the change operations and:
 *
 *  1) Before applying the change, calls the `this[observable.$auth]` method in
 *  order to check if the operation is autorized or forbidden.
 *
 *  2) After applyind the change, call the registerted callbacks, passing the
 *  a [Change][] object.
 *
 *  The constructor accepts an hash with the initial properties of the instance.
 *  If any of the properties are objects, they will be converted to ObservableObjects.
 *
 *  Example:
 *
 *  ```js
 *  var oobj = new ObservableObject({x:10, y:20, z:30})
 *
 *  var x = obj.x       // ->   x === 10
 *  oobj.y = 22         // ->   oobj.y === 22
 *  delete oobj.z       // ->   oobj.z === undefined
 *
 *  oobj.o = {a:1,b:2}  // ->   oobj.o instanceof ObservableObject
 *  oobj.a = [1,2,3]    // ->   oobj.a instanceof ObservableArray
 *  ```
 *
 *  ### Subscribe to change notifications
 *  In order to register a callback to be called on chages, you use the [Subscription][olojs.observable.Subscription] class.
 *  On every change, including deep changes, the callback will receive a [Change][] object.
 *
 *  ```js
 *  var oobj = new ObservableObject({x:10,y:20,o:{a:1,b:2}});
 *
 *  var subs = new Subscription(oobj, function (change) { 
 *      console.log(JSON.stringify(change)) 
 *  });
 *
 *  oobj.x = 10;        // -> logs: {"path":['x'], "old":10, "new":10}
 *  delete oobj.y;      // -> logs: {"path":['y'], "old":20}
 *  oobj.z = 30;        // -> logs: {"path":['z'], "new":30}
 *  oobj.o.a = 1.1;     // -> logs: {"path":['o','a'], "old":1, "new":1.1}
 *  ```
 *
 *  ### Auth
 *  By default all the changes are allowed. In order to implement your access control,
 *  you need to extend the ObservableObject class and provide your own `[$auth]` method.
 *  
 *  Before each change, the `[$auth]` method will be called with the `Change` object as
 *  parameter. When the method returns `true`, the operation goes through. When the
 *  method returns `false`, the access is deinied and an error message thrown.
 *
 *  Example:
 *
 *  ```js
 *  import {ObservableObject, $auth} from "olojs"  
 *
 *  class MyObsObj extends ObservableObject {
 *
 *      [$auth] (change) {
 *          return String(change.path) !== "b"
 *      }
 *           
 *  }
 *
 *  var oobj = new MyObsObj({a:1, b:2});
 *
 *  oobj.a = 10;    // -> oobj.a === 10
 *  oobj.b = 20;    // -> Error!
 *  ```
 */
class ObservableObject extends ProxyObject {

    [proxy.$init] (data={}) {

        // this map stores this object parents as follows:
        // // if obj[key] === this, then this[$parents].get(obj) === key        
        this[$parents] = new Map();

        // array of all the callbacks to be called in case of change
        this[$callbacks] = [];

        // object that holds the observed properties
        this[$data] = new data.constructor();
        for (let key in data) {
            this[proxy.$set](key, data[key]);
        }
    }

    // trap for: value = this[key]
    [proxy.$get] (key) {
        return this[$data][key] !== undefined ? this[$data][key] : this[key];
    }

    // trap for: Reflect.ownKeys(this)
    [proxy.$keys] () {
        return Reflect.ownKeys(this[$data]);
    }

    // trap for: key in this
    [proxy.$has] (key) {
        return Reflect.has(this[$data], key);
    }

    // trap for: this[key] = value
    [proxy.$set] (key, value) {
        var change = this[deep.$change](key, this[proxy.$get](key), value);
        return (change !== null);
    }

    // trap for: delete this[key]
    [proxy.$del] (key) {
        var change = this[deep.$change](key, this[proxy.$get](key), undefined);
        return (change !== null);
    }

    // handles property changes
    [deep.$change] (key, oldValue, newValue) {

        // validate the new value
        if (newValue !== undefined) {
            newValue = Observable(newValue) || newValue;
            if (!(newValue instanceof ObservableObject)
                    && !(["string", "number", "boolean"].includes(typeof newValue))
                    && newValue !== null) {
                throw new TypeError("Observable properties can only be Observable, Object, Array, String, Number, Boolean or null")
            }
        }

        // define the change object to be applied to this[$data]
        var requiredChange = new Change(key, oldValue, newValue);

        // varify that the requested change is allowed 
        if (!this[$auth](requiredChange)) throw new Error("Access denied");

        // apply the requested change to the inner data object
        var appliedChange = requiredChange.apply(this[$data]);

        // if the change has been successfully applied ...
        if (appliedChange !== null) {

            // ... update parent-child links
            if (oldValue instanceof ObservableObject) {
                oldValue[$parents].delete(this);
            }
            for (let ckey of Object.keys(this[$data])) {
                if (Array.isArray(this[$data])) ckey = Number(ckey);
                let child = this[$data][ckey];
                if (child instanceof ObservableObject) {
                    child[$parents].set(this, ckey);
                }
            }

            // ... dispatch the change to all the registered callbacks
            this[$dispatch](appliedChange);
        }

        return appliedChange;
    }

    // this method will be called before applying any change
    // if it returns true, the change is allowed
    // if it returns false, the change is rejected and an errero will be thrown
    [$auth] (change) {
        return true;
    }

    // this method calls all the registered callbacks, passing change
    [$dispatch] (change) {

        // prevent recursive dispatching of changes
        let childChange = change._childChange;
        while (childChange !== undefined) {
            if (childChange._dispatchingTo === this) return;
            childChange = childChange._childChange;
        }
        change._dispatchingTo = this;

        // dispatch to subscribers
        for (let callback of this[$callbacks]) {
            callback(change);
        }

        // dispatch to parents
        for (let parent of this[$parents].keys()) {
            let pkey = this[$parents].get(parent);
            var parentChange = new Change([pkey, change.path], change.old, change.new);
            parentChange._childChange = change;
            parent[$dispatch](parentChange);
        }        
    }

    // register a callback
    [$subscribe] (callback) {
        if (typeof callback === "function") {
            this[$callbacks].push(callback);
        }
    }

    // unregister a callback
    [$unsubscribe] (callback) {
        var cbIndex = this[$callbacks].indexOf(callback);
        if (cbIndex !== -1) {
            this[$callbacks].splice(cbIndex, 1);
        }
    }

    // trap for deep.copy(this)
    [deep.$copy] () {
        return deep.copy(this[$data]);
    }

    // trap for deep.diif(this, other)
    [deep.$diff] (other) {
        return deep.diff(this[$data], other);
    }

    // trap for deep.equal(this, other)
    [deep.$equal] (other) {
        return deep.equal(this[$data], other);
    }
}



/**
 *  ## class ObservableArray
 *  
 *  This class generates an [ObservableObject][] that behaves like an Array.
 *  Not all the javascript Array method are implemented yet and some of the 
 *  implemented methods behave a bit differently.
 *
 *  The only changeable properties are the array items:
 *  key-properties are read only.
 */
class ObservableArray extends ObservableObject {

    [proxy.$init] (data=[]) {
        super[proxy.$init](Array.from(data));
    }

    // trap for: value = this[key]
    [proxy.$get] (key) {
        return isIndex(key) ? this[$data][key] : this[key];
    }

    // handles property changes
    [deep.$change] (index, oldValue, newValue) {

        // validate the index
        if (!isIndex(index)) throw new Error("Invalid index");
        if (index < 0 || this.length < index 
                || (index == this.length && newValue === undefined)) {
            throw new Error("Index out of range");
        }

        // apply the change
        return super[deep.$change](Number(index), oldValue, newValue);
    }


    /**
     *  ### ObservableArray.prototype.lenght
     *  Returns the number of items in the array.
     */
    get length () {
        return this[$data].length;
    }


    /**
     *  ### ObservableArray.prototype.pop(index)
     *
     *  Remove the item at the given index and returns its value.
     *  If index is omitted, it will pop the last one.
     *  In the index is out of range, it will throw an error.
     */
    pop (index=this.length-1) {
        var change = this[deep.$change](index, this[proxy.$get](index), undefined);
        return change !== null ? change.old : undefined;
    }

    /**
     *  ### ObservableArray.prototype.push(item, index)
     *
     *  Inserts the new item at the given position.
     *  If index is omitted, it will append the item to the end of the array.
     *  In the index is out of range, it will throw an error.
     */
    push (item, index=this.length) {
        this[deep.$change](index, undefined, item);
    }


    /**
     *  ### ObservableArray.prototype.splice(index, deleteCount, ...items)
     *
     *  In the index is out of range, it will throw an error.
     *  For the rest it works the same as Array.prototype.splice.
     */
    splice (index, deleteCount, ...items) {
        while (deleteCount > 0) {
            delete this[index];
            deleteCount += -1;
        }
        for (let item of items.reverse()) {
            this.push(item, index);
        }
    }


    /**
     *  ### ObservableArray.prototype.includes(item)
     *  Returns true if item is an alement of the observable array.
     */
    includes (item) {
        return this[$data].includes(item);
    }


    /**
     *  ### ObservableArray.prototype.indexOf(item)
     *  Returns the index of the item or -1 if not present.
     */
    indexOf (item) {
        return this[$data].indexOf(item);
    }

    /**
     *  ### Iterability
     *
     *  The observable arry is iterable:
     *
     *  ```js
     *  var oarr = new ObservableArray([1,2,3])
     *  for (let item of oarr) console.log(item)    // -> logs: 1 2 3
     *  ```
     */
    * [Symbol.iterator] () {
        for (let item of this[$data]) yield item;
    }

    /*!
     *  Array methods not yet implemented
     *
     *  concat () {}
     *  copyWithin () {}
     *  entries () {}
     *  every () {}
     *  fill () {}
     *  filter () {}
     *  find () {}
     *  findIndex () {}
     *  forEach () {}
     *  join () {}
     *  keys () {}
     *  lastIndexOf () {}
     *  map () {}
     *  reduce () {}
     *  reduceRight () {}
     *  reverse () {}
     *  shift () {}
     *  slice () {}
     *  some () {}
     *  sort () {}
     *  toLocaleString () {}
     *  toSource () {}
     *  toString () {}
     *  unshift () {}
     *  values () {}
     */

    /*!
     *  Object.prototype.toString.call(this) will return "[object Array]"
     *  This is necessary for the olojs.deep module to treat ObservableArray
     *  instances as arrays.
     */
    get [Symbol.toStringTag] () {
        return "Array";
    }
}



/*!
 *  @function isIndex
 *  @param key 
 *  @returns true if key is an integer or a string representing an integer
 */
function isIndex (key) {
    try {
        return Number.isInteger(Number(key));
    } catch (e) {
        return false;
    }
}



/**
 *  ##function Observable(obj)
 *
 *  This is an utility function. It will return:
 *
 *      * an [ObservableObject][] if obj is a plain object,
 *      * an [ObservableArray][] if obj is a plain array,
 *      * `obj` if it is already an instance of [ObservableObject][]
 */
function Observable (obj) {
    if (obj instanceof ObservableObject) {
        return obj
    } else if (Array.isArray(obj)) {
        return new ObservableArray(obj);
    } else if (typeof obj === "object" && obj !== null) {
        return new ObservableObject(obj);
    } else {
        return null;
    }
}



/**
 *  ##class Subscription
 *
 *  The class subscription accepts an [ObservableObject][] instance and a callback.
 *  It will register the callback for change notificactions.
 *
 *  ```js
 *  var subscrption = new Subscription(observableObject, function (change) {...})
 *  ```
 */
class Subscription {

    constructor (observable, callback) {
        this.observable = observable;
        this.callback = callback;
        this.observable[$subscribe](this.callback);
    }

    /**
     *  ### Subscription.prototype.cancel()
     *  It will cancel the subscription. Once this method is called, the callback
     *  will not receive change notifications anymore.
     */
    cancel () {
        this.observable[$unsubscribe](this.callback);
    }
}



/*!
 *  Exports
 */
exports.ObservableObject = ObservableObject;
exports.ObservableArray = ObservableArray;
exports.Observable = Observable;
exports.Subscription = Subscription;
exports.$auth = $auth;



// DOCUMENTATION LINKS

/**
 *  [olojs.deep]: ./docs/deep.md
 *  [Path]: ./docs/deep.md#class-path
 *  [Change]: ./docs/deep.md#class-change
 *  [equal]: ./docs/deep.md#function-equalobj1-obj2
 *  [copy]: ./docs/deep.md#function-copyobj
 *  [diff]: ./docs/deep.md#function-diffoldobj-newobj
 *  [assign]: ./docs/deep.md#function-assigndest-orig

 *  [ObservableObject]: #class-observableobject
 *  [ObservableArray]: #class-observablearray
 *  [Observable]: #function-observableobj
 *  [Subscription]: #class-subscription

 *  [olojs.remote]: ./docs/remote.md
 *  [Hub]: ./docs/remote.md#class-hub
 */
},{"./deep":2,"./proxy":4}],4:[function(require,module,exports){

var $init  = exports.$init  = Symbol("olojs.deep.$init");
var $proxy = exports.$proxy = Symbol("olojs.deep.$proxy");
var $get   = exports.$get   = Symbol("olojs.deep.$get");
var $has   = exports.$has   = Symbol("olojs.deep.$has");
var $set   = exports.$set   = Symbol("olojs.deep.$set");
var $del   = exports.$del   = Symbol("olojs.deep.$del");
var $keys  = exports.$keys  = Symbol("olojs.deep.$keys");
var $props = exports.$props = Symbol("olojs.deep.$props");


class ProxyObject {

    constructor (...args) {
        this[$proxy] = new Proxy(this, proxyHandler);
        this[$init](...args);
        return this[$proxy];
    }

    [$init] (...args) {}

    [$get] (key) { 
        return Reflect.get(this, key); 
    }

    [$keys] () {
        return Reflect.ownKeys(this);
    }

    [$has] (key) {
        return Reflect.has(this, key);
    }

    [$set] (key, value) {
        return Reflect.set(this, key, value);
    }

    [$del] (key) {
        return Reflect.deleteProperty(this, key);
    }

}

var proxyHandler = {

    //getProtoypeOf: function (target) {},

    //setProtoypeOf: function (target, prototype) {},

    //isExtensible: function (target) {},

    //preventExtensions: function (target) {},

    //getOwnPropertyDescriptor: function (target, key) {},

    //defineProperty: function (target, key, descriptor) {},

    has: function (target, key) {
        return target[$has](key);
    },

    get: function (target, key, proxy) {
        return target[$get](key);
    },

    set: function (target, key, value, proxy) {
        return target[$set](key, value);
    },

    deleteProperty: function (target, key) {
        return target[$del](key);
    },

    ownKeys: function (target) {
        return target[$keys]();
    },

    //apply: function (target, thisArg, argumentList) {},

    //construct: function (target, argumentList, newTarget) {},
}



exports.ProxyObject = ProxyObject;

},{}]},{},[1]);
