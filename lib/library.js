const pathlib = require('path');

const document = require('./document');

const Store = require('./store');
const MemoryStore = require('./memory-store');
const HTTPStore = require('./http-store');
const Router = require('./router');

const URI_SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*$/
const URI_RE        = /^([a-zA-Z][a-zA-Z0-9+.-]*):\/(.*)$/;

const isValidName = name => typeof name === 'string' && /^[a-z_A-Z]+[a-z_A-Z0-9]*$/.test(name);




class Library{
    
    constructor (rootStore) {
        this.store = new Router({
            '/': rootStore || new MemoryStore()
        });
    }
    
    
    async read (docId) {
        const {scheme, path} = typeof docId === 'string' ? this.constructor.parseId(docId) : docId;
        const store = this._getStore(scheme);
        return await store.read(path);
    }
    
    async list (dirId) {
        const {scheme, path} = typeof dirId === 'string' ? this.constructor.parseId(dirId) : dirId;
        const store = this._getStore(scheme);
        return await store.list(path);
    }
    
    async write (docId, content) {
        const {scheme, path} = typeof docId === 'string' ? this.constructor.parseId(docId) : docId;
        const store = this._getStore(scheme);
        return await store.write(path, content);        
    }
    
    async delete (docId) {
        const {scheme, path} = typeof docId === 'string' ? this.constructor.parseId(docId) : docId;
        const store = this._getStore(scheme);
        return await store.delete(path);        
    }
    
    async deleteAll (dirId) {
        const {scheme, path} = typeof dirId === 'string' ? this.constructor.parseId(dirId) : dirId;
        const store = this._getStore(scheme);
        return await store.deleteAll(path);
    }
        
    mount (path, store) {
        return this.store.mount(path, store);
    }
    
    unmount (path) {
        return this.store.unmount(path);        
    }    

    createContext (docId) {
        const Library = this.constructor;
        const docIdObj = typeof docId === 'string' ? this.constructor.parseId(docId) : docId;
        const docIdStr = Library.stringifyId(docIdObj)
        return document.createContext(this.constructor.contextPrototype, {
            __id__: {
                scheme: docIdObj.scheme,
                path: docIdObj.path,
                query: docIdObj.query,
                __str__: docIdStr,
                resolve: relativeId => Library.resolveId(relativeId, docIdStr)
            },
            $library: this,
        });
    }
        
    async load (docId) {
        const doc = {};
        
        doc.id = this.constructor.parseId(docId); 
        doc.id.toString = () => this.constructor.stringifyId(doc.id);
        
        doc.source = await this.read(doc.id);
        
        doc.context = this.createContext(doc.id);
        
        const evaluate = this.constructor.parseDocument(doc.source);
        doc.namespace = await evaluate(doc.context);
        doc.namespace.$toString = () => doc.context.str(doc.namespace);
                
        return doc;
    }

    
    
    // -------------------------------------------------------------------------
    //  Internal methods
    // -------------------------------------------------------------------------

    _getStore (scheme) {
        if (scheme === 'default') {
            return this.store;
        }
        
        if (this.constructor.protocols.has(scheme)) {
            return this.constructor.protocols.get(scheme);
        }
        
        throw new Error(`Unknown protocol: '${scheme}'`);
    }


    // -------------------------------------------------------------------------
    //  Static methods
    // -------------------------------------------------------------------------
    
    static create (...args) {
        return new this(...args);
    }
    
    static parseDocument (source) {
        return document.parse(source);
    }
    
    static parseId (docId) {
        const queryIndex = docId.indexOf('?');
        const srcId = queryIndex === -1 ? docId : docId.slice(0, queryIndex);
        const queryStr = queryIndex === -1 ? "" : docId.slice(queryIndex+1);
        
        const uriMatch = srcId.match(URI_RE);
        const scheme = uriMatch ? (uriMatch[1] || 'default') : 'default';
        const path = uriMatch ? pathlib.join('/', uriMatch[2] || '') : pathlib.normalize(`/${srcId}`);
        
        const query = parseParameters(...iterQuery(queryStr));

        return {scheme, path, query};
    }
    
