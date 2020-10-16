require("isomorphic-fetch");
const pathlib = require('path');
const URI = require('uri-js');
const errors = require("./store-errors");
const NullStore = require('./null');


const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);


/**
 *  HTTPStore
 *  ============================================================================
 *  This store handles read/write operations on remote olo-documents
 *  via HTTP(S).
 *
 *  ```js
 *  httpStore = new HTTPStore(rootURL, options)
 *  ```
 *  
 *  - `rootURL` is the base URL that will be prepended to the paths passed to
 *    the `get`, `set` and `delete` methods.
 *  - `options.headers` are custom headers that will be added to every HTTP
 *    request.
 *  - `httpStore` is an object that exposes the standard olojs store API: `get`,
 *    `set` and `delete`.
 */
class HTTPStore extends NullStore {
    
    constructor (rootURL, options={}) {
        super();
        this.rootURL = URI.normalize(`${rootURL}/`);
        this.headers = isObject(options.headers) ? options.headers : {};
    }
    
    resolveURL (path) {
        return this.rootURL + pathlib.normalize(`/${path}`).slice(1);
    }
    

    /**
     *  HTTPStore.prototype.get - async method
     *  ------------------------------------------------------------------------
     *  Retrieves a remote olo-document via HTTP GET (HTTPS GET).
     *  
     *  ```js
     *  const source = await httpStore.get("/path/to/doc")
     *  ```
     *  
     *  - On 200 status code, returns the response body as string
     *  - On 403 status code, throws a PermissionDenied error
     *  - On 404 status code, return an empty string
     *  - On 405 status code, throws an OperationNotAllowed error
     *  - On any other status code, throws a generic error
     */
    async get (path) {
        const url = this.resolveURL(path);

        const response = await fetch(url, {
            method: 'get',
            headers: Object.assign({}, this.headers, {
                'Accept': 'text/*',
            }),
        });
        
        switch (response.status) {
            case 200:
                return await response.text();            
            case 403:
                throw new errors.PermissionDenied('GET', url);
            case 404:
                return "";
            case 405:
                throw new errors.OperationNotAllowed('GET', url);
            default:
                let message = await response.text();
                throw new Error(message);
        }                            
    }
    
    
    /**
     *  HTTPStore.prototype.set - async method
     *  ------------------------------------------------------------------------
     *  Modifies a remote olo-document via HTTP PUT (HTTPS PUT).
     *  
     *  ```js
     *  await httpStore.set("/path/to/doc", source)
     *  ```
     *  
     *  - On 200 and 201 status code, returns
     *  - On 403 status code, throws a PermissionDenied error
     *  - On 405 status code, throws an OperationNotAllowed error
     *  - On any other status code, throws a generic error
     */
    async set (path, source) {
        const url = this.resolveURL(path);

        const response = await fetch(url, {
            method: 'put',
            headers: Object.assign({}, this.headers, {
                'Accept': 'text/*',
                'Content-Type': 'text/plain',
            }),
            body: String(source)
        });
        
        switch (response.status) {
            case 200:
            case 201:
                break;
            case 403:
                throw new errors.PermissionDenied('SET', url);
            case 405:
                throw new errors.OperationNotAllowed('SET', url);
            default:
                let message = await response.text();
                throw new Error(message);
        }                    
    }    
    
    
    /**
     *  HTTPStore.prototype.delete - async method
     *  ------------------------------------------------------------------------
     *  Modifies a remote olo-document via HTTP DELETE (HTTPS DELETE).
     *  
     *  ```js
     *  await httpStore.delete("/path/to/doc")
     *  ```
     *  
     *  - On 200 status code, returns
     *  - On 403 status code, throws a PermissionDenied error
     *  - On 405 status code, throws an OperationNotAllowed error
     *  - On any other status code, throws a generic error
     */
    async delete (path) {
        const url = this.resolveURL(path);

        const response = await fetch(url, {
            method: 'delete',
            headers: Object.assign({}, this.headers, {
                'Accept': 'text/*',
                'Content-Type': 'text/plain',
            })
        });
        
        switch (response.status) {
            case 200:
                break;
            case 403:
                throw new errors.PermissionDenied('DELETE', url);
            case 405:
                throw new errors.OperationNotAllowed('DELETE', url);
            default:
                let message = await response.text();
                throw new Error(message);
        }        
    }    
}


module.exports = HTTPStore;
