
const MemoryStore = require("./MemoryStore");


class LocalStore extends MemoryStore {

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
