const pathlib = require('path');
const URI = require("uri-js");
const nullProtocolHandler = require("./protocols/null");
const protocolErrors = require('./protocols/.errors');
const document = require("./document");


/**
 *  olojs.Environment
 *  ============================================================================
 *  Creates a new olojs environment, which represents a colection of
 *  interdependent documents.
 *  
 *  
 *  ```js
 *  const environment = olojs.Environment({globals, protocols, routes})
 *  ```
 *  
 *  - `globals` is on object containing a set of names that will be included in
 *    every document contexts
 *  - `protocols` is an object mapping scheme strings to {get, set, delete}
 *    objects called protocol handlers. In this environment, an uri like
 *    `ppp:/path/to/doc` refers to a document that cna be retrieved via
 *    `protocols.ppp.get('/path/to/doc')` and modified via `protocols.ppp.ser`
 *    and `protocols.ppp.delete`. 
 *  - `routes` is an object mapping paths to URIs, so that the path can be used
 *    as shortcut for the full URI. For example, the mapping `"/a/b": "ppp:/path/to/dir"`
 *    makes the uri `/a/b/x/doc` equivalent to `ppp:/path/to/dir/x/doc`.
 *  
 *  Upon creation of the environment, the `globals` namespace will be augumented
 *  with a `globals.import` function that can be used by document expressions to 
 *  load and evaluate other documents of this environment.
 */
module.exports = (options={}) => {
    
    // Parse the options argument ...
    const globals = {}, protocols = {}, routes = {};
    if (options && typeof options === "object") {
        
        // ... parse the options.globals parameter
        if (options.globals && typeof options.globals === "object") {
            for (let name in options.globals) {
                globals[name] = options.globals[name];
            }
        }
        
        // ... parse the options.protocols parameter
        if (options.protocols && typeof options.protocols === "object") {
            for (let [scheme, protocolHandler] of Object.entries(options.protocols)) {
                protocols[scheme] = normalizeProtocolHandler(protocolHandler);
            }
        }
        
        // ... parse the options.routes parameter
        if (options.routes && typeof options.routes === "object") {
            for (let [mountPath, targetURI] of Object.entries(options.routes)) {
                let uri = URI.parse(targetURI);
                let protocolHandler = protocols[uri.scheme];
                if (protocolHandler) {
                    let keyPath = pathlib.join('/', mountPath);
                    let rootPath = getURILocation(uri);
                    routes[keyPath] = createRouteHandler(protocolHandler, rootPath);
                }                
            }
        }
    }
    const routesMap = sortObject( renameProperties(routes, normalizePath) );
    
    
    // Create the import function to be used by document expressions to load
    // and evaluate other documents of this environment
    globals.import = async function (subPath) {
        const targetId = unescape(URI.resolve(this.__id__, subPath));
        if (this.$cache.has(targetId)) {
            var doc = this.$cache.get(targetId);
        } else {
            var doc = await this.$env.readDocument(targetId);
            this.$cache.set(targetId, doc);
        }
        const context = doc.createContext();
        return await doc.evaluate(context);  
    }
    
    
    // Create and return the environment object
    return {
        
        /**
         *  environment.createDocument - function
         *  --------------------------------------------------------------------
         *  Creates a document object containing the document source and
         *  methods to evaluate that source to a namespace.
         *  
         *  ```js
         *  const doc = environment.createDocument(id, source)
         *  ```
         *  
         *  - `id` is an uri identifying the document in this environment
         *  - `source` is the un-parsed content of the document
         *  - `presets` is an object containing predefined name to be added to
         *    the context
         *  - `doc.id` contains the document id in normalized form
         *  - `doc.source` contain the un-parsed content of the document
         *  - `doc.createContext` is a function that takes a list of namespaces
         *    as input and returns a context that contains a) the environment
         *    global namespace, b) the passed namespaces and c) the presets
         *  - `evaluate` is an asynchronous function that takes a context as
         *    input and returns the document namespace computed in that context
         */
        createDocument (id, source) {
            const env = this;
            const uri = URI.parse(id);
            const argns = uri.query ? parseParameters(...uri.query.split('&')) : {};
            var evaluate;
            return {
                
                get id () {
                    return normalizeDocId(id);
                },
                
                get source () {
                    return String(source);
                },
                
                createContext (...namespaces) {
                    const context = document.createContext(globals, ...namespaces);
                    context.$env = env;
                    context.$cache = new Map();
                    context.__id__ = this.id;
                    context.argns = argns;
                    return context;
                },
                
                get evaluate () {
                    return evaluate || (evaluate = document.parse(this.source));
                }        
            }            
        },

        
        /**
         *  environment.readDocument - async function
         *  --------------------------------------------------------------------
         *  Returns the document mapped to a given uri in this environment.
         *  
         *  ```js
         *  const doc = await environment.readDocument(id)
         *  ```
         *  
         *  - `id` is an URI that identifies the required document inside this
         *    environment.
         *  - `doc` is the document object returned by the `createDocument`
         *    method.
         */
        async readDocument (id) {
            const {handler, path} = parseDocId(id, protocols, routesMap);   
            const source = await handler.get(path);
            return this.createDocument(id, source);
        },


        /**
         *  environment.writeDocument - async function
         *  --------------------------------------------------------------------
         *  Changes the content of the document mapped to the given uri in this
         *  environment.
         *
         *  ```js
         *  await environment.writeDocument(id, source)
         *  ```
         *  
         *  - `id` is an URI that identifies the targt document inside this
         *    environment.
         *  - `source` is the new value to be assigned to the document source
         */
        async writeDocument (id, source) {
            const {handler, path} = parseDocId(id, protocols, routesMap);        
            return await handler.set(path, source);        
        },
        

        /**
         *  environment.deleteDocument - async function
         *  --------------------------------------------------------------------
         *  Erases the document mapped to the given uri in this environment.
         *
         *  ```js
         *  await environment.deleteDocument(id)
         *  ```
         *  
         *  - `id` is an URI that identifies the targt document inside this
         *    environment.
         */
        async deleteDocument (id) {
            const {handler, path} = parseDocId(id, protocols, routesMap);        
            return await handler.delete(path);                
        },


        /**
         *  environment.render - async function
         *  --------------------------------------------------------------------
         *  This is just a stortcut to the `document.render` function.
         */
        render (value) {
            return document.render(value);
        }
    }
};



