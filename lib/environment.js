
const pathlib = require('path');
const URI = require('uri-js');
const document = require("./document");

const EmptyStore = require('./stores/empty');
const MemoryStore = require('./stores/memory');



/**
 *  olojs.Environment
 *  ============================================================================
 *  Creates a new olojs environment, which represents a colection of
 *  interdependent documents. In an environment, each document is identified
 *  by an uri-like id.
 *  
 *  
 *  ```js
 *  const environment = olojs.Environment({globals, store, protocols})
 *  ```
 *  
 *  - `globals` is on object containing a set of names that will be included in
 *    every document contexts; it defaults to {}
 *  - `protocols` is an object containing a set of `protocol:store` pairs. A 
 *    document id of the type `prt:/path/to/doc` is to be found in the
 *    `protocols.prt` store at the path `/path/to/doc`.
 *  - `store` is the default olojs store. A document id without protocol (e.g. 
 *    `/path/to/doc`) is to be found in this store. If omitted, the default
 *    store will be a `MemoryStore`.
 */
 
class Environment {
    
    constructor (options={}) {
                
        this.store = getProp(options, 'store') instanceof EmptyStore ? 
                options.store : new MemoryStore();
                
        this.protocols = filterObject(Object(options.protocols), 
                (name, store) => isValidProtocolName(name) && store instanceof EmptyStore);

        this.globals = isObject(getProp(options, 'globals')) ?
                Object.create(options.globals) : {};
    }
    
    
    // This method returns the store mapped to a given protocol name.
    // If no protocol name is specifired, that it returns the default 
    // environment store.
    _getStore (protocolName) {
        if (!protocolName) {
            return this.store;
        }
        if (this.protocols[protocolName]) {
            return this.protocols[protocolName];
        } else {
            throw new Error(`Unknown protocol: ${protocolName}`);
        }
    }
    
    
    /**
     *  environment.createDocument - function
     *  ------------------------------------------------------------------------
     *  Creates a document object containing the document source and
     *  methods to evaluate that source to a namespace.
     *  
     *  ```js
     *  const doc = environment.createDocument(id, source)
     *  ```
     *  
     *  - `id` is a path uri identifying the document in this environment; it
     *    can contain a protocol, a path and an optional query.
     *  - `source` is the un-parsed content of the document
     *  - `presets` is an object containing predefined name to be added to
     *    the documen context
     *  - `doc.id` contains the normalized document id
     *  - `doc.source` contains the un-parsed content of the document
     *  - `doc.createContext` is a function that takes a list of namespaces
     *    as input and returns a context that contains a) the environment
     *    global namespace, b) the passed namespaces and c) the presets
     *  - `evaluate` is an asynchronous function that takes a context as
     *    input and returns the document namespace computed in that context
     */
    createDocument (id, source, presets) {
        const environment = this;
        const docId = id instanceof DocId ? id : new DocId(id);
        
        const cache = {
            evaluate: null,
            imports: new Map()
        };
        
        return {
            
            get id () {
                return String(docId);
            },
            
            get source () {
                return String(source);
            },
            
            createContext (...namespaces) {
                const context = document.createContext(
                        environment.globals, 
                        { import: ImportFunction(environment, docId, cache.imports) },
                        {}, 
                        ...namespaces);
                if (isObject(presets)) Object.assign(context, presets);
                context.__id__ = String(docId);
                context.argns = docId.argns;
                return context;
            },
            
            get evaluate () {
                return cache.evaluate || (cache.evaluate = document.parse(this.source));
            }        
        }            
    }
    
    
    /**
     *  environment.readDocument - async function
     *  ------------------------------------------------------------------------
     *  Returns the document mapped to a given id in this environment.
     *  
     *  ```js
     *  const doc = await environment.readDocument(id)
     *  ```
     *  
     *  - `id` is an URI that identifies the required document inside this
     *    environment; it can contain a protocol, a path and an optional query
     *  - `doc` is the document object returned by the `createDocument`
     *    method.
     */
    async readDocument (id) {
        return await this._readDocument(id, null);
    }
    
    async _readDocument (id, cache) {
        const docId = new DocId(id);
        const source = cache ? await this._retrieveSource(docId, cache) : await this._fetchSource(docId);
        return this.createDocument(docId, source);
    }
    
    async _fetchSource (docId) {
        return await this._getStore(docId.protocol).get(docId.path);
    }    
    
