const Document = require("./document");
const errors = require("./errors");
const Path = require("path");
const URI = require("./uri");



class Store {

    constructor (storeURI, backend) {
        this.uri = storeURI instanceof URI ? storeURI : new URI(storeURI);
        this.backend = backend;
    }
    
    create (path, data) {
        return new this.constructor.Document(this, path, data);
    }
    
    async read (path) {
        if (path.slice("-1") === "/") {
            let subPaths = await this._list(path) || [];
            let doc = this.create(path, {
                presets: this.constructor.ContainerPresets(...subPaths),
                body: ""
            });
            return doc;
        } else {
            let data = await this._get(path) || "";
            return this.create(path, data);
        }
    }
    
    async write (path, body) {
        path = Path.join("/", path);
        
        if (path.slice(-1) === "/") {
            throw new errors.WriteOperationNotAllowed(path);
        } else {
            await this._put(path, body);
        }
    }
    
    async delete (path) {
        path = Path.join("/", path);        
        
        if (path.slice(-1) === "/") {
            let subPaths = await this._list(path) || [];
            let operations = subPaths.map(subPath => ({type:"delete", path:subPath}));
            await this._patch(path, operations);
        } else {
            await this._delete(path);
        }
    }
    
    async _get (path) {
        return await this.backend.get(path);
    }
    
    async _list (path) {
        return await this.backend.list(path);
    }
    
    async _put (path, body) {
        return await this.backend.put(path, body);
    }
    
    async _delete (path) {
        await this.backend.delete(path);
    }
    
    async _patch (path, operations) {
        if (typeof this.backend.patch === "function") {
            await this.backend.patch(path, operations);
        } else {
            for (let operation of operations) {
                let fullPath = Path.join(path, operation.path);
                if (operation.type === "put") {
                    await this._put(fullPath, operation.body);
                } else if (operation.type === "delete") {
                    await this._delete(fullPath);
                } else {
                    throw new errors.OperationNotAllowed(operation.type, fullPath);
                }
            }
        }
    }
    
    static get Document () {
        return StoreDocument;
    }
    
    static ContainerPresets (...subPaths) {
        return {
            subPaths: subPaths,
            get items () {
                let items = [];
                for (let subPath of subPaths) {
                    let slashIndex = subPath.indexOf("/");
                    let item = (slashIndex === -1) ? subPath : subPath.slice(0, slashIndex+1);
                    if (items.indexOf(item) === -1) items.push(item);
                }
                return items;
            }
        } 
    }
}


class StoreDocument extends Document {
    
    constructor (store, path, data) {
        const docBody = typeof data === "object" ? String(data.body) : String(data);
        super(docBody);
        
        this.store = store;
        this.path = Path.join("/", path);
        if (typeof data === "object") {
            this.presets = Object(data.presets);
        } else {
            this.presets = {};
        }
    }
    
    get uri () {
        var storeURI = String(this.store.uri);
        if (storeURI.slice(-1) !== "/") storeURI += "/";
        var docPath = Path.join("/", this.path).slice(1);
        return new URI(storeURI + docPath);
    }
    
    createContext (globals) {
        const context = super.createContext(globals);        
        Object.assign(context, this.presets);
        context.URI = this.uri.toNamespace();
        return context;
    }
}


// Exports
module.exports = Store;
