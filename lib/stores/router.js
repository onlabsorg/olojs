/**
 *  # Router class
 *  A Router is a store that works as a hub for sub-stores. You can mount
 *  several different stores to virtual paths and access all of them as if
 *  they belonget to one store.
 */


const Path = require("../tools/path");


class Router {
    
    
    /**
     *  ### new Router(routes)
     *  The routes parameter is an object mapping paths to stores.
     *
     *  Say you created a router as follows ...
     *
     *  ```js
     *  router = new Router({
     *      "/root/path1": store1,
     *      "/root_path2": store2,
     *      "/rp3": store3,
     *      ...
     *  })
     *  ```
     *  ... then
     *  - `router.read("/root/path1/path/to/docA")` will call `store1.read("/path/to/docA")`
     *    and return the returned string as document source
     *  - `router.read("/root_path2/path/to/docB")` will call `store2.read("/path/to/docB")`
     *    and return the returned string as document source
     *  - `router.read("/rp3/path/to/docC")` will call `store3.read("/path/to/docC")`
     *     and return the returned string as document source
     *
     *  Of course the same goes for the `write`, `delete` and `append` methdos.
     */    
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
        
        if (isObject(handler) && isFunction(handler.append)) {
            pathHandler.append = handler.append.bind(handler);            
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
    
    
    /**
     *  ### Router.prototype.read(path)
     *  This function takes a path, finds the first store matching the
     *  path and returns `store.read(subPath)`.
     */    
    read (path) {
        const docPath = Path.from(path);
        let [pathHandler, docSubPath] = this._findPathHandler(docPath);
        return pathHandler.read(String(docSubPath));
    }    
    
    
    /**
     *  ### Router.prototype.write(path, source)
     *  This function takes a path and an olo-document source, finds the first
     *  store matching the path and calls `store.write(subPath, source)`.
     *  
     *  If source is an empty string, it will instead call `store.delete(path)`.
     */
    write (path, source="") {
        const docPath = Path.from(path);
        let [pathHandler, docSubPath] = this._findPathHandler(docPath);
        if (isFunction(pathHandler.write)) {
            return pathHandler.write(String(docSubPath), source);        
        } else {
            throw new Error(`Write operation not defined for path ${docPath}`);
        }
    }      


    /**
     *  ### Router.prototype.delete(path)
     *  This function takes a path as argument, finds the first
     *  store matching the path and calls `store.delete(subPath)`.
     */
    delete (path) {
        const docPath = Path.from(path);
        let [pathHandler, docSubPath] = this._findPathHandler(docPath);
        if (isFunction(pathHandler.delete)) {
            return pathHandler.delete(String(docSubPath));        
        } else {
            throw new Error(`Delete operation not defined for path ${docPath}`);
        }
    }      


    /**
     *  ### Router.prototype.append(path, source)
     *  This function takes a path and an olo-document source, finds the first
     *  store matching the path and calls `store.append(subPath, source)`.
     */
    append (path, source="") {
        const docPath = Path.from(path);
        let [pathHandler, docSubPath] = this._findPathHandler(docPath);
        if (isFunction(pathHandler.append)) {
            return pathHandler.append(String(docSubPath), source);        
        } else {
            throw new Error(`Append operation not defined for path ${docPath}`);
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
