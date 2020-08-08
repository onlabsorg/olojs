// =============================================================================
//  Environment remote store interface over the HTTP protocol
// =============================================================================

require("isomorphic-fetch");
const Store = require("./base-store");


class HTTPStore extends Store {

    //  Create and HTTPStore instance sending requests to the given host URL.
    constructor (host, options={}) {
        super();
        while (host.slice(-1) === "/") host = host.slice(0,-1);
        this.host = host;
        
        // Parse the options parameter
        this.options = {};
        if (typeof options.decorateHttpRequest === "function") {
            this.options.decorateHttpRequest = options.decorateHttpRequest;
        } else {
            this.options.decorateHttpRequest = request => request;
        }
    }
    
    _createHttpRequest (path, options) {
        const url = normalizePath(this.host, path);
        const request = new Request(url, options);
        return this.options.decorateHttpRequest(request);
    }
    
    //  Returns the response body or an HTTP GET request to the host
    async read (path) {
        const request = this._createHttpRequest(path, {
            method: 'get',
            headers: {
                'Accept': 'text/*'
            },
        });
        
        const response = await fetch(request);
        
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

    //  Sends an HTTP POST request to the host, with source as body
    async write (path, source) {
        const request = this._createHttpRequest(path, {
            method: 'put',
            headers: {
                'Accept': "text/*",
                'Content-Type': 'text/olo'
            },
            body: String(source)
        });
        
        const response = await fetch(request);
        
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

    
    //  Sends an HTTP DELETE request to the host
    async delete (path) {
        const request = this._createHttpRequest(path, {
            method: 'delete',
            headers: {
                'Accept': "text/*"                
            },
        });
        
        const response = await fetch(request);

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
