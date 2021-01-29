require("isomorphic-fetch");
const pathlib = require('path');
const Store = require('./store');


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
 *    the `read`, `list`, `write` and `delete` methods.
 *  - `options.headers` are custom headers that will be added to every HTTP
 *    request.
 *  - `httpStore` is a [olojs.Store](./store.md) object
 */
class HTTPStore extends Store {

    constructor (rootURL, options={}) {
        super();
        if (rootURL.slice(0,6).toLowerCase() === 'http:/') {
            this.rootURL = 'http:/' + pathlib.normalize(`/${rootURL.slice(6)}/`);
        } else if (rootURL.slice(0,7).toLowerCase() === 'https:/') {
            this.rootURL = 'https:/' + pathlib.normalize(`/${rootURL.slice(7)}/`);
        } else {
            throw new Error(`Invalid http URL: ${rootURL}`)
        }
        this.headers = isObject(options.headers) ? options.headers : {};
    }

    resolveURL (path) {
        return this.rootURL + pathlib.normalize(`/${path}`).slice(1);
    }


    /**
     *  httpStore.read - async method
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
     *  - On 405 status code, throws a `HTTPStore.ReadOperationNotAllowedError`
     *  - On any other status code, throws a generic error
     */
    async read (path) {
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
                throw new this.constructor.ReadPermissionDeniedError(url);
            case 404:
                return "";
            case 405:
                throw new this.constructor.ReadOperationNotAllowedError(url);
            default:
                let message = await response.text();
                throw new Error(message);
        }
    }


    /**
     *  httpStore.list - async method
     *  ------------------------------------------------------------------------
     *  Retrieves a remote directory content via an HTTP GET requests that
     *  accepts only JSON as response.
     *
     *  ```js
     *  entries = await httpStore.list("/path/to/doc")
     *  ```
     *
     *  - On 200 status code, returns the response body as json array
     *  - On 403 status code, throws a `HTTPStore.ReadPermissionDeniedError`
     *  - On 404 status code, return an empty array
     *  - On 405 status code, throws a `HTTPStore.ReadOperationNotAllowedError`
     *  - On any other status code, throws a generic error
     */
    async list (path) {
        const url = this.resolveURL(path);

        const response = await fetch(url, {
            method: 'get',
            headers: Object.assign({}, this.headers, {
                'Accept': 'application/json',
            }),
        });

        switch (response.status) {
            case 200:
                const entries = await response.json();
                if (!Array.isArray(entries)) throw new Error('Array json response expected');
                return entries;
            case 403:
                throw new this.constructor.ReadPermissionDeniedError(url);
            case 404:
                return [];
            case 405:
                throw new this.constructor.ReadOperationNotAllowedError(url);
            default:
                let message = await response.text();
                throw new Error(message);
        }
    }


    /**
     *  httpStore.write - async method
     *  ------------------------------------------------------------------------
     *  Modifies a remote olo-document via HTTP PUT (HTTPS PUT).
     *
     *  ```js
     *  await httpStore.write("/path/to/doc", source)
     *  ```
     *
     *  - On 200 and 201 status code, returns
     *  - On 403 status code, throws a `HTTPStore.WritePermissionDeniedError`
     *  - On 405 status code, throws a `HTTPStore.WriteOperationNotAllowedError`
     *  - On any other status code, throws a generic error
     */
    async write (path, source) {
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
                throw new this.constructor.WritePermissionDeniedError(url);
            case 405:
                throw new this.constructor.WriteOperationNotAllowedError(url);
            default:
                let message = await response.text();
                throw new Error(message);
        }
    }


    /**
     *  httpStore.delete - async method
     *  ------------------------------------------------------------------------
     *  Modifies a remote olo-document via HTTP DELETE (HTTPS DELETE).
     *
     *  ```js
     *  await httpStore.delete("/path/to/doc")
     *  ```
     *
     *  - On 200 status code, returns
     *  - On 403 status code, throws a `HTTPStore.WritePermissionDeniedError`
     *  - On 405 status code, throws a `HTTPStore.WriteOperationNotAllowedError`
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
                throw new this.constructor.WritePermissionDeniedError(url);
            case 405:
                throw new this.constructor.WriteOperationNotAllowedError(url);
            default:
                let message = await response.text();
                throw new Error(message);
        }
    }


    /**
     *  httpStore.deleteAll - async method
     *  ------------------------------------------------------------------------
     *  Modifies a remote `text/direcotry` resource via HTTP DELETE (HTTPS DELETE).
     *
     *  ```js
     *  await httpStore.deleteAll("/path/to/dir")
     *  ```
     *
     *  - On 200 status code, returns
     *  - On 403 status code, throws a `HTTPStore.WritePermissionDeniedError`
     *  - On 405 status code, throws a `HTTPStore.WriteOperationNotAllowedError`
     *  - On any other status code, throws a generic error
     */
    async deleteAll (path) {
        const url = this.resolveURL(path);

        const response = await fetch(url, {
            method: 'delete',
            headers: Object.assign({}, this.headers, {
                'Accept': 'text/*',
                'Content-Type': 'text/directory',
            })
        });

        switch (response.status) {
            case 200:
                break;
            case 403:
                throw new this.constructor.WritePermissionDeniedError(url);
            case 405:
                throw new this.constructor.WriteOperationNotAllowedError(url);
            default:
                let message = await response.text();
                throw new Error(message);
        }
    }
}


module.exports = HTTPStore;
