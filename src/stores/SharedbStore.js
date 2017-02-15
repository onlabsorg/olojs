

import ShareDB from "sharedb/lib/client/index";
import Path from "../Path";
import utils from "../utils";
import AbstractStore from "./AbstractStore";


class Connection {

    constructor (url) {
        this.url = url;
    }

    open () {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(this.url);
            this.socket.onopen = () => {
                this.sharedb = new ShareDB.Connection(this.socket);
                resolve();
            }
            this.socket.onerror = reject;
        });
    }

    getDocument (id) {
        return new Promise ((resolve, reject) => {
            var doc = this.sharedb.get("documents", id);
            doc.subscribe((err) => {
                if (err) {
                    reject(err);
                } 
                else if (doc.type === null) {
                    doc.create({}, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(doc);
                        }
                    });
                } 
                else {
                    resolve(doc);
                }
            });
        });
    }

    close () {
        return new Promise((resolve, reject) => {
            this.socket.onclose = resolve;
            this.socket.onerror = reject;
            this.socket.close();
        });
    }
}


class SharedbStore extends AbstractStore {

    async connect () {
        this.connection = new Connection("ws://"+this.host);
        await this.connection.open();
        await super.connect();
    }

    async disconnect () {
        await super.disconnect();
        await this.connection.close();
    }

    static get protocol () {
        return "sharedb:";
    }

    static get Document () {
        return Document;
    }
}


class Document extends AbstractStore.Document {

    async open () {
        this.shareDoc = await this.store.connection.getDocument(this.id);
        this.shareDoc.on('op', (ops, source) => {
            for (let op of ops) {
                this.dispatchOperation(op);
            }
        });
        await super.open();
    }

    get data () {
        return this.shareDoc.data;
    }

    dispatchOperation (op) {
        var path = op.p.slice(0, op.p.length-1);
        var key = op.p[op.p.length-1];

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
            var removed = [op.ld];
            var inserted = [op.li];
        }

        // insertListItem change
        if (!('ld' in op) && 'li' in op) {
            var removed = [];
            var inserted = [op.li];
        }

        // removeListItem change
        if ('ld' in op && !('li' in op)) {
            var removed = [op.ld];
            var inserted = [];
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

        super.dispatch(path, key, removed, inserted);
    }

    get (path) {
        path = Path.from(path);
        return path.lookup(this.data);
    }

    type (path) {
        var value = this.get(path);
        if (utils.isPlainObject(value)) return "dict";
        if (utils.isArray(value)) return "list";
        if (utils.isString(value)) return "text";
        if (utils.isNumber(value)) return "numb";
        if (utils.isBoolean(value)) return "bool";
        return "none";
    }

    getDictKeys (path) {
        var dict = this.get(path);
        return Object.keys(dict);
    }

    setDictItem (path, key, newValue) {
        var op = {};
        op.p = Array.from(new Path(path, key));
        var oldValue = this.get(op.p);
        if (oldValue !== null) op.od = oldValue;
        op.oi = newValue;
        this.shareDoc.submitOp(op);
    }

    removeDictItem (path, key) {
        var op = {};
        op.p = Array.from(new Path(path, key));
        op.od = this.get(op.p);
        if (op.od !== null) {
            this.shareDoc.submitOp(op);
        }            
    }

    getListSize (path) {
        var list = this.get(path);
        return list.length;            
    }

    setListItem (path, index, newItem) {
        var op = {};
        op.p = Array.from(new Path(path, index));
        op.ld = this.get(op.p);
        op.li = newItem;
        this.shareDoc.submitOp(op);            
    }

    insertListItems (path, index, ...newItems) {
        newItems.reverse();
        for (let newItem of newItems) {
            let op = {};
            op.p = Array.from(new Path(path, index));
            op.li = newItem;
            this.shareDoc.submitOp(op);            
        }
    }

    removeListItems (path, index, count) {
        var op_path = Array.from(new Path(path, index));
        for (let i=0; i<count; i++) {
            let op = {};
            op.p = op_path;
            op.ld = this.get(op_path);
            this.shareDoc.submitOp(op);            
        }            
    } 

    getTextSize (path) {
        var text = this.get(path);
        return text.length;            
    }

    insertText (path, index, subString) {
        var op = {};
        op.p = Array.from(new Path(path)).concat(index);
        op.si = subString;
        this.shareDoc.submitOp(op);            
    }

    removeText (path, index, count) {
        if (!(path instanceof Path)) path = new Path(path);
        var parent = this.get(path.parent);
        var key = path.leaf;

        var text = this.get(path);
        var subString = text.slice(index, index+count);

        var op = {};
        op.p = Array.from(new Path(path)).concat(index);
        op.sd = subString;
        this.shareDoc.submitOp(op);            
    }

    async close () {
        this.shareDoc.destroy();
        await super.close();
    }
}


export default SharedbStore;
