
const MemoryBackend = require("./memory");


class LocalBackend extends MemoryBackend {

    constructor (host) {
        super(host);
        console.log(this.host);
        this._data = JSON.parse(localStorage.getItem(this.host));
        if (this._data === undefined) {
            this._data = {};
            this._update();
        }
    }

    _update () {
        localStorage.setItem(this.host, JSON.stringify(this._data));
    }
}


LocalBackend.Document = class extends MemoryBackend.Document {

    async open () {
        await super.open();
        this.store._update();
    }

    changeCallback (path, removed, inserted) {
        this.store._update();
    }
}


module.exports = LocalBackend;
