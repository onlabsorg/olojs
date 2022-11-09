require("isomorphic-fetch");
const pathlib = require('path');
const Store = require('./store');


const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);
const isURI = s => /^([a-zA-Z][a-zA-Z0-9+.-]*):\/(.*)$/.test(s);


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
 *    the `read`, `list`, `write` and `delete` methods.
 *  - `options.headers` are custom headers that will be added to every HTTP
 *    request.
 *  - `options.extension` is a custom file extension to be appended to the path
 *    of each `read`, `write` and `delete` request.
 *  - `httpStore` is a [olojs.Store](./store.md) object
 *  
 *  > HTTPStore inherits from the [Store](./store.md) class and overrides the
 *  > methods described below.
 */
class HTTPStore extends Store {

    constructor (rootURL, options={}) {
        super();
        if (rootURL.slice(0,6).toLowerCase() === 'http:/') {
            this.rootURL = 'http:/' + this.normalizePath(`${rootURL.slice(6)}/.`);
        } else if (rootURL.slice(0,7).toLowerCase() === 'https:/') {
            this.rootURL = 'https:/' + this.normalizePath(`${rootURL.slice(7)}/.`);
        } else {
            throw new Error(`Invalid http URL: ${rootURL}`)
        }
        this.headers = Object.assign({}, options.headers);
        this.extension = normalizeExtension(options.extension);
    }
    
    async _fetch (url, options) {
        return await fetch(url, options);
    }
    
    /**
     *  async httpStore.read: String path -> String source
     *  ------------------------------------------------------------------------
     *  Retrieves a remote olo-document via HTTP GET (HTTPS GET).
     *
     *  ```js
     *  source = await httpStore.read("/path/to/doc")
     *  ```
     *
     *  - On 200 status code, returns the response body as string
     *  - On 403 status code, throws a `HTTPStore.ReadPermissionDeniedError`
     *  - On 404 status code, return an empty string
     *  - On 405 or 501 status code, throws a `HTTPStore.ReadOperationNotAllowedError`
     *  - On any other status code, throws a generic error
     */
    async read (path) {
        if (isURI(path)) throw new this.constructor.ReadOperationNotAllowedError(path);
        const url = this.rootURL + this.normalizePath(path + this.extension);

        const response = await this._fetch(url, {
            method: 'get',
            headers: Object.assign({}, this.headers, {
                'Accept': 'text/*',
            }),
        });

        switch (response.status) {
            case 200:
                return await response.text();
            case 403:
                throw new this.constructor.ReadPermissionDeniedError(path);
            case 404:
                return "";
            case 405:
            case 501:
                throw new this.constructor.ReadOperationNotAllowedError(path);
            default:
                let message = await response.text();
                throw new Error(message);
        }
    }


    /**
     *  async httpStore.list: String path -> Array items
     *  ------------------------------------------------------------------------
     *  Retrieves the list of items contained under the given path, via a
     *  HTTP GET (HTTPS GET) request for MimeType `application/json`. 
     *  
     *  > This operation will work if the HTTP server implements responding 
     *  > with a JSON body to GET request for `application/json` MimeTypes. The 
     *  > [olojs.HTTPServer](http-server.md) implements this functionality.
     *
     *  ```js
     *  source = await httpStore.read("/path/to/dir")
     *  ```
     *
     *  - On 200 status code, returns the response body interpreted as JSON array
     *  - On 403 status code, throws a `HTTPStore.ReadPermissionDeniedError`
     *  - On 404 status code, return an empty array
     *  - On 405 or 501 status code, throws a `HTTPStore.ReadOperationNotAllowedError`
     *  - On any other status code, throws a generic error
     */
    async list (path) {
        if (isURI(path)) throw new this.constructor.ReadOperationNotAllowedError(path);
        const url = this.rootURL + this.normalizePath(`${path}/`);

        const response = await this._fetch(url, {
            method: 'get',
            headers: Object.assign({}, this.headers, {
                'Accept': 'application/json',
            }),
        });

        switch (response.status) {
            case 200:
                return await response.json();
            case 403:
                throw new this.constructor.ReadPermissionDeniedError(path);
            case 404:
                return [];
            case 405:
            case 501:
                throw new this.constructor.ReadOperationNotAllowedError(path);
            default:
                let message = await response.text();
                throw new Error(message);
        }
    }


    /**
     *  async httpStore.write: (String path, String source) -> undefined
     *  ------------------------------------------------------------------------
     *  Modifies a remote olo-document via HTTP PUT (HTTPS PUT).
     *
     *  ```js
     *  await httpStore.write("/path/to/doc", source)
     *  ```
     *
     *  - On 200 and 201 status code, returns
     *  - On 403 status code, throws a `HTTPStore.WritePermissionDeniedError`
     *  - On 405 or 501 status code, throws a `HTTPStore.WriteOperationNotAllowedError`
     *  - On any other status code, throws a generic error
     */
    async write (path, source) {
        if (isURI(path)) throw new this.constructor.WriteOperationNotAllowedError(path);
        const url = this.rootURL + this.normalizePath(path + this.extension);

        const response = await this._fetch(url, {
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
                throw new this.constructor.WritePermissionDeniedError(path);
            case 405:
            case 501:
                throw new this.constructor.WriteOperationNotAllowedError(path);
            default:
                let message = await response.text();
                throw new Error(message);
        }
    }


    /**
     *  async httpStore.delete: String path -> undefined
     *  ------------------------------------------------------------------------
     *  Removes a remote olo-document via HTTP DELETE (HTTPS DELETE).
     *
     *  ```js
     *  await httpStore.delete("/path/to/doc")
     *  ```
     *
     *  - On 200 status code, returns
     *  - On 403 status code, throws a `HTTPStore.WritePermissionDeniedError`
     *  - On 405 or 501 status code, throws a `HTTPStore.WriteOperationNotAllowedError`
     *  - On any other status code, throws a generic error
     */
    async delete (path) {
        if (isURI(path)) throw new this.constructor.WriteOperationNotAllowedError(path);
        const url = this.rootURL + this.normalizePath(path + this.extension);

        const response = await this._fetch(url, {
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
                throw new this.constructor.WritePermissionDeniedError(path);
            case 405:
            case 501:
                throw new this.constructor.WriteOperationNotAllowedError(path);
            default:
                let message = await response.text();
                throw new Error(message);
        }
    }
}


module.exports = HTTPStore;



// -----------------------------------------------------------------------------
//  Helper Functions
// -----------------------------------------------------------------------------

function normalizeExtension (ext="") {
    while (ext[0] === ".") ext = ext.slice(1);
    return ext === "" ? ext : `.${ext}`;
}
