const pathlib = require('path');
const Router = require('./router');
const MemoryStore = require('./memory-store');


/**
 *  Protocols
 *  ============================================================================
 *  This store is a collection of stores, each identified by a protocol. The 
 *  `read`, `list`, `write` and `delete` requests are delegated to the proper
 *  store based on the uri scheme. If the request URI soenst't start with a
 *  URI scheme, it will be delegated to the `default:` protocol.
 *  
 *  ```js
 *  protocols = new Protocols({
 *     'http' : new HTTPStore('http:/'),
 *     'https': new HTTPStore('httpa:/'),
 *     'default' : new MemoryStore()
 *  })
 *  ```
 *  
 *  If a `default` protocol is not defined, it defaults to an empty MemoryStore.
 */
class Protocols extends Router {
    
    constructor (stores) {
        const routes = {};
        
        for (let scheme in stores) {
            if ( URI_SCHEME_RE.test(scheme) ) {
                routes[`/${scheme}:/`] = stores[scheme];
            }
        }
        
        if (!routes['/default:/']) routes['/default:/'] = new MemoryStore();
        
        super(routes);
    }
    
    /**
     *  protocols.read - async method
     *  ------------------------------------------------------------------------
     *  Retrieves an olo-document from the matching mounted protool.
     *  
     *  ```js
     *  protocols = new Protocols({s1:store1, s2:store2, ..., default:defStore})
     *  source = await protocols.read("s1:/path/to/doc");
     *  ```
     *  
     *  - When requesting `s1:/path/to/doc`, it returns 
     *    `await store1.read('/path/to/doc')`; when requestin `s2:/path/to/doc`,
     *    it returns `await store2.read('/path/to/doc')`; etc.
     *  - When requesting `/path/to/doc`, it returns 
     *    `await defStore.read('/path/to/doc')`
     *  - When no store is mapped to the URI scheme, it returns an empty string
     */
    async read (uri) {
        return await super.read( pathifyURI(uri) );
    }
    
    /**
     *  protocols.list - async method
     *  ------------------------------------------------------------------------
     *  Delegatest to the `list` method of the matching protocol.
     *  
     *  ```js
     *  protocols = new Protocols({s1:store1, s2:store2, ..., default:defStore})
     *  entries = await protocols.list("s1:/path/to/doc");
     *  ```
     *  
     *  - When listing `s1:/path/to/doc`, it returns 
     *    `await store1.list('/path/to/doc')`; when listing `s2:/path/to/doc`,
     *    it returns `await store2.list('/path/to/doc')`; etc.
     *  - When listing `/path/to/doc`, it returns 
     *    `await defStore.list('/path/to/doc')`
     *  - When no store is mapped to the URI scheme, it returns an empty array
     */
    async list (uri) {
        return await super.list( pathifyURI(uri) );
    }
    
    /**
     *  protocols.write - async method
     *  ------------------------------------------------------------------------
     *  Delegatest to the `write` method of the matching protocol.
     *  
     *  ```js
     *  protocols = new Protocols({s1:store1, s2:store2, ..., default:defStore})
     *  await protocols.write("s1:/path/to/doc", source);
     *  ```
     *  
     *  - When writing to `s1:/path/to/doc`, it executes 
     *    `await store1.write('/path/to/doc', source)`; when writing to 
     *    `s2:/path/to/doc`, it executes 
     *    `await store2.write('/path/to/doc', source)`; etc.
     *  - When writing to `/path/to/doc`, it executes 
     *    `await defStore.write('/path/to/doc', source)`
     *  - When no store is mapped to the URI scheme, it throws a
     *    `Store.WriteOperationNotAllowedError`.
     */
    async write (uri, source) {
        return await super.write( pathifyURI(uri), source );
    }

    /**
     *  protocols.delete - async method
     *  ------------------------------------------------------------------------
     *  Delegatest to the `delete` method of the matching protocol.
     *  
     *  ```js
     *  protocols = new Protocols({s1:store1, s2:store2, ..., default:defStore})
     *  await protocols.delete("s1:/path/to/doc");
     *  ```
     *  
     *  - When deleting `s1:/path/to/doc`, it calls 
     *    `await store1.delete('/path/to/doc')`; when deleting `s2:/path/to/doc`,
     *    it calls `await store2.delete('/path/to/doc')`; etc.
     *  - When deleting `/path/to/doc`, it calls 
     *    `await defStore.delete('/path/to/doc')`
     *  - When no store is mapped to the URI scheme, it throws a
     *    `Store.WriteOperationNotAllowedError`.
     */
    async delete (uri) {
        return await super.delete( pathifyURI(uri) );
    }

    /**
     *  protocols.deleteAll - async method
     *  ------------------------------------------------------------------------
     *  Delegatest to the `deleteAll` method of the matching protocol.
     *  
     *  ```js
     *  protocols = new Protocols({s1:store1, s2:store2, ..., default:defStore})
     *  await protocols.deleteAll("s1:/path/to/dir");
     *  ```
     *  
     *  - When deleting `s1:/path/to/dir`, it calls 
     *    `await store1.deleteAll('/path/to/dir')`; when deleting `s2:/path/to/dir`,
     *    it calls `await store2.deleteAll('/path/to/dir')`; etc.
     *  - When deleting `/path/to/dir`, it calls 
     *    `await defStore.deleteAll('/path/to/dir')`
     *  - When no store is mapped to the URI scheme, it throws a
     *    `Store.WriteOperationNotAllowedError`.
     */
    async deleteAll (uri) {
        return await super.deleteAll( pathifyURI(uri) );
    }
}

function pathifyURI (uri) {
    const uriMatch = uri.match(URI_RE);
    if (!uriMatch) return pathlib.normalize(`/default:/${uri}`);
    const scheme = uriMatch[1] || 'default';
    const path = pathlib.join('/', uriMatch[2] || '');
    return `/${scheme}:${path}`;    
}

const URI_SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*$/
const URI_RE        = /^([a-zA-Z][a-zA-Z0-9+.-]*):\/(.*)$/;

module.exports = Protocols;
