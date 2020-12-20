const document = require('./document');
const pathlib = require('path');
const URI = require('uri-js');
const Store = require('./store'); 

const $loader = Symbol("Document loader");



/**
 *  Loader - function constructor
 *  ============================================================================
 *  Creates a function that loads a document object.
 *
 *  ```
 *  loadDocument = Loader(stores)
 *  doc = await loadDocument(id)
 *  ```
 *  
 *  The `stores` object containins all the stores accessible by the loader
 *  in the form of `name:store` pairs.
 *
 *  The `id` string is a document identifier of the type 
 *  `sname:/path/to/doc?query, where 
 *  - `sname` is the name of the store that contains the target document,
 *  - `/path/to/doc` is the path of the target document 
 *  - `query` is a list of `key=value` pairs (separated by `;` and/or `&`), 
 *    defining the evaluation input arguments.
 *
 *  The `doc` object contains the following properties:
 *  - `doc.id` is a sub-string of the document identifiers containing only
 *    the store name and the path (no query string)
 *  - `doc.source` is a string containing the document source returned by the
 *    store.get method
 *  - `doc.evaluate` is an asynchronous function that takes a context as input 
 *    and returns its namespace after source evaluation
 *  - `doc.context` is a function that creates a valid evaluation context,
 *    given a list of namespaces
 *  - `doc.context.__id__` exposes `doc.id` to the document 
 *  - `doc.import` is a function that, given another document id, returns
 *    its evaluated namespace. The target document id can be absolute or
 *    relative to `doc.id`
 */
const Loader = module.exports = stores => {
    if (!stores[Loader.DEFAULT_STORE_NAME]) stores[Loader.DEFAULT_STORE_NAME] = new Store();
    
    const cache = new Map();
    
    const loadDocument = async id => {
        
        const {storeName, path, query} = Loader.parseId(id);
        const docId = `${storeName}:${path}`;
        const argns = query ? Loader.parseQuery(query) : {};
        
        if (!cache.has(docId)) {
            if (!stores[storeName]) throw new Loader.UnknownStoreError(storeName);
            const source = await stores[storeName].get(path);
            const evaluate = document.parse(source);
            cache.set(docId, {source, evaluate});
        }
        
        return createDocument(docId, argns);
    }
    
    const createDocument = (docId, argns) => ({
        
        get id () {
            return docId;
        },
        
        get source () {
            return cache.get(this.id).source;
        },
        
        createContext (...namespaces) {
            if (namespaces.length === 0) namespaces = [{}];
            const context = document.createContext(
                Loader.globals, 
                {__load__: loadDocument}, 
                ...namespaces);
            context.__id__ = this.id;
            context.argns = argns;
            return context;
        },
        
        get evaluate () {
            return cache.get(this.id).evaluate;
        }        
    });
    
    return loadDocument;
}


// Any id without scheme (staring with a `/`) will default to this store name
Loader.DEFAULT_STORE_NAME = "home";


// The properties and functions contained in this object are in the scope of
// every document and therefore accessible to its inline expressions.
Loader.globals = {
    
    async import (id) {
        const targetId = Loader.resolveId(this.__id__, id);
        const targetDoc = await this.__load__(targetId);
        const targetDocContext = targetDoc.createContext();
        return await targetDoc.evaluate(targetDocContext);
    }
};


// Parses the given id string into its a store name (uri scheme), a path 
// (uri authority + uri path) and a query (uri query)
Loader.parseId = id => {
    const uri = URI.parse(id);
    uri.authority = URI.unescapeComponent(
            (uri.userinfo ? `${uri.userinfo}@` : "") + 
            (uri.host || "") + 
            (uri.port ? `:${uri.port}` : ""));
    return {
        storeName: uri.scheme ? uri.scheme.toLowerCase() : Loader.DEFAULT_STORE_NAME,
        path: (uri.authority ? `//${uri.authority}` : "") +
              (uri.path ? pathlib.normalize(`/${URI.unescapeComponent(uri.path)}`) : "/"),
        query: uri.query ? URI.unescapeComponent(uri.query) : "",
    }
}


// Takes a query in the form of a `&-separated` and/or `;-separated` list
// of `key=value` pairs and returns an object containing all the pairs
Loader.parseQuery = query => parseParameters(...iterQuery(query));        

// Given a list of argument ['par1=val1', 'par2=val2', 'par3=val3', ...], 
// converts it to an object ontaining the ke-value pair contained in the list
function parseParameters (...keyValuePairs) {
    const argns = {};
    for (let keyValuePair of keyValuePairs) {
        const separatorIndex = keyValuePair.indexOf("=");
        if (separatorIndex === -1) {
            let name = keyValuePair.trim();
            if (document.expression.isValidName(name)) argns[name] = true;
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

// Iterates over all the key-value pairs contained in the query, considering
// both `&` and `;` as separators.
function *iterQuery (query) {
    for (let ampParam of query.split('&')) {
        for (let param of ampParam.split(';')) {
            yield param;
        }
    }
}


// Calculate a full id given a reference id and an ide relative to it.
Loader.resolveId = (parentId, childId) => URI.resolve(parentId, childId);


// This error is thrown by the loader function when the passed id doesn't match
// any of the store passed as parameters to the Loader function.
Loader.UnknownStoreError = class extends Error {
    constructor (storeName) {
        super(`Unknown store name: ${storeName}`)
    }
}