    static stringifyId (docIdObj) {
        const schemeStr = docIdObj.scheme && docIdObj.scheme !== "default" ? `${docIdObj.scheme}:/` : "";
        const pathStr = pathlib.join('/', docIdObj.path || "");
        const queryStr = stringifyQueryObject(docIdObj.query);
        return schemeStr + pathStr + queryStr;
    }
    
    static resolveId (docId, baseId=null) {
        const docIdObj = this.parseId(docId);
        
        // if docId is not an absolute path or a baseId is provided ...
        if (!docId.match(URI_RE) && typeof baseId === 'string') {
            
            // assign to docId the same scheme as baseId
            const baseIdObj = this.parseId(baseId);
            docIdObj.scheme = baseIdObj.scheme;
            
            // resolve the docId path as relative to the baseId path
            const relativePath = docId.split('?')[0];
            if (relativePath[0] === '/') {
                docIdObj.path = pathlib.normalize(relativePath);
            } else {
                const baseDirPath = baseIdObj.path.slice(-1) === '/' ? 
                        baseIdObj.path : pathlib.resolve(baseIdObj.path, '..');
                docIdObj.path = pathlib.join(baseDirPath, relativePath);
            }
            
            // keep the same docId query
        }
        
        return this.stringifyId(docIdObj);
    }    
}



// -------------------------------------------------------------------------
//  Library.protocols static property
// -------------------------------------------------------------------------

class Protocols extends Map {
    
    set (scheme, store) {
        if (URI_SCHEME_RE.test(scheme)) {
            super.set(scheme, store);
        } else {
            throw new Error("Invalid protocol scheme: '${scheme}'");
        }
    }
}

Library.protocols = new Protocols();
Library.protocols.set('http',  new HTTPStore('http:/'));
Library.protocols.set('https', new HTTPStore('https:/'));



// -------------------------------------------------------------------------
//  Library.contextPrototype static property
// -------------------------------------------------------------------------

Library.contextPrototype = {
    
    // Properties added by createContext:
    //  __id__
    //  $library
    
    async $get (docIdObj) {
        if (!this.$cache) this.$cache = new Map();
        
        const cacheKey = `${docIdObj.scheme}:/${docIdObj.path}`;
        if (!this.$cache.has(cacheKey)) {
            const source = await this.$library.read(docIdObj);
            const evaluate = this.$library.constructor.parseDocument(source);
            this.$cache.set(cacheKey, {source, evaluate});
        }
        
        return this.$cache.get(cacheKey);
    },

    async import (docId) {
        const targetId = this.__id__.resolve(docId);
        const targetIdObj = this.$library.constructor.parseId(targetId);
        const {source, evaluate} = await this.$get(targetIdObj);
        const context = this.$library.createContext(targetIdObj);
        return await evaluate(context);
    }
};



// -----------------------------------------------------------------------------
//  Utility functions
// -----------------------------------------------------------------------------

// Given a list of argument ['par1=val1', 'par2=val2', 'par3=val3', ...],
// converts it to an object ontaining the ke-value pair contained in the list
function parseParameters (...keyValuePairs) {
    const query = {};
    for (let keyValuePair of keyValuePairs) {
        const separatorIndex = keyValuePair.indexOf("=");
        if (separatorIndex === -1) {
            let name = keyValuePair.trim();
            if (isValidName(name)) query[name] = true;
        } else {
            let name = keyValuePair.slice(0, separatorIndex).trim();
            if (isValidName(name)) {
                let string = keyValuePair.slice(separatorIndex+1).trim();
                let number = Number(string);
                query[name] = isNaN(number) ? string : number;
            }
        }
    }
    return query;
}

// Iterates over all the key-value pairs contained in the query, considering
// both `&` and `;` as separators.
function *iterQuery (query) {
    for (let ampParam of query.split('&')) {
        for (let param of ampParam.split(';')) {
            yield param;
        }
    }
}


function stringifyQueryObject (query) {
    if (!query || typeof query !== 'object') return "";
    
    const queryStrParts = [];
    for (let key in query) {
        queryStrParts.push(`${key}=${query[key]}`)
    }
    return (queryStrParts.length > 0) ? `?${queryStrParts.join("&")}` : "";
}



// -----------------------------------------------------------------------------
//  Exports
// -----------------------------------------------------------------------------

module.exports = Library;


