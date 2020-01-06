
const Path = require("path");
const MIME_TYPE = "application/x-olo-document";

const Store = require("../store");


class HTTPStoreClient extends Store {
    
    constructor (storeURL, options={}) {
        super();
        this.storeURL = storeURL.slice(-1) === "/" ? storeURL : storeURL + "/";
        this.authorizationHeader = options.auth;
        if (options.cache) this._cache = new Map();
    }
    
    async read (path) {
        while (path.slice(-1) === "/") {
            path = path.slice(0, -1);
        }
        const url = this._resolveURL(path);

        if (this._cache && this._cache.has(url)) {
            return this._cache.get(url);
        }        

        const response = await fetch(url, {
            method: 'get',
            headers: {
                'Authorization': this.authorizationHeader,
                'Content-Type': MIME_TYPE
            },
        });
        
        switch (response.status) {
            case 200:
                let source = await response.text();
                this._updateCache(url, source);
                return source;
            case 403: 
                throw new ReadAccessDenied(url);
            default:
                let message = await response.text();
                throw new Error(message);
        }                    
    }
    
    async write (path, body) {
        const url = this._resolveURL(path);
        
        var response;
        if (body === "") {
            response = await fetch(url, {
                method: 'delete',
                headers: {
                    'Authorization': this.authorizationHeader,
                    'Content-Type': MIME_TYPE                
                }
            });
        } else {            
            response = await fetch(url, {
                method: 'put',
                headers: {
                    'Authorization': this.authorizationHeader,
                    'Content-Type': MIME_TYPE              
                },
                body: String(body)
            });
        }
        switch (response.status) {
            case 200:
            case 201:
                this._updateCache(url, body);
                break;
            case 403:
                throw new WriteAccessDenied(url);
            default:
                let message = await response.text();
                throw new Error(message);
        }            
    }
    
    _updateCache (url, data) {
        if (this._cache && url.slice(-1) !== "/") {
            if (data) this._cache.set(url, data);
            else this._cache.delete(url);
        }
    }
        
    _resolveURL (path) {
        while (path[0] === "/") path = path.slice(1);
        return this.storeURL + path;
    }
}

class ReadAccessDenied extends Error {
    constructor (url) {
        super(`Read access denied to ${url}`);
    }
}

class WriteAccessDenied extends Error {
    constructor (url) {
        super(`Write access denied to ${url}`);
    }
}

module.exports = HTTPStoreClient;
