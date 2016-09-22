
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
        target[$set](key, value);
        return true;
    },

    deleteProperty: function (target, key) {
        target[$del](key);
        return true;
    },

    ownKeys: function (target) {
        return target[$keys]();
    },

    //apply: function (target, thisArg, argumentList) {},

    //construct: function (target, argumentList, newTarget) {},
}



exports.ProxyObject = ProxyObject;
