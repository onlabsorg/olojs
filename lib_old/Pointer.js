

class Pointer {

    constructor (...args) {
        this.init(...args);
        return new Proxy(this, pointerHandler);
    }

    init (...args) {}

    get target () {}
}


const pointerHandler = {

    getPrototypeOf: (pointer) => Reflect.getPrototypeOf(pointer.target),

    setPrototypeOf: (pointer, prototype) => Reflect.setPrototypeOf(pointer.target, prototype),

    isExtensible: (pointer) => Reflect.isExtensible(pointer.target),

    preventExtensions: (pointer) => Reflect.preventExtensions(pointer.target),

    getOwnPropertyDescriptor: (pointer, property) => Reflect.getOwnPropertyDescriptor(pointer.target, property),

    defineProperty: (pointer, property, descriptor) => Reflect.defineProperty(pointer.target, property, descriptor),

    has: (pointer, property) => Reflect.has(pointer.target, property),

    get: (pointer, property, receiver) => Reflect.get(pointer.target, property),

    set: (pointer, property, value, receiver) => Reflect.set(pointer.target, property, value),

    deleteProperty: (pointer, property) => Reflect.deleteProperty(pointer.target, property),

    ownKeys: (pointer) => Reflect.ownKeys(pointer.target),
}


module.exports = Pointer;