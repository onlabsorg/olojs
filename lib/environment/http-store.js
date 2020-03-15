/**
 *  # HTTPStore class
 *  This class provides an interface to an HTTP file server.
 *  The methods of an HTTPStore instance work out-of the box with a 
 *  [BackendEnvironment](./backend-environment.md) server.
 */

require("isomorphic-fetch");
const Store = require("./base-store");
const is = require("../tools/is");


class HTTPStore extends Store {

    /**
     *  ### new HTTPStore(host)
     *  The parameter is the base URL that will be prepended to all 
     *  HTTP requests.
     */
    constructor (host, options={}) {
        super();
        while (host.slice(-1) === "/") host = host.slice(0,-1);
        this.host = host;
        this.options = {
            headers: is.object(options.headers) ? options.headers : {}
        };
    }
    
    /**
     *  ### HTTPStore.prototype.read(path)
     *  Sends a HTTP `GET path` request to `this.host` and returns the response.
     *  Incase of 403 response code, throws `HTTPStore.ReadAccessDeniedError`.
     */
    async read (path) {
        const url = normalizePath(this.host, path);
        const response = await fetch(url, {
            method: 'get',
            headers: Object.assign({
                'Accept': 'text/olo'
            }, this.options.headers),
        });
        
        switch (response.status) {
            case 200:
                return await response.text();
            case 403:
                throw new this.constructor.ReadAccessDeniedError(path);
            default:
                let message = await response.text();
                throw new Error(message);
        }
    }

    /**
     *  ### HTTPStore.prototype.write(path, source)
     *  Sends a HTTP `PUT path` request with `source` as body to `this.host` 
     *  and resolves on 200 or 201 response code or rejects or error response code.
     *  Incase of 403 response code, throws `HTTPStore.WriteAccessDeniedError`.
     */
    async write (path, source) {
        const url = normalizePath(this.host, path);
        const response = await fetch(url, {
            method: 'put',
            headers: Object.assign({
                'Accept': "text/olo",
                'Content-Type': 'text/olo'
            }, this.options.headers),
            body: String(source)
        });
        
        switch (response.status) {
            case 200:
            case 201:
                break;
            case 403:
                throw new this.constructor.WriteAccessDeniedError(path);
            case 405:
                throw new Error(`Write operation not defined on path ${path}`);
            default:
                let message = await response.text();
                throw new Error(message);
        }                    
    }
    
    /**
     *  ### HTTPStore.prototype.delete(path)
     *  Sends a HTTP `DELETE path` request to `this.host` and resolves 
     *  on 200 or 201 response code or rejects or error response code.
     *  Incase of 403 response code, throws `HTTPStore.WriteAccessDeniedError`.
     */
    async delete (path) {
        const url = normalizePath(this.host, path);
        const response = await fetch(url, {
            method: 'delete',
            headers: Object.assign({
                'Accept': "text/olo"                
            }, this.options.headers),
        });
        switch (response.status) {
            case 200:
                break;
            case 403:
                throw new this.constructor.WriteAccessDeniedError(path);            
            default:
                let message = await response.text();
                throw new Error(message);
        }                            
    }

    // Error throw on 403 GET response code
    static get ReadAccessDeniedError () {
        return ReadAccessDeniedError
    }

    // Error throw on 403 PUT/DELETE response code
    static get WriteAccessDeniedError () {
        return WriteAccessDeniedError
    }

    /**
     *  ### FSStore.createReader(host)
     *  Returns the `HTTPStore.prototype.read` function bound to the given `host`.
     */
    // static createReader(rootPath) inherited from BaseStore
}


function normalizePath (hostURL, path) {
    if (path[0] !== "/") path = "/" + path;
    return hostURL + path;    
}


class AccessDeniedError extends Error {
    constructor (operation, path) {
        super(`${operation} access denied on path ${path}`);
    }
}

class ReadAccessDeniedError extends AccessDeniedError {
    constructor (path) {
        super("Read", path);
    }
}

class WriteAccessDeniedError extends AccessDeniedError {
    constructor (path) {
        super("Write", path);
    }
}




module.exports = HTTPStore;
