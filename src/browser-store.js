const Store = require('../lib/store');
const localForage = require('localforage');


class BrowserStore extends Store {
    
    constructor (storeId) {
        super();
        this._backend = localForage.createInstance({
            name: 'storeId',
            version: 0.1
        });
    }
    
    async read (path) {
        const key = this.normalizePath(path);
        const value = await this._backend.getItem(key);
        return value === null ? "" : String(value);
    }
    
    async list (path) {
        const normPath = this.normalizePath(`${path}/`);
        const items = [];
        for (let i=0; i < await this._backend.length(); i++) {
            const key = await this._backend.key(i);
            if (key.indexOf(normPath) === 0) {
                const subPath = key.slice(normPath.length);
                const slashIndex = subPath.indexOf('/');
                const item = slashIndex === -1 ? subPath : subPath.slice(0, slashIndex+1);
                if (items.indexOf(item) === -1) items.push(item);
            }
        }
        return items;
    }
    
    async write (path, source) {
        const key = this.normalizePath(path);
        const value = String(source);
        await this._backend.setItem(key, value);
    }
    
    async delete (path) {
        const key = this.normalizePath(path);
        await this._backend.removeItem(key);
    }
    
    async deleteAll (path) {
        const normPath = this.normalizePath(`${path}/`);
        const docPaths = [];
        for (let i=0; i < (await this._backend.length()); i++) {
            docPaths.push(await this._backend.key(i));
        }        
        for (let docPath of docPaths) {
            if (docPath.indexOf(normPath) === 0) {
                await this.delete(docPath);
            }
        }
    }
}

module.exports = BrowserStore;
