
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


class OlodbBackend extends AbstractBackend {

    connect (credentials) {
        return new Promise((resolve, reject) => {
            var url = `${this.constructor._protocol}://${this.host}?auth=${credentials}`;
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

    disconnect () {
        return new Promise((resolve, reject) => {
            this._socket.onclose = resolve;
            this._socket.onerror = reject;
            this._socket.close();
        });
    }

    static get _protocol () {
        return "ws";
    }
}

OlodbBackend.Document = class extends AbstractBackend.Document {

    async open () {
        this._shareDoc = this.store._sharedb.get(this.collection, this.id);
        this._permissions = await this.store._call('getUserRights', this.collection, this.id);

        this._assertReadable();

        await new Promise ((resolve, reject) => {
            this._shareDoc.subscribe((err) => {
                if (err) reject(err); else resolve();
            });
        });

        if (this._shareDoc.type === null) {
            this._assertWritable();
            await new Promise((resolve, reject) => {
                this._shareDoc.create({}, (err) => {
                    if (err) reject(err); else resolve();
                });
            });
        }

        this._lastOps = null;
        this._shareDoc.on('op', (ops, source) => {
            if (utils.isEqual(ops, this._lastOps)) return;
            this._lastOps = ops;
            for (let op of ops) {
                this._dispatchOperation(op);
            }
        });

        this._isOpen = true;
    }

    get isOpen () {
        return this._isOpen;
    }

    get readable () {
        return this._permissions >= READ;
    }

    get writable () {
        return this._permissions >= WRITE;
    }

    getItemValue (path='') {
        this._assertOpen()._assertReadable();
        path = Path.from(path);
        return path.lookup(this._shareDoc.data);
    }

    setDictItem (path, key, newValue) {
        this._assertOpen()._assertWritable();
        var itemPath = new Path(path, key);
        var oldValue = this.getItemValue(itemPath);
        this._shareDoc.submitOp({
            p  : Array.from(itemPath),
            od : oldValue === null ? undefined : oldValue,
            oi : newValue
        });
    }

    removeDictItem (path, key) {
        this._assertOpen()._assertWritable();
        var itemPath = new Path(path, key);
        var oldValue = this.getItemValue(itemPath);
        if (oldValue !== null) this._shareDoc.submitOp({
            p  : Array.from(itemPath),
            od : oldValue
        });
    }

    setListItem (path, index, newItem) {
        this._assertOpen()._assertWritable();
        var itemPath = new Path(path, index);
        this._shareDoc.submitOp({
            p  : Array.from(itemPath),
            ld : this.getItemValue(itemPath),
            li : newItem
        });
    }

    insertListItem (path, index, newItem) {
        this._assertOpen()._assertWritable();
        var itemPath = new Path(path, index);
        this._shareDoc.submitOp({
            p  : Array.from(itemPath),
            li : newItem
        });
    }

    removeListItem (path, index) {
        this._assertOpen()._assertWritable();
        var itemPath = new Path(path, index);
        this._shareDoc.submitOp({
            p  : Array.from(itemPath),
            ld : this.getItemValue(itemPath)
        });
    }

    insertTextString (path, index, string) {
        this._assertOpen()._assertWritable();
        var path = Path.from(path);
        this._shareDoc.submitOp({
            p  : [path, index],
            si : string
        });
    }

    removeTextString (path, index, count) {
        this._assertOpen()._assertWritable();
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
        this._isOpen = false;
    }
}



OlodbBackend.Secure = class extends OlodbBackend {

    static get _protocol () {
        return "wss";
    }
}

OlodbBackend.Secure.Document = OlodbBackend.Document



module.exports = OlodbBackend;
