require("isomorphic-fetch");
const pathlib = require('path');
const errors = require("./.errors");



/**
 *  olojs.protocols.http & olojs.protocols.https
 *  ============================================================================
 *  This protocol handles read/write operations on remote olo-documents
 *  via HTTP(S).
 */
module.exports = scheme => ({
    
    /**
     *  olojs.protocols.http.get & olojs.protocols.https.get
     *  ------------------------------------------------------------------------
     *  Retrieves a remote olo-document via HTTP GET (HTTPS GET).
     *  
     *  ```js
     *  const source = await olojs.protocols.http.get("//hostname/path/to/doc")
     *  ```
     *  
     *  - On 200 status code, returns the response body as string
     *  - On 403 status code, throws a PermissionDenied error
     *  - On 404 status code, return an empty string
     *  - On 405 status code, throws an OperationNotAllowed error
     *  - On any other status code, throws a generic error
     */
    async get (path) {
        const url = `${scheme}:/${pathlib.join('/', path)}`;

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
    },
    

    /**
     *  olojs.protocols.http.set & olojs.protocols.https.set
     *  ------------------------------------------------------------------------
     *  Modifies a remote olo-document via HTTP PUT (HTTPS PUT).
     *  
     *  ```js
     *  await olojs.protocols.http.set("//hostname/path/to/doc", source)
     *  ```
     *  
     *  - On 200 and 201 status code, returns
     *  - On 403 status code, throws a PermissionDenied error
     *  - On 405 status code, throws an OperationNotAllowed error
     *  - On any other status code, throws a generic error
     */
    async set (path, source) {
        const url = `${scheme}:/${pathlib.join('/', path)}`;

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
    },

    
    /**
     *  olojs.protocols.http.delete & olojs.protocols.https.delete
     *  ------------------------------------------------------------------------
     *  Modifies a remote olo-document via HTTP DELETE (HTTPS DELETE).
     *  
     *  ```js
     *  await olojs.protocols.http.delete("//hostname/path/to/doc")
     *  ```
     *  
     *  - On 200 status code, returns
     *  - On 403 status code, throws a PermissionDenied error
     *  - On 405 status code, throws an OperationNotAllowed error
     *  - On any other status code, throws a generic error
     */
    async delete (path) {
        const url = `${scheme}:/${pathlib.join('/', path)}`;

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
    },
    
    headers: {}
});
