require("isomorphic-fetch");
const pathlib = require('path');
const Store = require('./store');

const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);
const isURI = s => /^([a-zA-Z][a-zA-Z0-9+.-]*):\/(.*)$/.test(s);

function normalizeExtension (ext="") {
    while (ext[0] === ".") ext = ext.slice(1);
    return ext === "" ? ext : `.${ext}`;
}


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
 *    the `read`, `write` and `delete` methods.
 *  - `options.headers` are custom headers that will be added to every HTTP
 *    request. If a function, the object `await options.header(path)` will be
 *    added to every HTTP request relative to a document mapped to `path`.
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

        this.headers = options.headers || {};
        this.extension = normalizeExtension(options.extension);
    }
    
    _resolveURL (path) {
        return this.rootURL + this.normalizePath(path + this.extension);
    }

    async _getHeaders (path, requestHeaders) {
        const baseHeaders = (typeof this.headers === 'function') ?
              await this.headers(this.normalizePath(path)) : this.headers;
        return Object.assign({}, baseHeaders, requestHeaders);
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
        const url = this._resolveURL(path);

        const response = await fetch(url, {
            method: 'get',
            mode: 'cors',
            headers: await this._getHeaders(path, {
                'Accept': 'text/*',
                'Access-Control-Allow-Origin': '*'
            }),
        });

        switch (response.status) {
            case 200:
                return await response.text();
            case 403:
                throw new Store.ReadPermissionDeniedError(path);
            case 404:
                return "";
            case 405:
            case 501:
                throw new Store.ReadOperationNotAllowedError(path);
            default:
                let message = await response.text();
                throw new Error(message);
        }
    }




    /**
     *  async httpStore.write: (String path, Sting source) -> undefined
     *  ------------------------------------------------------------------------
     *  Modifies a remote olo-document via HTTP PUT (HTTPS PUT).
     *
     *  ```js
     *  await httpStore.set("/path/to/doc", source)
     *  ```
     *
     *  - On 200 and 201 status code, returns
     *  - On 403 status code, throws a `HTTPStore.WritePermissionDeniedError`
     *  - On 405 status code, throws an `HTTPStore.WriteOperationNotAllowedError`
     *  - On any other status code, throws a generic error
     */
    async write (path, source) {
        const url = this._resolveURL(path);

        const response = await fetch(url, {
            method: 'put',
            mode: 'cors',
            headers: await this._getHeaders(path, {
                'Accept': 'text/*',
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*'
            }),
            body: String(source)
        });

        switch (response.status) {
            case 200:
            case 201:
                break;
            case 403:
                throw new Store.WritePermissionDeniedError(path);
            case 405:
                throw new Store.WriteOperationNotAllowedError(path);
            default:
                let message = await response.text();
                throw new Error(message);
        }
    }


    /**
     *  async httpStore.delete: String path -> undefined
     *  ------------------------------------------------------------------------
     *  Modifies a remote olo-document via HTTP DELETE (HTTPS DELETE).
     *
     *  ```js
     *  await httpStore.delete("/path/to/doc")
     *  ```
     *
     *  - On 200 status code, returns
     *  - On 403 status code, throws a `HTTPStore.WritePermissionDeniedError`
     *  - On 405 status code, throws an `HTTPStore.WriteOperationNotAllowedError`
     *  - On any other status code, throws a generic error
     */
    async delete (path) {
        const url = this._resolveURL(path);

        const response = await fetch(url, {
            method: 'delete',
            mode: 'cors',
            headers: await this._getHeaders(path, {
                'Accept': 'text/*',
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*'
            })
        });

        switch (response.status) {
            case 200:
                break;
            case 403:
                throw new Store.WritePermissionDeniedError(path);
            case 405:
                throw new Store.WriteOperationNotAllowedError(path);
            default:
                let message = await response.text();
                throw new Error(message);
        }
    }

}


module.exports = HTTPStore;



