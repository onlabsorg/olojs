const MemoryStore = require('./memory-store');
const HTTPStore = require('./http-store');
const Router = require('./router');



/**
 *  Hub
 *  ============================================================================
 *  The Hub is a standard [Router](./router.md) containing the following paths:
 *  
 *  - `/home` mounting a custom store passed as parameter
 *  - `/local` in NodeJS this path mounts a FileStore with root path `/`, while
 *    in the browser it mounts a BrowserStore named `olojs_local_store`
 *  - '/http' mounting a HTTPStore with base URL `http:/`; thanks to this store
 *    you can access any document on the web with (for example) 
 *    `read('/http/www.hostname.com/path/to/doc')`
 *  - '/https' mounting a HTTPStore with base URL `https:/`
 *  - '/temp' mounting a memory store
 *  
 *  You can create a Hub as follows:
 *  
 *  ```js
 *  hub = new Hub(homeStore)
 *  ```
 *  
 *  The advantage of having a standard router is that a document depending on
 *  an external document (e.g. http://www.hostname.com/path/to/doc) can always
 *  find it even when he gets imported by another document that lives in a
 *  different store, as long as that store is a hub (standard router).
 *  
 *  Optionally, more routes can be added to the path using the `mount` method.
 */
class Hub extends Router {
    
    constructor (homeStore, localStore) {
        super({
            '/home': homeStore,
            '/local': localStore,
            '/http': new HTTPStore('http:/'),
            '/https': new HTTPStore('https:/'),
            '/temp': new MemoryStore()
        })
        this.homeStore = homeStore;
    }
}

module.exports = Hub;
