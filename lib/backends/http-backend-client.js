
const Path = require("path");
const errors = require("../errors");
const mimeTypes = require("./http-backend-mimetypes");


class HTTPBackendClient {
    
    constructor (backendURL, options={}) {
        this.backendURL = backendURL.slice(-1) === "/" ? backendURL : backendURL + "/";
        this.authorizationHeader = options.auth;
        if (options.cache) this._cache = new Map();
    }
    
    async get (path) {
        while (path.slice(-1) === "/") {
            path = path.slice(0, -1);
        }
        const url = this._resolveURL(path);

        if (this._cache && this._cache.has(url)) {
            return this._cache.get(url);
        }        

        const data = await this._fetch(url, mimeTypes.DOCUMENT);
        this._updateCache(url, data);
        return data;
    }
    
    async list (path) {
        if (path.slice(-1) !== "/") path += "/";
        const url = this._resolveURL(path);
        return await this._fetch(url, mimeTypes.CONTAINER);
    }
    
    async put (path, body) {
        const url = this._resolveURL(path);
        const response = await fetch(url, {
            method: 'put',
            headers: {
                'Authorization': this.authorizationHeader,
                'Content-Type': mimeTypes.DOCUMENT                
            },
            body: String(body)
        });
        switch (response.status) {
            case 200:
            case 201:
                this._updateCache(url, body);
                break;
            case 403:
                throw new errors.WriteAccessDenied(url);
            case 405:
                throw new errors.WriteOperationNotAllowed(url);
            default:
                let message = await response.text();
                throw new Error(message);
        }            
    }
    
    async delete (path) {
        const url = this._resolveURL(path);
        const response = await fetch(url, {
            method: 'delete',
            headers: {
                'Authorization': this.authorizationHeader,
                'Content-Type': mimeTypes.DOCUMENT                
            }
        });
        switch (response.status) {
            case 200:
                this._updateCache(url, "");
                break;
            case 403:
                throw new errors.WriteAccessDenied(url);
            default:
                let message = await response.text();
                throw new Error(message);
        }            
    }
    
    async _fetch (url, mimeType) {
        const response = await fetch(url, {
            method: 'get',
            headers: {
                'Authorization': this.authorizationHeader,
                'Content-Type': mimeType
            },
        });
        
        switch (response.status) {
            case 200:
                return await response.json();
            case 403: 
                throw new errors.ReadAccessDenied(url);
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
        return this.backendURL + path;
    }
}

module.exports = HTTPBackendClient;