// -----------------------------------------------------------------------------
//  PRIVATE SERVICE FUNCTIONS
// -----------------------------------------------------------------------------


// Given an URI, a protocols object and a routes object, returns the
// matching protocol handler and the resource path.
function parseDocId (uri, protocols, routes) {
    const puri = URI.parse(uri);
    const path = getURILocation(puri);
    if (puri.scheme) {
        let handler = protocols[puri.scheme] || nullProtocolHandler;
        return {handler, path};
    } else {
        for (let [routePath, routeHandler] of routes.entries()) {
            let subPath = getSubPath(routePath, path);
            if (subPath !== "") return {handler:routeHandler, path:subPath};
        }
        return {handler:nullProtocolHandler, path:path};
    }        
}


// Given a path, returns an equivalent path without `..`, `.`, `//` and with a
// leading `/`
function normalizePath (path) {
    return pathlib.join('/', String(path));
}


// Givena an objec, returns a new object after renaming all the keys via the
// passed `renameProperty` function
function renameProperties (object, renameProperty) {
    const newObject = {};
    for (let [key, value] of Object.entries(object)) {
        newObject[ renameProperty(key) ] = value;
    }
    return newObject;
}


// Given an object, converts it to a Map having the same key-value pairs but
// with the keys in alphabetical order
function sortObject (object) {
    const map = new Map();
    const keys = Object.keys(object);
    keys.sort().reverse();
    for (let key of keys) {
        map.set(key, object[key]);
    }
    return map;
}


// Given a parent path (e.g. `/parent/path`) and a subpath (e.g.`/parent/path/sub/path/to/doc`),
// returns the subpath relative to the parent path (e.g. `/sub/path/to/doc`)
// If the childPath is not a subpath of the parentPath, it returns ""
function getSubPath (parentPath, childPath) {
    parentPath = normalizePath(parentPath);
    childPath = normalizePath(childPath);
    if (parentPath === childPath) return '/';
    parentPath = pathlib.join(parentPath, '/');
    if (childPath.indexOf(parentPath) !== 0) return "";
    return childPath.slice(parentPath.length-1);    
}


// Given a protocol handler, it makes sure that it has all the required methods:
// `get`, `set` and `delete`.
function normalizeProtocolHandler (ph) {
    if (nullProtocolHandler.isPrototypeOf(ph)) return ph;
    const normPH = Object.create(nullProtocolHandler);
    return Object.assign(normPH, ph);
}


// Given a protocol handler and a protocol path, it creates a handler with
// `get`, `set` and `delete` method that takes a subpath, transforms it in
// a protocol absolute path and delegates to the protocolHandler
const createRouteHandler = (protocolHandler, rootPath) => ({
    get: path => protocolHandler.get(pathlib.join('/', rootPath, path)),
    set: (path, source) => protocolHandler.set(pathlib.join('/', rootPath, path), source),
    delete: path => protocolHandler.delete(pathlib.join('/', rootPath, path))
});



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


// The same uri can be written in multiple forms. This function returns the
// unique normal form of an uri.
function normalizeDocId (id) {
    return unescape(URI.normalize(id));
}


// Retrieve the origin+path part of a given URI
function getURILocation (uri) {
    uri = Object.assign({}, uri);
    uri.scheme = uri.query = uri.fragment = undefined;
    return unescape( pathlib.join('/', URI.serialize(uri)) );
}