    async _retrieveSource (docId, cache) {
        const key = docId.location;
        if (!cache.has(key)) cache.set(key, await this._fetchSource(docId));
        return cache.get(key);
    }
    
    
    /**
     *  environment.listEntries - async function
     *  ------------------------------------------------------------------------
     *  Returns an array containing the entry names of the given directory
     *  path.
     *
     *  ```js
     *  entries = await environment.listEntries(id)
     *  ```
     *  
     *  - `id` is an URI that identifies the required directory inside this
     *    environment.
     *  - `entries` is the return value of `await environment.store.list(id)`
     */
    async listEntries (id) {
        const docId = new DocId(id);
        return await this._getStore(docId.protocol).list(docId.path);
    }


    /**
     *  environment.writeDocument - async function
     *  ------------------------------------------------------------------------
     *  Changes the content of the document mapped to the given id in this
     *  environment.
     *
     *  ```js
     *  await environment.writeDocument(id, source)
     *  ```
     *  
     *  - `id` is an URI that identifies the required document inside this
     *    environment; it can contain a protocol, a path and an optional query
     *  - `source` is the new value to be assigned to the document source
     */
    async writeDocument (id, source) {
        const docId = new DocId(id);
        return await this._getStore(docId.protocol).set(docId.path, source);
    }
    
    
    /**
     *  environment.deleteDocument - async function
     *  ------------------------------------------------------------------------
     *  Erases the document mapped to the given uri in this environment.
     *
     *  ```js
     *  await environment.deleteDocument(id)
     *  ```
     *  
     *  - `id` is an URI that identifies the required document inside this
     *    environment; it can contain a protocol, a path and an optional query
     */
    async deleteDocument (id) {
        const docId = new DocId(id);
        return await this._getStore(docId.protocol).delete(docId.path);
    }    
    
    
    /**
     *  environment.render - async function
     *  --------------------------------------------------------------------
     *  This is just a stortcut to the `document.render` function.
     */
    render (value) {
        return document.render(value);
    }
}


module.exports = Environment;



class DocId {
    
    constructor (id) {
        const uri = URI.parse(id); 
        this.protocol = uri.scheme;
        this.path = pathlib.join('/', URI.unescapeComponent(URI.serialize({
            userinfo: uri.userinfo,
            host: uri.host,
            port: uri.port,
            path: uri.path
        })));
        this.query = URI.unescapeComponent(uri.query || "");
    }
    
    get location () {
        return (this.protocol ? `${this.protocol}:${this.path}` : this.path);
    }
    
    get argns () {
        return this.query ? parseParameters(...this.query.split('&')) : {};
    }
    
    resolve (subPath) {
        return URI.resolve(String(this), subPath);
    }
    
    toString () {
        return this.location + (this.query ? `?${this.query}` : "");
    }
}


const ImportFunction = (environment, parentId, cache) => async id => {
    const targetId = parentId.resolve(id);
    const targetDoc = await environment._readDocument(targetId, cache);
    const targetDocContext = targetDoc.createContext();
    return await targetDoc.evaluate(targetDocContext);          
}



// -----------------------------------------------------------------------------
//  SUPPORT FUNCTIONS
// -----------------------------------------------------------------------------

const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);
const extend = (parent, child) => Object.assign(Object.create(parent), child);
const getProp = (obj, key) => isObject(obj) ? obj[key] || null : null;
const getItem = (array, i) => i < 0 ? array[array.length+i] : array[i];
const sliceBefore = (str, separator) => str.split(separator)[0];
const sliceAfter = (str, separator) => str.split(separator)[1] || "";
const isDir = path => path.slice(-1) === '/';
const isValidProtocolName = name => /^[a-z_A-Z]+[a-z_A-Z0-9]*$/.test(name);

const filterObject = (obj, test) => {
    const filteredObj = {};
    for (let [key, value] of Object.entries(obj)) {
        if (test(key, value)) filteredObj[key] = value;
    }
    return filteredObj;
}

// Given a list of argument ['par1=val1', 'par2=val2', 'par3=val3', ...], 
// converts it to an object ontaining the ke-value pair contained in the list
function parseParameters (...keyValuePairs) {
    const argns = {};
    for (let keyValuePair of keyValuePairs) {
        const separatorIndex = keyValuePair.indexOf("=");
        if (separatorIndex === -1) {
            let name = keyValuePair.trim();
            if (document.expression.isValidName(name)) argns[name] = null;
        } else {
            let name = keyValuePair.slice(0, separatorIndex).trim();
            if (document.expression.isValidName(name)) {
                let string = keyValuePair.slice(separatorIndex+1).trim();
                let number = Number(string);
                argns[name] = isNaN(number) ? string : number;
            }
        }
    }
    return argns;
}
