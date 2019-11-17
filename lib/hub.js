/**
 *  # olojs.store module
 *
 *  This module exports the `Store` class.
 *
 *  - License: MIT
 *  - Author: Marcello Del Buono <m.delbuono@onlabs.org>
 */


const Store = require("./store");
const Path = require("path");
const URI = require("./uri");
const errors = require("./errors");





class Hub {

    constructor (...stores) {
        this._stores = new Map();
        for (let store of stores) {
            this.mount(store);
        }
    }


    mount (store) {
        if (!(store instanceof Store)) {
            throw new Error("Invalid store");
        }
        var storeURI = String(store.uri);
        if (storeURI.slice(-1) !== "/") storeURI += "/";
        this._stores.set(storeURI, store);
    }

    unmount (storeURI) {
        if (storeURI instanceof Store) {
            storeURI = String(storeURI.uri);
        }
        if (storeURI.slice(-1) !== "/") storeURI += "/";
        this._stores.delete(storeURI);
    }
    
    create (uri, data) {
        let {store, path} = this._parseURI(uri);
        let doc = store.create(path, data);
        return this._decorateDocument(doc);
    }
    
    async read (uri) {
        let {store, path} = this._parseURI(uri);
        let doc = await store.read(path);
        return this._decorateDocument(doc);
    }
    
    async write (uri, data) {
        let {store, path} = this._parseURI(uri);
        await store.write(path, data);
    }

    async delete (uri) {
        let {store, path} = this._parseURI(uri);
        await store.delete(path);
    }

    _parseURI (uri) {
        if (!(uri instanceof URI)) uri = new URI(uri);
        uri = String(uri);
        for (let storeURI of this._stores.keys()) {
            if (uri.indexOf(storeURI) === 0) {
                return {
                    store: this._stores.get(storeURI),
                    path: "/" + uri.slice(storeURI.length)
                }
            }
        }
        throw new errors.UnknownStore(uri);
    }    
    
    _decorateDocument (doc) {
        doc.presets.import = (relativeURI, names={}) => this._import(doc.uri, relativeURI, names);
        return doc;        
    }

    async _import (baseURI, relativeURI, names) {
        const docURI = baseURI.resolve(relativeURI);
        const doc = await this.read(docURI);
        const docNamespace = doc.createContext(names);
        return await doc.evaluate(docNamespace);        
    }    
}



// Exports
module.exports = Hub;
