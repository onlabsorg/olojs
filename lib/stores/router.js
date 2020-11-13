
const pathlib = require('path');
const EmptyStore = require('./empty');

/**
 *  RouterStore
 *  ============================================================================
 *  This store is a container for other stores and routes the `get`, `list`, 
 *  `set` and `delete` requests to the store matching the path.
 *
 *  ```js
 *  router = new RouterStore({
 *      "/path/to/store_1/": store_1, 
 *      "/path/to/store_2/": store_2, 
 *      ...
 *  })
 *  ```
 *  
 *  - Each `"/path/to/store_i":store_i` parameter is a mount point. All the 
 *    `get`, `set` `list` and `delete` calls to paths like 
 *    `/path/to/store_i/sub/path/to/doc` will be rerouted to `store_i` after 
 *    reducing the path to `/sub/path/to/doc`.
 *  - `router` is an object that exposes the standard olojs store API: `get`,
 *    `list`, `set` and `delete`.
 */

class RouterStore extends EmptyStore {
    
    constructor (routes) {
        super();
        const validRoutes = filterObject(isStore, routes);
        const normalizePath = path => this.normalizePath(`${path}/`)
        const normalizedRoutes = renameKeys(normalizePath, validRoutes);
        this._routes = sortObject(normalizedRoutes);
    }
    
    *_iterMatches (path) {
        const normPath = this.normalizePath(path);
        for (let [routePath, store] of this._routes.entries()) {
            if (normPath.indexOf(routePath) === 0) {
                const subPath = normPath.slice(routePath.length-1);
                yield [store, subPath];
            }
        }
    }
    
    _matchRoute (path) {
        const normPath = this.normalizePath(path);
        const matches = this._iterMatches(normPath);
        return matches.next().value || [null, normPath];
    }
    
        
    /**
     *  router.get - async method
     *  ------------------------------------------------------------------------
     *  Retrieves an olo-document from the matching sub-store.
     *
     *  ```js
     *  source = await router.get("/path/to/store_i/sub/path/to/doc");
     *  ```
     *  
     *  - When requesting `/path/to/store_i/sub/path/to/doc`, it returns
     *    `await store_i.get('/sub/path/to/doc'). 
     *  - When no store is mounted on `/path/to/store_i/`, it returns an empty 
     *    string
     */
    async get (path) {
        const [store, subPath] = this._matchRoute(path);
        return store ? await store.get(subPath) : await super.get(path);
    }


    /**
     *  router.list - async method
     *  ------------------------------------------------------------------------
     *  Returns the list of entry names under the passed path, considering all
     *  the mount points.
     *
     *  The following expression ...
     *  
     *  ```js
     *  entries = await router.list("/path/to/dir/");
     *  ```
     *  
     *  ... returns an array obtained by merging the following entries:
     *  
     *  - `await store1.list('/path/to/dir/')` if `store1` is mounted at `/`
     *  - `await store2.list('/to/dir/')` if `store2` is mounted at `/path/`
     *  - `await store3.list('/dir/')` if `store3` is mounted at `/path/to/`
     *  - `await store4.list('/')` if `store4` is mounted at `/path/to/dir/`
     *  - a `"dir_i/"` entry for each mount point like `/path/to/dir/dir_i/sub/path/`
     */
    async list (path) {
        const dirPath = this.normalizePath(`${path}/`)
        const entries = [];
        for (let [store, subPath] of this._iterMatches(dirPath)) {
            mergeLists(entries, await store.list(subPath));
        }
        for (let [routePath, store] of this._routes.entries()) {
            if (routePath !== dirPath && routePath.indexOf(dirPath) === 0) {
                const subPath = routePath.slice(dirPath.length);
                const entry = subPath.slice(0, subPath.indexOf('/')+1);
                pushIfMissing(entries, entry);
            }
        }
        return entries;
    }
    

    /**
     *  router.set - async method
     *  ------------------------------------------------------------------------
     *  Modifies an olo-document contained in the matching sub-store.
     *
     *  ```js
     *  await router.set("/path/to/store_i/sub/path/to/doc", source);
     *  ```
     *  
     *  - When `/path/to/store_i/sub/path/to/doc` is passed, it calls
     *    `await store_i.set('/sub/path/to/doc', source). 
     *  - When no store is mounted on `/path/to/store_i`, it throws an 
     *    `OperationNotAllowed` error.
     */
    async set (path, source) {
        const [store, subPath] = this._matchRoute(path);
        return store ? await store.set(subPath, source) : await super.set(path, source);
    }


    /**
     *  router.delete - async method
     *  ------------------------------------------------------------------------
     *  Deletes an olo-document contained in the matching sub-store.
     *
     *  ```js
     *  await router.delete("/path/to/store_i/sub/path/to/doc");
     *  ```
     *  
     *  - When `/path/to/store_i/sub/path/to/doc` is passed, it calls
     *    `await store_i.delete('/sub/path/to/doc'). 
     *  - When no store is mounted on `/path/to/store_i/`, it throws an 
     *    `OperationNotAllowed` error.
     */
    async delete (path, source) {
        const [store, subPath] = this._matchRoute(path);
        return store ? await store.delete(subPath) : await super.delete(path);
    }    
}


module.exports = RouterStore;



// -----------------------------------------------------------------------------
//  SERVICE FUNCTIONS
// -----------------------------------------------------------------------------

const isStore = obj => obj instanceof EmptyStore;

const renameKeys = (ren, obj) => {
    const newObj = {};
    for (let key in obj) newObj[ren(key)] = obj[key];
    return newObj;
}

const sortObject = obj => {
    const keys = Object.keys(obj).sort().reverse();
    const map = new Map();
    for (let key of keys) map.set(key, obj[key]);
    return map;
}

const filterObject = (test, obj) => {
    const newObj = {};
    for (let key in obj) if (test(obj[key])) newObj[key] = obj[key];
    return newObj;
}

const pushIfMissing = (list, item) => {
    if (list.indexOf(item) === -1) list.push(item);
}

const mergeLists = (list1, list2) => {
    for (let item of list2) pushIfMissing(list1, item);
}
