const pathlib = require('path');
const URI = require("uri-js");
const nullProtocolHandler = require("./protocols/null");
const document = require("./document");



class Environment {
    
    constructor (options={}) {
        this._globals = Object(options.globals);
        this._protocols = Object(options.protocols);
        
        const links = Object(options.routes);
        const routes = {};
        for (let path in links) {
            let uri = URI.parse(links[path]);
            let protocolHandler = this._protocols[uri.scheme];
            if (protocolHandler) {
                let keyPath = pathlib.join('/', path);
                uri.scheme = "";
                let rootPath = URI.serialize(uri);
                routes[keyPath] = (...paths) => protocolHandler(rootPath, ...paths);
            }
        }
        
        this._routesMap = sortObject( renameProperties(routes, normalizePath) );
    }
    
    get globals () {
        return this._globals;
    }
    
    createDocument (source, presets={}) {
        const globals = this.globals;
        const cache = {};
        return {
            
            get source () {
                return String(source);
            },
            
            createContext (...namespaces) {
                const context = document.createContext(globals, ...namespaces);
                return Object.assign(context, Object(presets));
            },
            
            get evaluate () {
                return cache.evaluate || (cache.evaluate = document.parse(this.source));
            }        
        }        
    }
    
    render (value) {
        return document.render(value);
    }
    
    async _fetch (uri) {
        const puri = URI.parse(uri);
        const path = pathlib.join("/", puri.host || "", puri.path || "");
        if (puri.scheme) {
            let protocolHandler = this._protocols[puri.scheme];
            if (protocolHandler) return await protocolHandler(path);
        } else {
            for (let [routePath, fetcher] of this._routesMap.entries()) {
                let subPath = getSubPath(routePath, path);
                if (subPath !== "") return String( await fetcher(subPath) );
            }
        }        
        return await nullProtocolHandler(path); 
    }
    
    async loadDocument (uri) {
        const env = this;
        
        const source = await this._fetch(uri);
        
        const doc = this.createDocument(source, {
            "import": async (subPath, ...namespaces) => {
                const target_URI = URI.resolve(uri, subPath);
                const doc = await getDocument(target_URI);
                const context = doc.createContext(...namespaces);
                return await doc.evaluate(context);  
            }
        });
        doc.URI = URI.normalize(uri);
        
        const import_cache = new Map();
        import_cache.set(doc.URI, doc);
        const getDocument = async id => {
            if (!import_cache.has(id)) import_cache.set(id, await env.loadDocument(id));
            return import_cache.get(id)
        }
        
        return doc;
    }
    
    parseParameters (...keyValuePairs) {
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
}


module.exports = function (options={}) {
    return new Environment(options);
}
module.exports.prototoype = Environment.constructor.prototype;





// -----------------------------------------------------------------------------
//  UTILITY FUNCTIONS
// -----------------------------------------------------------------------------

function renameProperties (object, renameProperty) {
    const newObject = {};
    for (let [key, value] of Object.entries(object)) {
        newObject[ renameProperty(key) ] = value;
    }
    return newObject;
}


function sortObject (object) {
    const map = new Map();
    const keys = Object.keys(object);
    keys.sort().reverse();
    for (let key of keys) {
        map.set(key, object[key]);
    }
    return map;
}


function normalizePath (path) {
    return pathlib.join('/', String(path));
}


function resolvePath (rootPath, subPath) {
    if (subPath[0] === '/') {
        return pathlib.normalize(subPath);        
        
    } else if (rootPath.slice(-1) === "/") {
        return pathlib.join('/', rootPath, subPath);
        
    } else {
        return pathlib.join('/', rootPath, "..", subPath);                
        
    }
}


function getSubPath (parentPath, childPath) {
    parentPath = normalizePath(parentPath);
    childPath = normalizePath(childPath);
    if (parentPath === childPath) return '/';
    parentPath = pathlib.join(parentPath, '/');
    if (childPath.indexOf(parentPath) !== 0) return "";
    return childPath.slice(parentPath.length-1);    
}
