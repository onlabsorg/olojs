/**
 *  # olojs.LocalStore module.
 *  - **Version:** 0.2.x
 *  - **Author:** Marcello Del Buono <m.delbuono@onlabs.org>
 *  - **License:** MIT
 */



const MemoryStore = require("./MemoryStore");


/**
 *  ## LocalStore class
 *  Implements the [Store](./Store.md) interface for a [localStorage](https://developer.mozilla.org/it/docs/Web/API/Window/localStorage)
 *  backend.
 */
class LocalStore extends MemoryStore {

    /**
     *  ### new LocalStore(name) - constructor
     *  ###### Parameters
     *  - `name` : the name of the locla store
     */
    constructor (name) {
        super();
        this._name = name;
        this._data = JSON.parse(localStorage.getItem(this._name));
        if (typeof this._data !== "object" || this._data === null) {
            this._data = {};
            this._update();
        }
    }

    _update () {
        localStorage.setItem(this._name, JSON.stringify(this._data));
    }
}


LocalStore.Document = class extends MemoryStore.Document {

    async __open () {
        await super.__open();
        this.store._update();
    }

    _dispatch (path, removed, inserted) {
        this.store._update();
        super._dispatch(path, removed, inserted);
    }
}


module.exports = LocalStore;
