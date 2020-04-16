
const Path = require("../tools/path");


class Router {
    
    constructor (routes={}) {
        this._pathHandlers = [];
        for (let path in routes) {
            let pathHandler = this._createPathHandler(path, routes[path]);
            this._pathHandlers.push(pathHandler);
        }
        this._pathHandlers.sort(comparePathHandlers).reverse();
    }
    
    _createPathHandler (path, handler) {
        const pathHandler = {};
        
        pathHandler.path = Path.from(path+"/");
        
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
        
        return pathHandler;
    }  
    
    _findPathHandler (docPath) {
        docPath = Path.from(docPath);
        for (let pathHandler of this._pathHandlers) {
            let subPath = pathHandler.path.getSubPath(docPath);
            if (subPath !== "") return [pathHandler, subPath];
        }
        throw new Error(`Handler not defined for path ${docPath}`);
    }
    
    read (path) {
        const docPath = Path.from(path);
        let [pathHandler, docSubPath] = this._findPathHandler(docPath);
        return pathHandler.read(String(docSubPath));
    }    
    
    write (path, source="") {
        const docPath = Path.from(path);
        let [pathHandler, docSubPath] = this._findPathHandler(docPath);
        if (isFunction(pathHandler.write)) {
            return pathHandler.write(String(docSubPath), source);        
        } else {
            throw new Error(`Write operation not defined for path ${docPath}`);
        }
    }      

    delete (path) {
        const docPath = Path.from(path);
        let [pathHandler, docSubPath] = this._findPathHandler(docPath);
        if (isFunction(pathHandler.delete)) {
            return pathHandler.delete(String(docSubPath));        
        } else {
            throw new Error(`Delete operation not defined for path ${docPath}`);
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
