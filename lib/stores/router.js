// =============================================================================
//  This module exposes the Router class.
//  A router is a hub of stores that delegates an operation to the store that
//  first matches the path.
// =============================================================================

const Path = require("../tools/path");


class Router {
        
    // Create a router given a paths->stores mapping.
    constructor (routes={}) {
        this._pathHandlers = [];
        for (let [path, handler] of Object.entries(routes)) {
            let pathHandler = this._createPathHandler(path, handler);
            this._pathHandlers.push(pathHandler);
        }
        this._pathHandlers.sort(comparePathHandlers).reverse();
    }
    
    _createPathHandler (path, handler) {
        const pathHandler = {};
        
        pathHandler.path = Path.normalize(path+'/');
        
        if (isFunction(handler)) {
            pathHandler.read = handler;
        } else if (isObject(handler) && isFunction(handler.read)) {
            pathHandler.read = handler.read.bind(handler);
        } else {
            pathHandler.read = () => {throw new Error(`Read operation not defined for paths ${pathHandler.path}*`)}            
        }
        
        if (isObject(handler) && isFunction(handler.write)) {
            pathHandler.write = handler.write.bind(handler);            
        }

        if (isObject(handler) && isFunction(handler.delete)) {
            pathHandler.delete = handler.delete.bind(handler);            
        }
        
        if (isObject(handler) && isFunction(handler.append)) {
            pathHandler.append = handler.append.bind(handler);            
        }

        return pathHandler;
    }  
    
    _findPathHandler (docPath) {
        docPath = Path.normalize(docPath);
        for (let pathHandler of this._pathHandlers) {
            let subPath = Path.sub(pathHandler.path, docPath);
            if (subPath !== "") return [pathHandler, subPath];
        }
        throw new Error(`Handler not defined for path ${docPath}`);
    }
    
    
    //  This function takes a path, finds the first store matching the
    //  doc_path and returns `store.read(doc_sub_path)`.
    read (path) {
        let [pathHandler, subPath] = this._findPathHandler(path);
        return pathHandler.read(subPath);
    }    
    
    
    //  This function takes a doc_path and an olo-document source, finds the 
    //  first store matching the doc_path and calls 
    //  `store.write(doc_sub_path, doc_source)`.
    write (path, source="") {
        let [pathHandler, subPath] = this._findPathHandler(path);
        if (isFunction(pathHandler.write)) {
            return pathHandler.write(subPath, source);        
        } else {
            let npath = Path.normalize(path);
            throw new Error(`Write operation not defined for path ${npath}`);
        }
    }      


    //  This function takes a doc_path as argument, finds the first
    //  store matching the doc_path and calls `store.delete(doc_sub_path)`.
    delete (path) {
        let [pathHandler, subPath] = this._findPathHandler(path);
        if (isFunction(pathHandler.delete)) {
            return pathHandler.delete(subPath);        
        } else {
            let npath = Path.normalize(path);
            throw new Error(`Delete operation not defined for path ${npath}`);
        }
    }      
}


module.exports = Router;



// HELPER FUNCTIONS

const isObject = x => typeof x === "object" && x !== null & !Array.isArray(x);

const isString = x => typeof x === "string";

const isFunction = x => typeof x === "function";

function comparePathHandlers (pathHandler1, pathHandler2) {
    const path1 = String(pathHandler1.path);
    const path2 = String(pathHandler2.path);
    return path1.localeCompare(path2);
}
