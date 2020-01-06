const Path = require("path");
const document = require("./document");


class Store {
    
    async read (path) {
        return "";
    }
    
    async write (path, source) {
        throw new Error(`Write operation not defined on path ${path}`);
    }
    
    async load (path) {
        const docId = this.constructor.DocId.parse(path);
        const source = await this.read(String(docId));
        return new this.constructor.Document(this, docId, source);
    }
    
    static get Document () {
        return Document;
    }
    
    static get DocId () {
        return DocId;
    }
}


class DocId {
    
    constructor (path) {
        this.path = Path.normalize(String(path));
    }
    
    resolve (subPath) {
        return new this.constructor(Path.resolve(Path.dirname(this.path), subPath));
    }
    
    toString () {
        return this.path;
    }
    
    toNamespace () {
        return {
            path: this.path
        }
    }
    
    static parse (id) {
        return id instanceof this ? id : new this(id);
    }
}


class Document {
    
    constructor (store, path, source) {
        this.store = store;
        this.id = store.constructor.DocId.parse(path);
        this.source = source;
    }
    
    get source () {
        return this._source;
    }
    
    set source (value) {
        const source = String(value);
        this._render = document.parse(source);
        this._source = source;
    }
    
    async _import (id, globals) {
        const doc = await this.store.load(this.id.resolve(id));
        const context = doc.createContext(globals);
        const content = await doc.render(context);
        return content.toNamespace();        
    }
    
    createContext (globals={}) {
        return document.createContext(globals, {
            "ID":   this.id.toNamespace(),
            "import": id => this._import(id, globals)
        });
    }        
    
    async render (context) {
        return await this._render(context);
    }
    
    async save () {
        return await this.store.write(String(this.id), this.source);
    }    
}


module.exports = Store;
