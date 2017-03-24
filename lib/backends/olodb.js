
const AbstractBackend = require("./abstract");
const Path = require("../Path");
const utils = require("../utils");
const errors = require("../errors");

const ShareDB = require("sharedb/lib/client/index");


// document access permission levels
const rights = require("../rights");
const NONE  = rights.NONE;
const READ  = rights.READ;
const WRITE = rights.WRITE;


class Store extends AbstractBackend.Store {

    constructor (url) {
        super();
        this._url = url;
        this._documentCache = {}
    }

    connect (credentials) {
        return new Promise((resolve, reject) => {
            var url = `${this._url}?auth=${credentials}`;
            this._socket = new WebSocket(url);

            this._socket.onopen = () => {
                this._sharedb = new ShareDB.Connection(this._socket);

                this._pendignRequests = {};
                this._sharedbMessageHandler = this._socket.onmessage;
                this._socket.onmessage = (msg) => this._handleMessage(msg);

                this._call('getUserName')
                .then((userName) => {
                    this._userName = userName;
                })
                .then(resolve)
                .catch(reject);
            }

            this._socket.onerror = reject;
        });
    }

    get connected () {
        return this._socket && this._socket.readyState === 1;
    }

    _call (method, ...args) {
        return new Promise((resolve, reject) => {
            var rid = utils.uuid4();
            var msg = JSON.stringify({rid:rid, method:method, args:args});
            this._pendignRequests[rid] = (res) => resolve(res);
            this._socket.send(msg);
        });
    }

    _handleMessage (msg) {
        var msgData = JSON.parse(msg.data);
        if (msgData.rid) {
            var callback = this._pendignRequests[msgData.rid];
            if (callback) {
                callback(msgData.res);
                delete this._pendignRequests[msgData.rid];
            }
        }
        else {
            this._sharedbMessageHandler(msg);
        }
    }

    getDocument (collection, id) {
        var path = `${collection}/${id}`;
        var doc = this._documentCache[path];

        if (!doc) {
            doc = new Document(this, collection, id);
            this._documentCache[path] = doc;
        }

        return doc;
    }

    disconnect () {
        return new Promise((resolve, reject) => {
            this._socket.onclose = resolve;
            this._socket.onerror = reject;
            this._socket.close();
        });
    }
}


class Document extends AbstractBackend.Document {

    async open () {
        this._shareDoc = this.store._sharedb.get(this.collection, this.id);
        this._permissions = await this.store._call('getUserRights', this.collection, this.id);

        if (!this.readable) throw new errors.ReadPermissionError(this.collection, this.id);

        await new Promise ((resolve, reject) => {
            this._shareDoc.subscribe((err) => {
                if (err) reject(err); else resolve();
            });
        });

        if (this._shareDoc.type === null) {
            if (!this.writable) throw new errors.WritePermissionError(this.collection, this.id);
            await new Promise((resolve, reject) => {
                this._shareDoc.create({}, (err) => {
                    if (err) reject(err); else resolve();
                });
            });
        }

        this._shareDoc.on('op', (ops, source) => {
            for (let op of ops) {
                this._dispatchOperation(op);
            }
        });
    }

    get readable () {
        return this._permissions >= READ;
    }

    get writable () {
        return this._permissions >= WRITE;
    }

    getItemValue (path='') {
        if (!this.readable) throw new errors.ReadPermissionError(this.collection, this.id);
        path = Path.from(path);
        return path.lookup(this._shareDoc.data);
    }

    setDictItem (path, key, newValue) {
        if (!this.writable) throw new errors.WritePermissionError(this.collection, this.id);
        var itemPath = new Path(path, key);
        var oldValue = this.getItemValue(itemPath);
        this._shareDoc.submitOp({
            p  : Array.from(itemPath),
            od : oldValue === null ? undefined : oldValue,
            oi : newValue
        });
    }

    removeDictItem (path, key) {
        if (!this.writable) throw new errors.WritePermissionError(this.collection, this.id);
        var itemPath = new Path(path, key);
        var oldValue = this.getItemValue(itemPath);
        if (oldValue !== null) this._shareDoc.submitOp({
            p  : Array.from(itemPath),
            od : oldValue
        });
    }

    setListItem (path, index, newItem) {
        if (!this.writable) throw new errors.WritePermissionError(this.collection, this.id);
        var itemPath = new Path(path, index);
        this._shareDoc.submitOp({
            p  : Array.from(itemPath),
            ld : this.getItemValue(itemPath),
            li : newItem
        });
    }

    insertListItem (path, index, newItem) {
        if (!this.writable) throw new errors.WritePermissionError(this.collection, this.id);
        var itemPath = new Path(path, index);
        this._shareDoc.submitOp({
            p  : Array.from(itemPath),
            li : newItem
        });
    }

    removeListItem (path, index) {
        if (!this.writable) throw new errors.WritePermissionError(this.collection, this.id);
        var itemPath = new Path(path, index);
        this._shareDoc.submitOp({
            p  : Array.from(itemPath),
            ld : this.getItemValue(itemPath)
        });
    }

    insertTextString (path, index, string) {
        if (!this.writable) throw new errors.WritePermissionError(this.collection, this.id);
        var path = Path.from(path);
        this._shareDoc.submitOp({
            p  : [path, index],
            si : string
        });
    }

    removeTextString (path, index, count) {
        if (!this.writable) throw new errors.WritePermissionError(this.collection, this.id);
        path = Path.from(path);

        var parent = this.getItemValue(path.parent);
        var key = path.leaf;

        var text = parent[key];
        var string = text.slice(index, index+count);

        this._shareDoc.submitOp({
            p  : [path, index],
            sd : string
        });
    }

    changeCallback (path, removed, inserted) {}

    _dispatchOperation (op) {
        var path = Path.from(op.p);

        // setDictItem change
        if ('od' in op && 'oi' in op) {
            var removed = op.od;
            var inserted = op.oi;
        }

        // setDictItem change
        else if (!('od' in op) && 'oi' in op) {
            var removed = null;
            var inserted = op.oi;
        }

        // removeDictItem change
        else if ('od' in op && !('oi' in op)) {
            var removed = op.od;
            var inserted = null;
        }

        // setListItem change
        if ('ld' in op && 'li' in op) {
            var removed = op.ld;
            var inserted = op.li;
        }

        // insertListItem change
        if (!('ld' in op) && 'li' in op) {
            var removed = null;
            var inserted = op.li;
        }

        // removeListItem change
        if ('ld' in op && !('li' in op)) {
            var removed = op.ld;
            var inserted = null;
        }

        // insertText change
        if ('si' in op) {
            var removed = "";
            var inserted = op.si;
        }

        // removeText change
        if ('sd' in op) {
            var removed = op.sd;
            var inserted = "";
        }

        this.changeCallback(path, removed, inserted);
    }

    async close () {
        if (this._shareDoc) {
            this._shareDoc.destroy();
            await new Promise ((resolve, reject) => {
                this._shareDoc.whenNothingPending((err) => {
                    if (err) reject(err); else resolve();
                });
            });
            delete this._shareDoc;
        }
        this._permissions = NONE;
    }
}


exports.Store = Store;
exports.Document = Document;
