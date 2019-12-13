const DocId = require("./doc-id");
const document = require("./document");
const NEXT = Symbol("Go to next handler");


class Router {
    
    constructor () {
        this._readHandlers = new Map();
        this._writeHandlers = new Map();
        this._deleteHandlers = new Map();
    }
    
    addReadHandler (routeId, handler) {
        this._readHandlers.set(DocId.parse(routeId), handler);
        return this;
    }
    
    addWriteHandler (routeId, handler) {
        this._writeHandlers.set(DocId.parse(routeId), handler);
        return this;
    }
    
    addDeleteHandler (routeId, handler) {
        this._deleteHandlers.set(DocId.parse(routeId), handler);
        return this;        
    }
    
    mount (routeId, handlers) {
        if (typeof handlers.read === "function") this.addReadHandler(routeId, handlers.read.bind(handlers));
        if (typeof handlers.write === "function") this.addWriteHandler(routeId, handlers.write.bind(handlers));
        if (typeof handlers.delete === "function") this.addDeleteHandler(routeId, handlers.delete.bind(handlers));
        return this;
    }
    
    async read (docId) {
        for (let [routeId, read] of this._readHandlers.entries()) {
            if (routeId.isParentOf(docId)) {
                let docPath = routeId.getSubPath(docId);
                let res = await read(docPath, NEXT);
                if (res !== NEXT) return res;                
            }
        }
        return "";
    }
    
    async write (docId, source) {
        for (let [routeId, write] of this._writeHandlers.entries()) {
            if (routeId.isParentOf(docId)) {
                let docPath = routeId.getSubPath(docId);
                let res = await write(docPath, source, NEXT);
                if (res !== NEXT) return res;                
            }
        }
        throw new Error(`Write operation not defined on path ${docId}`);
    }
    
    async delete (docId) {
        for (let [routeId, del] of this._deleteHandlers.entries()) {
            if (routeId.isParentOf(docId)) {
                let docPath = routeId.getSubPath(docId);
                let res = await del(docPath, NEXT);
                if (res !== NEXT) return res;                
            }
        }
        throw new Error(`Delete operation not defined on path ${docId}`);
    }
    
    async load (docId) {
        docId = DocId.parse(docId);
        const source = await this.read(docId);
        return new Document(this, docId, source);
    }
}


class Document {

    constructor (router, id, source) {
        this._router = router;
        this.id = id;
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
    
    async _import (importeeId, globals) {
        const importee = await this._router.load(this.id.resolve(importeeId));
        const importee_context = importee.createContext(globals);
        const importee_content = await importee.render(importee_context);
        return importee_content.toNamespace();        
    }
    
    createContext (globals={}) {
        return document.createContext(globals, {
            "id":     this.id.toNamespace(),
            "import": id => this._import(id, globals)
        });
    }        
    
    async render (context) {
        return await this._render(context);
    }
    
    async save () {
        return await this._router.write(String(this.id), this.source);
    }
    
    async delete () {
        const retval = await this._router.delete(String(this.id));
        this.source = "";
        return retval;
    }
}


function* match (handlers, path) {
    for (let key of handlers.keys()) {
        if (path.indexOf(key) === 0) {
            yield [handlers.get(key), path.substring(key.length-1)];
        }
    }
}


module.exports = Router;
