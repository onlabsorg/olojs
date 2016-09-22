/**
 *  This module provides classes that produce observable object instances.
 *
 *  An observable object intercepts all the change attempts and  
 *  1) allows to autorize or deny them,  
 *  2) notifies the changes to registered callbacks.  
 */

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

var $validate = Symbol("olojs.observable.$validate");





/*!
 *  Base abstract class for observable objects
 */
class ObservableContainer extends ProxyObject {

    [proxy.$init] () {

        // this map stores this object parents as follows:
        // - if obj is a parent of this (obj[key] === this), 
        // - then this[$parents] maps obj to key 
        this[$parents] = new Map();

        // array of all the callbacks to be called in case of change
        this[$callbacks] = [];

        // record containing the actual data. To be defined by the extended classes.
        this[$data] = null;
    }

    // validates the new value and converts objects in observable objects
    [$validate] (value) {
        var newValue = Observable(value) || value;

        var valid = newValue instanceof ObservableContainer ||
                    ["string", "number", "boolean"].includes(typeof newValue) ||
                    newValue === null;
                    
        if (!valid) {
            throw new TypeError("Observable properties can only be Observable, Object, Array, String, Number, Boolean or null")
        } else {
            return newValue;            
        }
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
 *  # class ObservableObject
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
 *  ### Subscription to change notifications
 *  In order to register a callback to be called on chages, you use the [Subscription][] class.
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
 *  By default it is always allowed to delete a key and it is allowed to set a key value
 *  only to primitive types, objects, arrays or null.  
 *  In order to define additional restrictions, you need to overwrite the `set` and `del` traps.
 *    
 *  Example:
 *
 *  ```js
 *  class MyObsObj extends olojs.observable.ObservableObject {
 *
 *      [olojs.observable.$set] (key, value) {
 *
 *          // here you can deny access by throwing an exception.
 *          // for example:
 *          if (key === "b") throw new Error("Property b is read-only");       
 *
 *          super[olojs.observable.$set](key,value);
 *      }
 *           
 *      [olojs.observable.$del] (key) {
 *
 *          // here you can deny access by throwing an exception.
 *          // for example:
 *          if (key === "c") throw new Error("Property c cannot be removed.");       
 *
 *          super[olojs.observable.$det](key);
 *      }
 *
 *  }
 *
 *  var oobj = new MyObsObj({a:1, b:2});
 *
 *  oobj.a = 10;    // -> oobj.a === 10
 *  oobj.b = 20;    // -> Error!
 *
 *  delete obj.a;   // -> oobj.a === undefined
 *  delete oobj.c;  // -> Error!
 *  ```
 */
class ObservableObject extends ObservableContainer {

    [proxy.$init] (data={}) {

        super[proxy.$init]();

        // object that holds the observed properties
        this[$data] = {};
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
        var newValue = this[$validate](value);
        var oldValue = this[proxy.$get](key);

        // if there is a change ...
        if (!deep.equal(oldValue, newValue)) {
            this[$data][key] = newValue;

            // ... update parent-child links
            if (oldValue instanceof ObservableContainer) {
                oldValue[$parents].delete(this);
            }
            if (newValue instanceof ObservableContainer) {
                newValue[$parents].set(this, key);
            }

            // ... dispatch the change to the observers
            this[$dispatch](new Change(key, oldValue, newValue));
        }
    }

    // trap for: delete this[key]
    [proxy.$del] (key) {
        var oldValue = this[proxy.$get](key);
        if (oldValue !== undefined) {
            delete this[$data][key];

            // ... update parent-child links
            if (oldValue instanceof ObservableContainer) {
                oldValue[$parents].delete(this);
            }

            // ... dispatch the change to the observers
            this[$dispatch](new Change(key, oldValue, undefined));            
        }
    }
}



/**
 *  # class ObservableArray
 *  
 *  This class generates an [ObservableObject][] that behaves like an Array.  
 *    
 *  Not all the javascript Array method are implemented yet and some of the 
 *  implemented methods behave a bit differently.  
 *    
 *  The only changeable properties are the array items:
 *  key-properties are read only.
 */
class ObservableArray extends ObservableContainer {

    [proxy.$init] (data=[]) {
        super[proxy.$init]();
        this[$data] = [];
        for (let item of data) {
            this.push(item);
        }
    }

    // trap for: value = this[key]
    [proxy.$get] (key) {
        return isIndex(key) ? this[$data][key] : this[key];
    }

    // trap for: this[index] = value
    [proxy.$set] (index, value) {
        if (!isIndex(index)) throw new Error("Invalid index");
        if (index < 0 || this.length < index) throw new Error("Index out of range");
        return ObservableObject.prototype[proxy.$set].call(this, Number(index), value);
    }

    // trap for: delete this[index]
    [proxy.$del] (index) {
        this.pop(index);
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
        if (!isIndex(index)) throw new Error("Invalid index");
        if (index < 0 || this.length <= index) throw new Error("Index out of range");

        var oldValue = this[proxy.$get](index);

        this[$data].splice(index, 1);

        // update parent-child links
        if (oldValue instanceof ObservableContainer) {
            oldValue[$parents].delete(this);
        }
        for (let i=index; i<this.lenght; i++) {
            let child = this[proxy.$get][i];
            if (child instanceof ObservableContainer) {
                child[$parents].set(this, i);
            }
        }

        this[$dispatch](new Change(Number(index), oldValue, undefined));

        return oldValue;
    }

    /**
     *  ### ObservableArray.prototype.push(item, index)
     *
     *  Inserts the new item at the given position.
     *  If index is omitted, it will append the item to the end of the array.
     *  In the index is out of range, it will throw an error.
     */
    push (item, index=this.length) {
        if (!isIndex(index)) throw new Error("Invalid index");
        if (index < 0 || this.length < index) throw new Error("Index out of range");

        var newItem = this[$validate](item);

        this[$data].splice(index, 0, newItem);

        // update parent-child links
        if (newItem instanceof ObservableContainer) {
            newItem[$parents].set(this, index);
        }
        for (let i=index; i<this.lenght; i++) {
            let child = this[proxy.$get][i];
            if (child instanceof ObservableContainer) {
                child[$parents].set(this, i);
            }
        }

        // ... dispatch the change to the observers
        this[$dispatch](new Change(Number(index), undefined, newItem));
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
 *  # function Observable(obj)
 *  
 *  This is an utility function. It will return:  
 *    
 *  * an [ObservableObject][] if obj is a plain object,
 *  * an [ObservableArray][] if obj is a plain array,
 *  * `obj` if it is already an instance of [ObservableObject][]  
 *     
 */
function Observable (obj) {
    if (obj instanceof ObservableContainer) {
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
 *  # class Subscription
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
exports.$init = proxy.$init;
exports.$get = proxy.$get;
exports.$set = proxy.$set;
exports.$del = proxy.$del;



// DOCUMENTATION LINKS

/**
 *  [olojs.deep]: ./olojs.deep  
 *  [Path]: ./olojs.deep#class-path  
 *  [Change]: ./olojs.deep#class-change  
 *  [equal]: ./olojs.deep#function-equalobj1-obj2  
 *  [copy]: ./olojs.deep#function-copyobj  
 *  [diff]: ./olojs.deep#function-diffoldobj-newobj  
 *  [assign]: ./olojs.deep#function-assigndest-orig  
 *    
 *  [ObservableObject]: #class-observableobject  
 *  [ObservableArray]: #class-observablearray  
 *  [Observable]: #function-observableobj  
 *  [Subscription]: #class-subscription  
 *    
 */
