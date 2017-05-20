/**
 *  # olojs.OlodbStore module.
 *  - **Version:** 0.2.x
 *  - **Author:** Marcello Del Buono <m.delbuono@onlabs.org>
 *  - **License:** MIT
 */

const Store = require("./Store");
const Path = require("./Path");
const utils = require("./utils");
const roles = require("./roles");

const ShareDB = require("sharedb/lib/client/index");


/**
 *  ## OlodbStore class
 *  Implements the [Store](./Store) interface for a [ShareDB](https://github.com/share/sharedb)
 *  backend.
 */
class OlodbStore extends Store {

    /**
     *  ### new OlodbStore(url) - constructor
     *  ###### Parameters
     *  - `url` : the websocket url of the remote olodb server
     */
    constructor (host) {
        super();
        this.host = host;
    }

    __connect (credentials) {
        return new Promise((resolve, reject) => {
            var url = `${this.host}?auth=${credentials}`;
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

    __connected () {
        return this._socket && this._socket.readyState === 1;
    }

    __disconnect () {
        return new Promise((resolve, reject) => {
            this._socket.onclose = resolve;
            this._socket.onerror = reject;
            this._socket.close();
        });
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
}


OlodbStore.Document = class extends Store.Document {

    async __init () {
        const parsedId = this.id.split(".");
        this._collection = parsedId[0];
        this._docName = parsedId[1];
        this._userRole = await this.store._call('getUserRole', this._collection, this._docName);
    }

    async __open () {
        this._assertReadable('/');

        this._shareDoc = this.store._sharedb.get(this._collection, this._docName);

        await new Promise ((resolve, reject) => {
            this._shareDoc.subscribe((err) => {
                if (err) reject(err); else resolve();
            });
        });

        if (this._shareDoc.type === null) {
            this._assertWritable('/');
            await new Promise((resolve, reject) => {
                this._shareDoc.create(this.constructor.template, (err) => {
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

    }

    __getUserRole () {
        return this._userRole;
    }

    __getItemValue (path) {
        return path.lookup(this._shareDoc.data);
    }

    __setDictItem (dictPath, key, newValue) {
        const itemPath = new Path(dictPath, key);
        const oldValue = this.__getItemValue(itemPath);
        this._shareDoc.submitOp({
            p  : Array.from(itemPath),
            od : oldValue === null ? undefined : oldValue,
            oi : newValue
        });
    }

    __removeDictItem (dictPath, key) {
        const itemPath = new Path(dictPath, key);
        const oldValue = this.__getItemValue(itemPath);
        if (oldValue !== null) this._shareDoc.submitOp({
            p  : Array.from(itemPath),
            od : oldValue
        });
    }

    __setListItem (listPath, index, newItem) {
        var itemPath = new Path(listPath, index);
        this._shareDoc.submitOp({
            p  : Array.from(itemPath),
            ld : this.__getItemValue(itemPath),
            li : newItem
        });
    }

    __insertListItem (listPath, index, newItem) {
        var itemPath = new Path(listPath, index);
        this._shareDoc.submitOp({
            p  : Array.from(itemPath),
            li : newItem
        });
    }

    __removeListItem (listPath, index) {
        var itemPath = new Path(listPath, index);
        this._shareDoc.submitOp({
            p  : Array.from(itemPath),
            ld : this.__getItemValue(itemPath)
        });
    }

    __insertTextString (textPath, index, string) {
        this._shareDoc.submitOp({
            p  : textPath.concat(index),
            si : string
        });
    }

    __removeTextString (textPath, index, count) {
        const parent = this.__getItemValue(textPath.parent);
        const key = textPath.leaf;
        const text = parent[key];
        const string = text.slice(index, index+count);
        this._shareDoc.submitOp({
            p  : textPath.concat(index),
            sd : string
        });
    }

    async __close () {
        await new Promise ((resolve, reject) => {
            this._shareDoc.destroy((err) => {
                if (err) reject(err); else resolve();
            });
        });
    }

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

        this._dispatch(path, removed, inserted);
    }
}


module.exports = OlodbStore;
